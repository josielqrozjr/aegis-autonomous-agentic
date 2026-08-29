"""Document upload and retrieval endpoints."""

import uuid
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from aegis.schemas.contracts import Document
from apps.api.app.api.deps import get_document_repo

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = os.environ.get("AEGIS_UPLOAD_DIR", "/tmp/aegis-uploads")


@router.post("", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    doc_repo=Depends(get_document_repo),
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    doc_id = str(uuid.uuid4())
    storage_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")

    content = await file.read()
    with open(storage_path, "wb") as f:
        f.write(content)

    raw_text: str | None = None
    if file.content_type and file.content_type.startswith("text"):
        try:
            raw_text = content.decode("utf-8")
        except UnicodeDecodeError:
            pass

    doc = Document(
        id=doc_id,
        filename=file.filename or "unknown",
        content_type=file.content_type or "application/octet-stream",
        storage_path=storage_path,
        raw_text=raw_text,
        uploaded_at=datetime.now(timezone.utc),
    )
    await doc_repo.save(doc)

    return {"id": doc_id, "filename": doc.filename, "content_type": doc.content_type}


@router.get("")
async def list_documents(doc_repo=Depends(get_document_repo)):
    docs = await doc_repo.list_all()
    return {
        "count": len(docs),
        "documents": [
            {
                "id": d.id,
                "filename": d.filename,
                "content_type": d.content_type,
                "uploaded_at": d.uploaded_at.isoformat(),
            }
            for d in docs
        ],
    }


@router.get("/{document_id}")
async def get_document(document_id: str, doc_repo=Depends(get_document_repo)):
    doc = await doc_repo.get(document_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc.model_dump()
