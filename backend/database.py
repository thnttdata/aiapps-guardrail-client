import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .models import Base

# Create database directory if it doesn't exist
os.makedirs("data", exist_ok=True)

SQLALCHEMY_DATABASE_URL = "sqlite:///./data/agentic_demo.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Dynamic Migration: ensure active_preset column exists
try:
    import sqlite3
    db_path = "./data/agentic_demo.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(app_config)")
    columns = [row[1] for row in cursor.fetchall()]
    if "active_preset" not in columns:
        cursor.execute("ALTER TABLE app_config ADD COLUMN active_preset VARCHAR DEFAULT 'DEFAULT-PRESET'")
        conn.commit()
        print("Successfully added active_preset column to app_config table via raw sqlite3.")
    conn.close()
except Exception as e:
    print(f"Migration error for active_preset column: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
