"""Storage adapters — local filesystem and Google Cloud Storage.

Selected via STORAGE_BACKEND env var: 'local' (default) or 'gcs'.
"""

from __future__ import annotations

import logging
import os
from typing import Optional, Protocol

logger = logging.getLogger("aegis.storage")


class StorageBackend(Protocol):
    """Port for file storage operations."""

    async def upload(self, destination: str, content: bytes, content_type: str) -> str:
        """Upload content. Returns the storage path/URI."""
        ...

    async def download(self, path: str) -> Optional[bytes]:
        """Download content by path. Returns bytes or None if not found."""
        ...

    async def delete(self, path: str) -> None:
        """Delete a file by path."""
        ...

    def public_url(self, path: str) -> Optional[str]:
        """Return a public URL for the file, if available."""
        ...


class LocalStorageBackend:
    """Stores files on the local filesystem."""

    def __init__(self, base_dir: str | None = None):
        self._base_dir = base_dir or os.environ.get("AEGIS_UPLOAD_DIR", "/tmp/aegis-uploads")
        os.makedirs(self._base_dir, exist_ok=True)

    async def upload(self, destination: str, content: bytes, content_type: str) -> str:
        path = os.path.join(self._base_dir, destination)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(content)
        return path

    async def download(self, path: str) -> Optional[bytes]:
        full = path if os.path.isabs(path) else os.path.join(self._base_dir, path)
        if not os.path.exists(full):
            return None
        with open(full, "rb") as f:
            return f.read()

    async def delete(self, path: str) -> None:
        full = path if os.path.isabs(path) else os.path.join(self._base_dir, path)
        if os.path.exists(full):
            os.remove(full)

    def public_url(self, path: str) -> Optional[str]:
        return None  # local files have no public URL


class GCSStorageBackend:
    """Stores files in Google Cloud Storage."""

    def __init__(self, bucket_name: str | None = None, project_id: str | None = None):
        from google.cloud import storage as gcs

        self._project = project_id or os.environ.get("GCP_PROJECT_ID")
        self._bucket_name = bucket_name or os.environ.get("GCS_BUCKET", "aegis-uploads")
        self._client = gcs.Client(project=self._project)
        self._bucket = self._client.bucket(self._bucket_name)
        logger.info("GCS storage: bucket=%s, project=%s", self._bucket_name, self._project)

    async def upload(self, destination: str, content: bytes, content_type: str) -> str:
        blob = self._bucket.blob(destination)
        blob.upload_from_string(content, content_type=content_type)
        return f"gs://{self._bucket_name}/{destination}"

    async def download(self, path: str) -> Optional[bytes]:
        # Strip gs:// prefix if present
        blob_name = path.replace(f"gs://{self._bucket_name}/", "")
        blob = self._bucket.blob(blob_name)
        if not blob.exists():
            return None
        return blob.download_as_bytes()

    async def delete(self, path: str) -> None:
        blob_name = path.replace(f"gs://{self._bucket_name}/", "")
        blob = self._bucket.blob(blob_name)
        if blob.exists():
            blob.delete()

    def public_url(self, path: str) -> Optional[str]:
        blob_name = path.replace(f"gs://{self._bucket_name}/", "")
        return f"https://storage.googleapis.com/{self._bucket_name}/{blob_name}"


def create_storage_backend() -> LocalStorageBackend | GCSStorageBackend:
    """Factory: create storage backend based on STORAGE_BACKEND env var."""
    backend = os.environ.get("STORAGE_BACKEND", "local").lower()

    if backend == "gcs":
        try:
            return GCSStorageBackend()
        except ImportError:
            logger.warning("google-cloud-storage not installed, falling back to local")
        except Exception as e:
            logger.warning("GCS init failed (%s), falling back to local", e)

    return LocalStorageBackend()
