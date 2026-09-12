# ClearInspect AI

## Industrial Wood Defect Detection & Explainability System

ClearInspect AI is a computer vision system for automated wood surface inspection. It uses a **ResNet-18** deep learning classifier to identify wood surface conditions and **Grad-CAM** to visually explain the regions that influenced the model's prediction.

The system supports two inspection modes:

* **Live Camera** — real-time inspection using a webcam.
* **Upload & Analyze** — high-resolution image inspection through file upload.

---

## Features

* Automated wood defect classification
* ResNet-18 based image classification
* Explainable AI using Grad-CAM heatmaps
* Live webcam inspection
* High-resolution image upload
* FastAPI inference API
* React 19 frontend
* Tailwind CSS interface
* Confidence score and defect explanation
* Confusion matrix and evaluation reports
* Camera stream cleanup when leaving the live inspection page

---

## 🔍 Supported Defect Classes

The model classifies images into six categories:

| Class      | Description                           |
| ---------- | ------------------------------------- |
| `good`     | Normal wood surface                   |
| `color`    | Color-related surface anomaly         |
| `combined` | Combined surface anomaly              |
| `hole`     | Hole or opening in the wood surface   |
| `liquid`   | Liquid or sap-related surface anomaly |
| `scratch`  | Linear surface abrasion or tool gouge |

The project uses the **MVTec Anomaly Detection (MVTec AD) Wood Benchmark**.

---

## Model

ClearInspect AI uses **ResNet-18** with pretrained ImageNet weights.

### Training Configuration

* Architecture: ResNet-18
* Parameters: approximately 11.2M
* Classification outputs: 6
* Optimizer: Adam
* Learning rate: `0.0001`
* Batch size: `16`
* Training epochs: `15`
* Loss: Categorical Cross-Entropy
* Input size: `224 × 224`

The final fully connected layer is modified to produce six class outputs.

---

## Explainable AI with Grad-CAM

Grad-CAM is used to show which regions of the wood image contributed to the model's prediction.

The implementation uses the final ResNet-18 convolutional layer:

```text
model.layer4[-1]
```

### Grad-CAM Pipeline

```text
Input Image
     ↓
ResNet-18
     ↓
Predicted Class
     ↓
Gradient Calculation
     ↓
Grad-CAM Heatmap
     ↓
Heatmap Overlay
```

The heatmap is normalized, resized to the original image dimensions, color-mapped using OpenCV, and blended with the original image.

---

## System Architecture

```text
                ┌──────────────────────┐
                │   Live Camera Feed   │
                └──────────┬───────────┘
                           │
                ┌──────────▼───────────┐
                │  High-Resolution     │
                │    Image Upload      │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │      FastAPI API     │
                │      /predict        │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Image Preprocessing  │
                │   & Normalization    │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │      ResNet-18       │
                │  Wood Classification │
                └──────────┬───────────┘
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
        ┌────────────────┐   ┌────────────────┐
        │ Class &        │   │    Grad-CAM    │
        │ Confidence     │   │    Heatmap     │
        └────────┬───────┘   └───────┬────────┘
                 │                   │
                 └─────────┬─────────┘
                           ▼
                ┌──────────────────────┐
                │ JSON + Base64 Image  │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   React 19 Frontend  │
                └──────────────────────┘
```

The architecture connects live camera/high-resolution image input to the FastAPI backend, ResNet-18 classification, Grad-CAM explanation, and React frontend.

---


## Model Evaluation

The documented evaluation was performed on **113 independent test specimens**.

Reported overall performance:

* **Accuracy:** 98.23%
* **Macro Precision:** 0.9603
* **Macro Recall:** 0.9389
* **Macro F1-Score:** 0.9475

The evaluation pipeline generates classification metrics and confusion-matrix reports.

---

## Frontend

The frontend is built using:

* React 19
* Vite
* Tailwind CSS


---





## Project Summary

**ClearInspect AI** combines deep learning, computer vision, Explainable AI, and a web-based inspection interface into an end-to-end wood defect detection system.

```text
Wood Image
    ↓
ResNet-18 Classification
    ↓
Defect Prediction + Confidence
    ↓
Grad-CAM Explanation
    ↓
FastAPI
    ↓
React Interface
```

**ClearInspect AI —  Wood Defect Detection & Explainability System**
