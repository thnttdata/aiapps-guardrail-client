import sys
import os

sys.path.insert(0, os.path.abspath('.'))

from backend.database import SessionLocal
from backend.models import AppConfig, RagSource

db = SessionLocal()
try:
    config = db.query(AppConfig).first()
    print("CONFIG:")
    if config:
        print(f"openai_api_key configured: {bool(config.openai_api_key)}")
        print(f"lakera_api_key configured: {bool(config.lakera_api_key)}")
        print(f"lakera_enabled: {config.lakera_enabled}")
        print(f"rag_content_scanning: {config.rag_content_scanning}")
        print(f"rag_lakera_project_id: {config.rag_lakera_project_id}")
        print(f"openai_model: {config.openai_model}")
    else:
        print("No AppConfig found in DB!")
    
    print("\nRAG SOURCES:")
    sources = db.query(RagSource).all()
    for s in sources:
        print(f"ID: {s.id}, Name: {s.name}, Type: {s.source_type}, Chunks: {s.chunks_count}")

finally:
    db.close()
