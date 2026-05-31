import asyncio
from dotenv import load_dotenv
load_dotenv()

from backend.database import SessionLocal
from backend import presets
from backend.models import RagSource, AppConfig

async def test_preset(name):
    print(f"\n--- Testing Preset: {name} ---")
    db = SessionLocal()
    try:
        result = await presets.apply_preset(name, db)
        print("Success:", result)
        
        # Verify db rows
        config = db.query(AppConfig).first()
        print("Config Business Name:", config.business_name)
        print("Config Theme:", config.theme)
        print("OpenAI Key:", bool(config.openai_api_key))
        print("Lakera Key:", bool(config.lakera_api_key))
        
        sources = db.query(RagSource).all()
        print("RAG Sources:")
        for s in sources:
            print(f"  - ID: {s.id}, Name: {s.name}, Chunks: {s.chunks_count}")
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

async def main():
    await test_preset("DEFAULT-PRESET")
    await test_preset("AIS-POC")
    await test_preset("AYCAP-DEMO")
    await test_preset("KDM-SHOWROOM")

if __name__ == "__main__":
    asyncio.run(main())
