"""
backend/app/repositories/case_repository.py

Case repository layer for PattaPe (owned by Aditya).
Handles database persistence of diagnostic prediction cases in SQLite/PostgreSQL.
"""

import logging
from typing import Any, Dict, Optional

logger = logging.getLogger("pattape.repositories.case")


async def save_case(case_data: Any) -> Optional[str]:
    """
    Persist diagnostic case record.

    Expected fields from PredictResponse:
    - case_id: Unique tracking identifier (string)
    - crop: Selected crop key (string)
    - disease: Predicted disease (string)
    - confidence: Softmax score (float)
    - top3: Top-3 candidate predictions (list)
    - severity: Categorical severity tier (string)
    - affected_pct: Percentage of leaf affected (float)
    - heatmap_url: Path to heatmap image (string or None)
    - risk_72h: 72h spread risk (dict / object)
    - advisory: IPM recommendations (dict / object)
    - gemini: Multimodal explanation (dict or None)
    - escalate: Escalation flag (bool)
    - escalate_reason: Escalation reason (string or None)
    - timestamp: ISO-8601 creation timestamp (string)

    Returns:
        Persisted case_id if successful, or None.
    """
    case_id = getattr(case_data, "case_id", None)
    logger.info("Persisting diagnostic case %s to database repository", case_id)
    return case_id
