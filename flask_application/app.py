# app.py - FIXED VERSION
from flask import Flask, render_template, send_from_directory, jsonify, request
import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, 
            template_folder='.',  # Look in current directory too
            static_folder='.')
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-key-123')

# ========== FIX: FIND YOUR HTML FILES ==========
def find_template(template_name):
    """Find HTML files in any location"""
    possible_locations = [
        template_name,  # Direct path
        f'templates/{template_name}',
        f'admin/templates/{template_name}',
        f'user/templates/{template_name}',
        f'{template_name}.html',
        f'templates/{template_name}.html',
        f'admin/templates/{template_name}.html',
        f'user/templates/{template_name}.html',
    ]
    
    for location in possible_locations:
        if os.path.exists(location):
            return location
    return None

# ========== DATABASE CONNECTION ==========
def get_db():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'ilabs_system'),
            port=int(os.getenv('DB_PORT', 3306))
        )
        return conn
    except Exception as e:
        print(f"Database error: {e}")
        return None

# ========== STATIC FILES ==========
@app.route('/admin/static/<path:filename>')
def admin_static(filename):
    return send_from_directory('admin/static', filename)

@app.route('/user/static/<path:filename>')
def user_static(filename):
    return send_from_directory('user/static', filename)

@app.route('/static/<path:filename>')
def global_static(filename):
    folders = ['static', 'admin/static', 'user/static']
    for folder in folders:
        if os.path.exists(f'{folder}/{filename}'):
            return send_from_directory(folder, filename)
    return "File not found", 404

# ========== CUSTOM RENDER ==========
def render_custom(template_name, **context):
    """Render template from anywhere"""
    template_path = find_template(template_name)
    if template_path:
        # Get directory and filename
        directory = os.path.dirname(template_path) or '.'
        filename = os.path.basename(template_path)
        return render_template(f'{directory}/{filename}' if directory != '.' else filename, **context)
    return f"Template '{template_name}' not found", 404

# ========== PAGE ROUTES ==========
@app.route('/')
def home():
    # Try to find index.html
    if os.path.exists('user/templates/index.html'):
        return render_template('user/templates/index.html')
    elif os.path.exists('admin/templates/index.html'):
        return render_template('admin/templates/index.html')
    elif os.path.exists('index.html'):
        return render_template('index.html')
    else:
        return """
        <h1>iLabs System is Running! ✅</h1>
        <p>Flask is working with your database.</p>
        <ul>
            <li><a href="/admin/login">Admin Login</a></li>
            <li><a href="/user/login">User/Faculty Login</a></li>
            <li><a href="/student">Student Portal</a></li>
            <li><a href="/api/status">Check API Status</a></li>
        </ul>
        """

# ========== ADMIN PAGES ==========
@app.route('/admin')
def admin_home():
    return render_custom('admin_dashboard.html') or render_custom('admin/admin_dashboard.html')

@app.route('/admin/login')
def admin_login():
    return render_custom('admin_login.html') or render_custom('admin/admin_login.html')

@app.route('/admin/users')
def admin_users():
    return render_custom('admin_users.html') or render_custom('admin/admin_users.html')

@app.route('/admin/bookings')
def admin_bookings():
    return render_custom('admin_bookings.html') or render_custom('admin/admin_bookings.html')

@app.route('/admin/reports')
def admin_reports():
    return render_custom('admin_reports.html') or render_custom('admin/admin_reports.html')

@app.route('/admin/schedule')
def admin_schedule():
    return render_custom('admin_schedule.html') or render_custom('admin/admin_schedule.html')

@app.route('/admin/settings')
def admin_settings():
    return render_custom('admin_settings.html') or render_custom('admin/admin_settings.html')

# ========== USER PAGES ==========
@app.route('/user')
def user_home():
    return render_custom('faculty_dashboard.html') or render_custom('user/faculty_dashboard.html')

@app.route('/user/login')
def user_login():
    return render_custom('faculty_login.html') or render_custom('user/faculty_login.html')

@app.route('/user/profile')
def user_profile():
    return render_custom('faculty_profile.html') or render_custom('user/faculty_profile.html')

@app.route('/student')
def student():
    return render_custom('student_portal.html') or render_custom('user/student_portal.html')

# ========== CATCH-ALL FOR ANY PAGE ==========
@app.route('/<path:page>')
def any_page(page):
    """Try to serve ANY HTML file from anywhere"""
    # Try as direct HTML file
    if page.endswith('.html'):
        return render_custom(page)
    
    # Try adding .html
    return render_custom(f'{page}.html')

# ========== API ENDPOINTS ==========
@app.route('/api/status')
def api_status():
    db = get_db()
    return jsonify({
        'flask': 'running',
        'database': 'connected' if db else 'disconnected',
        'message': 'Your system is working!',
        'endpoints': {
            'admin': '/admin/login',
            'user': '/user/login',
            'student': '/student',
            'api_test': '/api/labs',
            'api_faculty': '/api/faculty'
        }
    })

@app.route('/api/labs')
def api_labs():
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database not connected'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM labs")
        labs = cursor.fetchall()
        return jsonify({'success': True, 'data': labs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/faculty')
def api_faculty():
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database not connected'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM faculty WHERE is_active = 1")
        faculty = cursor.fetchall()
        return jsonify({'success': True, 'data': faculty})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def api_login():
    email = request.form.get('email')
    
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database error'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM faculty WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if user:
            return jsonify({
                'success': True,
                'user': user,
                'redirect': '/admin' if user['role'] == 'admin' else '/user'
            })
        return jsonify({'success': False, 'error': 'User not found'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# ========== START ==========
if __name__ == '__main__':
    print("\n" + "="*60)
    print("🎯 iLabs System - FIXED VERSION")
    print("="*60)
    
    # Check database
    db = get_db()
    print(f"📊 Database: {'✅ CONNECTED' if db else '❌ DISCONNECTED'}")
    if db:
        db.close()
    
    # List available HTML files
    print("\n📁 Available HTML files:")
    html_files = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    for i, file in enumerate(html_files[:10]):  # Show first 10
        print(f"  {i+1}. {file}")
    
    if len(html_files) > 10:
        print(f"  ... and {len(html_files) - 10} more")
    
    print("\n🌐 Access URLs:")
    print("  Home: http://localhost:5000/")
    print("  Admin: http://localhost:5000/admin")
    print("  Admin Login: http://localhost:5000/admin/login")
    print("  User: http://localhost:5000/user")
    print("  User Login: http://localhost:5000/user/login")
    print("  Student: http://localhost:5000/student")
    print("  API Test: http://localhost:5000/api/status")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)