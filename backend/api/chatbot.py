from flask import Blueprint, request, jsonify
from backend.models.database import Machine, Prediction, Dataset
from backend.services.chatbot_service import ChatbotEngine
from backend.api.auth import auth_required, role_required

chatbot_bp = Blueprint("chatbot", __name__)


@chatbot_bp.route("/message", methods=["POST"])
@auth_required
@role_required("admin", "manager")
def chat():
    data = request.get_json()
    query = data.get("message", "").strip()
    if not query:
        return jsonify({"error": "Message required"}), 400

    engine = ChatbotEngine((Machine, Prediction, Dataset))
    response = engine.respond(query)
    return jsonify(response)


@chatbot_bp.route("/suggestions", methods=["GET"])
@auth_required
@role_required("admin", "manager")
def suggestions():
    return jsonify([
        "Show machine health",
        "Which machine has the highest failure rate?",
        "Show production trend",
        "Compare machine performance",
        "Show defect analysis",
        "Predict next month's production",
        "Show temperature distribution",
        "Show downtime by machine",
    ])
