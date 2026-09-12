from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

from src.config import MODEL_PATH
from src.pipeline.gradcam import WoodDefectDetector

app = FastAPI(
    title="Wood Defect Detection & Explainable AI API",
    description="Real-time defect classification and Grad-CAM visual explanation service."
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy/global model initialization
detector = None

def get_detector():
    global detector
    if detector is None:
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(
                f"Model checkpoint not found at '{MODEL_PATH}'. Run 'python run_pipeline.py --stage train' first."
            )
        detector = WoodDefectDetector()
    return detector

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model_loaded": detector is not None or os.path.exists(MODEL_PATH)
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        det = get_detector()
        contents = await file.read()
        result = det.predict(contents)

        return {
            "predicted_class": result["predicted_class"],
            "confidence": result["confidence"],
            "explanation": result["explanation"],
            "heatmap_image": result["heatmap_image"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))