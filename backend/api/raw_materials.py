from flask import Blueprint, request, jsonify, g
from backend.app import db
from backend.models.database import RawMaterial
from backend.api.auth import auth_required, role_required, log_activity

raw_materials_bp = Blueprint("raw_materials", __name__)


@raw_materials_bp.route("", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def list_materials():
    category = request.args.get("category")
    status = request.args.get("status")
    q = RawMaterial.query
    if category:
        q = q.filter_by(category=category)
    if status:
        q = q.filter_by(status=status)
    materials = q.order_by(RawMaterial.name).all()
    return jsonify([{
        "id": m.id, "name": m.name, "code": m.code,
        "category": m.category, "unit": m.unit,
        "current_stock": m.current_stock,
        "minimum_stock": m.minimum_stock,
        "maximum_stock": m.maximum_stock,
        "unit_cost": m.unit_cost,
        "total_value": round(m.current_stock * m.unit_cost, 2),
        "supplier": m.supplier,
        "status": m.status,
        "stock_pct": round((m.current_stock / m.maximum_stock * 100) if m.maximum_stock else 0, 1),
        "last_restocked": m.last_restocked.isoformat() if m.last_restocked else "",
    } for m in materials])


@raw_materials_bp.route("/<int:material_id>", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def get_material(material_id):
    m = db.session.get(RawMaterial, material_id)
    if not m:
        return jsonify({"error": "Material not found"}), 404
    return jsonify({
        "id": m.id, "name": m.name, "code": m.code,
        "category": m.category, "unit": m.unit,
        "current_stock": m.current_stock,
        "minimum_stock": m.minimum_stock,
        "maximum_stock": m.maximum_stock,
        "unit_cost": m.unit_cost,
        "total_value": round(m.current_stock * m.unit_cost, 2),
        "supplier": m.supplier, "status": m.status,
        "stock_pct": round((m.current_stock / m.maximum_stock * 100) if m.maximum_stock else 0, 1),
        "last_restocked": m.last_restocked.isoformat() if m.last_restocked else "",
    })


@raw_materials_bp.route("", methods=["POST"])
@auth_required
@role_required("admin", "manager")
def create_material():
    data = request.get_json()
    if not data.get("name") or not data.get("code"):
        return jsonify({"error": "name and code required"}), 400
    if RawMaterial.query.filter_by(code=data["code"]).first():
        return jsonify({"error": "Material code already exists"}), 409
    m = RawMaterial(
        name=data["name"], code=data["code"],
        category=data.get("category", "raw_material"),
        unit=data.get("unit", "kg"),
        current_stock=data.get("current_stock", 0),
        minimum_stock=data.get("minimum_stock", 10),
        maximum_stock=data.get("maximum_stock", 1000),
        unit_cost=data.get("unit_cost", 0),
        supplier=data.get("supplier", ""),
    )
    m.status = "low_stock" if m.current_stock < m.minimum_stock else "in_stock"
    db.session.add(m)
    db.session.commit()
    log_activity("create_material", "raw_material", m.id, f"Material {m.code}")
    return jsonify({"message": "Material created", "id": m.id}), 201


@raw_materials_bp.route("/<int:material_id>", methods=["PUT"])
@auth_required
@role_required("admin", "manager")
def update_material(material_id):
    m = db.session.get(RawMaterial, material_id)
    if not m:
        return jsonify({"error": "Material not found"}), 404
    data = request.get_json()
    for field in ("name", "code", "category", "unit", "minimum_stock",
                  "maximum_stock", "unit_cost", "supplier"):
        if field in data:
            setattr(m, field, data[field])
    if "current_stock" in data:
        m.current_stock = data["current_stock"]
        m.last_restocked = __import__("datetime").datetime.utcnow()
    m.status = "low_stock" if m.current_stock < m.minimum_stock else "in_stock"
    db.session.commit()
    log_activity("update_material", "raw_material", m.id)
    return jsonify({"message": "Material updated"})


@raw_materials_bp.route("/<int:material_id>", methods=["DELETE"])
@auth_required
@role_required("admin")
def delete_material(material_id):
    m = db.session.get(RawMaterial, material_id)
    if not m:
        return jsonify({"error": "Material not found"}), 404
    db.session.delete(m)
    db.session.commit()
    return jsonify({"message": "Material deleted"})


@raw_materials_bp.route("/alerts", methods=["GET"])
@auth_required
def stock_alerts():
    low = RawMaterial.query.filter_by(status="low_stock").all()
    return jsonify({
        "low_stock_count": len(low),
        "low_stock_items": [{
            "id": m.id, "name": m.name, "code": m.code,
            "current_stock": m.current_stock,
            "minimum_stock": m.minimum_stock,
            "shortage": round(m.minimum_stock - m.current_stock, 1),
        } for m in low],
    })


@raw_materials_bp.route("/analytics", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def material_analytics():
    total = RawMaterial.query.count()
    low_count = RawMaterial.query.filter_by(status="low_stock").count()
    total_value = db.session.query(db.func.sum(
        RawMaterial.current_stock * RawMaterial.unit_cost
    )).scalar() or 0
    cat_stats = db.session.query(
        RawMaterial.category,
        db.func.count(RawMaterial.id),
        db.func.sum(RawMaterial.current_stock),
    ).group_by(RawMaterial.category).all()
    return jsonify({
        "total_materials": total,
        "low_stock_count": low_count,
        "total_inventory_value": round(total_value, 2),
        "category_stats": [{
            "category": c[0], "count": c[1], "total_stock": float(c[2] or 0),
        } for c in cat_stats],
    })
