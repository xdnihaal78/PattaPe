import argparse
import json
from pathlib import Path
import sys
from typing import Dict, List, Optional, Tuple, Union

import cv2
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms

# Grad-CAM dependencies
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image

# Ensure the ml directory is on sys.path for local imports
ML_DIR = Path(__file__).resolve().parent
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

# Reuse shared utilities from predict.py
try:
    from predict import (
        DEFAULT_CHECKPOINT_PATH,
        DEFAULT_CLASSES_PATH,
        IMAGE_SIZE,
        IMAGENET_MEAN,
        IMAGENET_STD,
        get_device,
        get_transform,
        load_classes,
        load_model,
        parse_class_name,
    )
except ImportError:
    from ml.predict import (
        DEFAULT_CHECKPOINT_PATH,
        DEFAULT_CLASSES_PATH,
        IMAGE_SIZE,
        IMAGENET_MEAN,
        IMAGENET_STD,
        get_device,
        get_transform,
        load_classes,
        load_model,
        parse_class_name,
    )

DEFAULT_HEATMAP_DIR = ML_DIR / "heatmaps"
DEFAULT_GRADCAM_THRESHOLD = 0.5


def get_target_layer(model: torch.nn.Module) -> torch.nn.Module:
    """
    Determine the final convolutional feature layer for timm EfficientNet-B0.
    In timm EfficientNet-B0, conv_head is the 1x1 conv mapping 320 to 1280 channels
    directly before global pooling and classifier.
    """
    if hasattr(model, "conv_head") and isinstance(model.conv_head, torch.nn.Module):
        return model.conv_head
    elif hasattr(model, "bn2") and isinstance(model.bn2, torch.nn.Module):
        return model.bn2
    elif hasattr(model, "blocks") and len(model.blocks) > 0:
        return model.blocks[-1]
    raise AttributeError("Unable to identify the final convolutional layer of the model.")


def extract_leaf_mask(image_np: np.ndarray) -> np.ndarray:
    """
    Extract a binary leaf-pixel mask using color and luminance thresholding.
    Distinguishes leaf pixels from plain studio/lab backgrounds:
    - Neutral/bright white backgrounds (high value, low saturation)
    - Extreme pure dark/shadow backgrounds (very low value)

    Args:
        image_np: RGB numpy array of shape (H, W, 3) with values in [0, 255].

    Returns:
        Boolean numpy array of shape (H, W) where True represents leaf pixels.
    """
    hsv = cv2.cvtColor(image_np, cv2.COLOR_RGB2HSV)
    s = hsv[:, :, 1]
    v = hsv[:, :, 2]

    # Neutral/bright background: value > 200 and low saturation < 45
    # Pure dark background: value < 25
    bg_mask = ((v > 200) & (s < 45)) | (v < 25)
    leaf_mask = ~bg_mask

    # Graceful fallback if image has non-standard background or everything is masked
    if leaf_mask.sum() == 0:
        leaf_mask = np.ones((image_np.shape[0], image_np.shape[1]), dtype=bool)

    return leaf_mask


def calculate_affected_percentage(
    cam_mask: np.ndarray,
    leaf_mask: Optional[np.ndarray] = None,
    threshold: float = DEFAULT_GRADCAM_THRESHOLD,
) -> float:
    """
    Calculate the percentage of leaf area covered by Grad-CAM activation.

    Formula:
        (cam_mask > threshold).sum() / leaf_pixels * 100

    Args:
        cam_mask: 2D numpy array [0.0, 1.0] of Grad-CAM activations.
        leaf_mask: Optional boolean 2D numpy array indicating leaf pixels.
        threshold: Activation cutoff (default: 0.5).

    Returns:
        Affected percentage as a rounded float (0.0 to 100.0).
    """
    if leaf_mask is None:
        leaf_mask = np.ones_like(cam_mask, dtype=bool)
    else:
        leaf_mask = leaf_mask.astype(bool)

    leaf_pixels = int(np.count_nonzero(leaf_mask))
    if leaf_pixels == 0:
        leaf_pixels = cam_mask.size
        leaf_mask = np.ones_like(cam_mask, dtype=bool)

    active_mask = (cam_mask > threshold) & leaf_mask
    affected_pixels = int(np.count_nonzero(active_mask))

    affected_pct = (affected_pixels / leaf_pixels) * 100.0
    return float(round(affected_pct, 2))


def generate_gradcam(
    image_input: Union[str, Path, Image.Image],
    model: Optional[torch.nn.Module] = None,
    class_names: Optional[List[str]] = None,
    target_class_index: Optional[int] = None,
    checkpoint_path: Union[str, Path] = DEFAULT_CHECKPOINT_PATH,
    classes_path: Optional[Union[str, Path]] = DEFAULT_CLASSES_PATH,
    device: Optional[torch.device] = None,
    threshold: float = DEFAULT_GRADCAM_THRESHOLD,
) -> Dict:
    """
    Generate Grad-CAM heatmap visualization and compute affected leaf percentage.

    Args:
        image_input: File path (str/Path) or PIL Image instance.
        model: Optional pre-loaded model.
        class_names: Optional list of class names.
        target_class_index: Optional specific class index to explain. If None, uses top predicted class.
        checkpoint_path: Path to model checkpoint.
        classes_path: Path to class mapping JSON.
        device: Torch device (CUDA/CPU).
        threshold: Grad-CAM lesion activation threshold (default: 0.5).

    Returns:
        Dictionary containing prediction, Grad-CAM arrays, and metrics:
        {
            "predicted_class": str,
            "crop": str,
            "disease": str,
            "confidence": float,
            "target_class_index": int,
            "cam_mask": np.ndarray (224, 224),
            "overlay": np.ndarray (224, 224, 3) uint8,
            "leaf_mask": np.ndarray (224, 224) bool,
            "affected_pct": float,
            "image_resized": PIL.Image,
            "image_stem": str,
        }
    """
    if device is None:
        device = get_device()

    if model is None or class_names is None:
        model, class_names = load_model(
            checkpoint_path=checkpoint_path,
            classes_path=classes_path,
            device=device,
        )

    # Load and preprocess image
    image_stem = "sample"
    if isinstance(image_input, (str, Path)):
        img_path = Path(image_input)
        if not img_path.exists():
            raise FileNotFoundError(f"Image not found at: {img_path}")
        image = Image.open(img_path).convert("RGB")
        image_stem = img_path.stem
    elif isinstance(image_input, Image.Image):
        image = image_input.convert("RGB")
    else:
        raise TypeError(f"Unsupported image_input type: {type(image_input)}")

    # Standard validation transform
    transform = get_transform()
    tensor = transform(image).unsqueeze(0).to(device)

    # Resized RGB image for visualization & leaf mask
    image_resized = image.resize((IMAGE_SIZE, IMAGE_SIZE), Image.Resampling.BILINEAR)
    img_np = np.array(image_resized, dtype=np.uint8)
    img_float = img_np.astype(np.float32) / 255.0

    # Model inference for top prediction
    with torch.no_grad():
        outputs = model(tensor)
        probabilities = F.softmax(outputs, dim=1).squeeze(0)

    if target_class_index is None:
        pred_idx = int(torch.argmax(probabilities).item())
    else:
        pred_idx = target_class_index

    confidence = float(probabilities[pred_idx].item())
    predicted_class = class_names[pred_idx]
    crop, disease = parse_class_name(predicted_class)

    # Target conv layer: conv_head
    target_layer = get_target_layer(model)
    cam = GradCAM(model=model, target_layers=[target_layer])
    targets = [ClassifierOutputTarget(pred_idx)]

    # Generate Grad-CAM activation map
    grayscale_cam = cam(input_tensor=tensor, targets=targets)
    cam_mask = grayscale_cam[0]  # shape (224, 224), float32 in [0, 1]

    # Compute leaf mask and affected percentage
    leaf_mask = extract_leaf_mask(img_np)
    affected_pct = calculate_affected_percentage(
        cam_mask=cam_mask,
        leaf_mask=leaf_mask,
        threshold=threshold,
    )

    # Overlay heatmap on original image
    overlay = show_cam_on_image(img_float, cam_mask, use_rgb=True)

    return {
        "predicted_class": predicted_class,
        "crop": crop,
        "disease": disease,
        "confidence": confidence,
        "target_class_index": pred_idx,
        "cam_mask": cam_mask,
        "overlay": overlay,
        "leaf_mask": leaf_mask,
        "affected_pct": affected_pct,
        "image_resized": image_resized,
        "image_stem": image_stem,
    }


def save_heatmap(
    result: Dict,
    output_path: Optional[Union[str, Path]] = None,
    output_dir: Union[str, Path] = DEFAULT_HEATMAP_DIR,
) -> Path:
    """
    Save the side-by-side Grad-CAM visualization showing:
    - Original image
    - Grad-CAM heatmap overlay
    - Predicted crop, disease, confidence, and affected percentage

    Args:
        result: Dictionary returned by generate_gradcam.
        output_path: Optional full output file path.
        output_dir: Directory to save heatmap if output_path is not specified.

    Returns:
        Path to the saved visualization image.
    """
    if output_path is None:
        out_dir = Path(output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        img_stem = result.get("image_stem", "gradcam")
        crop = result["crop"]
        disease = result["disease"]
        output_path = out_dir / f"{img_stem}_{crop}_{disease}_gradcam.png"
    else:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

    # Render side-by-side figure
    fig, axes = plt.subplots(1, 2, figsize=(8.5, 4.2), dpi=150)

    # 1. Original Image
    axes[0].imshow(result["image_resized"])
    axes[0].set_title("Original Image (224x224)", fontsize=11, fontweight="bold", pad=8)
    axes[0].axis("off")

    # 2. Grad-CAM Overlay
    axes[1].imshow(result["overlay"])
    axes[1].set_title("Grad-CAM Lesion Activation", fontsize=11, fontweight="bold", pad=8)
    axes[1].axis("off")

    # Metadata Header
    crop_display = result["crop"].capitalize()
    disease_display = result["disease"].replace("_", " ").title()
    conf_pct = result["confidence"] * 100.0
    affected_pct = result["affected_pct"]

    title_text = (
        f"Crop: {crop_display} | Disease: {disease_display}\n"
        f"Confidence: {conf_pct:.2f}% | Affected Leaf Area: {affected_pct:.2f}%"
    )
    fig.suptitle(title_text, fontsize=12, fontweight="bold", y=0.98)

    plt.tight_layout()
    fig.savefig(output_path, bbox_inches="tight")
    plt.close(fig)

    return output_path


def print_gradcam_results(result: Dict, output_path: Path) -> None:
    """Format and print Grad-CAM results to console."""
    print("=" * 60)
    print("PattaPe - Grad-CAM Disease Localization")
    print("=" * 60)
    print(f"Predicted Class:     {result['predicted_class']}")
    print(f"Crop:                {result['crop']}")
    print(f"Disease:             {result['disease']}")
    print(f"Confidence:          {result['confidence']:.4f} ({result['confidence'] * 100:.2f}%)")
    print(f"Affected Percentage: {result['affected_pct']:.2f}%")
    print(f"Heatmap Saved To:    {output_path.as_posix()}")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="PattaPe - Grad-CAM Localization & Affected Area Percentage"
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
        help="Path to model checkpoint (default: ml/checkpoints/best.pt)",
    )
    parser.add_argument(
        "--classes",
        type=str,
        default=str(DEFAULT_CLASSES_PATH),
        help="Path to class mapping file (default: ml/classes.json)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Optional destination path for the output heatmap image",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=DEFAULT_GRADCAM_THRESHOLD,
        help="Grad-CAM activation threshold for affected percentage (default: 0.5)",
    )
    args = parser.parse_args()

    result = generate_gradcam(
        image_input=args.image_path,
        checkpoint_path=args.checkpoint,
        classes_path=args.classes,
        threshold=args.threshold,
    )

    saved_path = save_heatmap(
        result=result,
        output_path=args.output,
    )

    print_gradcam_results(result, saved_path)


if __name__ == "__main__":
    main()
