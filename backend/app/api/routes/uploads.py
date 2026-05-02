import cloudinary
import cloudinary.uploader
import logging
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

ALLOWED_TYPES = {
    "video": ["video/mp4", "video/mpeg", "video/quicktime", "video/webm"],
    "image": ["image/jpeg", "image/png", "image/gif", "image/webp"],
    "pdf": ["application/pdf"],
    "document": [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
}

MAX_SIZES = {
    "video": 500 * 1024 * 1024,
    "image": 10 * 1024 * 1024,
    "pdf": 50 * 1024 * 1024,
    "document": 50 * 1024 * 1024,
}

MAGIC_BYTES = {
    b"\xff\xd8\xff": "image",
    b"\x89PNG\r\n\x1a\n": "image",
    b"GIF87a": "image",
    b"GIF89a": "image",
    b"RIFF": "image",
    b"\x00\x00\x00\x1cftyp": "video",
    b"\x00\x00\x00\x18ftyp": "video",
    b"\x00\x00\x00\x20ftyp": "video",
    b"\x1aE\xdf\xa3": "video",
    b"%PDF": "pdf",
    b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1": "document",
    b"PK\x03\x04": "document",
}


def _detect_type_from_bytes(header: bytes) -> str | None:
    for signature, file_type in MAGIC_BYTES.items():
        if header[:len(signature)] == signature:
            return file_type
    return None


def get_file_type(content_type: str):
    for file_type, mime_types in ALLOWED_TYPES.items():
        if content_type in mime_types:
            return file_type
    return None

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    file_type = get_file_type(file.content_type)
    if not file_type:
        raise HTTPException(status_code=400, detail="File type not allowed")

    contents = await file.read()

    detected_type = _detect_type_from_bytes(contents[:16])
    if detected_type is None or detected_type != file_type:
        raise HTTPException(
            status_code=400,
            detail="File content does not match declared type"
        )

    max_size = MAX_SIZES[file_type]
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail=f"File too large. Max: {max_size // (1024*1024)}MB")

    try:
        resource_type = "video" if file_type == "video" else "auto"

        result = cloudinary.uploader.upload(
            contents,
            folder=f"edunexus/{file_type}s",
            resource_type=resource_type,
            original_filename=file.filename,
        )

        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "file_type": file_type,
            "file_name": file.filename,
            "file_size": len(contents),
            "format": result.get("format", ""),
        }

    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")


@router.delete("/upload/{public_id:path}")
async def delete_file(
    public_id: str,
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    try:
        cloudinary.uploader.destroy(public_id)
        return {"message": "File deleted successfully"}
    except Exception as e:
        logger.error(f"Delete failed: {e}")
        raise HTTPException(status_code=500, detail="Delete failed")