from pathlib import Path
from PIL import Image
from collections import defaultdict
import random
import shutil
import json

# ============================================================
# CONFIG
# ============================================================

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw_data"
OUT = ROOT / "data"

MAX_PER_CLASS = 300
VAL_RATIO = 0.20
SEED = 42

random.seed(SEED)

# Multi-Crop dataset
MULTICROP_ROOT = (
    RAW
    / "multi_crop"
    / "Multi-Crop Disease Dataset"
    / "Multicrop Disease Dataset"
    / "Multicrop Disease Dataset"
)

# Only MVP crops from Multi-Crop
MULTICROP_CLASSES = {
    "banana_bract_mosaic_virus": "banana__bract_mosaic_virus",
    "banana_cordana": "banana__cordana",
    "banana_healthy": "banana__healthy",
    "banana_insectpest": "banana__insectpest",
    "banana_moko": "banana__moko",
    "banana_panama": "banana__panama",
    "banana_pestalotiopsis": "banana__pestalotiopsis",
    "banana_sigatoka": "banana__sigatoka",
    "banana_yb_sigatoka": "banana__yb_sigatoka",

    "chilli_anthracnose": "chilli__anthracnose",
    "chilli_healthy": "chilli__healthy",
    "chilli_leafcurl": "chilli__leafcurl",
    "chilli_leafspot": "chilli__leafspot",
    "chilli_whitefly": "chilli__whitefly",
    "chilli_yellowish": "chilli__yellowish",

    "groundnut_early_leaf_spot": "groundnut__early_leaf_spot",
    "groundnut_early_rust": "groundnut__early_rust",
    "groundnut_healthy": "groundnut__healthy",
    "groundnut_late_leaf_spot": "groundnut__late_leaf_spot",
    "groundnut_nutrition_deficiency": "groundnut__nutrition_deficiency",
    "groundnut_rust": "groundnut__rust",
}

# Exact YOLO class ID mapping from data.yaml
YOLO_NAMES = [
    "banana_bract_mosaic_virus",
    "banana_cordana",
    "banana_healthy",
    "banana_insectpest",
    "banana_moko",
    "banana_panama",
    "banana_pestalotiopsis",
    "banana_sigatoka",
    "banana_yb_sigatoka",
    "cauliflower_Blackrot",
    "cauliflower_bacterial _spot _rot",
    "cauliflower_downy_mildew",
    "cauliflower_healthy",
    "chilli_anthracnose",
    "chilli_healthy",
    "chilli_leafcurl",
    "chilli_leafspot",
    "chilli_whitefly",
    "chilli_yellowish",
    "groundnut_early_leaf_spot",
    "groundnut_early_rust",
    "groundnut_healthy",
    "groundnut_late_leaf_spot",
    "groundnut_nutrition_deficiency",
    "groundnut_rust",
    "radish_black_leaf_spot",
    "radish_downey_mildew",
    "radish_flea_beetle",
    "radish_healthy",
    "radish_mosaic",
]


# ============================================================
# HELPERS
# ============================================================

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def is_image(path):
    return path.suffix.lower() in IMAGE_EXTENSIONS


def prepare_output():
    if OUT.exists():
        print(f"Removing existing output: {OUT}")
        shutil.rmtree(OUT)

    (OUT / "train").mkdir(parents=True)
    (OUT / "val").mkdir(parents=True)


def split_samples(samples):
    random.shuffle(samples)

    val_count = max(1, int(len(samples) * VAL_RATIO))

    val = samples[:val_count]
    train = samples[val_count:]

    return train, val


def save_image(source, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as img:
        img = img.convert("RGB")
        img.save(destination, "JPEG", quality=95)


def save_crop(source, destination, bbox):
    destination.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as img:
        img = img.convert("RGB")

        width, height = img.size

        x_center, y_center, box_width, box_height = bbox

        x1 = int((x_center - box_width / 2) * width)
        y1 = int((y_center - box_height / 2) * height)
        x2 = int((x_center + box_width / 2) * width)
        y2 = int((y_center + box_height / 2) * height)

        # Clamp coordinates
        x1 = max(0, min(x1, width - 1))
        y1 = max(0, min(y1, height - 1))
        x2 = max(x1 + 1, min(x2, width))
        y2 = max(y1 + 1, min(y2, height))

        crop = img.crop((x1, y1, x2, y2))

        # Ignore extremely tiny crops
        if crop.width < 20 or crop.height < 20:
            return False

        crop.save(destination, "JPEG", quality=95)

    return True


# ============================================================
# FOLDER-BASED DATASETS
# ============================================================

def collect_folder_dataset(root, crop_name, class_map=None):
    """
    Collect images from:

        root/
            class1/
            class2/
            ...

    Returns:
        {
            "crop__class": [image_paths]
        }
    """

    samples = defaultdict(list)

    for class_dir in sorted(root.iterdir()):
        if not class_dir.is_dir():
            continue

        disease = class_dir.name.strip().lower()

        if class_map and disease not in class_map:
            continue

        if class_map:
            final_class = class_map[disease]
        else:
            final_class = f"{crop_name}__{disease}"

        for image_path in class_dir.rglob("*"):
            if is_image(image_path):
                samples[final_class].append(image_path)

    return samples


# ============================================================
# PADDY
# ============================================================

def collect_paddy():
    root = RAW / "paddy" / "train_images"

    print("\n[PADDY]")

    samples = collect_folder_dataset(root, "rice")

    for cls, paths in samples.items():
        print(f"{cls}: {len(paths)} images")

    return samples


# ============================================================
# SUGARCANE
# ============================================================

def collect_sugarcane():
    root = RAW / "sugarcane" / "dataset"

    print("\n[SUGARCANE]")

    samples = collect_folder_dataset(root, "sugarcane")

    for cls, paths in samples.items():
        print(f"{cls}: {len(paths)} images")

    return samples


# ============================================================
# MULTI-CROP YOLO DATASET
# ============================================================

def collect_multicrop():
    print("\n[MULTI-CROP]")

    image_dir = MULTICROP_ROOT / "train" / "images"
    label_dir = MULTICROP_ROOT / "train" / "labels"

    samples = defaultdict(list)

    image_files = [
        p for p in image_dir.iterdir()
        if p.is_file() and is_image(p)
    ]

    print(f"Found {len(image_files)} training images.")

    crop_root = OUT / "_multicrop_crops"

    crop_root.mkdir(parents=True, exist_ok=True)

    generated = 0
    skipped = 0

    for index, image_path in enumerate(image_files, start=1):

        label_path = label_dir / f"{image_path.stem}.txt"

        if not label_path.exists():
            continue

        try:
            with Image.open(image_path) as img:
                width, height = img.size
        except Exception:
            skipped += 1
            continue

        lines = label_path.read_text().splitlines()

        for box_index, line in enumerate(lines):

            parts = line.strip().split()

            if len(parts) != 5:
                continue

            class_id = int(parts[0])

            if class_id < 0 or class_id >= len(YOLO_NAMES):
                continue

            source_class = YOLO_NAMES[class_id]

            if source_class not in MULTICROP_CLASSES:
                continue

            final_class = MULTICROP_CLASSES[source_class]

            bbox = tuple(map(float, parts[1:5]))

            crop_name = (
                f"{image_path.stem}_box{box_index}.jpg"
            )

            destination = crop_root / final_class / crop_name

            success = save_crop(
                image_path,
                destination,
                bbox
            )

            if success:
                samples[final_class].append(destination)
                generated += 1
            else:
                skipped += 1

        if index % 1000 == 0:
            print(
                f"Processed {index}/{len(image_files)} images..."
            )

    print(f"Generated {generated} crops.")
    print(f"Skipped {skipped} invalid/tiny crops.")

    for cls, paths in samples.items():
        print(f"{cls}: {len(paths)} crops")

    return samples


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_dataset(all_samples):

    classes = sorted(all_samples.keys())

    classes_json = []

    print("\n[NORMALIZING DATASET]")
    print(f"Total classes: {len(classes)}")

    for class_name in classes:

        samples = all_samples[class_name]

        random.shuffle(samples)

        # Cap at MAX_PER_CLASS
        samples = samples[:MAX_PER_CLASS]

        train_samples, val_samples = split_samples(samples)

        train_dir = OUT / "train" / class_name
        val_dir = OUT / "val" / class_name

        train_dir.mkdir(parents=True, exist_ok=True)
        val_dir.mkdir(parents=True, exist_ok=True)

        for i, source in enumerate(train_samples):
            destination = train_dir / f"{i:04d}.jpg"
            save_image(source, destination)

        for i, source in enumerate(val_samples):
            destination = val_dir / f"{i:04d}.jpg"
            save_image(source, destination)

        print(
            f"{class_name}: "
            f"{len(train_samples)} train / "
            f"{len(val_samples)} val"
        )

        classes_json.append(class_name)

    return classes_json


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("PattaPe Dataset Ingestion")
    print("=" * 60)

    prepare_output()

    all_samples = defaultdict(list)

    # Paddy
    paddy = collect_paddy()

    for cls, paths in paddy.items():
        all_samples[cls].extend(paths)

    # Sugarcane
    sugarcane = collect_sugarcane()

    for cls, paths in sugarcane.items():
        all_samples[cls].extend(paths)

    # Multi-Crop
    multicrop = collect_multicrop()

    for cls, paths in multicrop.items():
        all_samples[cls].extend(paths)

    # Normalize
    classes = normalize_dataset(all_samples)

    # Save classes.json
    classes_path = ROOT / "classes.json"

    with open(classes_path, "w", encoding="utf-8") as f:
        json.dump(classes, f, indent=2)

    print("\n" + "=" * 60)
    print("INGESTION COMPLETE")
    print("=" * 60)

    print(f"Classes: {len(classes)}")
    print(f"Output: {OUT}")
    print(f"Classes file: {classes_path}")


if __name__ == "__main__":
    main()