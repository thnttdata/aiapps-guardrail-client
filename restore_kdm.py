#!/usr/bin/env python3
"""
Restore KDMPhoneShop configuration and prompts in the SQLite database.
"""
import sys
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.database import SessionLocal
from backend.models import AppConfig, DemoPrompt

def main():
    print("🔄 Restoring KDMPhoneShop configuration...")
    db = SessionLocal()
    try:
        # Delete existing configs
        config_count = db.query(AppConfig).delete()
        print(f"🗑️ Deleted {config_count} existing configuration records.")
        
        # Delete existing demo prompts
        prompt_count = db.query(DemoPrompt).delete()
        print(f"🗑️ Deleted {prompt_count} existing demo prompts.")
        
        db.commit()
        print("✅ Database cleared.")
    except Exception as e:
        print(f"❌ Error clearing database: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

    # Import and run the seeding function to recreate KDMPhoneShop defaults
    print("🌱 Re-seeding KDMPhoneShop data...")
    from backend.main import _seed_kdm_database
    _seed_kdm_database()
    print("🎉 KDMPhoneShop showroom fully restored!")

if __name__ == "__main__":
    main()
