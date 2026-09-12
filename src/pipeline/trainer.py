import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets
from torch.utils.data import DataLoader
from typing import Dict, Any

from src.config import (
    TRAIN_DATA_PATH,
    TEST_DATA_PATH,
    MODEL_PATH,
    BATCH_SIZE,
    NUM_EPOCHS,
    LEARNING_RATE,
    DEVICE,
    REPORTS_DIR,
    CLASS_NAMES
)
from src.pipeline.model import build_model, get_transforms, save_model

def train_classifier(
    train_dir: str = TRAIN_DATA_PATH,
    val_dir: str = TEST_DATA_PATH,
    model_save_path: str = MODEL_PATH,
    epochs: int = NUM_EPOCHS,
    batch_size: int = BATCH_SIZE,
    lr: float = LEARNING_RATE,
    device: torch.device = DEVICE
) -> Dict[str, Any]:
    
    if not os.path.exists(train_dir) or not os.path.exists(val_dir):
        raise FileNotFoundError(
            f"Training or validation directory not found. Please run data preparation first!"
        )

    transform = get_transforms()

    train_dataset = datasets.ImageFolder(root=train_dir, transform=transform)
    val_dataset = datasets.ImageFolder(root=val_dir, transform=transform)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    num_classes = len(train_dataset.classes)
    print(f"[*] Training on device: {device}")
    print(f"[*] Detected classes ({num_classes}): {train_dataset.classes}")
    print(f"[*] Train samples: {len(train_dataset)}, Validation samples: {len(val_dataset)}")

    model = build_model(num_classes=num_classes, pretrained=True, device=device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)

    history = {
        "train_loss": [],
        "train_acc": [],
        "val_loss": [],
        "val_acc": []
    }

    best_val_acc = 0.0

    print("\n" + "=" * 60)
    print(f"Starting Training for {epochs} Epochs")
    print("=" * 60)

    for epoch in range(epochs):
        # 1. Training Phase
        model.train()
        running_loss = 0.0
        train_correct = 0
        train_total = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            train_total += labels.size(0)
            train_correct += (preds == labels).sum().item()

        epoch_train_loss = running_loss / train_total
        epoch_train_acc = (train_correct / train_total) * 100.0

        # 2. Validation Phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(device)
                labels = labels.to(device)

                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_total += labels.size(0)
                val_correct += (preds == labels).sum().item()

        epoch_val_loss = val_loss / val_total
        epoch_val_acc = (val_correct / val_total) * 100.0

        history["train_loss"].append(epoch_train_loss)
        history["train_acc"].append(epoch_train_acc)
        history["val_loss"].append(epoch_val_loss)
        history["val_acc"].append(epoch_val_acc)

        print(f"Epoch [{epoch + 1:02d}/{epochs:02d}] "
              f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:6.2f}% | "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:6.2f}%", end="")

        if epoch_val_acc >= best_val_acc:
            best_val_acc = epoch_val_acc
            save_model(model, model_save_path)
            print("  <-- (Saved Best Model)")
        else:
            print()

    print("=" * 60)
    print(f"[+] Training complete! Best Validation Accuracy: {best_val_acc:.2f}%")

    # Save training history JSON
    history_path = os.path.join(REPORTS_DIR, "training_history.json")
    with open(history_path, "w") as f:
        json.dump(history, f, indent=4)
    print(f"[+] Saved training history to: {history_path}")

    # Generate curves plot if matplotlib is available
    try:
        import matplotlib.pyplot as plt
        plt.figure(figsize=(12, 4))

        plt.subplot(1, 2, 1)
        plt.plot(range(1, epochs + 1), history["train_loss"], label="Train Loss", marker='o')
        plt.plot(range(1, epochs + 1), history["val_loss"], label="Val Loss", marker='s')
        plt.title("Loss over Epochs")
        plt.xlabel("Epoch")
        plt.ylabel("Cross-Entropy Loss")
        plt.grid(True, linestyle="--", alpha=0.6)
        plt.legend()

        plt.subplot(1, 2, 2)
        plt.plot(range(1, epochs + 1), history["train_acc"], label="Train Acc", marker='o')
        plt.plot(range(1, epochs + 1), history["val_acc"], label="Val Acc", marker='s')
        plt.title("Accuracy over Epochs (%)")
        plt.xlabel("Epoch")
        plt.ylabel("Accuracy (%)")
        plt.grid(True, linestyle="--", alpha=0.6)
        plt.legend()

        plot_path = os.path.join(REPORTS_DIR, "training_curves.png")
        plt.tight_layout()
        plt.savefig(plot_path, dpi=150)
        plt.close()
        print(f"[+] Saved training curves to: {plot_path}")
    except Exception as e:
        print(f"[!] Note: Could not render matplotlib curves ({e}). History JSON saved.")

    return history

if __name__ == "__main__":
    train_classifier()
