import os
import sys
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from backend.config import Config

db = SQLAlchemy()

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
REACT_DIST = os.path.join(BASE_DIR, "frontend", "static", "dist")


def create_app():
    app = Flask(
        __name__,
        template_folder=os.path.join(BASE_DIR, "frontend", "templates"),
        static_folder=os.path.join(BASE_DIR, "frontend", "static"),
        static_url_path="/static",
    )

    @app.route("/assets/<path:filename>")
    def react_assets(filename):
        return send_from_directory(os.path.join(REACT_DIST, "assets"), filename)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)

    Config.init_firebase()

    # Import models so they are registered with SQLAlchemy
    with app.app_context():
        from backend.models.database import (
            User, Dataset, Machine, Prediction, Report, ActivityLog, UserSettings,
            Worker, ProductionOrder, RawMaterial,
        )
        db.create_all()
        _seed_data()

    # Register routes
    from backend.api.auth import auth_bp
    from backend.api.datasets import datasets_bp
    from backend.api.analytics import analytics_bp
    from backend.api.ml import ml_bp
    from backend.api.chatbot import chatbot_bp
    from backend.api.reports import reports_bp
    from backend.api.dashboard import dashboard_bp
    from backend.api.workers import workers_bp
    from backend.api.production import production_bp
    from backend.api.raw_materials import raw_materials_bp
    from backend.api.machines import machines_bp
    from backend.api.finance import finance_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(datasets_bp, url_prefix="/api/datasets")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(ml_bp, url_prefix="/api/ml")
    app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(workers_bp, url_prefix="/api/workers")
    app.register_blueprint(production_bp, url_prefix="/api/production")
    app.register_blueprint(raw_materials_bp, url_prefix="/api/raw-materials")
    app.register_blueprint(machines_bp, url_prefix="/api/machines")
    app.register_blueprint(finance_bp, url_prefix="/api/finance")

    # Page routes
    from backend.api.pages import page_bp
    app.register_blueprint(page_bp)

    return app


def _seed_data():
    from backend.models.database import Machine, Prediction, Worker, ProductionOrder, RawMaterial
    import random
    from datetime import datetime, timedelta, date

    if Machine.query.first() and Worker.query.first() and RawMaterial.query.first():
        return
    print("Seeding initial data...")
    # Clear existing data to avoid unique constraint conflicts on re-seed
    for table in [Prediction, ProductionOrder, RawMaterial, Worker, Machine]:
        table.query.delete()
    db.session.commit()

    machines = [
        Machine(name="CNC Lathe A1", code="CNC-001", machine_type="CNC", status="running",
                temperature=68.2, vibration=1.2, rpm=2800, torque=42.5, tool_wear=125,
                health_score=92.0, operating_hours=4520, location="Floor A"),
        Machine(name="CNC Mill B2", code="CNC-002", machine_type="CNC", status="running",
                temperature=72.1, vibration=1.5, rpm=2600, torque=38.0, tool_wear=210,
                health_score=88.0, operating_hours=3800, location="Floor A"),
        Machine(name="Press P1", code="PRS-001", machine_type="Press", status="running",
                temperature=55.3, vibration=2.1, rpm=1200, torque=85.0, tool_wear=340,
                health_score=78.0, operating_hours=6100, location="Floor B"),
        Machine(name="Press P2", code="PRS-002", machine_type="Press", status="down",
                temperature=95.0, vibration=4.8, rpm=0, torque=0, tool_wear=890,
                health_score=45.0, operating_hours=7200, location="Floor B"),
        Machine(name="Welder W1", code="WLD-001", machine_type="Welder", status="running",
                temperature=82.5, vibration=1.8, rpm=180, torque=15.2, tool_wear=450,
                health_score=85.0, operating_hours=2800, location="Floor B"),
        Machine(name="Assembly R1", code="ASM-001", machine_type="Assembly", status="running",
                temperature=38.0, vibration=0.5, rpm=1500, torque=8.5, tool_wear=60,
                health_score=96.0, operating_hours=1900, location="Assembly"),
        Machine(name="Packaging L1", code="PKG-001", machine_type="Packaging", status="idle",
                temperature=32.0, vibration=0.4, rpm=800, torque=5.2, tool_wear=30,
                health_score=93.0, operating_hours=1500, location="Packaging"),
        Machine(name="Laser Cutter L1", code="LSR-001", machine_type="Laser", status="running",
                temperature=42.0, vibration=0.7, rpm=0, torque=0, tool_wear=180,
                health_score=90.0, operating_hours=3200, location="Floor C"),
    ]
    db.session.add_all(machines)
    db.session.commit()

    workers = [
        Worker(employee_code="W-001", first_name="James", last_name="Wilson",
               department="CNC", designation="CNC Operator", shift="morning", performance_score=92.0, attendance_rate=97.5),
        Worker(employee_code="W-002", first_name="Sarah", last_name="Chen",
               department="Quality", designation="QC Inspector", shift="morning", performance_score=88.0, attendance_rate=99.0),
        Worker(employee_code="W-003", first_name="Michael", last_name="Brown",
               department="Maintenance", designation="Tech", shift="morning", performance_score=85.0, attendance_rate=94.0),
        Worker(employee_code="W-004", first_name="Emily", last_name="Davis",
               department="Assembly", designation="Assembly Operator", shift="afternoon", performance_score=90.0, attendance_rate=96.0),
        Worker(employee_code="W-005", first_name="David", last_name="Martinez",
               department="Press", designation="Press Operator", shift="afternoon", performance_score=78.0, attendance_rate=91.0),
        Worker(employee_code="W-006", first_name="Lisa", last_name="Anderson",
               department="Packaging", designation="Packaging Lead", shift="morning", performance_score=94.0, attendance_rate=98.5),
    ]
    db.session.add_all(workers)
    db.session.commit()

    products = ["Hydraulic Valve", "Bearing Housing", "Gear Set", "Motor Mount", "Sensor Cover"]
    machines_list = Machine.query.all()
    workers_list = Worker.query.all()
    for i in range(12):
        target = random.randint(500, 2000)
        completed = random.randint(int(target * 0.3), target)
        db.session.add(ProductionOrder(
            order_number=f"PO-{2026}{i+1:04d}",
            product_name=random.choice(products),
            target_qty=target, completed_qty=completed,
            scrap_qty=random.randint(0, int(completed * 0.08)),
            status="completed" if completed >= target else "in_progress",
            priority=random.choice(["low", "medium", "high"]),
            assigned_line=f"Line-{random.randint(1, 3)}",
            machine_id=random.choice(machines_list).id,
            assigned_worker_id=random.choice(workers_list).id,
            start_date=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
        ))
    db.session.commit()

    materials = [
        RawMaterial(name="Steel Rod 10mm", code="MAT-001", unit="meters", current_stock=450, minimum_stock=100, unit_cost=2.50, supplier="SteelCo", category="metal"),
        RawMaterial(name="Aluminum Sheet", code="MAT-002", unit="sheets", current_stock=80, minimum_stock=50, unit_cost=15.00, supplier="AluSupply", category="metal"),
        RawMaterial(name="Bearing 6205", code="SPT-001", unit="pcs", current_stock=24, minimum_stock=10, unit_cost=8.50, supplier="BearingPro", category="spare"),
        RawMaterial(name="Cutting Insert", code="SPT-002", unit="pcs", current_stock=45, minimum_stock=20, unit_cost=25.00, supplier="ToolMaster", category="tool"),
        RawMaterial(name="Welding Wire", code="CON-001", unit="kg", current_stock=85, minimum_stock=20, unit_cost=5.50, supplier="WeldSupply", category="consumable"),
        RawMaterial(name="Lubricant Oil", code="CON-002", unit="liters", current_stock=120, minimum_stock=30, unit_cost=3.20, supplier="ChemSupply", category="consumable"),
    ]
    for m in materials:
        m.status = "low_stock" if m.current_stock < m.minimum_stock else "in_stock"
    db.session.add_all(materials)
    db.session.commit()

    for m in Machine.query.all():
        for _ in range(10):
            db.session.add(Prediction(
                machine_id=m.id, prediction_type="failure",
                predicted_value=random.uniform(0, 1),
                confidence=random.uniform(0.7, 0.99),
                features_json='{}', actual_value=random.choice([0, 1]),
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
            ))
    db.session.commit()
    print(f"Seed: {Machine.query.count()} machines, {Worker.query.count()} workers, "
          f"{ProductionOrder.query.count()} orders, {RawMaterial.query.count()} materials, "
          f"{Prediction.query.count()} predictions")
