#!/usr/bin/env python3
"""
S3/R2 image upload helper.

Loads credentials from .env.scraper (or process env). Provides upload_to_s3()
that uploads a local file and returns a public URL, or None on failure.

If credentials are missing or invalid, the function returns None gracefully
so the scraper can fall back to local file paths.
"""
import os
from pathlib import Path
from typing import Optional

# Try to load .env.scraper
try:
    from dotenv import load_dotenv
    ENV_PATH = Path(__file__).parent / ".env.scraper"
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)
    else:
        # Try .env in project root as fallback
        ROOT_ENV = Path(__file__).parent.parent / ".env"
        if ROOT_ENV.exists():
            load_dotenv(ROOT_ENV)
except ImportError:
    pass


def _get_client():
    """Build boto3 S3 client from env vars, or None if not configured."""
    import boto3

    access_key = os.environ.get("S3_ACCESS_KEY_ID")
    secret_key = os.environ.get("S3_SECRET_ACCESS_KEY")
    region = os.environ.get("S3_REGION", "us-east-1")
    endpoint = os.environ.get("S3_ENDPOINT_URL") or None

    if not access_key or not secret_key or access_key == "replace-me":
        return None

    return boto3.client(
        "s3",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region,
        endpoint_url=endpoint,
    )


def _public_url_for(key: str) -> str:
    """Build the public URL for an uploaded key."""
    explicit = os.environ.get("S3_PUBLIC_URL")
    if explicit:
        return f"{explicit.rstrip('/')}/{key}"
    endpoint = os.environ.get("S3_ENDPOINT_URL")
    if endpoint and "r2.cloudflarestorage.com" in endpoint:
        # R2 default: use a custom domain or the bucket public URL.
        # If S3_PUBLIC_URL is not set, R2 still needs a public host.
        # Fall back to endpoint URL (likely private, will 404).
        return f"{endpoint.rstrip('/')}/{os.environ.get('S3_BUCKET', '')}/{key}"
    bucket = os.environ.get("S3_BUCKET", "")
    region = os.environ.get("S3_REGION", "us-east-1")
    return f"https://{bucket}.s3.{region}.amazonaws.com/{key}"


def upload_to_s3(local_path: Path, product_id: int, index: int, ext: str) -> Optional[str]:
    """
    Upload a local image file to S3/R2 and return the public URL.

    Args:
        local_path: Path to the local image file
        product_id: Product ID (used for the S3 key)
        index: Image index within the product (1-based)
        ext: File extension including the dot (e.g. ".jpg")

    Returns:
        Public URL string, or None if upload failed / not configured
    """
    if not local_path.exists():
        return None

    client = _get_client()
    if client is None:
        # No credentials configured — caller will fall back to local path
        return None

    bucket = os.environ.get("S3_BUCKET")
    if not bucket:
        return None

    ext_clean = ext.lower() if ext.startswith(".") else f".{ext.lower()}"
    key = f"products/{product_id}_{index}{ext_clean}"

    content_type_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }
    content_type = content_type_map.get(ext_clean, "application/octet-stream")

    try:
        client.upload_file(
            str(local_path),
            bucket,
            key,
            ExtraArgs={
                "ContentType": content_type,
                "CacheControl": "public, max-age=31536000, immutable",
            },
        )
        return _public_url_for(key)
    except Exception as e:
        print(f"  ⚠️ S3 upload failed for {local_path.name}: {type(e).__name__}: {e}")
        return None


def is_configured() -> bool:
    """True if real S3/R2 credentials are loaded (not placeholders)."""
    access_key = os.environ.get("S3_ACCESS_KEY_ID")
    return bool(access_key) and access_key != "replace-me"
