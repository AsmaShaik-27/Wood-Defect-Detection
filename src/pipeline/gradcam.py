import io
import os
import base64
import cv2
import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image
from typing import Union, Dict, Any, Tuple

from src.config import (
    MODEL_PATH,
    CLASS_NAMES,
    NUM_CLASSES,
    IMAGE_SIZE,
    DEVICE,
    DEFECT_EXPLANATIONS,
    PREDICTIONS_DIR
)
from src.pipeline.model import load_trained_model, get_inference_transform

class WoodDefectDetector:

    def __init__(self, model_path: str = MODEL_PATH, device: torch.device = DEVICE):
        self.device = device
        self.class_names = CLASS_NAMES
        self.transform = get_inference_transform(IMAGE_SIZE)
        self.model = load_trained_model(
            checkpoint_path=model_path,
            num_classes=NUM_CLASSES,
            device=self.device
        )
        # Target layer for ResNet-18 Grad-CAM
        self.target_layer = self.model.layer4[-1]

    def _generate_gradcam_heatmap(self, input_tensor: torch.Tensor) -> Tuple[np.ndarray, str, float]:

        activations = None
        gradients = None

        def forward_hook(module, inp, out):
            nonlocal activations
            activations = out

        def backward_hook(module, grad_in, grad_out):
            nonlocal gradients
            gradients = grad_out[0]

        handle_fwd = self.target_layer.register_forward_hook(forward_hook)
        handle_bwd = self.target_layer.register_full_backward_hook(backward_hook)

        try:
            output = self.model(input_tensor)
            probs = F.softmax(output, dim=1)
            confidence, pred_class = torch.max(probs, 1)

            self.model.zero_grad()
            output[0, pred_class].backward()

            pooled_gradients = torch.mean(gradients, dim=[0, 2, 3])

            for i in range(activations.shape[1]):
                activations[:, i, :, :] *= pooled_gradients[i]

            heatmap = torch.mean(activations, dim=1).squeeze()
            heatmap = torch.relu(heatmap)
            heatmap = heatmap.cpu().detach().numpy()

            # Normalize 0..1
            heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)
            heatmap = cv2.resize(heatmap, IMAGE_SIZE)

            predicted_label = self.class_names[pred_class.item()]
            confidence_val = float(confidence.item())

            return heatmap, predicted_label, confidence_val
        finally:
            handle_fwd.remove()
            handle_bwd.remove()

    def predict(self, image_source: Union[str, Image.Image, bytes, np.ndarray]) -> Dict[str, Any]:

        # Load image into PIL RGB
        if isinstance(image_source, str):
            if not os.path.exists(image_source):
                raise FileNotFoundError(f"Image not found: {image_source}")
            pil_image = Image.open(image_source).convert("RGB")
        elif isinstance(image_source, bytes):
            pil_image = Image.open(io.BytesIO(image_source)).convert("RGB")
        elif isinstance(image_source, np.ndarray):
            pil_image = Image.fromarray(image_source).convert("RGB")
        elif isinstance(image_source, Image.Image):
            pil_image = image_source.convert("RGB")
        else:
            raise ValueError(f"Unsupported image type: {type(image_source)}")

        # Prepare tensor
        input_tensor = self.transform(pil_image).unsqueeze(0).to(self.device)

        # Generate heatmap
        heatmap, pred_class, confidence = self._generate_gradcam_heatmap(input_tensor)

        # Create overlay
        img_resized = np.array(pil_image.resize(IMAGE_SIZE))
        # Ensure RGB -> BGR for OpenCV colormap blending
        img_bgr = cv2.cvtColor(img_resized, cv2.COLOR_RGB2BGR)
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
        overlay_bgr = cv2.addWeighted(img_bgr, 0.6, heatmap_colored, 0.4, 0)
        overlay_rgb = cv2.cvtColor(overlay_bgr, cv2.COLOR_BGR2RGB)

        # Encode to base64 for web API
        _, buffer = cv2.imencode(".jpg", overlay_bgr)
        overlay_base64 = base64.b64encode(buffer).decode("utf-8")

        explanation = DEFECT_EXPLANATIONS.get(
            pred_class,
            f"Model identified patterns corresponding to {pred_class}."
        )

        return {
            "predicted_class": pred_class,
            "confidence": round(confidence, 4),
            "explanation": explanation,
            "heatmap_image": overlay_base64,
            "overlay_bgr": overlay_bgr,
            "overlay_rgb": overlay_rgb,
            "heatmap_raw": heatmap
        }

    def predict_and_save(self, image_path: str, output_dir: str = PREDICTIONS_DIR) -> Dict[str, Any]:
        """
        Runs inference and saves the Grad-CAM visualization image and JSON results.
        """
        os.makedirs(output_dir, exist_ok=True)
        filename = os.path.splitext(os.path.basename(image_path))[0]
        result = self.predict(image_path)

        out_img_path = os.path.join(output_dir, f"{filename}_gradcam.jpg")
        cv2.imwrite(out_img_path, result["overlay_bgr"])

        json_data = {
            "input_image": image_path,
            "output_image": out_img_path,
            "predicted_class": result["predicted_class"],
            "confidence": result["confidence"],
            "explanation": result["explanation"]
        }

        import json
        out_json_path = os.path.join(output_dir, f"{filename}_result.json")
        with open(out_json_path, "w") as f:
            json.dump(json_data, f, indent=4)

        print(f"[+] Prediction:   {result['predicted_class']} (Confidence: {result['confidence'] * 100:.2f}%)")
        print(f"[+] Explanation:  {result['explanation']}")
        print(f"[+] Output Image: {out_img_path}")
        print(f"[+] Output JSON:  {out_json_path}")

        return json_data
