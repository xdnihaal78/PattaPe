import timm
import torch.nn as nn


def create_model(num_classes: int):
    model = timm.create_model(
        "efficientnet_b0",
        pretrained=True,
        num_classes=num_classes,
    )

    return model