"""
ml/infer.py  —  PattaPe / SIH26131 ML Handoff Interface

This is the single entry point for backend developers integrating the ML pipeline.
It wraps predict.py and gradcam.py into one clean function call.

Usage (import):
    from ml.infer import run_ml_pipeline, VALID_CROPS

Usage (CLI):
    python ml/infer.py <image_path> --crop rice

Output dict:
    {
        "disease":       str,         # e.g. "bacterial_leaf_blight"
        "crop":          str,         # e.g. "rice"
        "confidence":    float,       # 0.0–1.0
        "top3": [
            {"disease": str, "confidence": float},
            ...
        ],
        "affected_pct":  float,       # 0.0–100.0
        "heatmap_path":  str | None,  # absolute path to saved PNG, or None on failure
    }

The backend is responsible for everything outside this dict:
    severity, risk_72h, advisory, i18n, escalation, case_id, timestamp, gemini.
"""

import argparse
import json
from pathlib import Path
import sys
from typing import Dict, List, Optional, Union

from PIL import Image

# ---------------------------------------------------------------------------
# Ensure ml/ is on sys.path regardless of how this module is invoked
# ---------------------------------------------------------------------------
ML_DIR = Path(__file__).resolve().parent
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

try:
    from predict import (
        VALID_CROPS,
        DEFAULT_CHECKPOINT_PATH,
        DEFAULT_CLASSES_PATH,
        get_device,
        load_model,
        predict_image,
    )
    from gradcam import (
        DEFAULT_HEATMAP_DIR,
        generate_gradcam,
        save_heatmap,
    )
except ImportError:
    from ml.predict import (
        VALID_CROPS,
        DEFAULT_CHECKPOINT_PATH,
        DEFAULT_CLASSES_PATH,
        get_device,
        load_model,
        predict_image,
    )
    from ml.gradcam import (
        DEFAULT_HEATMAP_DIR,
        generate_gradcam,
        save_heatmap,
    )


def run_ml_pipeline(
    image_input: Union[str, Path, "Image.Image"],
    crop: str,
    checkpoint_path: Union[str, Path] = DEFAULT_CHECKPOINT_PATH,
    classes_path: Union[str, Path] = DEFAULT_CLASSES_PATH,
    heatmap_dir: Union[str, Path] = DEFAULT_HEATMAP_DIR,
    heatmap_path: Optional[Union[str, Path]] = None,
    top_k: int = 3,
    model=None,
    class_names: Optional[List[str]] = None,
    device=None,
) -> Dict:
    """
    Run the full PattaPe ML pipeline: crop-aware disease prediction + Grad-CAM.

    This is the ONLY function the backend needs to call.
    No severity, risk, advisory, or escalation logic is computed here.

    Args:
        image_input:      File path (str/Path) or PIL Image.
        crop:             Farmer-selected crop. Must be one of VALID_CROPS:
                          'rice', 'banana', 'chilli', 'groundnut', 'sugarcane'.
        checkpoint_path:  Path to ml/checkpoints/best.pt.
        classes_path:     Path to ml/classes.json.
        heatmap_dir:      Directory where the heatmap PNG is saved.
        heatmap_path:     Optional full path for the heatmap file (overrides heatmap_dir).
        top_k:            Number of top predictions to return (default: 3).
        model:            Optional pre-loaded model (for efficiency in API servers —
                          load once at startup with load_model(), pass here on every call).
        class_names:      Optional pre-loaded class names list (paired with model arg).
        device:           Optional torch.device. Auto-detected if None.

    Returns:
        Dict with keys:
            "disease":      str   — predicted disease name (snake_case, e.g. "blast")
            "crop":         str   — the supplied crop name
            "confidence":   float — softmax probability of top class (0.0–1.0)
            "top3":         list  — up to top_k entries, each {"disease": str, "confidence": float}
            "affected_pct": float — percentage of leaf area covered by Grad-CAM activation (0.0–100.0)
            "heatmap_path": str | None — absolute path to the saved heatmap PNG, or None on failure

    Raises:
        ValueError:        If crop is not in VALID_CROPS.
        FileNotFoundError: If the image or checkpoint path does not exist.
        TypeError:         If image_input is an unsupported type.
    """
    if device is None:
        device = get_device()

    # Load model once if not passed in (callers should pass pre-loaded model in prod)
    if model is None or class_names is None:
        model, class_names = load_model(
            checkpoint_path=checkpoint_path,
            classes_path=classes_path,
            device=device,
        )

    # 1. Crop-aware prediction
    pred = predict_image(
        image_input=image_input,
        model=model,
        class_names=class_names,
        device=device,
        top_k=top_k,
        crop=crop,
        checkpoint_path=checkpoint_path,
        classes_path=classes_path,
    )

    # 2. Resolve the predicted class index for Grad-CAM
    predicted_class_name = pred["predicted_class"]
    target_idx = class_names.index(predicted_class_name)

    # 3. Grad-CAM
    heatmap_path_result: Optional[str] = None
    affected_pct: float = 0.0
    try:
        gradcam_result = generate_gradcam(
            image_input=image_input,
            model=model,
            class_names=class_names,
            target_class_index=target_idx,
            predicted_confidence=pred["confidence"],
            device=device,
            checkpoint_path=checkpoint_path,
            classes_path=classes_path,
        )
        affected_pct = gradcam_result["affected_pct"]
        saved = save_heatmap(
            result=gradcam_result,
            output_path=heatmap_path,
            output_dir=heatmap_dir,
        )
        heatmap_path_result = str(saved)
    except Exception:
        # Grad-CAM failure is non-fatal — affected_pct stays 0.0, heatmap_path stays None
        pass

    # 4. Build the contract-compatible output
    top3 = [
        {"disease": p["disease"], "confidence": p["confidence"]}
        for p in pred["top_predictions"][:top_k]
    ]

    return {
        "disease": pred["disease"],
        "crop": pred["crop"],
        "confidence": pred["confidence"],
        "top3": top3,
        "affected_pct": affected_pct,
        "heatmap_path": heatmap_path_result,
    }


# ---------------------------------------------------------------------------
# CLI entry point (for quick testing and demo)
# ---------------------------------------------------------------------------

def _main():
    parser = argparse.ArgumentParser(
        description="PattaPe ML Pipeline — crop-aware inference + Grad-CAM"
    )
    parser.add_argument("image_path", type=str, help="Path to leaf image")
    parser.add_argument(
        "--crop",
        type=str,
        required=True,
        help=f"Farmer-selected crop. Valid: {', '.join(sorted(VALID_CROPS))}",
    )
    parser.add_argument("--checkpoint", type=str, default=str(DEFAULT_CHECKPOINT_PATH))
    parser.add_argument("--classes", type=str, default=str(DEFAULT_CLASSES_PATH))
    parser.add_argument("--heatmap-dir", type=str, default=str(DEFAULT_HEATMAP_DIR))
    args = parser.parse_args()

    result = run_ml_pipeline(
        image_input=args.image_path,
        crop=args.crop,
        checkpoint_path=args.checkpoint,
        classes_path=args.classes,
        heatmap_dir=args.heatmap_dir,
    )

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    _main()
