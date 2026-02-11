# admin/routes.py
from flask import render_template, jsonify, request, session, redirect, url_for
from models import db, Faculty, Lab, Booking, Course, RegularSchedule
from datetime import datetime, date
import mysql.connector
from config.db import db_config

# REMOVE this line for now:
# from . import admin_bp

# Create the blueprint HERE instead:
from flask import Blueprint
admin_bp = Blueprint('admin', __name__,
                     template_folder='templates',
                     static_folder='static',
                     static_url_path='/admin/static')

# Your routes go here...
@admin_bp.route('/')
def admin_dashboard():
    return "Admin Dashboard Working!"