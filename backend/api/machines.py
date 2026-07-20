from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models.database import Machine, Prediction
from backend.api.auth import auth_required, role_required, log_activity

machines_bp = Blueprint("machines", __name__)


@machines_bp.route("", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def list_machines():
    status = request.args.get("status")
    mtype = request.args.get("machine_type")
    q = Machine.query
    if status:
        q = q.filter_by(status=status)
    if mtype:
        q = q.filter_by(machine_type=mtype)
    machines = q.order_by(Machine.name).all()
    return jsonify([{
        "id": m.id, "name": m.name, "code": m.code,
        "machine_type": m.machine_type, "status": m.status,
        "location": m.location, "temperature": m.temperature,
        "vibration": m.vibration, "rpm": m.rpm, "torque": m.torque,
        "power": m.power, "tool_wear": m.tool_wear,
        "health_score": m.health_score, "operating_hours": m.operating_hours,
        "last_maintenance": m.last_maintenance.isoformat() if m.last_maintenance else "",
    } for m in machines])


@machines_bp.route("/<int:machine_id>", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_machine(machine_id):
    m = db.session.get(Machine, machine_id)
    if not m:
        return jsonify({"error": "Machine not found"}), 404
    preds = Prediction.query.filter_by(machine_id=m.id).order_by(Prediction.created_at.desc()).limit(20).all()
    return jsonify({
        "id": m.id, "name": m.name, "code": m.code,
        "machine_type": m.machine_type, "status": m.status,
        "location": m.location, "temperature": m.temperature,
        "vibration": m.vibration, "rpm": m.rpm, "torque": m.torque,
        "power": m.power, "tool_wear": m.tool_wear,
        "health_score": m.health_score, "operating_hours": m.operating_hours,
        "last_maintenance": m.last_maintenance.isoformat() if m.last_maintenance else "",
        "predictions": [{
            "id": p.id, "type": p.prediction_type,
            "value": p.predicted_value, "confidence": p.confidence,
            "actual": p.actual_value,
            "created_at": p.created_at.isoformat() if p.created_at else "",
        } for p in preds],
    })


@machines_bp.route("", methods=["POST"])
@auth_required
@role_required("admin")
def create_machine():
    data = request.get_json()
    if not data.get("name") or not data.get("code") or not data.get("machine_type"):
        return jsonify({"error": "name, code, machine_type required"}), 400
    if Machine.query.filter_by(code=data["code"]).first():
        return jsonify({"error": "Machine code already exists"}), 409
    m = Machine(
        name=data["name"], code=data["code"],
        machine_type=data["machine_type"],
        location=data.get("location", ""),
        status=data.get("status", "idle"),
    )
    db.session.add(m)
    db.session.commit()
    log_activity("create_machine", "machine", m.id)
    return jsonify({"message": "Machine created", "id": m.id}), 201


@machines_bp.route("/<int:machine_id>", methods=["PUT"])
@auth_required
@role_required("admin", "manager")
def update_machine(machine_id):
    m = db.session.get(Machine, machine_id)
    if not m:
        return jsonify({"error": "Machine not found"}), 404
    data = request.get_json()
    for field in ("name", "code", "machine_type", "status", "location",
                  "temperature", "vibration", "rpm", "torque", "power",
                  "tool_wear", "health_score", "operating_hours"):
        if field in data:
            setattr(m, field, data[field])
    db.session.commit()
    log_activity("update_machine", "machine", m.id)
    return jsonify({"message": "Machine updated"})


@machines_bp.route("/<int:machine_id>", methods=["DELETE"])
@auth_required
@role_required("admin")
def delete_machine(machine_id):
    m = db.session.get(Machine, machine_id)
    if not m:
        return jsonify({"error": "Machine not found"}), 404
    db.session.delete(m)
    db.session.commit()
    log_activity("delete_machine", "machine", machine_id)
    return jsonify({"message": "Machine deleted"})


@machines_bp.route("/<int:machine_id>/maintenance", methods=["POST"])
@auth_required
@role_required("admin", "manager")
def schedule_maintenance(machine_id):
    m = db.session.get(Machine, machine_id)
    if not m:
        return jsonify({"error": "Machine not found"}), 404
    from datetime import datetime, timedelta
    m.last_maintenance = datetime.utcnow()
    m.health_score = min(100, m.health_score + 15)
    db.session.commit()
    log_activity("maintenance", "machine", m.id, "Maintenance performed")
    return jsonify({"message": "Maintenance recorded", "health_score": m.health_score})
