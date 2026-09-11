from pathlib import Path
import json

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from tqdm import tqdm

from model import create_model


# ============================================================
# CONFIG
# ============================================================

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
CHECKPOINT_DIR = ROOT / "checkpoints"
CHECKPOINT_DIR.mkdir(exist_ok=True)

IMAGE_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 8
LEARNING_RATE = 1e-4
NUM_WORKERS = 4

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ============================================================
# DATA
# ============================================================

train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2,
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


def main():

    print("=" * 60)
    print("PattaPe - EfficientNet-B0 Training")
    print("=" * 60)

    print(f"Device: {DEVICE}")

    if DEVICE.type == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    # --------------------------------------------------------
    # Load datasets
    # --------------------------------------------------------

    train_dataset = datasets.ImageFolder(
        DATA_DIR / "train",
        transform=train_transform,
    )

    val_dataset = datasets.ImageFolder(
        DATA_DIR / "val",
        transform=val_transform,
    )

    print(f"Training images: {len(train_dataset)}")
    print(f"Validation images: {len(val_dataset)}")
    print(f"Classes: {len(train_dataset.classes)}")

    # Save class mapping
    classes_path = ROOT / "classes.json"

    with open(classes_path, "w", encoding="utf-8") as f:
        json.dump(train_dataset.classes, f, indent=2)

    print(f"Classes saved to: {classes_path}")

    # --------------------------------------------------------
    # DataLoaders
    # --------------------------------------------------------

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS,
        pin_memory=True,
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=True,
    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = create_model(len(train_dataset.classes))
    model = model.to(DEVICE)

    criterion = nn.CrossEntropyLoss()

    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=LEARNING_RATE,
        weight_decay=1e-4,
    )

    # --------------------------------------------------------
    # Training
    # --------------------------------------------------------

    best_val_accuracy = 0.0

    for epoch in range(EPOCHS):

        print()
        print(
            f"Epoch {epoch + 1}/{EPOCHS}"
        )

        # ====================================================
        # TRAIN
        # ====================================================

        model.train()

        train_loss = 0.0
        train_correct = 0
        train_total = 0

        progress = tqdm(
            train_loader,
            desc="Training",
        )

        for images, labels in progress:

            images = images.to(
                DEVICE,
                non_blocking=True,
            )

            labels = labels.to(
                DEVICE,
                non_blocking=True,
            )

            optimizer.zero_grad()

            outputs = model(images)

            loss = criterion(
                outputs,
                labels,
            )

            loss.backward()
            optimizer.step()

            train_loss += loss.item() * images.size(0)

            predictions = outputs.argmax(dim=1)

            train_correct += (
                predictions == labels
            ).sum().item()

            train_total += labels.size(0)

            progress.set_postfix(
                loss=f"{loss.item():.4f}"
            )

        train_loss /= train_total
        train_accuracy = train_correct / train_total

        # ====================================================
        # VALIDATION
        # ====================================================

        model.eval()

        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():

            progress = tqdm(
                val_loader,
                desc="Validation",
            )

            for images, labels in progress:

                images = images.to(
                    DEVICE,
                    non_blocking=True,
                )

                labels = labels.to(
                    DEVICE,
                    non_blocking=True,
                )

                outputs = model(images)

                loss = criterion(
                    outputs,
                    labels,
                )

                val_loss += (
                    loss.item() * images.size(0)
                )

                predictions = outputs.argmax(dim=1)

                val_correct += (
                    predictions == labels
                ).sum().item()

                val_total += labels.size(0)

        val_loss /= val_total
        val_accuracy = val_correct / val_total

        # ====================================================
        # RESULTS
        # ====================================================

        print()
        print(f"Train Loss: {train_loss:.4f}")
        print(f"Train Acc:  {train_accuracy * 100:.2f}%")
        print(f"Val Loss:   {val_loss:.4f}")
        print(f"Val Acc:    {val_accuracy * 100:.2f}%")

        # ====================================================
        # SAVE BEST MODEL
        # ====================================================

        if val_accuracy > best_val_accuracy:

            best_val_accuracy = val_accuracy

            checkpoint = {
                "model_state_dict": model.state_dict(),
                "class_names": train_dataset.classes,
                "val_accuracy": val_accuracy,
                "epoch": epoch + 1,
                "image_size": IMAGE_SIZE,
            }

            checkpoint_path = (
                CHECKPOINT_DIR / "best.pt"
            )

            torch.save(
                checkpoint,
                checkpoint_path,
            )

            print(
                f"✓ Best model saved: {checkpoint_path}"
            )

    print()
    print("=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    print(
        f"Best validation accuracy: "
        f"{best_val_accuracy * 100:.2f}%"
    )


if __name__ == "__main__":
    main()