import jwt
from datetime import datetime, timedelta
from flask import request, jsonify, current_app
from functools import wraps
from models import User

def create_token(user_id, expires_minutes=60):
    payload = {
        "sub": str(user_id),  # store as string to be safe with PyJWT 2.x
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=expires_minutes)
    }
    secret = current_app.config.get("SECRET_KEY", "dev_secret_key_change_this")
    return jwt.encode(payload, secret, algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        print("🔹 Incoming token:", token)  # debug

        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            secret = current_app.config.get("SECRET_KEY", "dev_secret_key_change_this")
            data = jwt.decode(token, secret, algorithms=["HS256"])
            print("🔹 Decoded JWT:", data)  # debug
            user_id = int(data["sub"])
            user = User.query.get(user_id)
            print("🔹 Found user:", user)  # debug
            if not user:
                return jsonify({"error": "User not found"}), 401
        except jwt.ExpiredSignatureError:
            print("❌ Token expired")
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError as e:
            print("❌ Invalid token error:", e)
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401

        return f(user, *args, **kwargs)
    return decorated

