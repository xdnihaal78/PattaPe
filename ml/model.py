import timm
import torch.nn as nn


def create_model(num_classes: int, pretrained: bool = False):
    model = timm.create_model(
        "efficientnet_b0",
        pretrained=pretrained,
        num_classes=num_classes,
    )

    return model