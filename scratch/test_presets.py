import asyncio
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from backend.database import SessionLocal
from backend.models import RagSource, AppConfig
from backend.presets import apply_preset

async def test():
    db = SessionLocal()
    for preset in ["AIS-POC", "AYCAP-DEMO", "KDM-SHOWROOM"]:
        print(f"\n--- Applying preset {preset} ---")
        res = await apply_preset(preset, db)
        print(f"Result: {res}")
        sources = db.query(RagSource).all()
        print(f"Sources count: {len(sources)}")
        for s in sources:
            print(f" - {s.name} ({s.chunks_count} chunks)")
    db.close()

if __name__ == "__main__":
    asyncio.run(test())
