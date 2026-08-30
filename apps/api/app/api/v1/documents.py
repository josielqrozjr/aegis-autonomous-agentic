"""Document upload and retrieval endpoints."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from aegis.schemas.contracts import Document
from apps.api.app.api.deps import get_document_repo, get_storage_backend

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    doc_repo=Depends(get_document_repo),
    storage=Depends(get_storage_backend),
):
    doc_id = str(uuid.uuid4())
    destination = f"{doc_id}_{file.filename}"

    content = await file.read()
    storage_path = await storage.upload(destination, content, file.content_type or "application/octet-stream")

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
