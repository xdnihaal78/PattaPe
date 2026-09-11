"""
ml/gemini_explainer.py

OPTIONAL second-opinion + explanation layer using Gemini 2.5 Flash-Lite.

The EfficientNet model (predict.py) remains the PRIMARY disease classifier.
Gemini NEVER overrides the EfficientNet prediction — it independently assesses the
image and reports whether it agrees or disagrees, providing a plain-language
explanation suitable for Indian farmers.

Usage:
    python ml/gemini_explainer.py <image_path>

Environment:
    GEMINI_API_KEY must be set (in environment or in a .env file at the project root).
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Union

from PIL import Image

# Ensure the ml directory is on sys.path for local imports
ML_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = ML_DIR.parent
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

# --------------------------------------------------------------------------
# Optional: Load .env file if python-dotenv is available
# --------------------------------------------------------------------------
try:
    from dotenv import load_dotenv as _load_dotenv

    _env_file = PROJECT_ROOT / ".env"
    if _env_file.exists():
        _load_dotenv(dotenv_path=_env_file, override=False)
except ImportError:
    pass  # python-dotenv not installed; rely on shell environment only

# --------------------------------------------------------------------------
# Google GenAI SDK
# --------------------------------------------------------------------------
try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    raise ImportError(
        "The google-genai package is required. "
        "Install it with: pip install google-genai"
    )

# --------------------------------------------------------------------------
# Reuse shared utilities from predict.py
# --------------------------------------------------------------------------
try:
    from predict import (
        DEFAULT_CHECKPOINT_PATH,
        DEFAULT_CLASSES_PATH,
        load_classes,
        load_model,
        predict_image,
    )
except ImportError:
    from ml.predict import (
        DEFAULT_CHECKPOINT_PATH,
        DEFAULT_CLASSES_PATH,
        load_classes,
        load_model,
        predict_image,
    )


# --------------------------------------------------------------------------
# Constants
# --------------------------------------------------------------------------
GEMINI_MODEL = "gemini-flash-lite-latest"  # Rolling alias → resolves to latest Flash Lite (currently gemini-2.5-flash-lite)
GEMINI_TEMPERATURE = 0.2

# Canonical crop-to-diseases mapping derived from classes.json
# (built dynamically at import time from classes.json)
_CLASSES_PATH = DEFAULT_CLASSES_PATH


def _build_crop_disease_map(classes_path: Union[str, Path] = _CLASSES_PATH) -> Dict[str, List[str]]:
    """Build a mapping of crop -> list of disease names from classes.json."""
    try:
        classes = load_classes(classes_path)
    except FileNotFoundError:
        return {}
    crop_map: Dict[str, List[str]] = {}
    for cls_name in classes:
        if "__" in cls_name:
            crop, disease = cls_name.split("__", 1)
            crop_map.setdefault(crop, []).append(disease)
    return crop_map


CROP_DISEASE_MAP = _build_crop_disease_map()


# --------------------------------------------------------------------------
# Gemini response schema
# --------------------------------------------------------------------------

def _build_response_schema() -> genai_types.Schema:
    """Define the strict JSON schema that Gemini must respond with."""
    return genai_types.Schema(
        type="OBJECT",
        required=[
            "gemini_assessment",
            "agreement",
            "assessment_confidence",
            "visual_evidence",
            "possible_causes",
            "farmer_explanation",
        ],
        properties={
            "gemini_assessment": genai_types.Schema(
                type="STRING",
                description=(
                    "The disease name Gemini independently assesses from the image. "
                    "Must be a valid disease name for the given crop (e.g., 'tungro', 'blast', "
                    "'healthy') or the literal string 'uncertain' if the image is ambiguous."
                ),
            ),
            "agreement": genai_types.Schema(
                type="BOOLEAN",
                description=(
                    "True if Gemini's visual assessment matches the ML-predicted disease. "
                    "False if they disagree. Must be a boolean."
                ),
            ),
            "assessment_confidence": genai_types.Schema(
                type="STRING",
                enum=["high", "medium", "low", "uncertain"],
                description="Gemini's confidence in its own visual assessment of the image.",
            ),
            "visual_evidence": genai_types.Schema(
                type="ARRAY",
                items=genai_types.Schema(type="STRING"),
                description=(
                    "List of 2-4 specific visual observations from the image that support "
                    "Gemini's assessment (e.g., 'yellow streaks on leaf blades', "
                    "'necrotic brown lesions with yellow halos'). "
                    "Be specific and factual. Do not invent observations."
                ),
            ),
            "possible_causes": genai_types.Schema(
                type="ARRAY",
                items=genai_types.Schema(type="STRING"),
                description=(
                    "List of 1-3 plausible high-level agronomic causes for the observed symptoms "
                    "(e.g., 'Viral infection spread by green leafhopper vector', "
                    "'Fungal infection favoured by high humidity'). "
                    "Do NOT prescribe pesticides or chemical treatments."
                ),
            ),
            "farmer_explanation": genai_types.Schema(
                type="STRING",
                description=(
                    "A simple, plain-language explanation (2-4 sentences) suitable for an "
                    "Indian farmer with limited formal education. Describe what is visually "
                    "wrong with the leaf and what it likely means for the crop. "
                    "Do not use technical jargon. Mention image ambiguity if appropriate."
                ),
            ),
            "disagreement_reason": genai_types.Schema(
                type="STRING",
                nullable=True,
                description=(
                    "If agreement is false, briefly explain what visual evidence leads "
                    "Gemini to a different assessment. Set to null if agreement is true."
                ),
            ),
        },
    )


# --------------------------------------------------------------------------
# Core Gemini analysis function
# --------------------------------------------------------------------------

def _get_api_key() -> str:
    """Retrieve the Gemini API key from the environment. Raises if missing."""
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise EnvironmentError(
            "GEMINI_API_KEY environment variable is not set. "
            "Set it in your shell or in a .env file at the project root."
        )
    return api_key


def _build_prompt(
    ml_result: Dict,
    affected_pct: float,
    valid_diseases: List[str],
) -> str:
    """Construct the structured Gemini prompt."""
    crop = ml_result.get("crop", "unknown")
    disease = ml_result.get("disease", "unknown")
    confidence = ml_result.get("confidence", 0.0)
    top_predictions = ml_result.get("top_predictions", [])

    top3_text = "\n".join(
        f"  {i + 1}. disease={p.get('disease', '?')}, confidence={p.get('confidence', 0):.3f}"
        for i, p in enumerate(top_predictions[:3])
    )

    valid_list = ", ".join(valid_diseases) if valid_diseases else "(no constraint)"

    prompt = f"""You are a visual crop-disease verification assistant for the PattaPe AI Crop Doctor system used by Indian farmers.

Independently inspect the supplied leaf image. Do NOT blindly agree with the machine-learning prediction below. Compare your own visual assessment against the supplied ML prediction and explain whether they agree. Treat the ML prediction as a hypothesis, not as ground truth.

--- ML MODEL PREDICTION (EfficientNet-B0) ---
Crop: {crop}
Top predicted disease: {disease}
Confidence: {confidence:.4f} ({confidence * 100:.2f}%)
Grad-CAM affected leaf area: {affected_pct:.2f}%

Top-3 candidate predictions:
{top3_text}

--- CONSTRAINTS ---
Valid disease names for this crop ({crop}): {valid_list}

Your gemini_assessment MUST be one of these valid disease names (exact match, snake_case) or the literal string "uncertain" if the image is too ambiguous to assess.
Do NOT invent a disease not in the list. Do NOT suggest chemical pesticides or treatment prescriptions.
If the image is blurry, low-quality, or shows a non-leaf subject, say so in farmer_explanation and return assessment_confidence = "uncertain".

--- YOUR TASK ---
1. Visually inspect the leaf image independently.
2. Identify specific symptoms you can see (lesion colour, shape, distribution, texture, etc.).
3. Form your own disease assessment based only on what you see.
4. Compare your assessment to the ML prediction above.
5. Set agreement = true only if your assessment matches the ML-predicted disease ("{disease}").
6. Fill in all fields of the JSON response according to the schema.
7. farmer_explanation must be simple and understandable to a rural Indian farmer with limited formal education.
"""
    return prompt


def analyze_with_gemini(
    image_input: Union[str, Path, Image.Image],
    ml_result: Dict,
    affected_pct: float,
    classes_path: Union[str, Path] = DEFAULT_CLASSES_PATH,
    api_key: Optional[str] = None,
) -> Dict:
    """
    Send the leaf image and EfficientNet prediction to Gemini 2.5 Flash-Lite
    for independent visual verification.

    This is a SUPPLEMENTARY layer only. The EfficientNet prediction must not
    be overridden or replaced by the Gemini response.

    Args:
        image_input:  File path (str/Path) or PIL Image instance.
        ml_result:    Dict returned by predict_image() from predict.py.
        affected_pct: Grad-CAM affected percentage (float, 0-100).
        classes_path: Path to classes.json for valid disease name constraints.
        api_key:      Optional explicit API key. Falls back to GEMINI_API_KEY env var.

    Returns:
        Dict with keys:
            gemini_assessment, agreement, assessment_confidence,
            visual_evidence, possible_causes, farmer_explanation,
            disagreement_reason
        On error, returns a dict with 'error' key and safe fallback values.
    """
    # Resolve API key
    if api_key is None:
        api_key = _get_api_key()

    # Load image bytes
    if isinstance(image_input, (str, Path)):
        img_path = Path(image_input)
        if not img_path.exists():
            raise FileNotFoundError(f"Image not found at: {img_path}")
        with open(img_path, "rb") as f:
            image_bytes = f.read()
        suffix = img_path.suffix.lower().lstrip(".")
        mime_type = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}.get(
            suffix, "image/jpeg"
        )
    elif isinstance(image_input, Image.Image):
        import io
        buf = io.BytesIO()
        fmt = image_input.format or "JPEG"
        image_input.save(buf, format=fmt)
        image_bytes = buf.getvalue()
        mime_type = "image/jpeg" if fmt.upper() in ("JPEG", "JPG") else "image/png"
    else:
        raise TypeError(f"Unsupported image_input type: {type(image_input)}")

    # Build valid disease list for this crop
    crop = ml_result.get("crop", "")
    valid_diseases = CROP_DISEASE_MAP.get(crop, [])
    if not valid_diseases and classes_path:
        crop_map = _build_crop_disease_map(classes_path)
        valid_diseases = crop_map.get(crop, [])

    # Build prompt and schema
    prompt_text = _build_prompt(ml_result, affected_pct, valid_diseases)
    response_schema = _build_response_schema()

    # Build content parts: image + prompt
    image_part = genai_types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    text_part = genai_types.Part.from_text(text=prompt_text)

    # Generate config with structured JSON output
    # automatic_function_calling disabled to suppress irrelevant SDK warnings
    config = genai_types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=response_schema,
        temperature=GEMINI_TEMPERATURE,
        automatic_function_calling=genai_types.AutomaticFunctionCallingConfig(disable=True),
    )

    # Create client and call Gemini
    client = genai.Client(api_key=api_key)

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[image_part, text_part],
            config=config,
        )

        raw_text = response.text
        if not raw_text:
            raise ValueError("Gemini returned an empty response.")

        gemini_data = json.loads(raw_text)

        # Validate gemini_assessment against allowed values
        assessment = gemini_data.get("gemini_assessment", "uncertain")
        if assessment != "uncertain" and assessment not in valid_diseases:
            # Best-effort: try case-insensitive match
            match = next(
                (d for d in valid_diseases if d.lower() == assessment.lower()),
                None,
            )
            if match:
                gemini_data["gemini_assessment"] = match
            else:
                # Force uncertain if Gemini invented a non-existent disease
                gemini_data["gemini_assessment"] = "uncertain"
                gemini_data["assessment_confidence"] = "uncertain"
                gemini_data["agreement"] = False
                if not gemini_data.get("disagreement_reason"):
                    gemini_data["disagreement_reason"] = (
                        f"Gemini returned an unrecognised disease name "
                        f"'{assessment}' not in the valid list for {crop}."
                    )

        # Enforce agreement logic
        ml_disease = ml_result.get("disease", "")
        gemini_disease = gemini_data.get("gemini_assessment", "uncertain")
        gemini_data["agreement"] = gemini_disease == ml_disease and gemini_disease != "uncertain"

        # Ensure disagreement_reason is null when agreement is true
        if gemini_data["agreement"] and gemini_data.get("disagreement_reason"):
            gemini_data["disagreement_reason"] = None

        return gemini_data

    except json.JSONDecodeError as e:
        return _error_response(
            f"Failed to parse Gemini JSON response: {e}",
            ml_result.get("disease", ""),
        )
    except Exception as e:
        return _error_response(str(e), ml_result.get("disease", ""))


def _error_response(error_msg: str, ml_disease: str) -> Dict:
    """Return a safe fallback dict when Gemini call fails."""
    return {
        "gemini_assessment": "uncertain",
        "agreement": False,
        "assessment_confidence": "uncertain",
        "visual_evidence": [],
        "possible_causes": [],
        "farmer_explanation": (
            "The AI visual verification service could not complete its analysis. "
            "Please rely on the machine learning prediction above."
        ),
        "disagreement_reason": None,
        "error": error_msg,
    }


# --------------------------------------------------------------------------
# Print helper
# --------------------------------------------------------------------------

def print_explainer_results(ml_result: Dict, gemini_result: Dict) -> None:
    """Format and print combined ML + Gemini results to console."""
    print("=" * 60)
    print("PattaPe - ML + Gemini Explainer")
    print("=" * 60)

    # ML section
    print("\n[EfficientNet-B0 Prediction]")
    print(f"  Predicted Class: {ml_result.get('predicted_class', '?')}")
    print(f"  Crop:            {ml_result.get('crop', '?')}")
    print(f"  Disease:         {ml_result.get('disease', '?')}")
    print(f"  Confidence:      {ml_result.get('confidence', 0) * 100:.2f}%")
    top3 = ml_result.get("top_predictions", [])
    if top3:
        print("  Top-3:")
        for i, p in enumerate(top3[:3], 1):
            print(f"    {i}. {p.get('disease', '?')} ({p.get('confidence', 0) * 100:.2f}%)")

    # Gemini section
    print("\n[Gemini 2.5 Flash-Lite Visual Assessment]")
    if "error" in gemini_result:
        print(f"  [!] Error: {gemini_result['error']}")
    else:
        agreement_icon = "[+]" if gemini_result.get("agreement") else "[-]"
        print(f"  Gemini Assessment:   {gemini_result.get('gemini_assessment', '?')}")
        print(f"  Agreement with ML:   {agreement_icon} {gemini_result.get('agreement')}")
        print(f"  Confidence:          {gemini_result.get('assessment_confidence', '?')}")

        visual = gemini_result.get("visual_evidence", [])
        if visual:
            print("  Visual Evidence:")
            for v in visual:
                print(f"    - {v}")

        causes = gemini_result.get("possible_causes", [])
        if causes:
            print("  Possible Causes:")
            for c in causes:
                print(f"    - {c}")

        print(f"\n  Farmer Explanation:")
        print(f"    {gemini_result.get('farmer_explanation', '')}")

        if not gemini_result.get("agreement") and gemini_result.get("disagreement_reason"):
            print(f"\n  Disagreement Reason:")
            print(f"    {gemini_result.get('disagreement_reason', '')}")

    print("\n" + "=" * 60)


# --------------------------------------------------------------------------
# CLI entry point
# --------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="PattaPe - Gemini 2.5 Flash-Lite visual verification layer"
    )
    parser.add_argument(
        "image_path",
        type=str,
        help="Path to crop leaf image file",
    )
    parser.add_argument(
        "--checkpoint",
        type=str,
        default=str(DEFAULT_CHECKPOINT_PATH),
        help="Path to EfficientNet checkpoint (default: ml/checkpoints/best.pt)",
    )
    parser.add_argument(
        "--classes",
        type=str,
        default=str(DEFAULT_CLASSES_PATH),
        help="Path to class mapping JSON (default: ml/classes.json)",
    )
    parser.add_argument(
        "--affected-pct",
        type=float,
        default=0.0,
        help="Grad-CAM affected leaf percentage (optional, for richer prompt)",
    )
    args = parser.parse_args()

    # --- Step 1: Run EfficientNet inference via predict.py ---
    ml_result = predict_image(
        image_input=args.image_path,
        checkpoint_path=args.checkpoint,
        classes_path=args.classes,
    )

    # --- Step 2: Run Gemini visual verification ---
    gemini_result = analyze_with_gemini(
        image_input=args.image_path,
        ml_result=ml_result,
        affected_pct=args.affected_pct,
        classes_path=args.classes,
    )

    # --- Step 3: Print combined results ---
    print_explainer_results(ml_result, gemini_result)


if __name__ == "__main__":
    main()
