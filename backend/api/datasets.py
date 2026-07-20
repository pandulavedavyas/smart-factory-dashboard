import os
import json
import pandas as pd
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from backend.app import db
from backend.models.database import Dataset, ActivityLog
from backend.api.auth import auth_required, role_required
from backend.services.dataset_service import (
    allowed_file, load_dataframe, clean_dataset,
    summary_stats, missing_values, correlation_matrix, get_preview
)
from backend.config import Config

datasets_bp = Blueprint("datasets", __name__)


@datasets_bp.route("/upload", methods=["POST"])
@auth_required
@role_required("admin", "manager")
def upload_dataset():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Use CSV or Excel."}), 400

    filename = secure_filename(file.filename)
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(filepath)

    original_name = file.filename
    file_size = os.path.getsize(filepath)

    try:
        df = load_dataframe(filepath, filename)
        df_clean, clean_report = clean_dataset(df)

        # Save cleaned data back
        df_clean.to_csv(filepath.replace(".", "_cleaned.") if "." in filepath else filepath + "_cleaned", index=False)

        stats = summary_stats(df_clean)
        missing = missing_values(df_clean)
        corr = correlation_matrix(df_clean)
        preview = get_preview(df_clean, 20)
        columns = list(df_clean.columns)
        dtypes = {str(k): str(v) for k, v in df_clean.dtypes.items()}

        dataset = Dataset(
            filename=filename,
            original_filename=original_name,
            file_size=file_size,
            row_count=len(df_clean),
            column_count=len(columns),
            columns_json=json.dumps(columns),
            dtypes_json=json.dumps(dtypes),
            summary_json=json.dumps(stats),
            missing_values_json=json.dumps(missing),
            status="processed",
        )
        db.session.add(dataset)
        db.session.commit()

        log = ActivityLog(action="upload", entity_type="dataset", entity_id=dataset.id,
                         details=f"Uploaded {original_name} ({len(df_clean)} rows)")
        db.session.add(log)
        db.session.commit()

        return jsonify({
            "id": dataset.id,
            "filename": original_name,
            "row_count": len(df_clean),
            "column_count": len(columns),
            "columns": columns,
            "dtypes": dtypes,
            "preview": preview,
            "summary": stats,
            "missing_values": missing,
            "correlation_matrix": corr,
            "clean_report": clean_report,
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@datasets_bp.route("/list", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def list_datasets():
    datasets = Dataset.query.order_by(Dataset.created_at.desc()).all()
    return jsonify([{
        "id": d.id, "filename": d.original_filename,
        "rows": d.row_count, "cols": d.column_count,
        "status": d.status, "uploaded": d.created_at.isoformat() if d.created_at else ""
    } for d in datasets])


@datasets_bp.route("/<int:dataset_id>", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_dataset(dataset_id):
    dataset = db.session.get(Dataset, dataset_id)
    if not dataset:
        return jsonify({"error": "Dataset not found"}), 404
    return jsonify({
        "id": dataset.id,
        "filename": dataset.original_filename,
        "row_count": dataset.row_count,
        "column_count": dataset.column_count,
        "columns": json.loads(dataset.columns_json) if dataset.columns_json else [],
        "dtypes": json.loads(dataset.dtypes_json) if dataset.dtypes_json else {},
        "summary": json.loads(dataset.summary_json) if dataset.summary_json else {},
        "missing_values": json.loads(dataset.missing_values_json) if dataset.missing_values_json else {},
        "status": dataset.status,
    })


@datasets_bp.route("/<int:dataset_id>/preview", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def preview_dataset(dataset_id):
    dataset = db.session.get(Dataset, dataset_id)
    if not dataset:
        return jsonify({"error": "Dataset not found"}), 404
    filepath = os.path.join(Config.UPLOAD_FOLDER, dataset.filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
    df = load_dataframe(filepath, dataset.filename)
    return jsonify({
        "columns": list(df.columns),
        "preview": get_preview(df, 50),
        "dtypes": {str(k): str(v) for k, v in df.dtypes.items()},
    })


@datasets_bp.route("/<int:dataset_id>", methods=["DELETE"])
@auth_required
@role_required("admin")
def delete_dataset(dataset_id):
    dataset = db.session.get(Dataset, dataset_id)
    if not dataset:
        return jsonify({"error": "Dataset not found"}), 404
    filepath = os.path.join(Config.UPLOAD_FOLDER, dataset.filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    db.session.delete(dataset)
    db.session.commit()
    return jsonify({"message": "Dataset deleted"})
