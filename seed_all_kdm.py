#!/usr/bin/env python3
"""
Unified Seeding & Setup Script for KDMPhoneShop.
This script performs the following actions in one single command:
1. Compiles the high-fidelity technical manual PDF.
2. Clears the database and seeds the showroom configurations & demo prompts.
3. Automatically embeds and ingests the PDF manual into ChromaDB.
"""
import os
import sys
import asyncio
from pathlib import Path

# Add project root to python path
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
load_dotenv(dotenv_path=project_root / ".env")

# Programmatically import our scripts
from scripts.generate_deep_pdf import create_manual_pdf
from backend.database import SessionLocal
from backend.models import AppConfig, DemoPrompt, RagSource
from backend.main import _seed_kdm_database
from backend.rag import ingest_file

async def run_pipeline():
    print("=" * 70)
    print("🌟 KDM PHONESHOP UNIFIED SHOWROOM INITIALIZATION PIPELINE")
    print("=" * 70)

    # 1. Generate Technical PDF Manual
    pdf_dir = project_root / "uploads"
    pdf_dir.mkdir(exist_ok=True)
    pdf_path = pdf_dir / "kdm_phones_deep_manual.pdf"
    
    print("\n📄 STEP 1: Compiles Technical Reference PDF Manual...")
    try:
        create_manual_pdf(str(pdf_path))
        print(f"✅ PDF Manual compiled successfully at: {pdf_path}")
    except Exception as e:
        print(f"❌ Failed to compile PDF Manual: {e}")
        sys.exit(1)

    # 2. Re-seed SQLite Database
    print("\n🌱 STEP 2: Restoring & Seeding SQLite Database Configuration...")
    db = SessionLocal()
    try:
        # Clear existing configs & prompts
        config_count = db.query(AppConfig).delete()
        prompt_count = db.query(DemoPrompt).delete()
        print(f"🗑️  Cleared database: Deleted {config_count} configs, {prompt_count} demo prompts.")
        db.commit()

        # Seed KDM default configurations & prompts (including our new RAG prompt)
        _seed_kdm_database()
        print("✅ SQLite database seeding completed successfully!")
    except Exception as e:
        print(f"❌ Database seeding failed: {e}")
        db.rollback()
        db.close()
        sys.exit(1)

    # 3. ChromaDB PDF Ingestion
    print("\n🤖 STEP 3: Ingesting Technical PDF Manual into RAG Vector Database (ChromaDB)...")
    try:
        config = db.query(AppConfig).first()
        if not config:
            config = AppConfig()
            db.add(config)
            db.flush()

        # Update config with OPENAI_API_KEY from .env if present
        openai_key = os.environ.get("OPENAI_API_KEY")
        if openai_key:
            print("🔑 Found OPENAI_API_KEY in .env/environment. Updating database configuration...")
            config.openai_api_key = openai_key
            db.commit()
            db.refresh(config)

        if not config.openai_api_key and not getattr(config, "use_litellm", False):
            print("\n" + "!" * 70)
            print("⚠️  WARNING: API KEY LACKING FOR RAG EMBEDDINGS")
            print("To embed the PDF manual into ChromaDB, please set OPENAI_API_KEY in your .env file.")
            print("Once configured, you can re-run this pipeline or execute: python scripts/ingest_manual.py")
            print("!" * 70 + "\n")
        else:
            # 3a. Clean up and ingest main technical reference PDF
            existing = db.query(RagSource).filter(RagSource.name == "kdm_phones_deep_manual.pdf").first()
            if existing:
                print("🗑️  Removing existing KDM Phone Manual reference from database...")
                db.delete(existing)
                db.commit()

            meta = {
                "name": "kdm_phones_deep_manual.pdf",
                "source_type": "uploaded"
            }

            print("📡 Registering and embedding PDF chunks...")
            result = await ingest_file(str(pdf_path), "application/pdf", meta, db=db)
            if result.get("source_id") != "error":
                print(f"🎉 Successfully ingested! Source ID: {result.get('source_id')}, Chunks: {result.get('chunks')}")
            else:
                print("❌ Ingestion failed during smart chunking/embedding.")

            # 3b. Discover and ingest security demo files from fakecompanies/rag_security_demo
            sec_dir = project_root / "fakecompanies" / "rag_security_demo"
            if sec_dir.exists():
                print("\n🔐 Ingesting Security Demo files from fakecompanies/rag_security_demo...")
                mimetype_map = {
                    ".pdf": "application/pdf",
                    ".md": "text/markdown",
                    ".txt": "text/plain",
                    ".csv": "text/csv"
                }
                for fpath in sorted(sec_dir.iterdir()):
                    if fpath.is_file() and fpath.suffix.lower() in mimetype_map:
                        fname = fpath.name
                        mimetype = mimetype_map[fpath.suffix.lower()]

                        # Clean up existing references to prevent duplication
                        existing_sec = db.query(RagSource).filter(RagSource.name == fname).first()
                        if existing_sec:
                            print(f"🗑️  Removing existing reference for {fname}...")
                            db.delete(existing_sec)
                            db.commit()

                        meta_sec = {
                            "name": fname,
                            "source_type": "uploaded"
                        }
                        print(f"📡 Registering and embedding: {fname}...")
                        result_sec = await ingest_file(str(fpath), mimetype, meta_sec, db=db)
                        if result_sec.get("source_id") != "error":
                            print(f"🎉 Successfully ingested {fname}! Chunks: {result_sec.get('chunks')}")
                        else:
                            print(f"❌ Failed to ingest {fname}.")
            else:
                print(f"⚠️  Security demo directory not found at: {sec_dir}")

    except Exception as e:
        print(f"❌ Error during ChromaDB ingestion: {e}")
        db.rollback()
    finally:
        db.close()

    print("\n" + "=" * 70)
    print("✨ SHOWROOM INITIALIZATION PIPELINE COMPLETE!")
    print("Run the application with: python start_all.py")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_pipeline())
