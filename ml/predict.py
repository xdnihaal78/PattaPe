import argparse
import json
from pathlib import Path
import sys
from typing import Dict, List, Optional, Tuple, Union

from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms

# Ensure the ml directory is on sys.path for model importing
ML_DIR = Path(__file__).resolve().parent
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

try:
    from model import create_model
except ImportError:
    from ml.model import create_model

# Default paths and configurations
DEFAULT_CHECKPOINT_PATH = ML_DIR / "checkpoints" / "best.pt"
DEFAULT_CLASSES_PATH = ML_DIR / "classes.json"

IMAGE_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def get_device() -> torch.device:
    """Automatically use CUDA when available, otherwise CPU."""
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def get_transform(image_size: int = IMAGE_SIZE) -> transforms.Compose:
    """Return standard ImageNet preprocessing transform matching training validation."""
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=IMAGENET_MEAN,
            std=IMAGENET_STD,
        ),
    ])


def load_classes(classes_path: Union[str, Path] = DEFAULT_CLASSES_PATH) -> List[str]:
    """Load class names from JSON file, preserving exact ImageFolder ordering."""
    classes_file = Path(classes_path)
    if not classes_file.exists():
        raise FileNotFoundError(f"Classes file not found at: {classes_file}")
    with open(classes_file, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_class_name(class_name: str) -> Tuple[str, str]:
    """
    Parse the class format 'crop__disease' into separate crop and disease strings.
    Example: 'rice__blast' -> crop = 'rice', disease = 'blast'
    """
    if "__" in class_name:
        crop, disease = class_name.split("__", 1)
    else:
        crop, disease = class_name, "unknown"
    return crop, disease


def load_model(
    checkpoint_path: Union[str, Path] = DEFAULT_CHECKPOINT_PATH,
    classes_path: Optional[Union[str, Path]] = DEFAULT_CLASSES_PATH,
    device: Optional[torch.device] = None,
) -> Tuple[torch.nn.Module, List[str]]:
    """
    Load EfficientNet-B0 model checkpoint and class mapping.
    """
    if device is None:
        device = get_device()

    checkpoint_file = Path(checkpoint_path)
    if not checkpoint_file.exists():
        raise FileNotFoundError(f"Checkpoint file not found at: {checkpoint_file}")

    checkpoint = torch.load(checkpoint_file, map_location=device)

    # Class names from checkpoint or fallback to classes.json
    class_names = checkpoint.get("class_names")
    if not class_names:
        if classes_path is not None:
            class_names = load_classes(classes_path)
        else:
            raise ValueError("Class names not found in checkpoint and classes_path not provided.")

    model = create_model(num_classes=len(class_names))
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()

    return model, class_names


def predict_image(
    image_input: Union[str, Path, Image.Image],
    model: Optional[torch.nn.Module] = None,
    class_names: Optional[List[str]] = None,
    checkpoint_path: Union[str, Path] = DEFAULT_CHECKPOINT_PATH,
    classes_path: Optional[Union[str, Path]] = DEFAULT_CLASSES_PATH,
    device: Optional[torch.device] = None,
    top_k: int = 3,
) -> Dict:
    """
    Run EfficientNet-B0 inference on an image.
    Supports file path or PIL Image instance for reusable backend integration.
    """
    if device is None:
        device = get_device()

    if model is None or class_names is None:
        model, class_names = load_model(
            checkpoint_path=checkpoint_path,
            classes_path=classes_path,
            device=device,
        )

    # Load and convert image
    if isinstance(image_input, (str, Path)):
        img_path = Path(image_input)
        if not img_path.exists():
            raise FileNotFoundError(f"Image not found at: {img_path}")
        image = Image.open(img_path).convert("RGB")
    elif isinstance(image_input, Image.Image):
        image = image_input.convert("RGB")
    else:
        raise TypeError(f"Unsupported image_input type: {type(image_input)}")

    # Preprocess image
    transform = get_transform()
    tensor = transform(image).unsqueeze(0).to(device)

    # Run inference
    with torch.no_grad():
        outputs = model(tensor)
        probabilities = F.softmax(outputs, dim=1).squeeze(0)

    # Top-K predictions
    k = min(top_k, len(class_names))
    top_probs, top_indices = torch.topk(probabilities, k=k)

    top_probs = top_probs.cpu().tolist()
    top_indices = top_indices.cpu().tolist()

    top_predictions = []
    for prob, idx in zip(top_probs, top_indices):
        cls_name = class_names[idx]
        crop, disease = parse_class_name(cls_name)
        top_predictions.append({
            "class": cls_name,
            "crop": crop,
            "disease": disease,
            "confidence": float(prob),
        })

    best_pred = top_predictions[0]

    return {
        "predicted_class": best_pred["class"],
        "crop": best_pred["crop"],
        "disease": best_pred["disease"],
        "confidence": best_pred["confidence"],
        "top_predictions": top_predictions,
    }


def print_prediction_results(result: Dict) -> None:
    """Format and print prediction results to console."""
    print("=" * 60)
    print("PattaPe - Crop Disease Prediction")
    print("=" * 60)
    print(f"Predicted Class: {result['predicted_class']}")
    print(f"Crop:            {result['crop']}")
    print(f"Disease:         {result['disease']}")
    print(f"Confidence:      {result['confidence']:.4f} ({result['confidence'] * 100:.2f}%)")
    print()
    print("Top-3 Predictions:")
    for idx, pred in enumerate(result["top_predictions"], start=1):
        print(f"  {idx}. {pred['class']} ({pred['crop']} | {pred['disease']}): {pred['confidence'] * 100:.2f}%")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="PattaPe - AI Crop Doctor Disease Prediction"
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
    args = parser.parse_args()

    result = predict_image(
        image_input=args.image_path,
        checkpoint_path=args.checkpoint,
        classes_path=args.classes,
    )

    print_prediction_results(result)


if __name__ == "__main__":
    main()
