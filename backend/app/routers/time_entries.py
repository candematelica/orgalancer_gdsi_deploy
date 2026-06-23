import uuid
from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, Field

from app.database import get_db
from app.routers.auth import get_current_user
from app.models import TimeEntry, User
from app.schemas.time_entries import (
    TimeEntryCreate,
    TimeEntryUpdate,
)

router = APIRouter(prefix="/time-entries", tags=["time-entries"])


def serialize(entry: TimeEntry) -> dict:
    return {
        "id":               entry.id,
        "project_id":       entry.project_id,
        "project_name":     entry.project.name if entry.project else None,
        "task_id":          entry.task_id,
        "task_name":        entry.task.title if entry.task else None,
        "entry_date":       entry.entry_date.isoformat(),
        "duration_minutes": entry.duration_minutes,
        "description":      entry.description,
        "source":           entry.source.value,
        "created_at":       entry.created_at.isoformat(),
    }


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("")
def list_entries(
    task_id:    Optional[str]  = None,
    project_id: Optional[str]  = None,
    from_date:  Optional[date] = Query(None, alias="from"),
    to_date:    Optional[date] = Query(None, alias="to"),
    db:   Session = Depends(get_db),
    user = Depends(get_current_user),
):
    q = (
        db.query(TimeEntry)
        .options(joinedload(TimeEntry.project), joinedload(TimeEntry.task))
        .filter(TimeEntry.user_id == user.id)
    )
    if task_id:
        q = q.filter(TimeEntry.task_id == task_id)
    if project_id:
        q = q.filter(TimeEntry.project_id == project_id)
    if from_date:
        q = q.filter(TimeEntry.entry_date >= from_date)
    if to_date:
        q = q.filter(TimeEntry.entry_date <= to_date)

    entries = q.order_by(TimeEntry.entry_date.desc(), TimeEntry.created_at.desc()).all()
    return [serialize(e) for e in entries]


@router.post("", status_code=201)
def create_entry(
    body: TimeEntryCreate,
    db:   Session = Depends(get_db),
    user = Depends(get_current_user),
):
    from app.models import Task
    valid_task_id = None
    if body.task_id:
        exists = db.query(Task).filter(Task.id == body.task_id).first()
        valid_task_id = body.task_id if exists else None

    entry = TimeEntry(
        id               = str(uuid.uuid4()),
        user_id          = user.id,
        project_id       = body.project_id,
        task_id          = valid_task_id,
        entry_date       = body.entry_date,
        duration_minutes = body.duration_minutes,
        description      = body.description,
        source           = body.source,
        created_at       = datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return serialize(entry)


@router.put("/{entry_id}")
def update_entry(
    entry_id: str,
    body: TimeEntryUpdate,
    db:   Session = Depends(get_db),
    user = Depends(get_current_user),
):
    entry = db.query(TimeEntry).filter_by(id=entry_id, user_id=user.id).first()
    if not entry:
        raise HTTPException(404, "Entrada no encontrada")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return serialize(entry)


@router.delete("/{entry_id}", status_code=204)
def delete_entry(
    entry_id: str,
    db:   Session = Depends(get_db),
    user = Depends(get_current_user),
):
    entry = db.query(TimeEntry).filter_by(id=entry_id, user_id=user.id).first()
    if not entry:
        raise HTTPException(404, "Entrada no encontrada")

    db.delete(entry)
    db.commit()