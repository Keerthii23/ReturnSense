from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
import numpy as np

app = FastAPI(title="ReturnSense AI Prediction Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo training data only.
# These synthetic examples are not real customer records.
# Features: category code, price in INR, days since purchase.
X = np.array([
    [0, 10000, 2],
    [0, 20000, 5],
    [0, 50000, 10],
    [0, 30000, 25],
    [1, 40000, 3],
    [1, 80000, 8],
    [1, 60000, 20],
    [1, 90000, 30],
    [2, 3000, 2],
    [2, 8000, 6],
    [2, 12000, 15],
    [2, 5000, 28],
    [0, 15000, 18],
    [1, 50000, 12],
    [2, 7000, 22],
    [0, 40000, 30],
    [1, 70000, 4],
    [2, 10000, 4],
    [0, 25000, 8],
    [1, 85000, 16],
], dtype=float)

# Demo labels: 1 = returned, 0 = not returned.
y = np.array([
    1, 1, 0, 0,
    1, 0, 0, 0,
    1, 1, 0, 0,
    0, 1, 0, 0,
    1, 1, 0, 1,
], dtype=int)

model = make_pipeline(
    StandardScaler(),
    LogisticRegression(random_state=42)
)
model.fit(X, y)

CATEGORY_CODES = {
    "Mobiles": 0,
    "Laptops": 1,
    "Audio": 2,
}


class PredictionRequest(BaseModel):
    category: str
    price: float = Field(gt=0, le=10000000)
    daysSincePurchase: int = Field(ge=0, le=3650)


@app.get("/")
def home():
    return {
        "service": "ReturnSense AI",
        "status": "running",
        "modelType": "demo logistic regression",
        "trainingData": "synthetic examples",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/predict")
def predict_return_risk(request: PredictionRequest):
    if request.category not in CATEGORY_CODES:
        return {
            "riskLevel": "Unavailable",
            "probability": None,
            "note": "Supported categories are Mobiles, Laptops, and Audio.",
        }

    features = np.array([[
        CATEGORY_CODES[request.category],
        request.price,
        request.daysSincePurchase,
    ]])

    probability = float(model.predict_proba(features)[0][1])

    if probability >= 0.65:
        risk_level = "High"
    elif probability >= 0.35:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "riskLevel": risk_level,
        "probability": round(probability, 4),
        "note": (
            "Demo estimate from a model trained on synthetic data; "
            "not validated for real business decisions."
        ),
    }