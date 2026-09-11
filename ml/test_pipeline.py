"""
ml/test_pipeline.py  —  PattaPe / SIH26131 ML Automated Test Suite

Tests the existing ML pipeline without retraining.
All tests reuse real checkpoint (ml/checkpoints/best.pt) and real validation images.

Run:
    python ml/test_pipeline.py

Or with verbose output:
    python ml/test_pipeline.py -v
"""

import math
import sys
import unittest
from pathlib import Path

# Ensure ml/ is on sys.path
ML_DIR = Path(__file__).resolve().parent
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

from predict import (
    VALID_CROPS,
    DEFAULT_CHECKPOINT_PATH,
    DEFAULT_CLASSES_PATH,
    get_device,
    load_model,
    predict_image,
    get_crop_class_indices,
)
from gradcam import generate_gradcam, calculate_affected_percentage
import numpy as np

# ---------------------------------------------------------------------------
# Shared fixtures — loaded ONCE for the entire test session
# ---------------------------------------------------------------------------

DEVICE = get_device()

# Use real validation images that are guaranteed to exist
RICE_IMAGE = ML_DIR / "data" / "val" / "rice__blast" / "0000.jpg"
BANANA_IMAGE = ML_DIR / "data" / "val" / "banana__healthy" / "0000.jpg"


def _skip_if_no_checkpoint():
    """Return a skip decorator if the checkpoint doesn't exist."""
    return unittest.skipUnless(
        DEFAULT_CHECKPOINT_PATH.exists(),
        f"Checkpoint not found: {DEFAULT_CHECKPOINT_PATH}",
    )


def _skip_if_no_image(path: Path):
    return unittest.skipUnless(path.exists(), f"Val image not found: {path}")


# ---------------------------------------------------------------------------
# Load model ONCE — shared across all test cases
# ---------------------------------------------------------------------------
_model = None
_class_names = None


def _get_model():
    global _model, _class_names
    if _model is None:
        _model, _class_names = load_model(
            checkpoint_path=DEFAULT_CHECKPOINT_PATH,
            classes_path=DEFAULT_CLASSES_PATH,
            device=DEVICE,
        )
    return _model, _class_names


# ===========================================================================
# Test Suite 1 — Prediction Logic
# ===========================================================================

class TestPredictImage(unittest.TestCase):

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_valid_crop_prediction_returns_keys(self):
        """predict_image() returns all required keys."""
        model, class_names = _get_model()
        result = predict_image(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="rice",
        )
        required_keys = {"predicted_class", "crop", "disease", "confidence", "top_predictions"}
        self.assertTrue(required_keys.issubset(result.keys()), f"Missing keys: {required_keys - result.keys()}")

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_confidence_is_between_0_and_1(self):
        """Confidence score must be a finite float in [0.0, 1.0]."""
        model, class_names = _get_model()
        result = predict_image(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="rice",
        )
        conf = result["confidence"]
        self.assertIsInstance(conf, float)
        self.assertTrue(math.isfinite(conf), "Confidence must be finite")
        self.assertGreaterEqual(conf, 0.0)
        self.assertLessEqual(conf, 1.0)

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_crop_restriction_all_predictions_are_rice(self):
        """When crop='rice', every entry in top_predictions must start with 'rice__'."""
        model, class_names = _get_model()
        result = predict_image(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="rice",
        )
        for pred in result["top_predictions"]:
            self.assertTrue(
                pred["class"].startswith("rice__"),
                f"Got non-rice class in crop-restricted result: {pred['class']}",
            )

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(BANANA_IMAGE)
    def test_crop_restriction_all_predictions_are_banana(self):
        """When crop='banana', every entry in top_predictions must start with 'banana__'."""
        model, class_names = _get_model()
        result = predict_image(
            image_input=BANANA_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="banana",
        )
        for pred in result["top_predictions"]:
            self.assertTrue(
                pred["class"].startswith("banana__"),
                f"Got non-banana class in crop-restricted result: {pred['class']}",
            )

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_top3_are_sorted_descending(self):
        """Top predictions must be in descending order of confidence."""
        model, class_names = _get_model()
        result = predict_image(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="rice",
            top_k=3,
        )
        preds = result["top_predictions"]
        self.assertGreaterEqual(len(preds), 1)
        for i in range(len(preds) - 1):
            self.assertGreaterEqual(
                preds[i]["confidence"],
                preds[i + 1]["confidence"],
                f"Top predictions not sorted: {preds[i]['confidence']} < {preds[i+1]['confidence']}",
            )

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_deterministic_inference(self):
        """Two calls with the same input must return identical results."""
        model, class_names = _get_model()
        kwargs = dict(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="rice",
        )
        r1 = predict_image(**kwargs)
        r2 = predict_image(**kwargs)
        self.assertEqual(r1["predicted_class"], r2["predicted_class"])
        self.assertAlmostEqual(r1["confidence"], r2["confidence"], places=6)

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_returned_crop_matches_requested_crop(self):
        """When crop='rice' is requested, returned crop must be 'rice'."""
        model, class_names = _get_model()
        result = predict_image(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="rice",
        )
        self.assertEqual(result["crop"], "rice")

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_top_prediction_matches_best_class(self):
        """First entry of top_predictions must match predicted_class."""
        model, class_names = _get_model()
        result = predict_image(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="rice",
        )
        self.assertEqual(result["predicted_class"], result["top_predictions"][0]["class"])


# ===========================================================================
# Test Suite 2 — Invalid Input Handling
# ===========================================================================

class TestInvalidInputHandling(unittest.TestCase):

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_invalid_crop_raises_value_error(self):
        """An unknown crop name must raise ValueError."""
        model, class_names = _get_model()
        with self.assertRaises(ValueError):
            predict_image(
                image_input=RICE_IMAGE,
                model=model,
                class_names=class_names,
                device=DEVICE,
                crop="mango",  # not a valid crop
            )

    def test_missing_image_raises_file_not_found(self):
        """A non-existent image path must raise FileNotFoundError."""
        model, class_names = _get_model()
        with self.assertRaises(FileNotFoundError):
            predict_image(
                image_input="/nonexistent/path/leaf.jpg",
                model=model,
                class_names=class_names,
                device=DEVICE,
                crop="rice",
            )

    def test_get_crop_class_indices_invalid_crop(self):
        """get_crop_class_indices raises ValueError for unknown crops."""
        import json
        class_names = json.loads(DEFAULT_CLASSES_PATH.read_text())
        with self.assertRaises(ValueError):
            get_crop_class_indices("mango", class_names)

    def test_get_crop_class_indices_valid_crops(self):
        """get_crop_class_indices returns non-empty list for every valid crop."""
        import json
        class_names = json.loads(DEFAULT_CLASSES_PATH.read_text())
        for crop in VALID_CROPS:
            indices = get_crop_class_indices(crop, class_names)
            self.assertIsInstance(indices, list)
            self.assertGreater(len(indices), 0, f"No indices for crop: {crop}")


# ===========================================================================
# Test Suite 3 — Grad-CAM
# ===========================================================================

class TestGradCAM(unittest.TestCase):

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_gradcam_returns_required_keys(self):
        """generate_gradcam() returns all required output keys."""
        model, class_names = _get_model()

        pred = predict_image(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="rice",
        )
        target_idx = class_names.index(pred["predicted_class"])

        result = generate_gradcam(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            target_class_index=target_idx,
            predicted_confidence=pred["confidence"],
            device=DEVICE,
        )

        required = {"predicted_class", "crop", "disease", "confidence",
                    "target_class_index", "cam_mask", "overlay",
                    "leaf_mask", "affected_pct", "image_resized"}
        self.assertTrue(required.issubset(result.keys()), f"Missing keys: {required - result.keys()}")

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_gradcam_uses_exact_target_class(self):
        """generate_gradcam() must use the supplied target_class_index, not re-infer."""
        model, class_names = _get_model()

        pred = predict_image(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="rice",
        )
        target_idx = class_names.index(pred["predicted_class"])

        result = generate_gradcam(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            target_class_index=target_idx,
            predicted_confidence=pred["confidence"],
            device=DEVICE,
        )

        self.assertEqual(
            result["target_class_index"],
            target_idx,
            "Grad-CAM used a different class index than the one supplied.",
        )
        self.assertEqual(result["predicted_class"], pred["predicted_class"])

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_affected_pct_is_finite_and_bounded(self):
        """affected_pct must be a finite float in [0.0, 100.0]."""
        model, class_names = _get_model()

        pred = predict_image(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="rice",
        )
        target_idx = class_names.index(pred["predicted_class"])

        result = generate_gradcam(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            target_class_index=target_idx,
            predicted_confidence=pred["confidence"],
            device=DEVICE,
        )

        pct = result["affected_pct"]
        self.assertTrue(math.isfinite(pct), "affected_pct must be finite")
        self.assertGreaterEqual(pct, 0.0)
        self.assertLessEqual(pct, 100.0)

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_cam_mask_shape_and_range(self):
        """Grad-CAM mask must be (224, 224) with values in [0.0, 1.0]."""
        model, class_names = _get_model()
        pred = predict_image(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            device=DEVICE,
            crop="rice",
        )
        target_idx = class_names.index(pred["predicted_class"])
        result = generate_gradcam(
            image_input=RICE_IMAGE,
            model=model,
            class_names=class_names,
            target_class_index=target_idx,
            predicted_confidence=pred["confidence"],
            device=DEVICE,
        )
        cam = result["cam_mask"]
        self.assertEqual(cam.shape, (224, 224), f"Unexpected cam_mask shape: {cam.shape}")
        self.assertGreaterEqual(float(cam.min()), 0.0)
        self.assertLessEqual(float(cam.max()), 1.0 + 1e-6)


# ===========================================================================
# Test Suite 4 — affected_pct edge cases (pure unit tests, no model needed)
# ===========================================================================

class TestAffectedPctCalculation(unittest.TestCase):

    def test_zero_activation_gives_zero_pct(self):
        """A fully-zero CAM mask must give 0% affected."""
        cam = np.zeros((224, 224), dtype=np.float32)
        pct = calculate_affected_percentage(cam)
        self.assertAlmostEqual(pct, 0.0)

    def test_full_activation_gives_100_pct(self):
        """A fully-activated CAM mask must give 100% affected."""
        cam = np.ones((224, 224), dtype=np.float32)
        pct = calculate_affected_percentage(cam)
        self.assertAlmostEqual(pct, 100.0)

    def test_result_is_bounded(self):
        """affected_pct must always be in [0, 100] for random masks."""
        rng = np.random.default_rng(42)
        for _ in range(20):
            cam = rng.random((224, 224)).astype(np.float32)
            pct = calculate_affected_percentage(cam)
            self.assertGreaterEqual(pct, 0.0)
            self.assertLessEqual(pct, 100.0)

    def test_result_is_finite(self):
        """affected_pct must always be finite."""
        cam = np.random.rand(224, 224).astype(np.float32)
        pct = calculate_affected_percentage(cam)
        self.assertTrue(math.isfinite(pct))

    def test_empty_leaf_mask_fallback(self):
        """An all-False leaf mask must not cause division by zero."""
        cam = np.ones((224, 224), dtype=np.float32)
        leaf_mask = np.zeros((224, 224), dtype=bool)  # all background
        pct = calculate_affected_percentage(cam, leaf_mask=leaf_mask)
        self.assertTrue(math.isfinite(pct))
        self.assertGreaterEqual(pct, 0.0)
        self.assertLessEqual(pct, 100.0)


# ===========================================================================
# Test Suite 5 — infer.py handoff interface
# ===========================================================================

class TestInferInterface(unittest.TestCase):

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_run_ml_pipeline_returns_contract_keys(self):
        """run_ml_pipeline() must return all keys the backend expects."""
        # Import here to avoid loading the module at collection time if checkpoint missing
        from infer import run_ml_pipeline
        model, class_names = _get_model()

        result = run_ml_pipeline(
            image_input=RICE_IMAGE,
            crop="rice",
            model=model,
            class_names=class_names,
            device=DEVICE,
        )
        expected_keys = {"disease", "crop", "confidence", "top3", "affected_pct", "heatmap_path"}
        self.assertTrue(expected_keys.issubset(result.keys()), f"Missing keys: {expected_keys - result.keys()}")

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_run_ml_pipeline_top3_format(self):
        """top3 entries must each have 'disease' (str) and 'confidence' (float)."""
        from infer import run_ml_pipeline
        model, class_names = _get_model()

        result = run_ml_pipeline(
            image_input=RICE_IMAGE,
            crop="rice",
            model=model,
            class_names=class_names,
            device=DEVICE,
        )
        self.assertIsInstance(result["top3"], list)
        self.assertGreater(len(result["top3"]), 0)
        for entry in result["top3"]:
            self.assertIn("disease", entry)
            self.assertIn("confidence", entry)
            self.assertIsInstance(entry["disease"], str)
            self.assertIsInstance(entry["confidence"], float)

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_run_ml_pipeline_confidence_bounded(self):
        """run_ml_pipeline() confidence must be in [0.0, 1.0]."""
        from infer import run_ml_pipeline
        model, class_names = _get_model()

        result = run_ml_pipeline(
            image_input=RICE_IMAGE,
            crop="rice",
            model=model,
            class_names=class_names,
            device=DEVICE,
        )
        self.assertGreaterEqual(result["confidence"], 0.0)
        self.assertLessEqual(result["confidence"], 1.0)

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_run_ml_pipeline_affected_pct_bounded(self):
        """run_ml_pipeline() affected_pct must be in [0.0, 100.0]."""
        from infer import run_ml_pipeline
        model, class_names = _get_model()

        result = run_ml_pipeline(
            image_input=RICE_IMAGE,
            crop="rice",
            model=model,
            class_names=class_names,
            device=DEVICE,
        )
        self.assertGreaterEqual(result["affected_pct"], 0.0)
        self.assertLessEqual(result["affected_pct"], 100.0)

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_run_ml_pipeline_heatmap_saved(self):
        """run_ml_pipeline() must save a heatmap PNG and return its path."""
        import tempfile, os
        from infer import run_ml_pipeline
        model, class_names = _get_model()

        with tempfile.TemporaryDirectory() as tmpdir:
            result = run_ml_pipeline(
                image_input=RICE_IMAGE,
                crop="rice",
                model=model,
                class_names=class_names,
                device=DEVICE,
                heatmap_dir=tmpdir,
            )
            self.assertIsNotNone(result["heatmap_path"])
            self.assertTrue(
                Path(result["heatmap_path"]).exists(),
                f"Heatmap PNG was not created at: {result['heatmap_path']}",
            )

    @_skip_if_no_checkpoint()
    @_skip_if_no_image(RICE_IMAGE)
    def test_run_ml_pipeline_invalid_crop_raises(self):
        """run_ml_pipeline() must raise ValueError for unknown crop."""
        from infer import run_ml_pipeline
        model, class_names = _get_model()

        with self.assertRaises(ValueError):
            run_ml_pipeline(
                image_input=RICE_IMAGE,
                crop="mango",
                model=model,
                class_names=class_names,
                device=DEVICE,
            )


# ===========================================================================
# Entry point
# ===========================================================================

if __name__ == "__main__":
    unittest.main(verbosity=2)
