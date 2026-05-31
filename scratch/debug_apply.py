import os
import sys
import asyncio

sys.path.insert(0, os.path.abspath('.'))

from backend.database import SessionLocal
from backend.models import AppConfig, RagSource
from backend.presets import apply_preset

async def test_preset(name):
    print(f"\n--- Testing Preset: {name} ---")
    db = SessionLocal()
    try:
        res = await apply_preset(name, db)
        print("Response:", res)
        sources = db.query(RagSource).all()
        print(f"RAG sources count: {len(sources)}")
        for s in sources:
            print(f"  - ID: {s.id}, Name: {s.name}, Chunks: {s.chunks_count}")
    except Exception as e:
        print(f"Exception during apply_preset {name}:")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

async def main():
    await test_preset("AIS-POC")
    await test_preset("AYCAP-DEMO")
    await test_preset("KDM-SHOWROOM")

if __name__ == "__main__":
    asyncio.run(main())
