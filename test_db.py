# test_db.py
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

try:
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('Milan0sM@rine'),
        database=os.getenv('DB_NAME'),
        port=int(os.getenv('DB_PORT', 3306))
    )
    
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    
    print("✅ Database connected successfully!")
    print(f"📊 Found {len(tables)} tables:")
    
    for table in tables:
        print(f"  - {table[0]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    print("\nTroubleshooting:")
    print("1. Is MySQL running? (Check Services -> MySQL)")
    print("2. Are credentials in .env file correct?")
    print("3. Does database 'ilabs_system' exist?")