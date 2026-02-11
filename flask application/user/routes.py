# user/routes.py
from flask import render_template, jsonify, request, session, redirect, url_for
from . import user_bp
from models import db, Faculty, Lab, Booking, Course, RegularSchedule
from datetime import datetime, date, timedelta
import mysql.connector
from config.db import db_config

# Helper function for raw SQL queries
def get_db_connection():
    return mysql.connector.connect(**db_config)

# User authentication decorator
def user_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('user.faculty_login'))
        return f(*args, **kwargs)
    return decorated_function

# Faculty Login
@user_bp.route('/login', methods=['GET', 'POST'])
def faculty_login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')  # In production, use proper hashing
        
        faculty = Faculty.query.filter_by(email=email, is_active=True).first()
        
        if faculty:  # In production: verify password hash
            session['user_id'] = faculty.id
            session['faculty_id'] = faculty.faculty_id
            session['full_name'] = faculty.full_name
            session['email'] = faculty.email
            session['role'] = faculty.role
            
            if faculty.role == 'admin':
                return redirect(url_for('admin.admin_dashboard'))
            else:
                return redirect(url_for('user.faculty_dashboard'))
    
    return render_template('faculty_login.html')

# Faculty Dashboard
@user_bp.route('/dashboard')
@user_required
def faculty_dashboard():
    return render_template('faculty_dashboard.html')

# Student Portal
@user_bp.route('/student')
def student_portal():
    return render_template('student_portal.html')

# Home page
@user_bp.route('/')
def index():
    return render_template('index.html')

# API: Get faculty's bookings
@user_bp.route('/api/my-bookings')
@user_required
def get_my_bookings():
    bookings = Booking.query.filter_by(faculty_id=session['user_id'])\
                           .order_by(Booking.booking_date.desc(), Booking.start_time)\
                           .limit(50).all()
    
    result = []
    for booking in bookings:
        result.append({
            'id': booking.id,
            'booking_code': booking.booking_code,
            'lab_name': booking.lab.lab_name if booking.lab else 'Unknown',
            'room': booking.lab.room_number if booking.lab else 'Unknown',
            'booking_date': booking.booking_date.isoformat() if booking.booking_date else None,
            'start_time': booking.start_time.strftime('%H:%M') if booking.start_time else None,
            'end_time': booking.end_time.strftime('%H:%M') if booking.end_time else None,
            'purpose': booking.purpose,
            'status': booking.status,
            'created_at': booking.created_at.isoformat() if booking.created_at else None
        })
    
    return jsonify(result)

# API: Create new booking
@user_bp.route('/api/bookings', methods=['POST'])
@user_required
def create_booking_api():
    data = request.json
    
    # Check if lab is available
    existing = Booking.query.filter(
        Booking.lab_id == data['lab_id'],
        Booking.booking_date == datetime.strptime(data['booking_date'], '%Y-%m-%d').date(),
        Booking.status.in_(['approved', 'pending']),
        (
            (Booking.start_time <= datetime.strptime(data['end_time'], '%H:%M').time()) &
            (Booking.end_time >= datetime.strptime(data['start_time'], '%H:%M').time())
        )
    ).first()
    
    if existing:
        return jsonify({'error': 'Time slot already booked'}), 400
    
    # Generate booking code
    booking_code = f"BOOK-{datetime.now().strftime('%Y%m%d')}-{session['faculty_id']}"
    
    # Create booking
    booking = Booking(
        booking_code=booking_code,
        lab_id=data['lab_id'],
        faculty_id=session['user_id'],
        booking_date=datetime.strptime(data['booking_date'], '%Y-%m-%d').date(),
        start_time=datetime.strptime(data['start_time'], '%H:%M').time(),
        end_time=datetime.strptime(data['end_time'], '%H:%M').time(),
        purpose=data.get('purpose', 'extra_class'),
        purpose_details=data.get('purpose_details', ''),
        course_id=data.get('course_id'),
        section=data.get('section')
    )
    
    db.session.add(booking)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'booking_id': booking.id,
        'booking_code': booking_code,
        'message': 'Booking request submitted'
    })

# API: Cancel booking
@user_bp.route('/api/bookings/<int:booking_id>/cancel', methods=['POST'])
@user_required
def cancel_booking_api(booking_id):
    booking = Booking.query.filter_by(
        id=booking_id,
        faculty_id=session['user_id']
    ).first()
    
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    
    if booking.status not in ['pending', 'approved']:
        return jsonify({'error': 'Cannot cancel this booking'}), 400
    
    booking.status = 'cancelled'
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Booking cancelled'})

# API: Check lab availability
@user_bp.route('/api/labs/availability')
def check_lab_availability():
    lab_id = request.args.get('lab_id')
    booking_date = request.args.get('date')
    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')
    
    if not all([lab_id, booking_date, start_time, end_time]):
        return jsonify({'error': 'Missing parameters'}), 400
    
    # Check bookings
    booking_conflict = Booking.query.filter(
        Booking.lab_id == lab_id,
        Booking.booking_date == datetime.strptime(booking_date, '%Y-%m-%d').date(),
        Booking.status.in_(['approved', 'pending']),
        (
            (Booking.start_time <= datetime.strptime(end_time, '%H:%M').time()) &
            (Booking.end_time >= datetime.strptime(start_time, '%H:%M').time())
        )
    ).first()
    
    # Check regular schedules
    schedule_conflict = RegularSchedule.query.filter(
        RegularSchedule.lab_id == lab_id,
        RegularSchedule.day_of_week == datetime.strptime(booking_date, '%Y-%m-%d').strftime('%A'),
        RegularSchedule.is_active == True,
        (
            (RegularSchedule.start_time <= datetime.strptime(end_time, '%H:%M').time()) &
            (RegularSchedule.end_time >= datetime.strptime(start_time, '%H:%M').time())
        )
    ).first()
    
    available = not (booking_conflict or schedule_conflict)
    
    return jsonify({
        'available': available,
        'conflicts': {
            'booking': bool(booking_conflict),
            'schedule': bool(schedule_conflict)
        }
    })

# API: Get available labs for time slot
@user_bp.route('/api/labs/available')
def get_available_labs():
    booking_date = request.args.get('date')
    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')
    
    if not all([booking_date, start_time, end_time]):
        return jsonify({'error': 'Missing parameters'}), 400
    
    # Get all labs
    all_labs = Lab.query.filter_by(status='available').all()
    
    available_labs = []
    
    for lab in all_labs:
        # Check for booking conflicts
        booking_conflict = Booking.query.filter(
            Booking.lab_id == lab.id,
            Booking.booking_date == datetime.strptime(booking_date, '%Y-%m-%d').date(),
            Booking.status.in_(['approved', 'pending']),
            (
                (Booking.start_time <= datetime.strptime(end_time, '%H:%M').time()) &
                (Booking.end_time >= datetime.strptime(start_time, '%H:%M').time())
            )
        ).first()
        
        # Check for schedule conflicts
        schedule_conflict = RegularSchedule.query.filter(
            RegularSchedule.lab_id == lab.id,
            RegularSchedule.day_of_week == datetime.strptime(booking_date, '%Y-%m-%d').strftime('%A'),
            RegularSchedule.is_active == True,
            (
                (RegularSchedule.start_time <= datetime.strptime(end_time, '%H:%M').time()) &
                (RegularSchedule.end_time >= datetime.strptime(start_time, '%H:%M').time())
            )
        ).first()
        
        if not booking_conflict and not schedule_conflict:
            available_labs.append({
                'id': lab.id,
                'code': lab.lab_code,
                'name': lab.lab_name,
                'room': lab.room_number,
                'building': lab.building,
                'capacity': lab.capacity
            })
    
    return jsonify(available_labs)

# Logout
@user_bp.route('/logout')
def user_logout():
    session.clear()
    return redirect(url_for('user.faculty_login'))