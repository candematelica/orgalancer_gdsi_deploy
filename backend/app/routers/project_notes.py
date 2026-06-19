import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, ProjectNote, User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["project-notes"])


class NoteCreate(BaseModel):
    content: str


class NoteUpdate(BaseModel):
    content: str


class NoteResponse(BaseModel):
    id:         str
    project_id: str
    content:    str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


def _get_project_or_404(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return project


@router.get("/{project_id}/notes", response_model=list[NoteResponse])
def list_notes(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _get_project_or_404(project_id, user, db)
    return (
        db.query(ProjectNote)
        .filter(ProjectNote.project_id == project_id, ProjectNote.user_id == user.id)
        .order_by(ProjectNote.created_at.desc())
        .all()
    )


@router.post("/{project_id}/notes", response_model=NoteResponse, status_code=201)
def create_note(
    project_id: str,
    body: NoteCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _get_project_or_404(project_id, user, db)
    now = datetime.now(timezone.utc)
    note = ProjectNote(
        id=str(uuid.uuid4()),
        user_id=user.id,
        project_id=project_id,
        content=body.content,
        created_at=now,
        updated_at=now,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{project_id}/notes/{note_id}", response_model=NoteResponse)
def update_note(
    project_id: str,
    note_id: str,
    body: NoteUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    note = db.query(ProjectNote).filter(
        ProjectNote.id == note_id,
        ProjectNote.project_id == project_id,
        ProjectNote.user_id == user.id,
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Nota no encontrada")
    note.content = body.content
    note.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{project_id}/notes/{note_id}", status_code=204)
def delete_note(
    project_id: str,
    note_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    note = db.query(ProjectNote).filter(
        ProjectNote.id == note_id,
        ProjectNote.project_id == project_id,
        ProjectNote.user_id == user.id,
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Nota no encontrada")
    db.delete(note)
    db.commit()
