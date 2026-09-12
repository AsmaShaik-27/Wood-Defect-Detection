import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from typing import Tuple
from src.config import CLASS_NAMES, NUM_CLASSES, MODEL_PATH, DEVICE, IMAGE_SIZE

def get_transforms(image_size: Tuple[int, int] = IMAGE_SIZE):

    return transforms.Compose([
        transforms.Resize(image_size),
        transforms.ToTensor()
    ])

def get_inference_transform(image_size: Tuple[int, int] = IMAGE_SIZE):
    
    return transforms.Compose([
        transforms.Resize(image_size),
        transforms.ToTensor()
    ])

def build_model(num_classes: int = NUM_CLASSES, pretrained: bool = True, device: torch.device = DEVICE) -> nn.Module:
    
    weights = models.ResNet18_Weights.DEFAULT if pretrained else None
    model = models.resnet18(weights=weights)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    model = model.to(device)
    return model

def load_trained_model(
    checkpoint_path: str = MODEL_PATH,
    num_classes: int = NUM_CLASSES,
    device: torch.device = DEVICE
) -> nn.Module:
   
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(
            f"Model weights not found at '{checkpoint_path}'. Please run training first!"
        )

    model = build_model(num_classes=num_classes, pretrained=False, device=device)
    state_dict = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(state_dict)
    model.eval()
    return model

def save_model(model: nn.Module, save_path: str = MODEL_PATH):
   
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    torch.save(model.state_dict(), save_path)
    print(f"[+] Saved model checkpoint to: {save_path}")
