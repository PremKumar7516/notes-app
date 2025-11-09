# backend/app.py
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

# init app
app = Flask(__name__, static_folder="static", template_folder="templates")
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", "dev_secret_key_change_this")
# sqlite DB in instance folder
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_DIR = os.path.join(BASE_DIR, "instance")
os.makedirs(DB_DIR, exist_ok=True)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(DB_DIR, "notes.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# CORS
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://192.168.0.8:3000"]}}, supports_credentials=True)


# import models and db
from models import db, User, Note
db.init_app(app)

# import utils AFTER app and db are set
from utils import create_token, token_required

with app.app_context():
    db.create_all()

# ---------- AUTH ----------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already exists"}), 400

    hashed = generate_password_hash(password)
    user = User(username=username, email=email, password=hashed)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "registered successfully"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "invalid credentials"}), 401

    token = create_token(user.id, expires_minutes=60*24)  # 1 day
    return jsonify({"token": token, "username": user.username}), 200

# Logout is front-end responsibility (delete local token) but endpoint can be created if you manage blacklisting.
@app.route("/api/logout", methods=["POST"])
def logout():
    # No server action for simple JWT flow (token is stateless).
    return jsonify({"message": "logout on client by deleting token"}), 200

# ---------- NOTES (protected) ----------
@app.route("/api/notes", methods=["GET"])
@token_required
def get_notes(current_user):
    notes = Note.query.filter_by(user_id=current_user.id).order_by(Note.created_at.desc()).all()
    result = [{"id": n.id, "title": n.title, "content": n.content} for n in notes]
    return jsonify(result), 200

@app.route("/api/notes", methods=["POST"])
@token_required
def add_note(current_user):
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    content = (data.get("content") or "").strip()
    if not title or not content:
        return jsonify({"error": "title and content required"}), 400
    note = Note(title=title, content=content, user_id=current_user.id)
    db.session.add(note)
    db.session.commit()
    return jsonify({"message": "note added", "id": note.id}), 201

@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
@token_required
def delete_note(current_user, note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
    if not note:
        return jsonify({"error": "note not found"}), 404
    db.session.delete(note)
    db.session.commit()
    return jsonify({"message": "deleted"}), 200

# optional: edit note
@app.route("/api/notes/<int:note_id>", methods=["PUT"])
@token_required
def update_note(current_user, note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
    if not note:
        return jsonify({"error": "note not found"}), 404
    data = request.get_json() or {}
    note.title = data.get("title", note.title)
    note.content = data.get("content", note.content)
    db.session.commit()
    return jsonify({"message": "updated"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Running locally on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
