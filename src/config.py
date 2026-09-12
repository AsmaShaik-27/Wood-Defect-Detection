import os
import torch

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Dataset paths
RAW_DATA_PATH = os.path.join(BASE_DIR, "wood") if os.path.exists(os.path.join(BASE_DIR, "wood")) else os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "classification")
TRAIN_DATA_PATH = os.path.join(PROCESSED_DATA_PATH, "train")
TEST_DATA_PATH = os.path.join(PROCESSED_DATA_PATH, "test")

# Model checkpoints
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "wood_classifier.pth")

# Output and Reports
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
REPORTS_DIR = os.path.join(OUTPUT_DIR, "reports")
PREDICTIONS_DIR = os.path.join(OUTPUT_DIR, "predictions")

# Ensure required directories exist
for folder in [MODEL_DIR, OUTPUT_DIR, REPORTS_DIR, PREDICTIONS_DIR]:
    os.makedirs(folder, exist_ok=True)


CLASS_NAMES = ['color', 'combined', 'good', 'hole', 'liquid', 'scratch']
NUM_CLASSES = len(CLASS_NAMES)

# Human-readable domain explanations
DEFECT_EXPLANATIONS = {
    "scratch": "Elongated surface texture disruptions or gouges indicating a scratch defect.",
    "hole": "A circular/localized cavity with depth or dark contrast identified as a hole defect.",
    "liquid": "Irregular reflective or discolored patches suggesting liquid contamination or moisture stain.",
    "color": "Noticeable color inconsistency or discoloration compared to normal wood surface grain.",
    "combined": "Multiple defect types (e.g. scratches, discoloration, or cracks) co-occurring in the region.",
    "good": "Normal wood surface with regular grain patterns and no visible structural anomalies."
}

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
NUM_EPOCHS = 15
LEARNING_RATE = 1e-4
SPLIT_RATIO = 0.7
RANDOM_SEED = 42

# Device selection
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
