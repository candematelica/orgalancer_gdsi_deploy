from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timezone

from app.database import get_db
from app.models import User, Task, TaskStatus, Project
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdateStatus, TaskUpdate
from app.routers.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == task_in.project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado o no autorizado")

    now = datetime.now(timezone.utc)

    new_task = Task(
        user_id=current_user.id,
        project_id=task_in.project_id,
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority,
        target_date=task_in.target_date,
        status=TaskStatus.pending,
        created_at=now,
        updated_at=now
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    new_task.project = project 
    return new_task


@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).options(joinedload(Task.project)).filter(Task.user_id == current_user.id).all()
    return tasks


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: str,
    status_in: TaskUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).options(joinedload(Task.project)).filter(
        Task.id == task_id, 
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    task.status = status_in.status
    task.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(task)
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).options(joinedload(Task.project)).filter(
        Task.id == task_id, 
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    if task.project_id != task_in.project_id:
        project = db.query(Project).filter(
            Project.id == task_in.project_id,
            Project.user_id == current_user.id
        ).first()

        if not project:
            raise HTTPException(status_code=404, detail="Proyecto no encontrado o no autorizado")
        
        task.project = project

    task.title = task_in.title
    task.description = task_in.description
    task.priority = task_in.priority
    task.status = task_in.status
    task.target_date = task_in.target_date
    task.project_id = task_in.project_id
    task.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(task)
    
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    db.delete(task)
    db.commit()

    return None
