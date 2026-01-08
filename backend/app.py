
from datetime import datetime, time
import json
import os
from werkzeug.security import generate_password_hash
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_caching import Cache
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from routes import route
from models import db, Admin

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Database Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///database.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'db5a94073d88b4827d057a6e12e10714ed99708775691039860472fb4032d1bd' # Randomly generated
app.secret_key = 'e8f1c4021239580b0657905202619092d6037805128766150249767632608779' # Randomly generated

# Upload Configuration
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), "uploads")
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
for subfolder in ['team_members', 'screenshots', 'event_covers']:
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], subfolder), exist_ok=True)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

# Initialize Extensions
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Default Admin Setup + DB Init
def create_default_admin():
    if not Admin.query.first():
        default_admin = Admin(
            username='hsadmin35',
            password_hash=generate_password_hash('hsadmin2017')
        )
        db.session.add(default_admin)
        db.session.commit()
        print("✅ Default admin created - Username: hsadmin35, Password: hsadmin2017")

def initialize_app():
    """Run once at startup to ensure tables exist"""
    with app.app_context():
        db.create_all()
        create_default_admin()

# Run immediately at import time (Flask 3.x safe)
initialize_app()

# Register Blueprints
app.register_blueprint(route)

# Root Route
@app.route("/")
def home():
    return "✅ Hindi Samiti Backend is running successfully on Render!"

# App Entry Point
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
