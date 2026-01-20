from flask import Flask, send_from_directory, session
from flask_cors import CORS
from config import Config
from database import Database
from auth import auth_bp
from routes import api_bp
import os

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend', static_url_path='')
app.config.from_object(Config)

# Enable CORS
CORS(app, supports_credentials=True, origins=Config.CORS_ORIGINS)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(api_bp, url_prefix='/api')

# Initialize database
Database.initialize_pool()
Database.initialize_database()

# Serve frontend files
@app.route('/')
def serve_login():
    """Serve login page"""
    return send_from_directory(app.static_folder, 'login.html')

@app.route('/<path:path>')
def serve_file(path):
    """Serve other static files"""
    return send_from_directory(app.static_folder, path)

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return send_from_directory(app.static_folder, 'login.html')

@app.before_request
def before_request():
    """Make session permanent"""
    session.permanent = True

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Data Dashboard Server Starting...")
    print("=" * 60)
    print(f"📍 Server running at: http://localhost:5000")
    print(f"🔐 Login page: http://localhost:5000/login.html")
    print(f"📊 Dashboard: http://localhost:5000/index.html")
    print("=" * 60)
    print("\n💡 Default Login Credentials:")
    print("   Admins:")
    print("   - admin1 / Admin@123")
    print("   - admin2 / Admin@456")
    print("\n   Users:")
    print("   - user1 / User@123")
    print("   - user2 / User@456")
    print("   - user3 / User@789")
    print("   - user4 / User@012")
    print("=" * 60)
    print("\n⚙️  Press CTRL+C to stop the server\n")
    
    app.run(host='0.0.0.0', port=5000, debug=Config.DEBUG)