from flask import Blueprint, request, jsonify, session
from database import Database
import bcrypt
from datetime import datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def login_required(f):
    """Decorator to require login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized', 'message': 'Please login first'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized', 'message': 'Please login first'}), 401
        if session.get('role') != 'admin':
            return jsonify({'error': 'Forbidden', 'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'message': 'Username and password are required'
            }), 400
        
        # Get user from database
        query = """
            SELECT id, username, password_hash, role, full_name, email, is_active
            FROM users
            WHERE username = %s
        """
        user = Database.execute_query(query, (username,), fetch_one=True)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid username or password'
            }), 401
        
        # Check if user is active
        if not user['is_active']:
            return jsonify({
                'success': False,
                'message': 'Account is deactivated. Please contact administrator.'
            }), 403
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({
                'success': False,
                'message': 'Invalid username or password'
            }), 401
        
        # Update last login
        update_query = "UPDATE users SET last_login = %s WHERE id = %s"
        Database.execute_query(update_query, (datetime.now(), user['id']))
        
        # Create session
        session.clear()
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['role'] = user['role']
        session['full_name'] = user['full_name']
        session.permanent = True
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'role': user['role'],
                'full_name': user['full_name'],
                'email': user['email']
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during login'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Handle user logout"""
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'username': session['username'],
                'role': session['role'],
                'full_name': session['full_name']
            }
        }), 200
    else:
        return jsonify({
            'authenticated': False
        }), 200

@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """Change user password"""
    try:
        data = request.get_json()
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not current_password or not new_password:
            return jsonify({
                'success': False,
                'message': 'Current and new password are required'
            }), 400
        
        # Validate new password strength
        if len(new_password) < 8:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 8 characters long'
            }), 400
        
        # Get current user
        query = "SELECT password_hash FROM users WHERE id = %s"
        user = Database.execute_query(query, (session['user_id'],), fetch_one=True)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Verify current password
        if not bcrypt.checkpw(current_password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({
                'success': False,
                'message': 'Current password is incorrect'
            }), 401
        
        # Hash new password
        new_password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Update password
        update_query = "UPDATE users SET password_hash = %s WHERE id = %s"
        Database.execute_query(update_query, (new_password_hash, session['user_id']))
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        print(f"Change password error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while changing password'
        }), 500