# user/__init__.py
from flask import Blueprint

# Define the blueprint FIRST
user_bp = Blueprint('user', __name__,
                    template_folder='templates',
                    static_folder='static',
                    static_url_path='/user/static')

# Import routes AFTER blueprint is defined
# (Don't put anything else here for now)