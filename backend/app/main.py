"""
backend/app/main.py

FastAPI app entrypoint for PattaPe.
Exposes:
- POST /predict: Core diagnostic endpoint strictly adhering to CONTRACT.md
- GET /health: Health check endpoint for integration testing & uptime monitoring
- Global exception handlers and CORS middleware
"""

from datetime import datetime, timedelta, timezone
import logging
import os
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.schemas import ErrorResponse, HealthResponse, PredictResponse, VALID_CROPS
from app.services import predict_service
from app.services.model_service import DEFAULT_MOCK_MODEL, warmup_model

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("pattape.main")

# Timezone (IST: UTC+05:30)
IST = timezone(timedelta(hours=5, minutes=30))

# Initialize FastAPI app
app = FastAPI(
    title="PattaPe API",
    description="AI Crop Doctor for Indian Farmers — Backend Diagnostic API",
    version="1.0.0",
)

# CORS configuration for Frontend PWA & Officer Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Vite dev servers & deployed PWAs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directories exist and mount static route for heatmaps
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
HEATMAPS_DIR = STATIC_DIR / "heatmaps"
HEATMAPS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
 
 
@app.on_event("startup")
async def startup_event():
    """Warm up ML model in memory at server start to eliminate cold-start lag."""
    logger.info("Server starting up. Pre-warming ML model...")
    warmup_model()

# Allowed image MIME types, extensions, and formats
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/bmp",
}
ALLOWED_IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp", ".bmp")
ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP", "BMP"}
MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB


# Global Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Format HTTP exceptions into standard detail JSON."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Format request validation errors into standard 422 JSON."""
    return JSONResponse(
        status_code=422,
        content={"detail": jsonable_encoder(exc.errors())},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Global catch-all to prevent unhandled 500 stack dumps."""
    logger.exception("Unhandled server error: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


@app.get(
    "/",
    tags=["System"],
    summary="Root API info",
    include_in_schema=False,
)
async def root():
    return {
        "app": "PattaPe — Crop Disease Detection API",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/health",
        "predict_endpoint": "POST /predict",
    }


@app.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
    tags=["System"],
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint for Aditya's integration testing and deployment monitoring.
    """
    mock_mode = os.getenv("MOCK_MODEL", str(DEFAULT_MOCK_MODEL)).lower() in ("true", "1", "yes")
    return HealthResponse(
        status="ok",
        mock_mode=mock_mode,
        version="1.0.0",
        timestamp=datetime.now(IST).isoformat(),
    )


@app.post(
    "/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"model": PredictResponse, "description": "Successful diagnostic prediction matching frozen contract"},
        400: {"model": ErrorResponse, "description": "Invalid crop or malformed image"},
        422: {"description": "Request validation error (missing required parameters)"},
    },
    summary="Diagnose crop leaf image",
    tags=["Diagnosis"],
)
async def predict(
    crop: str = Form(..., description="Target crop key (rice, chilli, banana, groundnut, sugarcane)"),
    file: Optional[UploadFile] = File(None, description="Crop leaf photo file"),
    image: Optional[UploadFile] = File(None, description="Alias for leaf photo file"),
    lat: Optional[float] = Form(None, description="Latitude for weather risk lookup"),
    lon: Optional[float] = Form(None, description="Longitude for weather risk lookup"),
) -> PredictResponse:
    """
    Core diagnostic endpoint for PattaPe.
    Accepts crop name and leaf image file, routes to predict_service.py, and returns
    the frozen JSON response contract defined in CONTRACT.md.
    """
    # 1. Validate Crop
    normalized_crop = crop.strip().lower()
    if normalized_crop not in VALID_CROPS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid crop '{crop}'. Valid options are: {', '.join(sorted(VALID_CROPS))}",
        )

    # 2. Resolve Uploaded File (support both 'file' and 'image' field names)
    upload = file or image
    if not upload or not upload.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No leaf image provided. Upload an image under 'file' or 'image'.",
        )

    # 3. Validate Content Type and File Extension
    content_type = (upload.content_type or "").lower()
    filename = (upload.filename or "").lower()

    if content_type not in ALLOWED_MIME_TYPES and not filename.endswith(ALLOWED_IMAGE_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{content_type}'. Must be an image (JPEG, PNG, WEBP).",
        )

    # 4. Read File Bytes & Validate Size
    try:
        image_bytes = await upload.read()
    except Exception as read_err:
        logger.error("Failed to read uploaded image bytes: %s", read_err)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read uploaded image data.",
        )

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image file is empty.",
        )

    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image file exceeds {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB limit.",
        )

    # 5. Validate Image Integrity & Format (detect corrupt image or unsupported format)
    try:
        import io
        from PIL import Image, UnidentifiedImageError
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        if img.format and img.format.upper() not in ALLOWED_IMAGE_FORMATS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image format '{img.format}'. Supported formats are: JPEG, PNG, WEBP.",
            )
    except HTTPException:
        raise
    except (UnidentifiedImageError, SyntaxError, ValueError, OSError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corrupted or unreadable image file.",
        )

    # 5. Route to Predict Service and return result directly
    try:
        result: PredictResponse = await predict_service.predict(
            image_bytes=image_bytes,
            crop=normalized_crop,
            lat=lat,
            lon=lon,
        )
        return result
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as exc:
        logger.exception("Unexpected error inside predict_service: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing the prediction.",
        )
