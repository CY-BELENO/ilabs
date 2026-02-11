# config/db.py
import os
from dotenv import load_dotenv

load_dotenv()

# MySQL Configuration with YOUR password
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'Milan0sM@rine'),
    'database': os.getenv('DB_NAME', 'ilabs_system'),
    'port': int(os.getenv('DB_PORT', 3306))
}

SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"