
import sys
import os
import argparse
import subprocess

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.config import (
    RAW_DATA_PATH,
    PROCESSED_DATA_PATH,
    MODEL_PATH,
    NUM_EPOCHS,
    BATCH_SIZE,
    LEARNING_RATE
)

def stage_prepare():
    print("\n" + "=" * 70)
    print("STAGE 1: DATA PREPARATION & SPLITTING")
    print("=" * 70)
    from src.pipeline.data_prep import prepare_and_split_data
    stats = prepare_and_split_data()
    return stats

def stage_train(epochs: int = NUM_EPOCHS, batch_size: int = BATCH_SIZE, lr: float = LEARNING_RATE):
    print("\n" + "=" * 70)
    print("STAGE 2: MODEL TRAINING (ResNet-18)")
    print("=" * 70)
    from src.pipeline.trainer import train_classifier
    history = train_classifier(epochs=epochs, batch_size=batch_size, lr=lr)
    return history

def stage_evaluate():
    print("\n" + "=" * 70)
    print("STAGE 3: MODEL EVALUATION & METRICS")
    print("=" * 70)
    from src.pipeline.evaluator import evaluate_model
    metrics = evaluate_model()
    return metrics

def stage_infer(image_path: str):
    print("\n" + "=" * 70)
    print("STAGE 4: INFERENCE & GRAD-CAM EXPLAINABILITY")
    print("=" * 70)
    from src.pipeline.gradcam import WoodDefectDetector
    detector = WoodDefectDetector()
    results = detector.predict_and_save(image_path)
    return results

def stage_serve(host: str = "127.0.0.1", port: int = 8000):
    print("\n" + "=" * 70)
    print(f"STAGE 5: SERVING FASTAPI SERVICE (http://{host}:{port})")
    print("=" * 70)
    import uvicorn
    uvicorn.run("src.api:app", host=host, port=port, reload=True)

def stage_all(sample_image: str = None):
    print("\n" + "#" * 70)
    print("STARTING FULL END-TO-END PIPELINE")
    print("#" * 70)
    
    # 1. Prepare
    stage_prepare()
    
    # 2. Train
    stage_train()
    
    # 3. Evaluate
    stage_evaluate()
    
    # 4. Infer
    if not sample_image:
        # Check for temp.jpg or pick an image from test set
        if os.path.exists("temp.jpg"):
            sample_image = "temp.jpg"
        else:
            test_dir = os.path.join(PROCESSED_DATA_PATH, "test", "scratch")
            if os.path.exists(test_dir) and os.listdir(test_dir):
                sample_image = os.path.join(test_dir, os.listdir(test_dir)[0])
    
    if sample_image and os.path.exists(sample_image):
        print(f"\n[*] Running validation inference on: {sample_image}")
        stage_infer(sample_image)
    
    print("\n" + "#" * 70)
    print("FULL PIPELINE COMPLETED SUCCESSFULLY!")
    print("#" * 70)

def main():
    parser = argparse.ArgumentParser(
        description="Wood Defect Detection - End-to-End Pipeline CLI",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "--stage",
        type=str,
        required=True,
        choices=["prepare", "train", "evaluate", "infer", "serve", "all"],
        help="Pipeline stage to execute."
    )
    # Hyperparameters for training
    parser.add_argument("--epochs", type=int, default=NUM_EPOCHS, help="Number of training epochs.")
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE, help="Batch size.")
    parser.add_argument("--lr", type=float, default=LEARNING_RATE, help="Learning rate.")
    # Inference argument
    parser.add_argument("--image", type=str, default=None, help="Image file path for inference stage.")
    # Server arguments
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host IP for FastAPI service.")
    parser.add_argument("--port", type=int, default=8000, help="Port for FastAPI service.")

    args = parser.parse_args()

    if args.stage == "prepare":
        stage_prepare()
    elif args.stage == "train":
        stage_train(epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
    elif args.stage == "evaluate":
        stage_evaluate()
    elif args.stage == "infer":
        if not args.image:
            print("[!] Error: --image <path> is required when --stage infer is selected.")
            sys.exit(1)
        stage_infer(args.image)
    elif args.stage == "serve":
        stage_serve(host=args.host, port=args.port)
    elif args.stage == "all":
        stage_all(sample_image=args.image)

if __name__ == "__main__":
    main()
