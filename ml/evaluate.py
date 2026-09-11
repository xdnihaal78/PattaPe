"""
ml/evaluate.py

Comprehensive evaluation module for the PattaPe / SIH26131 EfficientNet-B0 model.
Evaluates the trained checkpoint (ml/checkpoints/best.pt) on the full validation dataset (ml/data/val/).

Generates:
  1. ml/outputs/confusion_matrix.png     (High-resolution 300 DPI plot)
  2. ml/outputs/classification_report.txt (Precision, Recall, F1, Support per class)
  3. ml/outputs/evaluation.json           (Machine-readable metrics summary)

Usage:
  python ml/evaluate.py
"""

import argparse
import json
from pathlib import Path
import sys
from typing import Dict, List, Optional, Tuple, Union

import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless / server execution
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from tqdm import tqdm

# Ensure the ml directory is on sys.path for local imports
ML_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = ML_DIR.parent
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

try:
    from model import create_model
except ImportError:
    from ml.model import create_model

# Default configurations and paths matching train.py
DEFAULT_CHECKPOINT_PATH = ML_DIR / "checkpoints" / "best.pt"
DEFAULT_CLASSES_PATH = ML_DIR / "classes.json"
DEFAULT_VAL_DATA_DIR = ML_DIR / "data" / "val"
DEFAULT_OUTPUT_DIR = ML_DIR / "outputs"

IMAGE_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def get_device() -> torch.device:
    """Automatically detect and return CUDA device if available, otherwise CPU."""
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def get_val_transform(image_size: int = IMAGE_SIZE) -> transforms.Compose:
    """
    Return exact validation preprocessing pipeline matching train.py:
      - Resize to (image_size, image_size)
      - ToTensor
      - Normalize with ImageNet mean and std
    """
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=IMAGENET_MEAN,
            std=IMAGENET_STD,
        ),
    ])


def load_classes(classes_path: Union[str, Path] = DEFAULT_CLASSES_PATH) -> List[str]:
    """Load class names from JSON file, preserving exact ordering."""
    classes_file = Path(classes_path)
    if not classes_file.exists():
        raise FileNotFoundError(f"Classes file not found at: {classes_file}")
    with open(classes_file, "r", encoding="utf-8") as f:
        return json.load(f)


def load_checkpoint(
    checkpoint_path: Union[str, Path] = DEFAULT_CHECKPOINT_PATH,
    classes_path: Optional[Union[str, Path]] = DEFAULT_CLASSES_PATH,
    device: Optional[torch.device] = None,
) -> Tuple[torch.nn.Module, List[str], Dict]:
    """
    Load trained EfficientNet-B0 model checkpoint, class mapping, and metadata.
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

    return model, class_names, checkpoint


def run_inference(
    model: torch.nn.Module,
    val_loader: DataLoader,
    device: torch.device,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Run forward pass on all images in val_loader and return (y_true, y_pred) as numpy arrays.
    """
    model.eval()
    all_targets = []
    all_predictions = []

    with torch.no_grad():
        for images, labels in tqdm(val_loader, desc="Evaluating", unit="batch"):
            images = images.to(device, non_blocking=True)
            outputs = model(images)
            preds = outputs.argmax(dim=1).cpu()

            all_targets.extend(labels.tolist())
            all_predictions.extend(preds.tolist())

    return np.array(all_targets), np.array(all_predictions)


def compute_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    class_names: List[str],
) -> Tuple[Dict, str, np.ndarray]:
    """
    Compute accuracy, classification report, per-class metrics, confusion matrix,
    and identify best 5 and worst 5 classes.
    """
    num_images = int(len(y_true))
    overall_acc = float(accuracy_score(y_true, y_pred))

    # Detailed classification report
    report_dict = classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        output_dict=True,
        zero_division=0,
    )
    report_text = classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        digits=4,
        zero_division=0,
    )

    macro_f1 = float(report_dict["macro avg"]["f1-score"])
    weighted_f1 = float(report_dict["weighted avg"]["f1-score"])

    # Per-class metrics
    per_class = {}
    class_eval_list = []

    for idx, cls_name in enumerate(class_names):
        cls_mask = (y_true == idx)
        support = int(cls_mask.sum())
        correct = int(((y_true == idx) & (y_pred == idx)).sum())
        cls_acc = float(correct / support) if support > 0 else 0.0

        cls_rep = report_dict.get(cls_name, {})
        precision = float(cls_rep.get("precision", 0.0))
        recall = float(cls_rep.get("recall", 0.0))
        f1 = float(cls_rep.get("f1-score", 0.0))

        class_stat = {
            "accuracy": cls_acc,
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "support": support,
        }
        per_class[cls_name] = class_stat

        class_eval_list.append({
            "class": cls_name,
            "class_name": cls_name,
            "accuracy": cls_acc,
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "support": support,
        })

    # Sort classes for worst_5 (ascending accuracy) and best_5 (descending accuracy)
    # Tie-break with f1-score
    sorted_classes_asc = sorted(class_eval_list, key=lambda x: (x["accuracy"], x["f1"]))
    sorted_classes_desc = sorted(class_eval_list, key=lambda x: (x["accuracy"], x["f1"]), reverse=True)

    worst_5 = sorted_classes_asc[:5]
    best_5 = sorted_classes_desc[:5]

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(class_names))))

    summary = {
        "overall_accuracy": overall_acc,
        "num_validation_images": num_images,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
        "per_class": per_class,
        "worst_5": worst_5,
        "best_5": best_5,
        "worst_5_classes": [item["class"] for item in worst_5],
        "best_5_classes": [item["class"] for item in best_5],
    }

    return summary, report_text, cm


def plot_and_save_confusion_matrix(
    cm: np.ndarray,
    class_names: List[str],
    output_path: Union[str, Path],
) -> None:
    """
    Render and save a high-resolution confusion matrix plot.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    fig, ax = plt.subplots(figsize=(24, 22))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names)
    disp.plot(
        ax=ax,
        cmap="Blues",
        xticks_rotation=90,
        colorbar=True,
        values_format="d",
    )

    ax.set_title(
        "EfficientNet-B0 Validation Confusion Matrix — PattaPe (SIH26131)",
        fontsize=16,
        fontweight="bold",
        pad=18,
    )
    ax.set_xlabel("Predicted Label", fontsize=13, fontweight="bold", labelpad=12)
    ax.set_ylabel("True Label", fontsize=13, fontweight="bold", labelpad=12)
    ax.tick_params(axis="both", which="major", labelsize=8)

    # Adjust text annotation font size inside matrix cells
    if disp.text_ is not None:
        for text in disp.text_.ravel():
            text.set_fontsize(6.5)

    plt.tight_layout()
    fig.savefig(output_path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def save_outputs(
    summary: Dict,
    report_text: str,
    cm: np.ndarray,
    class_names: List[str],
    output_dir: Union[str, Path] = DEFAULT_OUTPUT_DIR,
) -> Dict[str, Path]:
    """
    Save all three evaluation artifacts:
      1. confusion_matrix.png
      2. classification_report.txt
      3. evaluation.json
    """
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    cm_path = out_dir / "confusion_matrix.png"
    report_path = out_dir / "classification_report.txt"
    json_path = out_dir / "evaluation.json"

    # 1. Confusion Matrix plot
    plot_and_save_confusion_matrix(cm, class_names, cm_path)

    # 2. Classification Report text
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("=" * 80 + "\n")
        f.write("PattaPe / SIH26131 — EfficientNet-B0 Classification Report (Validation Set)\n")
        f.write("=" * 80 + "\n\n")
        f.write(report_text)
        f.write("\n")

    # 3. JSON Summary
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    return {
        "confusion_matrix": cm_path,
        "classification_report": report_path,
        "evaluation_json": json_path,
    }


def print_evaluation_summary(
    summary: Dict,
    output_paths: Dict[str, Path],
    device: torch.device,
) -> None:
    """
    Format and print a professional evaluation summary to the console.
    """
    overall_acc = summary["overall_accuracy"]
    num_images = summary["num_validation_images"]
    macro_f1 = summary["macro_f1"]
    weighted_f1 = summary["weighted_f1"]
    per_class = summary["per_class"]
    worst_5 = summary["worst_5"]
    best_5 = summary["best_5"]

    print()
    print("=" * 76)
    print("PattaPe / SIH26131 — EfficientNet-B0 Validation Evaluation")
    print("=" * 76)
    print(f"Inference Device:          {device.type.upper()}" + (f" ({torch.cuda.get_device_name(0)})" if device.type == "cuda" else ""))
    print(f"Total Validation Images:   {num_images}")
    print(f"Total Classes:             {len(per_class)}")
    print(f"Overall Accuracy:          {overall_acc * 100:.2f}% ({int(round(overall_acc * num_images))}/{num_images})")
    print(f"Macro F1-Score:            {macro_f1 * 100:.2f}%")
    print(f"Weighted F1-Score:         {weighted_f1 * 100:.2f}%")
    print("-" * 76)

    # Per-Class Table
    print(f"{'Class Name':<42} {'Acc (%)':>9} {'Precision':>10} {'Recall':>8} {'F1':>8} {'Count':>7}")
    print("-" * 76)
    for cls_name, metrics in per_class.items():
        print(
            f"{cls_name:<42} "
            f"{metrics['accuracy'] * 100:>8.2f}% "
            f"{metrics['precision']:>10.4f} "
            f"{metrics['recall']:>8.4f} "
            f"{metrics['f1']:>8.4f} "
            f"{metrics['support']:>7d}"
        )
    print("-" * 76)

    # Worst 5 Classes
    print()
    print("[!] Worst 5 Classes (Lowest Validation Accuracy):")
    for rank, item in enumerate(worst_5, start=1):
        print(
            f"  {rank}. {item['class']:<38} "
            f"Acc: {item['accuracy'] * 100:>6.2f}%  "
            f"F1: {item['f1']:>6.4f}  "
            f"Support: {item['support']:>3d}"
        )

    # Best 5 Classes
    print()
    print("[*] Best 5 Classes (Highest Validation Accuracy):")
    for rank, item in enumerate(best_5, start=1):
        print(
            f"  {rank}. {item['class']:<38} "
            f"Acc: {item['accuracy'] * 100:>6.2f}%  "
            f"F1: {item['f1']:>6.4f}  "
            f"Support: {item['support']:>3d}"
        )

    # Output files
    print()
    print("=" * 76)
    print("Generated Artifacts:")
    print(f"  - Confusion Matrix:       {output_paths['confusion_matrix']}")
    print(f"  - Classification Report:  {output_paths['classification_report']}")
    print(f"  - Evaluation JSON:        {output_paths['evaluation_json']}")
    print("=" * 76)


def evaluate(
    val_dir: Union[str, Path] = DEFAULT_VAL_DATA_DIR,
    checkpoint_path: Union[str, Path] = DEFAULT_CHECKPOINT_PATH,
    classes_path: Optional[Union[str, Path]] = DEFAULT_CLASSES_PATH,
    output_dir: Union[str, Path] = DEFAULT_OUTPUT_DIR,
    batch_size: int = 32,
    num_workers: int = 0,
    device: Optional[torch.device] = None,
) -> Tuple[Dict, Dict[str, Path]]:
    """
    Main programmatic evaluation routine.
    Loads model and val dataset, executes inference, generates metrics, and saves all outputs.
    """
    if device is None:
        device = get_device()

    val_path = Path(val_dir)
    if not val_path.exists():
        raise FileNotFoundError(f"Validation directory not found: {val_path}")

    # Load model and class names
    model, class_names, _ = load_checkpoint(
        checkpoint_path=checkpoint_path,
        classes_path=classes_path,
        device=device,
    )

    # Load validation dataset with exact validation transform
    transform = get_val_transform()
    val_dataset = datasets.ImageFolder(val_path, transform=transform)

    # Confirm class alignment
    if val_dataset.classes != class_names:
        print("[!] Warning: ImageFolder classes do not exactly match checkpoint classes.")
        print(f"    Dataset classes:    {len(val_dataset.classes)}")
        print(f"    Checkpoint classes: {len(class_names)}")

    pin_memory = (device.type == "cuda")
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=pin_memory,
    )

    # Run inference across every image
    y_true, y_pred = run_inference(model, val_loader, device)

    # Compute metrics
    summary, report_text, cm = compute_metrics(y_true, y_pred, class_names)

    # Save artifacts to ml/outputs/
    output_paths = save_outputs(
        summary=summary,
        report_text=report_text,
        cm=cm,
        class_names=class_names,
        output_dir=output_dir,
    )

    # Print summary
    print_evaluation_summary(summary, output_paths, device)

    return summary, output_paths


def main():
    parser = argparse.ArgumentParser(
        description="PattaPe / SIH26131 — EfficientNet-B0 Model Comprehensive Evaluation"
    )
    parser.add_argument(
        "--checkpoint",
        type=str,
        default=str(DEFAULT_CHECKPOINT_PATH),
        help=f"Path to model checkpoint (default: {DEFAULT_CHECKPOINT_PATH})",
    )
    parser.add_argument(
        "--val-dir",
        type=str,
        default=str(DEFAULT_VAL_DATA_DIR),
        help=f"Path to validation data directory (default: {DEFAULT_VAL_DATA_DIR})",
    )
    parser.add_argument(
        "--classes",
        type=str,
        default=str(DEFAULT_CLASSES_PATH),
        help=f"Path to class mapping file (default: {DEFAULT_CLASSES_PATH})",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=str(DEFAULT_OUTPUT_DIR),
        help=f"Directory to save evaluation artifacts (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=32,
        help="DataLoader batch size (default: 32)",
    )
    parser.add_argument(
        "--num-workers",
        type=int,
        default=0,
        help="DataLoader num_workers (default: 0 for fast single-process on Windows)",
    )
    args = parser.parse_args()

    evaluate(
        val_dir=args.val_dir,
        checkpoint_path=args.checkpoint,
        classes_path=args.classes,
        output_dir=args.output_dir,
        batch_size=args.batch_size,
        num_workers=args.num_workers,
    )


if __name__ == "__main__":
    main()
