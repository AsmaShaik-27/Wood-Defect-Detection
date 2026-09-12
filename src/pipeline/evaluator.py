import os
import json
import torch
import numpy as np
from torchvision import datasets
from torch.utils.data import DataLoader
from typing import Dict, Any

from src.config import (
    TEST_DATA_PATH,
    MODEL_PATH,
    BATCH_SIZE,
    DEVICE,
    REPORTS_DIR,
    CLASS_NAMES
)
from src.pipeline.model import load_trained_model, get_transforms

def evaluate_model(
    test_dir: str = TEST_DATA_PATH,
    model_path: str = MODEL_PATH,
    batch_size: int = BATCH_SIZE,
    device: torch.device = DEVICE
) -> Dict[str, Any]:

    if not os.path.exists(test_dir):
        raise FileNotFoundError(f"Test dataset directory not found at: {test_dir}")

    transform = get_transforms()
    test_dataset = datasets.ImageFolder(root=test_dir, transform=transform)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

    class_names = test_dataset.classes
    model = load_trained_model(checkpoint_path=model_path, num_classes=len(class_names), device=device)

    all_preds = []
    all_labels = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy().tolist())
            all_labels.extend(labels.numpy().tolist())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)

    # Compute Confusion Matrix
    num_classes = len(class_names)
    cm = np.zeros((num_classes, num_classes), dtype=int)
    for t, p in zip(all_labels, all_preds):
        cm[t, p] += 1

    # Overall Accuracy
    accuracy = float((all_preds == all_labels).sum() / len(all_labels)) * 100.0

    # Per-class metrics
    class_metrics = {}
    for i, cls in enumerate(class_names):
        tp = int(cm[i, i])
        fp = int(cm[:, i].sum() - tp)
        fn = int(cm[i, :].sum() - tp)
        support = int(cm[i, :].sum())

        precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        f1 = float(2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

        class_metrics[cls] = {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "support": support
        }

    metrics_report = {
        "overall_accuracy": round(accuracy, 2),
        "total_test_samples": len(all_labels),
        "class_metrics": class_metrics,
        "confusion_matrix": cm.tolist(),
        "classes": class_names
    }

    # Save metrics JSON
    metrics_path = os.path.join(REPORTS_DIR, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_report, f, indent=4)

    print("\n" + "=" * 60)
    print("TEST EVALUATION REPORT")
    print("=" * 60)
    print(f"Total Test Samples: {len(all_labels)}")
    print(f"Overall Accuracy:   {accuracy:.2f}%\n")
    print(f"{'Class':<12} {'Precision':<10} {'Recall':<10} {'F1-Score':<10} {'Support':<8}")
    print("-" * 52)
    for cls, m in class_metrics.items():
        print(f"{cls:<12} {m['precision']:<10.4f} {m['recall']:<10.4f} {m['f1_score']:<10.4f} {m['support']:<8}")
    print("=" * 60)
    print(f"[+] Saved evaluation report to: {metrics_path}")

    # Generate Confusion Matrix visualization
    try:
        import matplotlib.pyplot as plt
        plt.figure(figsize=(8, 6))
        plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
        plt.title(f"Confusion Matrix (Accuracy: {accuracy:.1f}%)")
        plt.colorbar()
        tick_marks = np.arange(len(class_names))
        plt.xticks(tick_marks, class_names, rotation=45, ha="right")
        plt.yticks(tick_marks, class_names)

        thresh = cm.max() / 2.0 if cm.max() > 0 else 1.0
        for i in range(num_classes):
            for j in range(num_classes):
                val = cm[i, j]
                color = "white" if val > thresh else "black"
                plt.text(j, i, format(val, 'd'),
                         ha="center", va="center", color=color, fontsize=11, weight="bold")

        plt.ylabel("True Label")
        plt.xlabel("Predicted Label")
        plt.tight_layout()

        cm_plot_path = os.path.join(REPORTS_DIR, "confusion_matrix.png")
        plt.savefig(cm_plot_path, dpi=150)
        plt.close()
        print(f"[+] Saved confusion matrix image to: {cm_plot_path}")
    except Exception as e:
        print(f"[!] Note: Could not render confusion matrix plot ({e})")

    return metrics_report

if __name__ == "__main__":
    evaluate_model()
