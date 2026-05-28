#!/usr/bin/env python3
import sys
import os
import asyncio

# Add the current directory and the backend package to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)

from dotenv import load_dotenv

from backend.database import SessionLocal
from backend.models import AppConfig, RagSource
from backend.rag import ingest_file

async def main():
    # Load environment variables from .env file
    load_dotenv(dotenv_path=os.path.join(project_root, ".env"))

    pdf_path = os.path.join(project_root, "uploads", "kdm_phones_deep_manual.pdf")
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found at: {pdf_path}")
        print("Please run scripts/generate_deep_pdf.py first.")
        sys.exit(1)

    print("🌱 Initializing Database Session and Chromadb Ingestion...")
    db = SessionLocal()
    try:
        config = db.query(AppConfig).first()
        if not config:
            config = AppConfig()
            db.add(config)
            db.flush()

        # Check for OpenAI API key
        openai_key = os.environ.get("OPENAI_API_KEY")
        if openai_key:
            print("🔑 Found OPENAI_API_KEY in environment variables. Updating database configuration...")
            config.openai_api_key = openai_key
            db.commit()
            db.refresh(config)
        
        if not config.openai_api_key and not getattr(config, "use_litellm", False):
            print("\n" + "="*80)
            print("⚠️  API KEY REQUIRED FOR RAG EMBEDDINGS")
            print("="*80)
            print("To embed the PDF manual into ChromaDB, an OpenAI API key is required.")
            print("\nHow to configure:")
            print("1. Set it in your terminal before running this script:")
            print("   export OPENAI_API_KEY=your-api-key")
            print("   python scripts/ingest_manual.py")
            print("\n2. Or enter it in the Admin Console Security tab:")
            print("   http://localhost:3000/admin  (Open the app, go to Security tab, and save your key)")
            print("   Then run this ingestion script again.")
            print("="*80 + "\n")
            sys.exit(0)

        # Check if this source is already ingested to prevent duplicates
        existing = db.query(RagSource).filter(RagSource.name == "kdm_phones_deep_manual.pdf").first()
        if existing:
            print("🗑️ Removing existing KDM Phone Manual source to perform a clean re-ingestion...")
            db.delete(existing)
            db.commit()

        meta = {
            "name": "kdm_phones_deep_manual.pdf",
            "source_type": "uploaded"
        }

        print(f"📄 Ingesting {pdf_path} into ChromaDB and SQLite...")
        result = await ingest_file(pdf_path, "application/pdf", meta, db=db)
        
        if result.get("source_id") != "error":
            print(f"🎉 Successfully ingested! Source ID: {result.get('source_id')}, Chunks: {result.get('chunks')}")
        else:
            print("❌ Ingestion failed during smart chunking/embedding.")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error during manual ingestion: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
