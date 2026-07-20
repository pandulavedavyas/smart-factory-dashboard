import os
import io
from datetime import datetime
from flask import Blueprint, request, jsonify, send_file
from backend.app import db
from backend.models.database import Machine, Prediction, Dataset, Report, ActivityLog
from backend.api.auth import auth_required, role_required
from backend.utils.report_utils import generate_report, generate_pdf, export_csv
from backend.utils.export_helper import get_report_data, generate_csv, generate_xlsx, generate_pdf_report, generate_docx_report

reports_bp = Blueprint("reports", __name__)
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "static", "reports")


@reports_bp.route("/generate", methods=["POST"])
@auth_required
@role_required("admin", "manager")
def create_report():
    data = request.get_json()
    report_type = data.get("type", "daily")
    fmt = data.get("format", "txt")

    if fmt == "pdf":
        filename = generate_pdf(report_type, db, Machine, Prediction, Dataset)
    else:
        filename = generate_report(report_type, db, Machine, Prediction, Dataset)

    report = Report(report_type=report_type, title=f"{report_type.title()} Report",
                   format=fmt, file_path=filename)
    db.session.add(report)
    log = ActivityLog(action="generate_report", entity_type="report",
                     details=f"Generated {report_type} {fmt} report")
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Report generated", "filename": filename})


@reports_bp.route("/list", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def list_reports():
    reports = Report.query.order_by(Report.created_at.desc()).all()
    return jsonify([{
        "id": r.id, "type": r.report_type, "title": r.title,
        "format": r.format, "file": r.file_path,
        "created_at": r.created_at.isoformat() if r.created_at else ""
    } for r in reports])


@reports_bp.route("/download/<filename>", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def download(filename):
    filepath = os.path.join(REPORTS_DIR, filename)
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)
    return jsonify({"error": "File not found"}), 404


@reports_bp.route("/export/csv", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def export():
    filename = export_csv(db, Machine, Prediction)
    return jsonify({"filename": filename})


@reports_bp.route("/export", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def export_report():
    category = request.args.get("category", "production")
    fmt = request.args.get("format", "csv").lower()
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    title, headers, data = get_report_data(category, start_date, end_date)

    if fmt == "csv":
        bytes_data = generate_csv(headers, data)
        mimetype = "text/csv"
        filename = f"{category}_report_{datetime.now().strftime('%Y%m%d')}.csv"
    elif fmt in ["xlsx", "excel"]:
        bytes_data = generate_xlsx(title, headers, data)
        mimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"{category}_report_{datetime.now().strftime('%Y%m%d')}.xlsx"
    elif fmt == "pdf":
        bytes_data = generate_pdf_report(title, headers, data)
        mimetype = "application/pdf"
        filename = f"{category}_report_{datetime.now().strftime('%Y%m%d')}.pdf"
    elif fmt in ["docx", "word"]:
        bytes_data = generate_docx_report(title, headers, data)
        mimetype = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = f"{category}_report_{datetime.now().strftime('%Y%m%d')}.docx"
    else:
        return jsonify({"error": "Unsupported format"}), 400

    buffer = io.BytesIO(bytes_data)
    return send_file(
        buffer,
        mimetype=mimetype,
        as_attachment=True,
        download_name=filename
    )
