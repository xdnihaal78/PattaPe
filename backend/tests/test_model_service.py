"""
backend/tests/test_model_service.py

Unit tests for the ML Model Inference module (services/model_service.py).
Validates:
- Mock mode inference across supported crops
- Output shape and PredictionResult typing
- Simulated latency handling
- Timeout handling and controlled safe fallback
- Error recovery and graceful degradation
"""

import asyncio
import pytest
import sys
from pathlib import Path

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.model_service import (
    DEFAULT_MOCK_LATENCY,
    DEFAULT_MOCK_MODEL,
    FALLBACK_AFFECTED_PCT,
    FALLBACK_CONFIDENCE,
    FALLBACK_DISEASE,
    FALLBACK_HEATMAP_URL,
    ModelOutput,
    PredictionResult,
    predict_image,
)


def test_mock_environment_defaults():
    """Verify environment defaults for mock mode and simulated latency."""
    assert DEFAULT_MOCK_MODEL is True
    assert DEFAULT_MOCK_LATENCY == 1.5


@pytest.mark.asyncio
async def test_mock_prediction_shape_and_types():
    """Verify that mock inference produces exactly the 6 ML-owned fields with correct types."""
    dummy_image = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00"
    
    result = await predict_image(
        image_bytes=dummy_image,
        crop="rice",
        mock_mode=True,
        mock_latency=0.01,  # Short latency for fast unit testing
    )

    assert isinstance(result, ModelOutput)
    assert isinstance(result, PredictionResult)
    
    # Verify the 6 ML-owned fields
    six_fields = result.to_dict()
    assert set(six_fields.keys()) == {
        "crop",
        "disease",
        "confidence",
        "top3",
        "affected_pct",
        "heatmap_url",
    }
    
    assert result.crop == "rice"
    assert result.disease == "bacterial_leaf_blight"
    assert 0.0 <= result.confidence <= 1.0
    assert isinstance(result.top3, list)
    assert len(result.top3) == 3
    for pred in result.top3:
        assert "disease" in pred
        assert "confidence" in pred
        assert isinstance(pred["confidence"], float)
    assert isinstance(result.affected_pct, float)
    assert result.affected_pct > 0
    assert isinstance(result.heatmap_url, str)
    assert result.is_fallback is False
    assert result.fallback_reason is None


@pytest.mark.asyncio
@pytest.mark.parametrize("crop,expected_disease", [
    ("rice", "bacterial_leaf_blight"),
    ("chilli", "leafcurl"),
    ("banana", "sigatoka"),
    ("groundnut", "rust"),
    ("sugarcane", "redrot"),
])
async def test_mock_prediction_all_crops(crop: str, expected_disease: str):
    """Verify mock prediction returns appropriate disease for all supported crops."""
    dummy_image = b"test-image-bytes"
    result = await predict_image(
        image_bytes=dummy_image,
        crop=crop,
        mock_mode=True,
        mock_latency=0.01,
    )
    assert result.crop == crop
    assert result.disease == expected_disease
    assert result.confidence > 0.8
    assert result.is_fallback is False


@pytest.mark.asyncio
async def test_inference_timeout_triggers_safe_fallback():
    """
    Verify that when model inference exceeds timeout_seconds, a safe fallback
    prediction is returned with disease='unknown', confidence=0, top3=[], heatmap_url=None.
    """
    dummy_image = b"test-image-bytes"
    
    # Configure timeout shorter than mock latency
    result = await predict_image(
        image_bytes=dummy_image,
        crop="rice",
        mock_mode=True,
        mock_latency=0.2,      # simulated inference takes 200ms
        timeout_seconds=0.05,  # timeout triggers after 50ms
    )

    assert isinstance(result, ModelOutput)
    assert result.is_fallback is True
    assert result.fallback_reason == "inference_timeout"
    assert result.disease == "unknown"
    assert result.confidence == 0.0
    assert result.top3 == []
    assert result.heatmap_url is None
    assert result.affected_pct == 0.0
    assert result.crop == "rice"


@pytest.mark.asyncio
async def test_inference_handles_unhandled_failure_gracefully(monkeypatch):
    """
    Verify that an unhandled crash or exception inside inference is caught
    and converted to a safe fallback prediction (controlled failure):
    disease='unknown', confidence=0, top3=[], heatmap_url=None.
    """
    dummy_image = b"corrupted-bytes"

    # Monkeypatch internal mock to raise an unexpected runtime error
    async def mock_crashing_inference(*args, **kwargs):
        raise RuntimeError("GPU Out of Memory or Tensor dimension mismatch!")

    import app.services.model_service as ms
    monkeypatch.setattr(ms, "_mock_inference", mock_crashing_inference)

    result = await predict_image(
        image_bytes=dummy_image,
        crop="chilli",
        mock_mode=True,
        mock_latency=0.01,
    )

    assert result.is_fallback is True
    assert "inference_error" in (result.fallback_reason or "")
    assert result.disease == "unknown"
    assert result.confidence == 0.0
    assert result.top3 == []
    assert result.heatmap_url is None
    assert result.affected_pct == 0.0
    assert result.crop == "chilli"
