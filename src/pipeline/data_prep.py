import os
import shutil
import random
from typing import Dict, Tuple
from src.config import (
    RAW_DATA_PATH,
    PROCESSED_DATA_PATH,
    TRAIN_DATA_PATH,
    TEST_DATA_PATH,
    CLASS_NAMES,
    SPLIT_RATIO,
    RANDOM_SEED
)

def prepare_and_split_data(
    raw_path: str = RAW_DATA_PATH,
    output_path: str = PROCESSED_DATA_PATH,
    split_ratio: float = SPLIT_RATIO,
    seed: int = RANDOM_SEED
) -> Dict[str, Dict[str, int]]:

    random.seed(seed)

    if not os.path.exists(raw_path):
        raise FileNotFoundError(f"Source raw dataset directory not found: {raw_path}")

    # Create destination class directories
    for split in ["train", "test"]:
        for cls in CLASS_NAMES:
            os.makedirs(os.path.join(output_path, split, cls), exist_ok=True)

    stats = {"train": {cls: 0 for cls in CLASS_NAMES}, "test": {cls: 0 for cls in CLASS_NAMES}}

    def split_and_copy(images, class_name):
        random.shuffle(images)
        split_idx = int(len(images) * split_ratio)
        train_imgs = images[:split_idx]
        test_imgs = images[split_idx:]

        for img in train_imgs:
            dst = os.path.join(output_path, "train", class_name, os.path.basename(img))
            if not os.path.exists(dst):
                shutil.copy2(img, dst)
            stats["train"][class_name] += 1

        for img in test_imgs:
            dst = os.path.join(output_path, "test", class_name, os.path.basename(img))
            if not os.path.exists(dst):
                shutil.copy2(img, dst)
            stats["test"][class_name] += 1

    # 1. Process normal / good images
    good_images = []
    good_train_dir = os.path.join(raw_path, "train", "good")
    good_test_dir = os.path.join(raw_path, "test", "good")

    if os.path.exists(good_train_dir):
        good_images.extend([os.path.join(good_train_dir, f) for f in os.listdir(good_train_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
    if os.path.exists(good_test_dir):
        good_images.extend([os.path.join(good_test_dir, f) for f in os.listdir(good_test_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])

    if not good_images:
        raise ValueError(f"No 'good' class images found under {raw_path}")

    print(f"[*] Found {len(good_images)} total normal ('good') images.")
    split_and_copy(good_images, "good")

    # 2. Process defect categories from raw test folder
    raw_test_dir = os.path.join(raw_path, "test")
    for cls in CLASS_NAMES:
        if cls == "good":
            continue
        defect_dir = os.path.join(raw_test_dir, cls)
        if not os.path.exists(defect_dir):
            print(f"[!] Warning: Defect directory not found: {defect_dir}")
            continue

        defect_images = [
            os.path.join(defect_dir, f)
            for f in os.listdir(defect_dir)
            if f.lower().endswith(('.png', '.jpg', '.jpeg'))
        ]
        print(f"[*] Found {len(defect_images)} images for defect '{cls}'.")
        split_and_copy(defect_images, cls)

    print(f"\n[+] Dataset successfully prepared at: {output_path}")
    print("[+] Dataset distribution:")
    for split in ["train", "test"]:
        total_split = sum(stats[split].values())
        print(f"    {split.upper()} (Total: {total_split}): {stats[split]}")

    return stats

if __name__ == "__main__":
    prepare_and_split_data()
