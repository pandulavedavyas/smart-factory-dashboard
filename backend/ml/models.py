import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, roc_curve, classification_report
import joblib

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")


def _model_path(name):
    return os.path.join(MODELS_DIR, name)


def train_failure_model(df, target_col="machine_failure"):
    """Train a machine failure prediction model."""
    if target_col not in df.columns:
        return {"error": f"Target column '{target_col}' not found in dataset"}

    # Prepare features
    X = df.select_dtypes(include=[np.number]).drop(columns=[target_col], errors="ignore")
    y = df[target_col]

    if y.nunique() < 2:
        return {"error": "Target column must have at least 2 unique values"}

    # Handle missing values
    X = X.fillna(X.median())

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else None

    accuracy = float(accuracy_score(y_test, y_pred))
    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(y_test, y_pred, output_dict=True)

    # Feature importance
    importance = {str(X.columns[i]): float(model.feature_importances_[i]) for i in range(len(X.columns))}
    importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))

    # ROC curve
    fpr, tpr, thresholds = roc_curve(y_test, y_proba) if y_proba is not None else ([], [], [])

    # Save model
    path = _model_path("failure_model.pkl")
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(model, path)

    return {
        "model_path": path,
        "accuracy": round(accuracy * 100, 2),
        "confusion_matrix": cm,
        "classification_report": report,
        "feature_importance": importance,
        "roc_curve": {
            "fpr": [float(x) for x in fpr],
            "tpr": [float(x) for x in tpr],
        },
        "features_used": list(X.columns),
        "test_samples": len(X_test),
    }


def train_production_model(df, target_col="production_output"):
    """Train a production forecasting model."""
    if target_col not in df.columns:
        return {"error": f"Target column '{target_col}' not found in dataset"}

    X = df.select_dtypes(include=[np.number]).drop(columns=[target_col], errors="ignore")
    y = df[target_col]
    X = X.fillna(X.median())

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = float(np.mean(np.abs(y_test - y_pred)))
    mse = float(np.mean((y_test - y_pred) ** 2))

    importance = {str(X.columns[i]): float(model.feature_importances_[i]) for i in range(len(X.columns))}
    importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))

    path = _model_path("production_model.pkl")
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(model, path)

    return {
        "model_path": path,
        "mae": round(mae, 2),
        "mse": round(mse, 2),
        "rmse": round(np.sqrt(mse), 2),
        "feature_importance": importance,
        "features_used": list(X.columns),
        "test_samples": len(X_test),
    }


def load_model(name):
    path = _model_path(name)
    if os.path.exists(path):
        return joblib.load(path)
    return None


def predict_failure(features):
    model = load_model("failure_model.pkl")
    if not model:
        return {
            "prediction": int(np.random.choice([0, 1], p=[0.7, 0.3])),
            "probability": round(float(np.random.uniform(0, 0.5)), 3),
            "fallback": True
        }
    X = pd.DataFrame([features])[model.feature_names_in_]
    pred = int(model.predict(X)[0])
    proba = model.predict_proba(X)[0].tolist()
    return {
        "prediction": pred,
        "probability": round(float(max(proba)), 3),
        "fallback": False
    }


def predict_production(features):
    model = load_model("production_model.pkl")
    if not model:
        return {"forecast": [round(np.random.uniform(800, 1500)) for _ in range(7)], "fallback": True}
    X = pd.DataFrame([features])[model.feature_names_in_]
    pred = float(model.predict(X)[0])
    return {"forecast": [round(pred * np.random.uniform(0.95, 1.05)) for _ in range(7)], "fallback": False}
