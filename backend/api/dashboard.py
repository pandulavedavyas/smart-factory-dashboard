from flask import Blueprint, jsonify
from backend.app import db
from backend.models.database import Machine, Prediction, Dataset
from backend.api.auth import auth_required, role_required
from backend.services.analytics_service import (
    compute_dashboard_kpi, machine_analytics, production_trends, failure_analysis
)

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/kpi", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_kpi():
    data = compute_dashboard_kpi(Machine, Prediction, Dataset)
    return jsonify(data)


@dashboard_bp.route("/machines", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_machines():
    return jsonify(machine_analytics(Machine))


@dashboard_bp.route("/trends", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_trends():
    return jsonify(production_trends(Prediction))


@dashboard_bp.route("/failures", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_failures():
    return jsonify(failure_analysis(Machine, Prediction))
