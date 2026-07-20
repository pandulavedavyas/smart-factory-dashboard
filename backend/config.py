import os
import json
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "smart-factory-prod-secret")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Database
    DATABASE_URL = os.environ.get(
        "DATABASE_URL",
        "sqlite:///../instance/database.db"
    )
    # If using Supabase, ensure the URL uses postgresql:// scheme
    if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = DATABASE_URL

    # Firebase Admin
    FIREBASE_CRED_PATH = os.environ.get("FIREBASE_CRED_PATH", "firebase-credentials.json")
    FIREBASE_CREDENTIALS_JSON = os.environ.get("FIREBASE_CREDENTIALS", "")

    # Upload
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dataset")
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB

    # ML
    MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")

    @staticmethod
    def init_firebase():
        try:
            import firebase_admin
            from firebase_admin import credentials
        except ImportError:
            print("WARNING: firebase_admin not installed. Auth verification disabled.")
            return False

        if firebase_admin._apps:
            return True

        try:
            cred_path = Config.FIREBASE_CRED_PATH
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                return True

            creds_json = Config.FIREBASE_CREDENTIALS_JSON
            if creds_json:
                cred = credentials.Certificate(json.loads(creds_json))
                firebase_admin.initialize_app(cred)
                return True
        except Exception as e:
            print(f"WARNING: Firebase init failed: {e}. Auth verification disabled.")
            return False

        print("WARNING: No Firebase credentials found. Auth verification disabled.")
        return False
