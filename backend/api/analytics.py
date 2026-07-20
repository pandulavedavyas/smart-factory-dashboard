import os
import json
import pandas as pd
import numpy as np
from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models.database import Dataset, Machine, Prediction, ActivityLog
from backend.api.auth import auth_required, role_required
from backend.services.dataset_service import load_dataframe, correlation_matrix
from backend.ml.models import train_failure_model, train_production_model, predict_failure, predict_production
from backend.services.analytics_service import machine_analytics, failure_analysis, production_trends
from backend.config import Config

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/eda/<int:dataset_id>", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_eda(dataset_id):
    dataset = db.session.get(Dataset, dataset_id)
    if not dataset:
        return jsonify({"error": "Dataset not found"}), 404

    filepath = os.path.join(Config.UPLOAD_FOLDER, dataset.filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    df = load_dataframe(filepath, dataset.filename)
    numeric = df.select_dtypes(include=[np.number])

    eda = {
        "columns": list(df.columns),
        "dtypes": {str(k): str(v) for k, v in df.dtypes.items()},
        "summary": json.loads(dataset.summary_json) if dataset.summary_json else {},
        "missing": json.loads(dataset.missing_values_json) if dataset.missing_values_json else {},
        "correlation": correlation_matrix(df),
        "shape": [len(df), len(df.columns)],
        "numeric_columns": list(numeric.columns),
        "categorical_columns": list(df.select_dtypes(include=["object"]).columns),
    }

    # Outlier detection
    outliers = {}
    for col in numeric.columns[:10]:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        low = Q1 - 1.5 * IQR
        high = Q3 + 1.5 * IQR
        count = int(((df[col] < low) | (df[col] > high)).sum())
        outliers[col] = {"count": count, "lower": float(low), "upper": float(high)}

    eda["outliers"] = outliers
    return jsonify(eda)


@analytics_bp.route("/train", methods=["POST"])
@auth_required
@role_required("admin", "manager")
def train_model():
    data = request.get_json()
    dataset_id = data.get("dataset_id")
    target_col = data.get("target_col", "machine_failure")
    model_type = data.get("model_type", "failure")

    dataset = db.session.get(Dataset, dataset_id) if dataset_id else None
    if dataset:
        filepath = os.path.join(Config.UPLOAD_FOLDER, dataset.filename)
        if not os.path.exists(filepath):
            return jsonify({"error": "Dataset file not found"}), 404
        df = load_dataframe(filepath, dataset.filename)
    else:
        # Use seed machines data
        machines = Machine.query.all()
        df = pd.DataFrame([{
            "temperature": m.temperature, "vibration": m.vibration,
            "rpm": m.rpm, "torque": m.torque, "tool_wear": m.tool_wear,
            "operating_hours": m.operating_hours, "health_score": m.health_score,
        } for m in machines])

        # Add synthetic failure column
        df["machine_failure"] = [1 if m.status == "down" else 0 for m in machines]
        df["production_output"] = [int(m.operating_hours * np.random.uniform(0.8, 1.2)) for m in machines]

    if model_type == "failure":
        result = train_failure_model(df, target_col)
    elif model_type == "production":
        result = train_production_model(df, target_col)
    else:
        return jsonify({"error": "Unknown model type"}), 400

    log = ActivityLog(action="train", entity_type="model",
                     details=f"Trained {model_type} model on '{target_col}'")
    db.session.add(log)
    db.session.commit()

    return jsonify(result)


@analytics_bp.route("/predict", methods=["POST"])
@auth_required
@role_required("admin", "manager")
def make_prediction():
    data = request.get_json()
    features = data.get("features", {})

    from backend.ml.models import predict_failure, predict_production
    prediction_type = data.get("type", "failure")

    if prediction_type == "failure":
        result = predict_failure(features)
    elif prediction_type == "production":
        result = predict_production(features)
    else:
        return jsonify({"error": "Unknown prediction type"}), 400

    return jsonify(result)


@analytics_bp.route("/insights", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_insights():
    from backend.services.analytics_service import failure_analysis
    failures = failure_analysis(Machine, Prediction)
    trends = production_trends(Prediction)

    insight_count = 0
    insights = []
    for f in failures[:3]:
        if f["failure_rate"] > 50:
            insights.append({
                "type": "critical",
                "title": f"High failure rate: {f['machine']}",
                "description": f"Failure rate at {f['failure_rate']}%. Schedule maintenance immediately.",
                "icon": "exclamation-triangle"
            })
            insight_count += 1
        elif f["failure_rate"] > 20:
            insights.append({
                "type": "warning",
                "title": f"Monitor {f['machine']}",
                "description": f"Failure rate at {f['failure_rate']}%. Increase inspection frequency.",
                "icon": "exclamation-circle"
            })
            insight_count += 1

    machines = Machine.query.all()
    for m in machines:
        if m.health_score < 60:
            insights.append({
                "type": "critical",
                "title": f"Low health: {m.name}",
                "description": f"Health score at {m.health_score}%. Immediate maintenance required.",
                "icon": "heart-broken"
            })
            insight_count += 1
        elif m.temperature > 80:
            insights.append({
                "type": "warning",
                "title": f"High temperature: {m.name}",
                "description": f"Temperature at {m.temperature}°C. Check cooling system.",
                "icon": "thermometer-half"
            })
            insight_count += 1

    insights.append({
        "type": "success",
        "title": "Production is on track",
        "description": f"Current production trend is stable across {len(machines)} machines.",
        "icon": "check-circle"
    })

    return jsonify({"count": len(insights), "insights": insights})


@analytics_bp.route("/distributions/<int:dataset_id>", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_distributions(dataset_id):
    dataset = db.session.get(Dataset, dataset_id)
    if not dataset:
        return jsonify({"error": "Dataset not found"}), 404
    filepath = os.path.join(Config.UPLOAD_FOLDER, dataset.filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
    df = load_dataframe(filepath, dataset.filename)
    numeric = df.select_dtypes(include=[np.number]).columns[:6].tolist()
    dists = {}
    for col in numeric:
        dists[col] = {
            "values": df[col].dropna().tolist()[:500],
            "mean": float(df[col].mean()),
            "median": float(df[col].median()),
            "std": float(df[col].std()),
        }
    return jsonify(dists)
