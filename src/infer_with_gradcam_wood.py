import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.pipeline.gradcam import WoodDefectDetector

def main():
    if len(sys.argv) != 2:
        print("Usage: python src/infer_with_gradcam_wood.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(f"Error: Image not found at '{image_path}'")
        sys.exit(1)

    detector = WoodDefectDetector()
    detector.predict_and_save(image_path, output_dir="output")

if __name__ == "__main__":
    main()