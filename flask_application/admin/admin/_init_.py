# admin/__init__.py
from flask import Blueprint

# Define the blueprint FIRST
admin_bp = Blueprint('admin', __name__,
                     template_folder='templates',
                     static_folder='static',
                     static_url_path='/admin/static')

# Import routes AFTER blueprint is defined
# (Don't put anything else here for now)