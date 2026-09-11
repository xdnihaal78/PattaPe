"""
backend/app/services/model_service.py

Model inference module for PattaPe.
Provides a unified interface for ML predictions with support for:
- Phase 1 Mock Mode (simulated ~1.5s latency, realistic predictions matching classes.json)
- Swappable Real ML Inference (Phase 4 integration without breaking caller signature)
- Controlled failure & timeout handling (safe fallback predictions instead of 500 errors)
"""

import asyncio
from dataclasses import asdict, dataclass, field
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

# Load environment variables if python-dotenv is available
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
except Exception:
    pass

logger = logging.getLogger("pattape.model_service")

# Configuration defaults
DEFAULT_MOCK_MODEL = os.getenv("MOCK_MODEL", "true").lower() in ("true", "1", "yes")
DEFAULT_MODEL_TIMEOUT = float(os.getenv("MODEL_TIMEOUT_SECONDS", "5.0"))
DEFAULT_MOCK_LATENCY = float(os.getenv("MOCK_LATENCY_SECONDS", "1.5"))

# Fallback constants per "controlled failure" principle
FALLBACK_DISEASE = "unknown"
FALLBACK_CONFIDENCE = 0.0
FALLBACK_AFFECTED_PCT = 0.0
FALLBACK_HEATMAP_URL = None


@dataclass
class ModelOutput:
    """
    Standardized output of the model inference service.
    Contains the 6 core ML-owned fields:
    - crop: Target crop key
    - disease: Predicted disease class identifier
    - confidence: Softmax probability score (0.0 - 1.0)
    - top3: List of top 3 ranked candidate predictions
    - affected_pct: Percentage of leaf area affected by lesions
    - heatmap_url: URL to Grad-CAM heatmap overlay or null
    """
    crop: str
    disease: str
    confidence: float
    top3: List[Dict[str, Any]] = field(default_factory=list)
    affected_pct: float = 0.0
    heatmap_url: Optional[str] = None
    is_fallback: bool = False
    fallback_reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Return dictionary of the 6 core ML-owned fields."""
        return {
            "crop": self.crop,
            "disease": self.disease,
            "confidence": self.confidence,
            "top3": self.top3,
            "affected_pct": self.affected_pct,
            "heatmap_url": self.heatmap_url,
        }


# Backward-compatible alias
PredictionResult = ModelOutput


# Realistic mock profiles per crop based on SIH26131 classes.json
MOCK_PROFILES: Dict[str, Dict[str, Any]] = {
    "rice": {
        "disease": "bacterial_leaf_blight",
        "confidence": 0.94,
        "top3": [
            {"disease": "bacterial_leaf_blight", "confidence": 0.94},
            {"disease": "bacterial_leaf_streak", "confidence": 0.04},
            {"disease": "brown_spot", "confidence": 0.01},
        ],
        "affected_pct": 26.0,
        "heatmap_url": "/static/heatmaps/demo_rice_blight.png",
    },
    "chilli": {
        "disease": "leafcurl",
        "confidence": 0.91,
        "top3": [
            {"disease": "leafcurl", "confidence": 0.91},
            {"disease": "leafspot", "confidence": 0.06},
            {"disease": "yellowish", "confidence": 0.02},
        ],
        "affected_pct": 18.5,
        "heatmap_url": "/static/heatmaps/demo_chilli_leafcurl.png",
    },
    "banana": {
        "disease": "sigatoka",
        "confidence": 0.89,
        "top3": [
            {"disease": "sigatoka", "confidence": 0.89},
            {"disease": "cordana", "confidence": 0.07},
            {"disease": "panama", "confidence": 0.03},
        ],
        "affected_pct": 32.0,
        "heatmap_url": "/static/heatmaps/demo_banana_sigatoka.png",
    },
    "groundnut": {
        "disease": "rust",
        "confidence": 0.95,
        "top3": [
            {"disease": "rust", "confidence": 0.95},
            {"disease": "early_leaf_spot", "confidence": 0.03},
            {"disease": "late_leaf_spot", "confidence": 0.01},
        ],
        "affected_pct": 22.0,
        "heatmap_url": "/static/heatmaps/demo_groundnut_rust.png",
    },
    "sugarcane": {
        "disease": "redrot",
        "confidence": 0.92,
        "top3": [
            {"disease": "redrot", "confidence": 0.92},
            {"disease": "rust", "confidence": 0.05},
            {"disease": "mosaic", "confidence": 0.02},
        ],
        "affected_pct": 28.0,
        "heatmap_url": "/static/heatmaps/demo_sugarcane_redrot.png",
    },
}


def _get_fallback_prediction(
    crop: str,
    reason: str,
) -> ModelOutput:
    """
    Construct safe fallback prediction when inference times out or fails.
    Returns:
    - disease = "unknown"
    - confidence = 0
    - top3 = []
    - heatmap_url = null
    - safe affected_pct = 0.0
    Routes gracefully to extension officer instead of causing an HTTP 500 error.
    """
    return ModelOutput(
        crop=crop,
        disease=FALLBACK_DISEASE,
        confidence=FALLBACK_CONFIDENCE,
        top3=[],
        affected_pct=FALLBACK_AFFECTED_PCT,
        heatmap_url=FALLBACK_HEATMAP_URL,
        is_fallback=True,
        fallback_reason=reason,
    )


async def _mock_inference(
    crop: str,
    latency: float = DEFAULT_MOCK_LATENCY,
) -> ModelOutput:
    """
    Simulate realistic model inference with configured latency.
    """
    if latency > 0:
        await asyncio.sleep(latency)

    norm_crop = crop.strip().lower() if crop else "rice"
    profile = MOCK_PROFILES.get(norm_crop, MOCK_PROFILES["rice"])

    return PredictionResult(
        crop=norm_crop,
        disease=profile["disease"],
        confidence=profile["confidence"],
        top3=profile["top3"],
        affected_pct=profile["affected_pct"],
        heatmap_url=profile["heatmap_url"],
        is_fallback=False,
    )


def _real_inference_sync(
    image_bytes: bytes,
    crop: Optional[str] = None,
) -> ModelOutput:
    """
    Phase 4 Real ML inference integration hook (EfficientNet-B0 + Grad-CAM).
    Invokes M1's trained EfficientNet-B0 and Grad-CAM when weights exist.
    """
    try:
        # Check if ml.predict and checkpoint are present
        from ml.predict import predict_image as ml_predict_image, DEFAULT_CHECKPOINT_PATH
        import io
        from PIL import Image

        if not Path(DEFAULT_CHECKPOINT_PATH).exists():
            raise FileNotFoundError(f"Model checkpoint not found at {DEFAULT_CHECKPOINT_PATH}")

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        res = ml_predict_image(image, crop=crop)

        # Grad-CAM heatmap generation if available
        heatmap_url = None
        affected_pct = 20.0  # default estimate
        try:
            from ml.gradcam import generate_heatmap_result
            cam_res = generate_heatmap_result(image, predicted_class=res["predicted_class"])
            heatmap_url = cam_res.get("heatmap_url", None)
            affected_pct = cam_res.get("affected_pct", 20.0)
        except Exception as cam_err:
            logger.warning("Grad-CAM generation skipped: %s", cam_err)

        top3 = [
            {"disease": p["disease"], "confidence": p["confidence"]}
            for p in res.get("top_predictions", [])[:3]
        ]

        return ModelOutput(
            crop=res.get("crop", crop or "rice"),
            disease=res.get("disease", "unknown"),
            confidence=float(res.get("confidence", 0.0)),
            top3=top3,
            affected_pct=float(affected_pct),
            heatmap_url=heatmap_url,
            is_fallback=False,
        )
    except Exception as exc:
        logger.error("Real ML inference encountered error: %s", exc)
        raise exc


async def predict_image(
    image_bytes: bytes,
    crop: Optional[str] = None,
    timeout_seconds: Optional[float] = None,
    mock_mode: Optional[bool] = None,
    mock_latency: Optional[float] = None,
) -> ModelOutput:
    """
    Clean entrypoint for ML inference on image bytes.

    Args:
        image_bytes: Raw binary leaf photo.
        crop: Selected crop key ('rice', 'chilli', 'banana', 'groundnut', 'sugarcane').
        timeout_seconds: Max seconds to wait before triggering fallback.
        mock_mode: Override environment MOCK_MODEL flag if specified.
        mock_latency: Override mock sleep duration (useful for unit testing).

    Returns:
        ModelOutput: Standardized prediction object with 6 ML fields:
        - crop, disease, confidence, top3, affected_pct, heatmap_url.
        Guaranteed not to raise unhandled exceptions — returns safe fallback on timeout/failure.
    """
    effective_crop = (crop or "rice").strip().lower()
    effective_timeout = timeout_seconds if timeout_seconds is not None else DEFAULT_MODEL_TIMEOUT
    effective_mock = mock_mode if mock_mode is not None else DEFAULT_MOCK_MODEL
    effective_latency = mock_latency if mock_latency is not None else DEFAULT_MOCK_LATENCY

    async def _execute_inference() -> ModelOutput:
        if effective_mock:
            return await _mock_inference(crop=effective_crop, latency=effective_latency)
        else:
            # Run CPU/GPU bound sync inference in threadpool executor
            loop = asyncio.get_running_loop()
            return await loop.run_in_executor(None, _real_inference_sync, image_bytes, effective_crop)

    try:
        result = await asyncio.wait_for(_execute_inference(), timeout=effective_timeout)
        return result
    except asyncio.TimeoutError:
        logger.warning(
            "Model inference timed out after %.2fs for crop '%s'. Returning safe fallback.",
            effective_timeout,
            effective_crop,
        )
        return _get_fallback_prediction(effective_crop, reason="inference_timeout")
    except Exception as exc:
        logger.error(
            "Model inference failed for crop '%s': %s. Returning safe fallback.",
            effective_crop,
            exc,
        )
        return _get_fallback_prediction(effective_crop, reason=f"inference_error: {str(exc)}")
