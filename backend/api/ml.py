import os
import json
import pandas as pd
import numpy as np
from flask import Blueprint, request, jsonify
from backend.app import db
from backend.ml.models import train_failure_model, train_production_model
from backend.models.database import Dataset, Machine, Prediction, ActivityLog
from backend.api.auth import auth_required, role_required
from backend.services.dataset_service import load_dataframe
from backend.config import Config

ml_bp = Blueprint("ml", __name__)


@ml_bp.route("/train", methods=["POST"])
@auth_required
@role_required("admin", "manager")
def train():
    data = request.get_json()
    dataset_id = data.get("dataset_id")
    target_col = data.get("target_col", "machine_failure")
    model_type = data.get("model_type", "failure")

    if dataset_id:
        dataset = db.session.get(Dataset, dataset_id)
        if not dataset:
            return jsonify({"error": "Dataset not found"}), 404
        filepath = os.path.join(Config.UPLOAD_FOLDER, dataset.filename)
        if not os.path.exists(filepath):
            return jsonify({"error": "File not found"}), 404
        df = load_dataframe(filepath, dataset.filename)
    else:
        machines = Machine.query.all()
        df = pd.DataFrame([{
            "temperature": m.temperature, "vibration": m.vibration,
            "rpm": m.rpm, "torque": m.torque, "tool_wear": m.tool_wear,
            "operating_hours": m.operating_hours,
        } for m in machines])
        df["machine_failure"] = [1 if m.status == "down" else 0 for m in machines]
        df["production_output"] = [int(m.operating_hours * np.random.uniform(0.8, 1.2)) for m in machines]

    if target_col not in df.columns:
        return jsonify({"error": f"Target column '{target_col}' not found"}), 400

    result = train_failure_model(df, target_col) if model_type == "failure" else train_production_model(df, target_col)

    log = ActivityLog(action="train", entity_type="model",
                     details=f"Trained {model_type} model on '{target_col}'")
    db.session.add(log)
    db.session.commit()

    return jsonify(result)


@ml_bp.route("/predict", methods=["POST"])
@auth_required
@role_required("admin", "manager")
def predict():
    data = request.get_json()
    from backend.ml.models import predict_failure, predict_production
    f = data.get("features", {})
    ptype = data.get("type", "failure")
    result = predict_failure(f) if ptype == "failure" else predict_production(f)
    return jsonify(result)


@ml_bp.route("/models", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def list_models():
    import os
    models_dir = Config.MODELS_DIR
    models = []
    if os.path.exists(models_dir):
        for f in os.listdir(models_dir):
            if f.endswith(".pkl"):
                path = os.path.join(models_dir, f)
                models.append({
                    "name": f.replace(".pkl", ""),
                    "filename": f,
                    "size": os.path.getsize(path),
                    "modified": os.path.getmtime(path),
                })
    return jsonify(models)
