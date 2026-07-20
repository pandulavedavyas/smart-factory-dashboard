import os
from flask import Blueprint, send_from_directory, send_file

page_bp = Blueprint("pages", __name__)

REACT_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "static", "dist")


def _index():
    return send_file(os.path.join(REACT_DIST, "index.html"))


@page_bp.route("/")
def index():
    return _index()


@page_bp.route("/auth")
@page_bp.route("/login")
def login_page():
    return _index()


@page_bp.route("/admin")
def admin_login():
    return _index()


@page_bp.route("/admin/dashboard")
def admin_dashboard():
    return _index()


@page_bp.route("/admin/dashboard/<path:page>")
def admin_dashboard_page(page):
    return _index()


@page_bp.route("/dashboard")
def dashboard():
    return _index()


@page_bp.route("/dashboard/<path:page>")
def dashboard_page(page):
    return _index()


@page_bp.route("/workers")
def workers():
    return _index()


@page_bp.route("/machinery")
def machinery():
    return _index()


@page_bp.route("/production")
def production():
    return _index()


@page_bp.route("/materials")
def materials():
    return _index()


@page_bp.route("/analytics")
def analytics():
    return _index()


@page_bp.route("/predictions")
def predictions():
    return _index()


@page_bp.route("/reports")
def reports():
    return _index()


@page_bp.route("/settings")
def settings():
    return _index()


@page_bp.route("/datasets")
def datasets():
    return _index()


@page_bp.route("/access-denied")
def access_denied():
    return _index()


@page_bp.route("/logout")
def logout():
    return _index()


# SPA fallback — serve index.html for any unmatched, non-API route.
@page_bp.route("/<path:path>")
def spa_fallback(path):
    if path.startswith(("api/", "assets/", "static/")):
        return ("Not found", 404)
    return _index()
