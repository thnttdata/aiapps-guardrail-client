import json
import io
import os
import shutil
import zipfile
from fastapi.testclient import TestClient

# Ensure we are in the correct python path and import components
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app
from backend.database import SessionLocal, engine
from backend.models import LLMIntegration, AppConfig, Base

def run_verification():
    print("=== Starting Import/Export Configuration Verification ===")
    
    # Use standard FastAPI TestClient
    client = TestClient(app)
    db = SessionLocal()
    
    try:
        # 1. Setup clean initial state in the DB
        print("\n1. Seeding clean test state in DB...")
        
        # Ensure we have some LLM integrations
        # Delete existing ones to have a known clean state
        db.query(LLMIntegration).delete()
        
        openai_integration = LLMIntegration(
            provider="openai",
            enabled=True,
            api_key="real-secret-key-123",
            api_base="https://api.openai.com/v1",
            model_name="gpt-4o-mini",
            config_json={"org_id": "real-org", "api_base": ""}
        )
        db.add(openai_integration)
        
        vertex_integration = LLMIntegration(
            provider="vertex_ai",
            enabled=False,
            api_key=None,
            api_base=None,
            model_name="gemini-1.5-flash",
            config_json={
                "project_id": "real-gcp-project",
                "location": "us-central1",
                "credentials_json": "real-service-account-json-content"
            }
        )
        db.add(vertex_integration)
        
        # Write dummy last_rag_scanning_result.json to data/
        os.makedirs("data", exist_ok=True)
        dummy_scanning_report = {
            "scanned_at": "2026-05-29T12:00:00Z",
            "findings_count": 42,
            "status": "completed"
        }
        with open("data/last_rag_scanning_result.json", "w", encoding="utf-8") as f:
            json.dump(dummy_scanning_report, f, indent=2)
            
        db.commit()
        print("Initial test state seeded.")
        
        # 2. Test Export WITHOUT API Keys
        print("\n2. Requesting export WITHOUT API keys...")
        response = client.get("/api/config/export?include=llm,rag_scanning")
        assert response.status_code == 200, f"Export failed: {response.text}"
        
        zip_bytes = response.content
        zip_buffer = io.BytesIO(zip_bytes)
        
        # Inspect export zip contents
        with zipfile.ZipFile(zip_buffer, "r") as z:
            namelist = z.namelist()
            print(f"Zip files: {namelist}")
            
            assert "llm_integrations.json" in namelist
            assert "last_rag_scanning_result.json" in namelist
            assert "metadata.json" in namelist
            
            # Read and verify llm_integrations.json
            with z.open("llm_integrations.json") as f:
                integrations = json.loads(f.read().decode("utf-8"))
            
            # Read and verify last_rag_scanning_result.json
            with z.open("last_rag_scanning_result.json") as f:
                scanning_report = json.loads(f.read().decode("utf-8"))
                
            # Read metadata.json
            with z.open("metadata.json") as f:
                metadata = json.loads(f.read().decode("utf-8"))
                
        print("Metadata contents:", metadata)
        assert "llm" in metadata["includes"]
        assert "rag_scanning" in metadata["includes"]
        
        # Verify keys are scrubbed!
        print("\nChecking scrubbed credentials in exported integrations...")
        for integration in integrations:
            prov = integration["provider"]
            if prov == "openai":
                print(f"openai integration: api_key={integration['api_key']}, config_json={integration['config_json']}")
                assert integration["api_key"] is None, "OpenAI API key was NOT scrubbed!"
                assert integration["config_json"].get("org_id") is None, "OpenAI org_id was NOT scrubbed!"
            elif prov == "vertex_ai":
                print(f"vertex_ai integration: config_json={integration['config_json']}")
                assert integration["config_json"].get("credentials_json") is None, "Vertex AI credentials_json was NOT scrubbed!"
                # Project ID is non-sensitive, but let's check its values
                assert integration["config_json"].get("project_id") == "real-gcp-project"
                
        print("Credential scrubbing verified successfully.")
        assert scanning_report == dummy_scanning_report, "RAG scanning report does not match dummy scanning report!"
        print("RAG scanning report export verified successfully.")
        
        # 3. Test Import / Symmetric Merging (Preserving keys)
        print("\n3. Testing Key-Preservation during Import...")
        # Simulate target database state:
        # Delete vertex credentials and change some other properties to simulate machine setting updates
        db.query(LLMIntegration).delete()
        
        # Simulate target DB with pre-existing keys, but different configurations (e.g. models or enabled toggles)
        db.add(LLMIntegration(
            provider="openai",
            enabled=False, # differs from export (which was True)
            api_key="target-openai-active-key", # differs from export (which was scrubbed None)
            api_base="https://custom.openai-endpoint.com/v1", # differs from export
            model_name="gpt-3.5-turbo", # differs from export (which was gpt-4o-mini)
            config_json={"org_id": "target-active-org-id", "api_base": "custom"} # differs from export
        ))
        
        db.add(LLMIntegration(
            provider="vertex_ai",
            enabled=True, # differs
            api_key=None,
            api_base=None,
            model_name="gemini-1.0-pro", # differs
            config_json={
                "project_id": "target-project-id", # differs
                "location": "us-west1", # differs
                "credentials_json": "target-active-vertex-key" # differs
            }
        ))
        db.commit()
        
        # Run import using the TestClient
        # We need to send the ZIP file bytes as form data
        zip_file_payload = {"file": ("config.zip", zip_bytes, "application/zip")}
        import_response = client.post("/api/config/import", files=zip_file_payload)
        assert import_response.status_code == 200, f"Import failed: {import_response.text}"
        print("Import API call successful!")
        
        # Verify the DB merged state
        db.expire_all()
        db_openai = db.query(LLMIntegration).filter(LLMIntegration.provider == "openai").first()
        db_vertex = db.query(LLMIntegration).filter(LLMIntegration.provider == "vertex_ai").first()
        
        print("\nVerifying merged OpenAI integration:")
        print(f"  enabled: {db_openai.enabled} (expected: True)")
        print(f"  model_name: {db_openai.model_name} (expected: gpt-4o-mini)")
        print(f"  api_key: {db_openai.api_key} (expected: target-openai-active-key)")
        print(f"  config_json org_id: {db_openai.config_json.get('org_id')} (expected: target-active-org-id)")
        
        assert db_openai.enabled == True, "OpenAI enabled toggle was not updated to imported value!"
        assert db_openai.model_name == "gpt-4o-mini", "OpenAI model name was not updated to imported value!"
        assert db_openai.api_key == "target-openai-active-key", "OpenAI API key was overwritten by imported None!"
        assert db_openai.config_json.get("org_id") == "target-active-org-id", "OpenAI org_id was overwritten by imported None!"
        
        print("\nVerifying merged Vertex AI integration:")
        print(f"  enabled: {db_vertex.enabled} (expected: False)")
        print(f"  model_name: {db_vertex.model_name} (expected: gemini-1.5-flash)")
        print(f"  project_id: {db_vertex.config_json.get('project_id')} (expected: real-gcp-project)")
        print(f"  location: {db_vertex.config_json.get('location')} (expected: us-central1)")
        print(f"  credentials_json: {db_vertex.config_json.get('credentials_json')} (expected: target-active-vertex-key)")
        
        assert db_vertex.enabled == False, "Vertex AI enabled toggle was not updated!"
        assert db_vertex.model_name == "gemini-1.5-flash", "Vertex AI model name was not updated!"
        assert db_vertex.config_json.get("project_id") == "real-gcp-project", "Vertex AI project_id was not updated!"
        assert db_vertex.config_json.get("location") == "us-central1", "Vertex AI location was not updated!"
        assert db_vertex.config_json.get("credentials_json") == "target-active-vertex-key", "Vertex AI credentials_json was overwritten by imported None!"
        
        print("\nVerification successful! All security keys and nested credentials are fully preserved during merge import, while standard configuration properties are correctly updated.")
        
    finally:
        db.close()

if __name__ == "__main__":
    run_verification()
