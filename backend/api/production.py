from flask import Blueprint, request, jsonify, g
from backend.app import db
from backend.models.database import ProductionOrder, Machine, Worker
from backend.api.auth import auth_required, role_required, log_activity

production_bp = Blueprint("production", __name__)


@production_bp.route("", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def list_orders():
    status = request.args.get("status")
    priority = request.args.get("priority")
    q = ProductionOrder.query
    if status:
        q = q.filter_by(status=status)
    if priority:
        q = q.filter_by(priority=priority)
    orders = q.order_by(ProductionOrder.created_at.desc()).all()
    return jsonify([{
        "id": o.id, "order_number": o.order_number,
        "product_name": o.product_name,
        "target_qty": o.target_qty, "completed_qty": o.completed_qty,
        "scrap_qty": o.scrap_qty,
        "completion_pct": round((o.completed_qty / o.target_qty * 100) if o.target_qty else 0, 1),
        "scrap_rate": round((o.scrap_qty / o.completed_qty * 100) if o.completed_qty else 0, 1),
        "status": o.status, "priority": o.priority,
        "assigned_line": o.assigned_line,
        "machine_name": o.machine.name if o.machine else "",
        "worker_name": f"{o.worker.first_name} {o.worker.last_name}" if o.worker else "",
        "start_date": o.start_date.isoformat() if o.start_date else "",
        "end_date": o.end_date.isoformat() if o.end_date else "",
    } for o in orders])


@production_bp.route("/<int:order_id>", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_order(order_id):
    o = db.session.get(ProductionOrder, order_id)
    if not o:
        return jsonify({"error": "Order not found"}), 404
    return jsonify({
        "id": o.id, "order_number": o.order_number,
        "product_name": o.product_name,
        "target_qty": o.target_qty, "completed_qty": o.completed_qty,
        "scrap_qty": o.scrap_qty,
        "completion_pct": round((o.completed_qty / o.target_qty * 100) if o.target_qty else 0, 1),
        "status": o.status, "priority": o.priority,
        "assigned_line": o.assigned_line,
        "machine_id": o.machine_id, "assigned_worker_id": o.assigned_worker_id,
        "start_date": o.start_date.isoformat() if o.start_date else "",
        "end_date": o.end_date.isoformat() if o.end_date else "",
    })


@production_bp.route("", methods=["POST"])
@auth_required
@role_required("admin", "manager")
def create_order():
    data = request.get_json()
    if not data.get("product_name") or not data.get("target_qty"):
        return jsonify({"error": "product_name and target_qty required"}), 400
    import random
    order_number = f"PO-{2026}{random.randint(100, 999)}"
    while ProductionOrder.query.filter_by(order_number=order_number).first():
        order_number = f"PO-{2026}{random.randint(100, 999)}"
    o = ProductionOrder(
        order_number=order_number,
        product_name=data["product_name"],
        target_qty=data["target_qty"],
        priority=data.get("priority", "medium"),
        assigned_line=data.get("assigned_line", "Line-1"),
        machine_id=data.get("machine_id"),
        assigned_worker_id=data.get("assigned_worker_id"),
    )
    db.session.add(o)
    db.session.commit()
    log_activity("create_order", "production_order", o.id, f"Order {order_number}")
    return jsonify({"message": "Order created", "id": o.id, "order_number": order_number}), 201


@production_bp.route("/<int:order_id>", methods=["PUT"])
@auth_required
@role_required("admin", "manager")
def update_order(order_id):
    o = db.session.get(ProductionOrder, order_id)
    if not o:
        return jsonify({"error": "Order not found"}), 404
    data = request.get_json()
    for field in ("product_name", "target_qty", "completed_qty", "scrap_qty",
                  "status", "priority", "assigned_line", "machine_id",
                  "assigned_worker_id"):
        if field in data:
            setattr(o, field, data[field])
    if data.get("status") == "completed" and not o.end_date:
        from datetime import datetime
        o.end_date = datetime.utcnow()
    db.session.commit()
    log_activity("update_order", "production_order", o.id)
    return jsonify({"message": "Order updated"})


@production_bp.route("/<int:order_id>", methods=["DELETE"])
@auth_required
@role_required("admin")
def delete_order(order_id):
    o = db.session.get(ProductionOrder, order_id)
    if not o:
        return jsonify({"error": "Order not found"}), 404
    db.session.delete(o)
    db.session.commit()
    return jsonify({"message": "Order deleted"})


@production_bp.route("/analytics", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def production_analytics():
    from datetime import datetime, timedelta
    import random
    total = ProductionOrder.query.count()
    completed = ProductionOrder.query.filter_by(status="completed").count()
    in_progress = ProductionOrder.query.filter_by(status="in_progress").count()
    agg = db.session.query(
        db.func.sum(ProductionOrder.target_qty),
        db.func.sum(ProductionOrder.completed_qty),
        db.func.sum(ProductionOrder.scrap_qty),
    ).first()
    total_target = agg[0] or 0
    total_completed = agg[1] or 0
    total_scrap = agg[2] or 0
    overall_completion = round((total_completed / total_target * 100) if total_target else 0, 1)
    overall_scrap = round((total_scrap / total_completed * 100) if total_completed else 0, 1)
    product_dist = db.session.query(
        ProductionOrder.product_name,
        db.func.sum(ProductionOrder.completed_qty),
    ).group_by(ProductionOrder.product_name).all()
    return jsonify({
        "total_orders": total,
        "completed_orders": completed,
        "in_progress_orders": in_progress,
        "total_target_qty": total_target,
        "total_completed_qty": total_completed,
        "total_scrap_qty": total_scrap,
        "completion_rate": overall_completion,
        "scrap_rate": overall_scrap,
        "product_distribution": [{"product": p[0], "qty": p[1]} for p in product_dist],
    })
