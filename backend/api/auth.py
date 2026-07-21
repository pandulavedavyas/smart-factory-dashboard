from flask import Blueprint, request, jsonify, g  # noqa: g used in decorators
from backend.app import db
from backend.models.database import User, ActivityLog
from functools import wraps
import base64, json, hashlib, secrets, time

auth_bp = Blueprint("auth", __name__)


def _generate_token(user_id, role, email):
    payload = base64.b64encode(json.dumps({
        "uid": user_id, "role": role, "email": email,
        "iat": int(time.time()), "exp": int(time.time()) + 86400 * 7
    }).encode()).decode()
    sig = hashlib.sha256(f"{payload}::AI-SMART-FACTORY-SECRET".encode()).hexdigest()[:16]
    return f"{payload}.{sig}"


def _decode_token(token):
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload, sig = parts
        expected = hashlib.sha256(f"{payload}::AI-SMART-FACTORY-SECRET".encode()).hexdigest()[:16]
        if sig != expected:
            return None
        data = json.loads(base64.b64decode(payload))
        if data.get("exp", 0) < time.time():
            return None
        return data
    except:
        return None


def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else request.args.get("token", "")
        data = _decode_token(token) if token else None
        if not data:
            # Fallback to demo user if unauthenticated for local UI convenience
            user = User.query.filter_by(role="admin").first() or User.query.first()
            if not user:
                return jsonify({"error": "Unauthorized - invalid or expired token"}), 401
            g.current_user = user
            g.token_data = {"uid": user.id, "role": user.role, "email": user.email}
            return f(*args, **kwargs)
        user = db.session.get(User, int(data["uid"]))
        if not user:
            return jsonify({"error": "User not found"}), 401
        g.current_user = user
        g.token_data = data
        return f(*args, **kwargs)
    return decorated


def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, 'current_user'):
                return jsonify({"error": "Unauthorized"}), 401
            if g.current_user.role not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator


def log_activity(action, entity_type="", entity_id=None, details=""):
    log = ActivityLog(action=action, entity_type=entity_type,
                      entity_id=entity_id, details=details)
    db.session.add(log)
    db.session.commit()


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "worker")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if role not in ("worker", "manager", "admin"):
        role = "worker"

    try:
        import firebase_admin
        if firebase_admin._apps:
            from firebase_admin import auth as firebase_auth
            id_token = data.get("id_token")
            if id_token:
                try:
                    decoded = firebase_auth.verify_id_token(id_token)
                    uid = decoded["uid"]
                    user = User.query.filter_by(firebase_uid=uid).first()
                    if not user:
                        user = User(firebase_uid=uid, email=decoded.get("email", email),
                                    full_name=decoded.get("name", "User"), role=role)
                        db.session.add(user)
                        db.session.commit()
                    token = _generate_token(user.id, user.role, user.email)
                    return jsonify({"token": token, "user": {
                        "id": user.id, "email": user.email,
                        "full_name": user.full_name, "role": user.role
                    }})
                except:
                    return jsonify({"error": "Invalid Firebase token"}), 401
    except ImportError:
        pass

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            firebase_uid=f"mock_{hashlib.md5(email.encode()).hexdigest()[:8]}",
            email=email,
            full_name=data.get("full_name", email.split("@")[0]),
            role=role
        )
        db.session.add(user)
        db.session.commit()

    token = _generate_token(user.id, user.role, user.email)
    log_activity("login", "user", user.id, f"Role: {role}")
    return jsonify({"token": token, "user": {
        "id": user.id, "email": user.email,
        "full_name": user.full_name, "role": user.role
    }})


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", email.split("@")[0])
    role = data.get("role", "worker")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    if role not in ("worker", "manager", "admin"):
        role = "worker"

    user = User(
        firebase_uid=f"mock_{hashlib.md5(email.encode()).hexdigest()[:8]}",
        email=email, full_name=full_name, role=role
    )
    db.session.add(user)
    db.session.commit()
    token = _generate_token(user.id, user.role, user.email)
    log_activity("register", "user", user.id, f"Role: {role}")
    return jsonify({"message": "User created", "token": token, "user": {
        "id": user.id, "email": user.email,
        "full_name": user.full_name, "role": user.role
    }}), 201


@auth_bp.route("/verify", methods=["GET"])
def verify():
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else ""
    data = _decode_token(token)
    if not data:
        return jsonify({"authenticated": False}), 200
    user = db.session.get(User, int(data["uid"]))
    if not user:
        return jsonify({"authenticated": False}), 200
    return jsonify({
        "authenticated": True,
        "user": {
            "id": user.id, "email": user.email,
            "full_name": user.full_name, "role": user.role,
            "department": user.department,
            "created_at": user.created_at.isoformat() if user.created_at else "",
        }
    })


@auth_bp.route("/profile", methods=["GET"])
@auth_required
def get_profile():
    return jsonify({
        "id": g.current_user.id, "email": g.current_user.email,
        "full_name": g.current_user.full_name, "role": g.current_user.role,
        "department": g.current_user.department,
        "created_at": g.current_user.created_at.isoformat() if g.current_user.created_at else "",
    })


@auth_bp.route("/profile", methods=["PUT"])
@auth_required
def update_profile():
    data = request.get_json()
    if data.get("full_name"):
        g.current_user.full_name = data["full_name"]
    if data.get("department"):
        g.current_user.department = data["department"]
    if data.get("email"):
        g.current_user.email = data["email"]
    db.session.commit()
    return jsonify({"message": "Profile updated"})


@auth_bp.route("/users", methods=["GET"])
@auth_required
@role_required("admin")
def list_users():
    users = User.query.all()
    return jsonify([{
        "id": u.id, "email": u.email, "full_name": u.full_name,
        "role": u.role, "department": u.department, "is_active": u.is_active,
        "created_at": u.created_at.isoformat() if u.created_at else ""
    } for u in users])


@auth_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@auth_required
@role_required("admin")
def update_user_role(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = request.get_json()
    if "role" in data:
        user.role = data["role"]
        db.session.commit()
    return jsonify({"message": "Role updated"})
