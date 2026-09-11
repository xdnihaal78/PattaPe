"""
backend/app/schemas.py

Pydantic schemas for the PattaPe API.
STATUS: 🔒 FROZEN — Strictly implements the contract in CONTRACT.md.
Key names, structures, and data types must not be modified.
"""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

# Valid crop identifiers supported by PattaPe
VALID_CROPS = {"rice", "chilli", "banana", "groundnut", "sugarcane"}
CropType = Literal["rice", "chilli", "banana", "groundnut", "sugarcane"]


class Top3Prediction(BaseModel):
    """Ranked candidate disease prediction."""
    disease: str = Field(..., description="Predicted disease class identifier (snake_case)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Softmax confidence score (0.0 - 1.0)")


class Risk72h(BaseModel):
    """72-hour disease spread risk assessment."""
    level: str = Field(..., description="Risk tier: 'low', 'moderate', 'high', or 'unknown'")
    reasons: List[str] = Field(default_factory=list, description="List of environmental/agronomic risk trigger tokens")


class Advisory(BaseModel):
    """IPM-aligned agronomic recommendations mapped from pathogen templates (T1-T8)."""
    what_it_is: str = Field(..., description="Plain-language description of disease or pest")
    do_now: List[str] = Field(default_factory=list, description="Immediate cultural and mechanical IPM actions")
    watch_for: List[str] = Field(default_factory=list, description="Symptoms and thresholds to monitor")
    avoid: List[str] = Field(default_factory=list, description="Harmful practices to avoid")
    source: str = Field(..., description="Authoritative citation source (e.g., TNAU / ICAR)")


class PredictResponse(BaseModel):
    """
    Definitive JSON response model for POST /predict.
    FROZEN CONTRACT: Matches Section 2 & 3 of CONTRACT.md exactly.
    """
    crop: str = Field(..., description="Target crop key selected by farmer")
    crop_label_i18n: Dict[str, str] = Field(..., description="Localized crop names (keyed by en, hi, ta)")
    disease: str = Field(..., description="Predicted disease class identifier (snake_case)")
    disease_label_i18n: Dict[str, str] = Field(..., description="Localized disease display names (keyed by en, hi, ta)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Softmax probability score of top predicted class")
    top3: List[Top3Prediction] = Field(..., description="Top 3 ranked candidate predictions")
    severity: str = Field(..., description="Severity tier derived from affected_pct: trace, mild, moderate, severe")
    affected_pct: float = Field(..., ge=0.0, le=100.0, description="Percentage of leaf area affected by lesions")
    heatmap_url: Optional[str] = Field(None, description="Relative or absolute URL to the Grad-CAM heatmap overlay image")
    risk_72h: Risk72h = Field(..., description="72-hour disease spread risk assessment")
    advisory: Advisory = Field(..., description="IPM-aligned agronomic recommendations")
    gemini: Optional[Dict[str, Any]] = Field(None, description="Multimodal Gemini explanation output or null")
    escalate: bool = Field(..., description="Whether this case must escalate to a human extension officer")
    escalate_reason: Optional[str] = Field(None, description="Deterministic rule identifier explaining escalation")
    case_id: str = Field(..., description="Unique tracking identifier for the diagnostic record")
    timestamp: str = Field(..., description="ISO 8601 timestamp with timezone offset")


class HealthResponse(BaseModel):
    """Health check response schema for GET /health."""
    status: str = Field("ok", description="Service health status")
    mock_mode: bool = Field(..., description="Whether mock ML inference mode is active")
    version: str = Field("1.0.0", description="Backend service version")
    timestamp: str = Field(..., description="ISO 8601 timestamp of health check")


class ErrorResponse(BaseModel):
    """Standardized error response body."""
    detail: str = Field(..., description="Human-readable error description")
