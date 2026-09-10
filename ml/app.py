"""
ml/app.py

PattaPe / SIH26131 — AI Crop Doctor for Indian Farmers
Interactive Streamlit Demo Application for EfficientNet-B0 + Grad-CAM + Gemini 2.5 Flash-Lite.

Usage:
    streamlit run ml/app.py
"""

import os
from pathlib import Path
import sys
import tempfile
from typing import Dict, List, Optional, Tuple

from PIL import Image
import torch

# Ensure the ml directory and project root are on sys.path
ML_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = ML_DIR.parent
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Load .env file if available
try:
    from dotenv import load_dotenv
    _env_path = PROJECT_ROOT / ".env"
    if _env_path.exists():
        load_dotenv(dotenv_path=_env_path, override=False)
except ImportError:
    pass

# Import ML pipeline modules
try:
    from predict import (
        DEFAULT_CHECKPOINT_PATH,
        DEFAULT_CLASSES_PATH,
        get_device,
        load_classes,
        load_model,
        parse_class_name,
        predict_image,
    )
    from gradcam import generate_gradcam
    from gemini_explainer import analyze_with_gemini
except ImportError:
    from ml.predict import (
        DEFAULT_CHECKPOINT_PATH,
        DEFAULT_CLASSES_PATH,
        get_device,
        load_classes,
        load_model,
        parse_class_name,
        predict_image,
    )
    from ml.gradcam import generate_gradcam
    from ml.gemini_explainer import analyze_with_gemini

# Streamlit import
import streamlit as st

# ============================================================
# CROP MAPPING CONFIGURATION
# ============================================================

CROP_OPTIONS = {
    "Rice": "rice",
    "Chilli": "chilli",
    "Banana": "banana",
    "Groundnut": "groundnut",
    "Sugarcane": "sugarcane",
}


def get_severity(affected_pct: float) -> Tuple[str, str]:
    """
    Derive disease severity level based on affected leaf area percentage:
      0–5%   → Trace
      6–15%  → Mild
      16–35% → Moderate
      36%+   → Severe

    Returns:
        Tuple of (Severity label, Hex color code)
    """
    if affected_pct <= 5.0:
        return "Trace", "#2e7d32"  # Forest Green
    elif affected_pct <= 15.0:
        return "Mild", "#f9a825"   # Warm Amber
    elif affected_pct <= 35.0:
        return "Moderate", "#e65100" # Burnt Orange
    else:
        return "Severe", "#c62828"   # Crimson Red


@st.cache_resource(show_spinner="Loading EfficientNet-B0 checkpoint...")
def get_cached_model(checkpoint_path: Path, classes_path: Path):
    """Load and cache the model and classes once across sessions."""
    device = get_device()
    model, class_names = load_model(
        checkpoint_path=checkpoint_path,
        classes_path=classes_path,
        device=device,
    )
    return model, class_names, device


def format_disease_name(raw_name: str) -> str:
    """Format snake_case disease name into human-readable Title Case."""
    if not raw_name:
        return "Unknown"
    return raw_name.replace("_", " ").title()


# ============================================================
# MAIN STREAMLIT APP
# ============================================================

def main():
    st.set_page_config(
        page_title="PattaPe — AI Crop Doctor",
        page_icon="🌿",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    # Custom CSS for clean, professional hackathon demo styling
    st.markdown(
        """
        <style>
        .main-header {
            font-size: 2.3rem;
            font-weight: 800;
            color: #1b5e20;
            margin-bottom: 0.1rem;
        }
        .sub-header {
            font-size: 1.15rem;
            color: #455a64;
            margin-bottom: 1.5rem;
            font-weight: 500;
        }
        .metric-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 1rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .agreement-badge-pass {
            background-color: #e8f5e9;
            color: #1b5e20;
            padding: 6px 14px;
            border-radius: 20px;
            font-weight: 700;
            display: inline-block;
            border: 1px solid #a5d6a7;
        }
        .agreement-badge-warn {
            background-color: #fff3e0;
            color: #e65100;
            padding: 6px 14px;
            border-radius: 20px;
            font-weight: 700;
            display: inline-block;
            border: 1px solid #ffcc80;
        }
        .advisory-box {
            background-color: #f1f8e9;
            border-left: 5px solid #7cb342;
            padding: 1rem 1.2rem;
            border-radius: 6px;
            margin-top: 1rem;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )

    # --------------------------------------------------------
    # Header Section
    # --------------------------------------------------------
    st.markdown('<div class="main-header">🌿 PattaPe</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">AI Crop Doctor for Indian Farmers &nbsp;|&nbsp; <b>SIH26131</b></div>',
        unsafe_allow_html=True,
    )

    # --------------------------------------------------------
    # Sidebar: Model Info & Settings
    # --------------------------------------------------------
    with st.sidebar:
        st.header("Pipeline Status")
        device = get_device()
        device_label = "CUDA (GPU Acceleration)" if device.type == "cuda" else "CPU (Standard)"
        st.info(f"**Inference Device:** {device_label}")

        has_ckpt = DEFAULT_CHECKPOINT_PATH.exists()
        if has_ckpt:
            st.success("✓ **Checkpoint:** `best.pt` (Loaded)")
        else:
            st.error("✗ **Checkpoint:** Not Found")

        has_gemini = bool(os.environ.get("GEMINI_API_KEY", "").strip())
        if has_gemini:
            st.success("✓ **Gemini 2.5 Flash-Lite:** Active")
        else:
            st.warning("⚠️ **Gemini Cross-Check:** Key Not Detected")
            st.caption("Set `GEMINI_API_KEY` in `.env` to enable Gemini verification.")

        st.markdown("---")
        st.markdown("### About PattaPe")
        st.caption(
            "PattaPe provides instant, explainable disease diagnosis for smallholder "
            "farmers across India using localized EfficientNet-B0 vision, Grad-CAM visual heatmaps, "
            "and multi-modal Gemini second-opinion verification."
        )

    # Verify checkpoint exists
    if not has_ckpt:
        st.error(
            f"Checkpoint file not found at `{DEFAULT_CHECKPOINT_PATH}`. "
            "Please ensure the trained model is placed in `ml/checkpoints/best.pt`."
        )
        return

    # Pre-load model
    try:
        model, class_names, device = get_cached_model(
            DEFAULT_CHECKPOINT_PATH,
            DEFAULT_CLASSES_PATH,
        )
    except Exception as e:
        st.error(f"Failed to load model architecture: {e}")
        return

    # --------------------------------------------------------
    # Step 1 & 2: Crop Selector & Image Upload
    # --------------------------------------------------------
    col_input1, col_input2 = st.columns([1, 2])

    with col_input1:
        st.markdown("### 1. Select Crop")
        selected_crop_display = st.selectbox(
            "Crop species:",
            options=list(CROP_OPTIONS.keys()),
            index=0,
            help="Select the crop type. Inference will be restricted to this crop's disease classes.",
        )
        selected_crop_code = CROP_OPTIONS[selected_crop_display]

        # Optional Demo Image Loader for convenient hackathon judges demonstration
        st.markdown("---")
        st.markdown("##### Quick Demo Sample")
        demo_sample_path = ML_DIR / "data" / "val" / "rice__blast" / "0000.jpg"
        use_sample = st.checkbox(
            "Load sample image (Rice Blast)",
            value=False,
            help="Use pre-packaged validation leaf sample for testing.",
        )

    uploaded_image: Optional[Image.Image] = None

    with col_input2:
        st.markdown("### 2. Upload Leaf Image")
        uploaded_file = st.file_uploader(
            "Choose a crop leaf photograph:",
            type=["jpg", "jpeg", "png"],
            help="Upload clear JPG, JPEG, or PNG photograph of the infected or healthy leaf.",
        )

        if uploaded_file is not None:
            try:
                uploaded_image = Image.open(uploaded_file).convert("RGB")
            except Exception as e:
                st.error(f"Invalid image file: {e}")
        elif use_sample and demo_sample_path.exists():
            try:
                uploaded_image = Image.open(demo_sample_path).convert("RGB")
                st.caption(f"Loaded validation sample: `{demo_sample_path.name}`")
            except Exception as e:
                st.error(f"Failed to load sample image: {e}")

        if uploaded_image is not None:
            st.image(uploaded_image, caption="Uploaded Leaf Photograph", width=320)

    # --------------------------------------------------------
    # Step 3: Analyze Button
    # --------------------------------------------------------
    st.markdown("---")
    analyze_clicked = st.button("🔍 Analyze Leaf", type="primary", use_container_width=True)

    if analyze_clicked:
        if uploaded_image is None:
            st.warning("⚠️ Please upload a leaf image (or select the sample image) before analyzing.")
            return

        with st.spinner("Diagnosing leaf with EfficientNet-B0 and generating Grad-CAM localization..."):
            # 1. Run ML Prediction (crop-aware: logits for other crops masked to -inf before softmax)
            try:
                pred_result = predict_image(
                    image_input=uploaded_image,
                    model=model,
                    class_names=class_names,
                    device=device,
                    top_k=3,
                    crop=selected_crop_code,
                )
            except Exception as e:
                st.error(f"Prediction inference failed: {e}")
                return

            # 2. Resolve original 36-class index for the predicted class.
            #    This index is what EfficientNet uses internally and what Grad-CAM must target.
            predicted_class_name = pred_result["predicted_class"]
            try:
                target_idx = class_names.index(predicted_class_name)
            except ValueError:
                st.error(
                    f"Predicted class '{predicted_class_name}' not found in class_names. "
                    "Cannot generate Grad-CAM."
                )
                return

            # 3. Run Grad-CAM, targeting the exact crop-aware predicted class.
            #    No second inference pass is performed inside generate_gradcam().
            try:
                gradcam_result = generate_gradcam(
                    image_input=uploaded_image,
                    model=model,
                    class_names=class_names,
                    target_class_index=target_idx,
                    predicted_confidence=pred_result["confidence"],
                    device=device,
                )
            except Exception as e:
                st.warning(f"Grad-CAM computation encountered an issue: {e}")
                gradcam_result = None

        # 3. Compute Severity
        affected_pct = gradcam_result.get("affected_pct", 0.0) if gradcam_result else 0.0
        severity_label, severity_color = get_severity(affected_pct)

        # ----------------------------------------------------
        # Display: AI Diagnosis Metrics
        # ----------------------------------------------------
        st.markdown("## AI Diagnosis")

        pred_crop = pred_result["crop"].capitalize()
        pred_disease = format_disease_name(pred_result["disease"])
        pred_conf = pred_result["confidence"] * 100.0

        mcol1, mcol2, mcol3, mcol4 = st.columns(4)
        with mcol1:
            st.metric(label="Predicted Crop", value=pred_crop)
        with mcol2:
            st.metric(label="Disease Diagnosis", value=pred_disease)
        with mcol3:
            st.metric(label="Model Confidence", value=f"{pred_conf:.2f}%")
        with mcol4:
            st.metric(label="Severity Level", value=severity_label.upper(), delta=f"{affected_pct:.1f}% affected", delta_color="inverse")

        # ----------------------------------------------------
        # Display: Grad-CAM Activation Visualizer
        # ----------------------------------------------------
        st.markdown("---")
        st.markdown("### Visual Localization & Heatmap")

        if gradcam_result is not None:
            gcol1, gcol2 = st.columns(2)
            with gcol1:
                st.image(
                    gradcam_result["image_resized"],
                    caption="Standardized Preprocessed Leaf (224x224)",
                    use_container_width=True,
                )
            with gcol2:
                st.image(
                    gradcam_result["overlay"],
                    caption="Grad-CAM Lesion Activation Overlay",
                    use_container_width=True,
                )

            st.info(
                f"📊 **AI-estimated affected leaf area: `{affected_pct:.2f}%`** &nbsp;|&nbsp; "
                f"**Assessed Severity: `{severity_label.upper()}`**\n\n"
                "*Note: The affected percentage is an AI-estimated visual activation area indicating lesion localization, "
                "not an exact ground-truth laboratory measure.*"
            )
        else:
            st.info("Grad-CAM visualization was bypassed due to a runtime warning.")

        # ----------------------------------------------------
        # Display: Top-3 Candidate Predictions
        # ----------------------------------------------------
        st.markdown("---")
        st.markdown("### Top-3 Model Candidates")

        top_preds = pred_result.get("top_predictions", [])
        for rank, p in enumerate(top_preds, start=1):
            cand_crop = p.get("crop", "").capitalize()
            cand_disease = format_disease_name(p.get("disease", ""))
            cand_conf = p.get("confidence", 0.0) * 100.0

            pcol1, pcol2 = st.columns([1, 4])
            with pcol1:
                st.write(f"**{rank}. {cand_disease}** ({cand_crop})")
            with pcol2:
                st.progress(min(max(cand_conf / 100.0, 0.0), 1.0), text=f"{cand_conf:.2f}%")

        # ----------------------------------------------------
        # Step 5: Gemini Verification Layer (Optional Second Opinion)
        # ----------------------------------------------------
        st.markdown("---")
        st.markdown("### 🤖 AI Cross-Check (Gemini Verification)")

        gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()

        if not gemini_key:
            st.info(
                "ℹ️ **Gemini 2.5 Flash-Lite cross-check skipped:** No `GEMINI_API_KEY` was found in `.env` or system environment. "
                "Primary EfficientNet-B0 diagnosis remains active and unaffected."
            )
        else:
            with st.spinner("Consulting Gemini 2.5 Flash-Lite for independent visual cross-check..."):
                try:
                    gemini_result = analyze_with_gemini(
                        image_input=uploaded_image,
                        ml_result=pred_result,
                        affected_pct=affected_pct,
                        classes_path=DEFAULT_CLASSES_PATH,
                    )
                except Exception as e:
                    gemini_result = {
                        "error": str(e),
                        "farmer_explanation": "Gemini cross-check encountered a temporary connectivity issue.",
                    }

            if "error" in gemini_result and gemini_result.get("agreement") is None:
                st.warning(
                    f"⚠️ **Gemini Cross-Check Notice:** Could not complete external verification ({gemini_result['error']}). "
                    "EfficientNet-B0 prediction remains your primary valid diagnosis."
                )
            else:
                agreement = gemini_result.get("agreement", False)
                gemini_disease_raw = gemini_result.get("gemini_assessment", "uncertain")
                gemini_disease = format_disease_name(gemini_disease_raw)
                gemini_conf = gemini_result.get("assessment_confidence", "uncertain").capitalize()

                # Agreement banner
                if agreement:
                    st.markdown(
                        '<div class="agreement-badge-pass">✓ AI models agree on diagnosis</div>',
                        unsafe_allow_html=True,
                    )
                else:
                    st.markdown(
                        '<div class="agreement-badge-warn">⚠️ AI models disagree — Review suggested</div>',
                        unsafe_allow_html=True,
                    )

                st.write("")
                g_meta1, g_meta2, g_meta3 = st.columns(3)
                with g_meta1:
                    st.write(f"**Gemini Assessment:** {gemini_disease}")
                with g_meta2:
                    st.write(f"**Gemini Confidence:** {gemini_conf}")
                with g_meta3:
                    st.write(f"**EfficientNet Diagnosis:** {pred_disease}")

                # Farmer-friendly explanation
                st.markdown("##### Farmer Explanation:")
                farmer_exp = gemini_result.get("farmer_explanation", "No explanation provided.")
                st.write(f"> *\"{farmer_exp}\"*")

                # Visual evidence & causes in columns
                ev_col1, ev_col2 = st.columns(2)
                with ev_col1:
                    st.markdown("##### 🔍 Visual Evidence Observed:")
                    evidence_list = gemini_result.get("visual_evidence", [])
                    if evidence_list:
                        for ev in evidence_list:
                            st.markdown(f"- {ev}")
                    else:
                        st.caption("No specific observations listed.")

                with ev_col2:
                    st.markdown("##### 🔬 Probable Agronomic Causes:")
                    causes_list = gemini_result.get("possible_causes", [])
                    if causes_list:
                        for cause in causes_list:
                            st.markdown(f"- {cause}")
                    else:
                        st.caption("No causes listed.")

                if not agreement and gemini_result.get("disagreement_reason"):
                    st.markdown(f"**Disagreement Context:** {gemini_result['disagreement_reason']}")

        # ----------------------------------------------------
        # Step 6: Advisory Placeholder
        # ----------------------------------------------------
        st.markdown("---")
        st.markdown("### 💡 Advisory")
        st.markdown(
            """
            <div class="advisory-box">
                <b>Integrated Pest Management (IPM) Advisory:</b><br>
                <em>"Advisory module will provide crop- and disease-specific IPM guidance."</em><br><br>
                <small>⚠️ <b>Safety Notice:</b> Chemical pesticide prescriptions and dosage instructions are intentionally withheld 
                pending state agricultural university agronomic validation.</small>
            </div>
            """,
            unsafe_allow_html=True,
        )


if __name__ == "__main__":
    main()
