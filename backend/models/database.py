from datetime import datetime, date
from backend.app import db


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(128), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    full_name = db.Column(db.String(150), default="")
    role = db.Column(db.String(20), default="worker")
    department = db.Column(db.String(80), default="")
    avatar_url = db.Column(db.String(256), default="")
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Dataset(db.Model):
    __tablename__ = "datasets"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, default=0)
    row_count = db.Column(db.Integer, default=0)
    column_count = db.Column(db.Integer, default=0)
    columns_json = db.Column(db.Text, default="[]")
    dtypes_json = db.Column(db.Text, default="{}")
    summary_json = db.Column(db.Text, default="{}")
    missing_values_json = db.Column(db.Text, default="{}")
    status = db.Column(db.String(20), default="uploaded")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Machine(db.Model):
    __tablename__ = "machines"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    machine_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default="running")
    location = db.Column(db.String(100), default="")
    temperature = db.Column(db.Float, default=25.0)
    vibration = db.Column(db.Float, default=0.0)
    rpm = db.Column(db.Float, default=0.0)
    torque = db.Column(db.Float, default=0.0)
    power = db.Column(db.Float, default=0.0)
    tool_wear = db.Column(db.Float, default=0.0)
    health_score = db.Column(db.Float, default=100.0)
    operating_hours = db.Column(db.Float, default=0.0)
    last_maintenance = db.Column(db.DateTime)
    next_maintenance = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Prediction(db.Model):
    __tablename__ = "predictions"
    id = db.Column(db.Integer, primary_key=True)
    machine_id = db.Column(db.Integer, db.ForeignKey("machines.id"), nullable=True)
    dataset_id = db.Column(db.Integer, db.ForeignKey("datasets.id"), nullable=True)
    prediction_type = db.Column(db.String(50), nullable=False)
    predicted_value = db.Column(db.Float, default=0.0)
    confidence = db.Column(db.Float, default=0.0)
    features_json = db.Column(db.Text, default="{}")
    actual_value = db.Column(db.Float, nullable=True)
    model_name = db.Column(db.String(100), default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    machine = db.relationship("Machine", backref="predictions")


class Report(db.Model):
    __tablename__ = "reports"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    report_type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), default="")
    format = db.Column(db.String(10), default="pdf")
    file_path = db.Column(db.String(255), default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    action = db.Column(db.String(50), nullable=False)
    entity_type = db.Column(db.String(50), default="")
    entity_id = db.Column(db.Integer, nullable=True)
    details = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class UserSettings(db.Model):
    __tablename__ = "user_settings"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    theme = db.Column(db.String(20), default="dark")
    language = db.Column(db.String(10), default="en")
    notifications_enabled = db.Column(db.Boolean, default=True)
    email_notifications = db.Column(db.Boolean, default=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)


class Worker(db.Model):
    __tablename__ = "workers"
    id = db.Column(db.Integer, primary_key=True)
    employee_code = db.Column(db.String(20), unique=True, nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    designation = db.Column(db.String(50), default="")
    shift = db.Column(db.String(20), default="morning")
    phone = db.Column(db.String(20), default="")
    email = db.Column(db.String(120), default="")
    hire_date = db.Column(db.Date, default=date.today)
    status = db.Column(db.String(20), default="active")
    performance_score = db.Column(db.Float, default=0.0)
    attendance_rate = db.Column(db.Float, default=100.0)
    hourly_rate = db.Column(db.Float, default=15.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ProductionOrder(db.Model):
    __tablename__ = "production_orders"
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(30), unique=True, nullable=False)
    product_name = db.Column(db.String(100), nullable=False)
    target_qty = db.Column(db.Integer, default=0)
    completed_qty = db.Column(db.Integer, default=0)
    scrap_qty = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default="in_progress")
    priority = db.Column(db.String(10), default="medium")
    assigned_line = db.Column(db.String(50), default="Line-1")
    assigned_worker_id = db.Column(db.Integer, db.ForeignKey("workers.id"), nullable=True)
    machine_id = db.Column(db.Integer, db.ForeignKey("machines.id"), nullable=True)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    machine = db.relationship("Machine", backref="production_orders")
    worker = db.relationship("Worker", backref="production_orders")


class RawMaterial(db.Model):
    __tablename__ = "raw_materials"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(30), unique=True, nullable=False)
    category = db.Column(db.String(50), default="raw_material")
    unit = db.Column(db.String(20), default="kg")
    current_stock = db.Column(db.Float, default=0.0)
    minimum_stock = db.Column(db.Float, default=10.0)
    maximum_stock = db.Column(db.Float, default=1000.0)
    unit_cost = db.Column(db.Float, default=0.0)
    supplier = db.Column(db.String(100), default="")
    status = db.Column(db.String(20), default="in_stock")
    last_restocked = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
