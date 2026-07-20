from flask import Blueprint, request, jsonify, g
from backend.app import db
from backend.models.database import Worker
from backend.api.auth import auth_required, role_required, log_activity

workers_bp = Blueprint("workers", __name__)


@workers_bp.route("", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def list_workers():
    dept = request.args.get("department")
    shift = request.args.get("shift")
    q = Worker.query
    if dept:
        q = q.filter_by(department=dept)
    if shift:
        q = q.filter_by(shift=shift)
    workers = q.order_by(Worker.first_name).all()
    return jsonify([{
        "id": w.id, "employee_code": w.employee_code,
        "first_name": w.first_name, "last_name": w.last_name,
        "full_name": f"{w.first_name} {w.last_name}",
        "department": w.department, "designation": w.designation,
        "shift": w.shift, "phone": w.phone, "email": w.email,
        "status": w.status, "performance_score": w.performance_score,
        "attendance_rate": w.attendance_rate,
        "hire_date": w.hire_date.isoformat() if w.hire_date else "",
        "hourly_rate": w.hourly_rate,
    } for w in workers])


@workers_bp.route("/<int:worker_id>", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_worker(worker_id):
    w = db.session.get(Worker, worker_id)
    if not w:
        return jsonify({"error": "Worker not found"}), 404
    return jsonify({
        "id": w.id, "employee_code": w.employee_code,
        "first_name": w.first_name, "last_name": w.last_name,
        "full_name": f"{w.first_name} {w.last_name}",
        "department": w.department, "designation": w.designation,
        "shift": w.shift, "phone": w.phone, "email": w.email,
        "status": w.status, "performance_score": w.performance_score,
        "attendance_rate": w.attendance_rate,
        "hire_date": w.hire_date.isoformat() if w.hire_date else "",
        "hourly_rate": w.hourly_rate,
    })


@workers_bp.route("", methods=["POST"])
@auth_required
@role_required("admin", "manager")
def create_worker():
    data = request.get_json()
    if not data.get("employee_code") or not data.get("first_name") or not data.get("last_name"):
        return jsonify({"error": "employee_code, first_name, last_name required"}), 400
    if Worker.query.filter_by(employee_code=data["employee_code"]).first():
        return jsonify({"error": "Employee code already exists"}), 409
    w = Worker(
        employee_code=data["employee_code"],
        first_name=data["first_name"],
        last_name=data["last_name"],
        department=data.get("department", ""),
        designation=data.get("designation", ""),
        shift=data.get("shift", "morning"),
        phone=data.get("phone", ""),
        email=data.get("email", ""),
        hourly_rate=data.get("hourly_rate", 15.0),
    )
    db.session.add(w)
    db.session.commit()
    log_activity("create_worker", "worker", w.id, f"Worker {w.employee_code} created")
    return jsonify({"message": "Worker created", "id": w.id}), 201


@workers_bp.route("/<int:worker_id>", methods=["PUT"])
@auth_required
@role_required("admin", "manager")
def update_worker(worker_id):
    w = db.session.get(Worker, worker_id)
    if not w:
        return jsonify({"error": "Worker not found"}), 404
    data = request.get_json()
    for field in ("first_name", "last_name", "department", "designation",
                  "shift", "phone", "email", "status", "performance_score",
                  "attendance_rate", "hourly_rate"):
        if field in data:
            setattr(w, field, data[field])
    db.session.commit()
    log_activity("update_worker", "worker", w.id)
    return jsonify({"message": "Worker updated"})


@workers_bp.route("/<int:worker_id>", methods=["DELETE"])
@auth_required
@role_required("admin")
def delete_worker(worker_id):
    w = db.session.get(Worker, worker_id)
    if not w:
        return jsonify({"error": "Worker not found"}), 404
    db.session.delete(w)
    db.session.commit()
    log_activity("delete_worker", "worker", worker_id)
    return jsonify({"message": "Worker deleted"})


@workers_bp.route("/analytics", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def worker_analytics():
    total = Worker.query.count()
    active = Worker.query.filter_by(status="active").count()
    departments = db.session.query(
        Worker.department, db.func.count(Worker.id), db.func.avg(Worker.performance_score),
        db.func.avg(Worker.attendance_rate)
    ).group_by(Worker.department).all()
    return jsonify({
        "total_workers": total,
        "active_workers": active,
        "department_stats": [{
            "department": d[0], "count": d[1],
            "avg_performance": round(d[2] or 0, 1),
            "avg_attendance": round(d[3] or 0, 1),
        } for d in departments],
    })
