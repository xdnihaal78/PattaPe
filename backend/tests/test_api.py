"""
backend/tests/test_api.py

API and Contract compliance tests for PattaPe backend.
Strictly validates:
- GET /health response format and status code
- POST /predict response strictly matching CONTRACT.md (all 15 fields & types)
- Request validation (invalid crop, empty image, missing parameters)
- Escalation rule verification
"""

import io
import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import os
os.environ["MOCK_MODEL"] = "true"

from app.main import app

client = TestClient(app)

# Generate a valid 10x10 JPEG image byte string for testing
def _create_test_jpeg() -> bytes:
    from PIL import Image
    buf = io.BytesIO()
    img = Image.new("RGB", (10, 10), color=(34, 139, 34))
    img.save(buf, format="JPEG")
    return buf.getvalue()

DUMMY_JPEG = _create_test_jpeg()


def test_health_check_endpoint():
    """Verify GET /health returns 200 and expected schema for Aditya's integration testing."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "mock_mode" in data
    assert "version" in data
    assert "timestamp" in data


def test_predict_contract_compliance():
    """
    CRITICAL CONTRACT TEST:
    Verify POST /predict produces exact JSON matching the 16-field frozen contract.
    No extra fields, no missing fields, correct types for all 16 fields.
    """
    files = {"file": ("leaf.jpg", DUMMY_JPEG, "image/jpeg")}
    data = {"crop": "rice"}

    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 200

    payload = response.json()

    # Exact expected 16 fields per frozen contract
    expected_fields = {
        "crop",
        "crop_label_i18n",
        "disease",
        "disease_label_i18n",
        "confidence",
        "top3",
        "severity",
        "affected_pct",
        "heatmap_url",
        "risk_72h",
        "advisory",
        "gemini",
        "escalate",
        "escalate_reason",
        "case_id",
        "timestamp",
    }
    actual_fields = set(payload.keys())

    # Strictly no missing fields, strictly no extra fields (EXACTLY 16)
    assert len(actual_fields) == 16, f"Expected exactly 16 fields, got {len(actual_fields)}"
    assert actual_fields == expected_fields, (
        f"Contract mismatch! Missing: {expected_fields - actual_fields}, Extra: {actual_fields - expected_fields}"
    )

    # 1. crop
    assert payload["crop"] == "rice"
    assert isinstance(payload["crop"], str)

    # 2. crop_label_i18n
    assert isinstance(payload["crop_label_i18n"], dict)
    assert set(payload["crop_label_i18n"].keys()) == {"en", "hi", "ta"}
    assert payload["crop_label_i18n"]["en"] == "Rice"

    # 3. disease
    assert isinstance(payload["disease"], str)
    assert payload["disease"] == "bacterial_leaf_blight"

    # 4. disease_label_i18n
    assert isinstance(payload["disease_label_i18n"], dict)
    assert set(payload["disease_label_i18n"].keys()) == {"en", "hi", "ta"}
    assert payload["disease_label_i18n"]["en"] == "Bacterial Leaf Blight"

    # 5. confidence
    assert isinstance(payload["confidence"], float)
    assert 0.0 <= payload["confidence"] <= 1.0

    # 6. top3
    assert isinstance(payload["top3"], list)
    assert len(payload["top3"]) == 3
    for item in payload["top3"]:
        assert isinstance(item, dict)
        assert "disease" in item and "confidence" in item
        assert isinstance(item["disease"], str)
        assert isinstance(item["confidence"], float)

    # 7. severity
    assert payload["severity"] in {"trace", "mild", "moderate", "severe"}

    # 8. affected_pct
    assert isinstance(payload["affected_pct"], (int, float))
    assert 0.0 <= payload["affected_pct"] <= 100.0

    # 9. heatmap_url
    assert payload["heatmap_url"] is None or isinstance(payload["heatmap_url"], str)

    # 10. risk_72h
    assert isinstance(payload["risk_72h"], dict)
    assert "level" in payload["risk_72h"]
    assert "reasons" in payload["risk_72h"]
    assert payload["risk_72h"]["level"] in {"low", "moderate", "high", "unknown"}
    assert isinstance(payload["risk_72h"]["reasons"], list)

    # 11. advisory
    assert isinstance(payload["advisory"], dict)
    assert set(payload["advisory"].keys()) == {
        "what_it_is",
        "do_now",
        "watch_for",
        "avoid",
        "source",
    }
    assert isinstance(payload["advisory"]["what_it_is"], str)
    assert isinstance(payload["advisory"]["do_now"], list)
    assert isinstance(payload["advisory"]["watch_for"], list)
    assert isinstance(payload["advisory"]["avoid"], list)
    assert isinstance(payload["advisory"]["source"], str)

    # 12. gemini (object or null)
    assert payload["gemini"] is None or isinstance(payload["gemini"], dict)

    # 13. escalate & 14. escalate_reason
    assert isinstance(payload["escalate"], bool)
    if payload["escalate"]:
        assert payload["escalate_reason"] is not None
        assert isinstance(payload["escalate_reason"], str)
    else:
        assert payload["escalate_reason"] is None or isinstance(payload["escalate_reason"], str)

    # 15. case_id
    assert isinstance(payload["case_id"], str)
    assert payload["case_id"].startswith("CASE-")

    # 16. timestamp (valid ISO-8601)
    from datetime import datetime
    parsed_dt = datetime.fromisoformat(payload["timestamp"])
    assert parsed_dt is not None


def test_predict_with_image_field_alias():
    """Verify endpoint accepts 'image' parameter name as an alias to 'file'."""
    files = {"image": ("leaf.png", DUMMY_JPEG, "image/png")}
    data = {"crop": "chilli"}

    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 200
    payload = response.json()
    assert payload["crop"] == "chilli"
    assert payload["disease"] == "leafcurl"


def test_predict_invalid_crop():
    """Verify invalid crop returns 400 Bad Request."""
    files = {"file": ("leaf.jpg", DUMMY_JPEG, "image/jpeg")}
    data = {"crop": "wheat"}  # Not in 5 crops

    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 400
    assert "Invalid crop" in response.json()["detail"]


def test_predict_empty_file():
    """Verify empty image returns 400 Bad Request."""
    files = {"file": ("empty.jpg", b"", "image/jpeg")}
    data = {"crop": "rice"}

    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_predict_missing_file():
    """Verify omitting file returns 400 Bad Request."""
    data = {"crop": "rice"}
    response = client.post("/predict", data=data)
    assert response.status_code == 400
    assert "no leaf image provided" in response.json()["detail"].lower()


def test_predict_missing_crop():
    """Verify omitting crop returns 422 Unprocessable Entity."""
    files = {"file": ("leaf.jpg", DUMMY_JPEG, "image/jpeg")}
    response = client.post("/predict", files=files)
    assert response.status_code == 422


def test_predict_corrupt_image():
    """Verify corrupt/malformed image bytes return 400 Bad Request."""
    files = {"file": ("bad.jpg", b"corrupted_bytes_not_a_valid_image", "image/jpeg")}
    data = {"crop": "rice"}
    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 400
    assert "corrupt" in response.json()["detail"].lower() or "unreadable" in response.json()["detail"].lower()


def test_predict_unsupported_image():
    """Verify unsupported file types return 400 Bad Request."""
    files = {"file": ("document.pdf", b"%PDF-1.5 test content", "application/pdf")}
    data = {"crop": "rice"}
    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 400
    assert "invalid file type" in response.json()["detail"].lower() or "must be an image" in response.json()["detail"].lower()


def test_predict_model_failure_fallback(monkeypatch):
    """
    Verify model failure/timeout fallback in POST /predict:
    Returns 200 with disease='unknown', confidence=0, top3=[], heatmap_url=None, escalate=True.
    """
    import app.services.model_service as ms

    async def mock_crashing_predict(*args, **kwargs):
        return ms.ModelOutput(
            crop="rice",
            disease="unknown",
            confidence=0.0,
            top3=[],
            affected_pct=0.0,
            heatmap_url=None,
            is_fallback=True,
            fallback_reason="inference_timeout",
        )

    monkeypatch.setattr(ms, "predict_image", mock_crashing_predict)

    files = {"file": ("leaf.jpg", DUMMY_JPEG, "image/jpeg")}
    data = {"crop": "rice"}

    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 200
    payload = response.json()

    assert payload["disease"] == "unknown"
    assert payload["confidence"] == 0.0
    assert payload["top3"] == []
    assert payload["heatmap_url"] is None
    assert payload["affected_pct"] == 0.0
    assert payload["escalate"] is True
    assert len(set(payload.keys())) == 16


def test_static_heatmaps_serving():
    """Verify static heatmaps are served properly for frontend rendering."""
    response = client.get("/static/heatmaps/demo_rice_blight.png")
    assert response.status_code == 200
    assert response.headers["content-type"] in ("image/png", "image/x-png")

