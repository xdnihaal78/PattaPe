"""
backend/tests/test_database.py

Tests for diagnostic case database persistence (Task 1).
Validates:
A. Successful case persistence through repository layer
B. Graceful degradation on database persistence failure (no 500 or corruption)
C. Case ID consistency between returned response and persisted case
D. Timestamp consistency between returned response and persisted case
"""

import io
import pytest
import sys
from pathlib import Path
from unittest.mock import AsyncMock

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from app.main import app
from app.schemas import PredictResponse
import app.repositories.case_repository as case_repo

client = TestClient(app)


def _create_test_jpeg() -> bytes:
    from PIL import Image
    buf = io.BytesIO()
    img = Image.new("RGB", (10, 10), color=(34, 139, 34))
    img.save(buf, format="JPEG")
    return buf.getvalue()


DUMMY_JPEG = _create_test_jpeg()


def test_successful_case_persistence(monkeypatch):
    """
    Test A: Successful case persistence.
    Verify repository.save_case is called with correct case information after prediction.
    """
    saved_cases = []

    async def mock_save_case(case_data):
        saved_cases.append(case_data)
        return getattr(case_data, "case_id", "CASE-TEST")

    monkeypatch.setattr(case_repo, "save_case", mock_save_case)

    files = {"file": ("leaf.jpg", DUMMY_JPEG, "image/jpeg")}
    data = {"crop": "rice"}

    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 200

    # Verify repository was called exactly once
    assert len(saved_cases) == 1
    persisted_case = saved_cases[0]

    # Verify correct case information passed
    assert isinstance(persisted_case, PredictResponse)
    assert persisted_case.crop == "rice"
    assert persisted_case.disease == "bacterial_leaf_blight"
    assert persisted_case.confidence > 0.0
    assert persisted_case.severity in ("trace", "mild", "moderate", "severe")
    assert persisted_case.case_id == response.json()["case_id"]


def test_database_failure_handling(monkeypatch):
    """
    Test B: Repository/database failure.
    Simulate database failure and verify prediction response remains valid and uncorrupted.
    """
    async def mock_failing_save_case(case_data):
        raise RuntimeError("PostgreSQL / SQLite database connection lost or pool exhausted!")

    monkeypatch.setattr(case_repo, "save_case", mock_failing_save_case)

    files = {"file": ("leaf.jpg", DUMMY_JPEG, "image/jpeg")}
    data = {"crop": "rice"}

    response = client.post("/predict", files=files, data=data)

    # Must NOT return 500 error or corrupt response
    assert response.status_code == 200
    payload = response.json()
    assert len(set(payload.keys())) == 16
    assert payload["crop"] == "rice"
    assert payload["disease"] == "bacterial_leaf_blight"


def test_case_id_consistency(monkeypatch):
    """
    Test C: Case ID consistency.
    Verify case ID is persisted consistently with the API response.
    """
    persisted_case_ids = []

    async def mock_save_case(case_data):
        persisted_case_ids.append(case_data.case_id)
        return case_data.case_id

    monkeypatch.setattr(case_repo, "save_case", mock_save_case)

    files = {"file": ("leaf.jpg", DUMMY_JPEG, "image/jpeg")}
    data = {"crop": "banana"}

    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 200

    payload = response.json()
    assert len(persisted_case_ids) == 1
    assert persisted_case_ids[0] == payload["case_id"]


def test_timestamp_consistency(monkeypatch):
    """
    Test D: Timestamp consistency.
    Verify persisted timestamp corresponds to the returned case timestamp.
    """
    persisted_timestamps = []

    async def mock_save_case(case_data):
        persisted_timestamps.append(case_data.timestamp)
        return case_data.case_id

    monkeypatch.setattr(case_repo, "save_case", mock_save_case)

    files = {"file": ("leaf.jpg", DUMMY_JPEG, "image/jpeg")}
    data = {"crop": "chilli"}

    response = client.post("/predict", files=files, data=data)
    assert response.status_code == 200

    payload = response.json()
    assert len(persisted_timestamps) == 1
    assert persisted_timestamps[0] == payload["timestamp"]
