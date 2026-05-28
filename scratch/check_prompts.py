import sys
import os

sys.path.insert(0, os.path.abspath('.'))

from backend.database import SessionLocal
from backend.models import DemoPrompt

db = SessionLocal()
try:
    prompts = db.query(DemoPrompt).all()
    print(f"Total prompts in DB: {len(prompts)}")
    categories = set(p.category for p in prompts)
    print(f"Categories: {categories}")
    for p in prompts[:3]:
        print(f"[{p.category}] Title: {p.title}")
finally:
    db.close()
