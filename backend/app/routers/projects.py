from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import case

from app.database import get_db
from app.models import User, Project, Client, ProjectState, TaskStatus
from app.schemas.project import (
    ProjectCreate,
    ProjectListItem,
    ProjectResponse,
    ProjectSummary,
    ProjectUpdate,
)
from app.routers.auth import get_current_user
from app.services.profit_calculator import ProfitCalculator

router = APIRouter(prefix="/projects", tags=["projects"])

_ACTIVE_STATES = {ProjectState.active}
_ALERT_THRESHOLDS = [(3, "urgent"), (7, "warning"), (14, "soon")]
_COMPLETED_TASK_STATUS = {"Completada"}


# --- POST ---

@router.post("/", response_model=ProjectResponse, status_code=201)
def create_project(
        project_data: ProjectCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    if project_data.client_id:
        client = db.query(Client).filter(
            Client.id == project_data.client_id,
            Client.user_id == current_user.id,
            Client.is_deleted == False
        ).first()
        if not client:
            raise HTTPException(status_code=404, detail="Cliente no encontrado o no autorizado")

    data = project_data.model_dump()
    new_project = Project(
        **data,
        user_id=current_user.id,
        state=ProjectState.active,
        start_date=date.today()
    )

    try:
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear el proyecto: {str(e)}")

    return _to_response(new_project)


# --- GET ---

@router.get("/stats", response_model=ProjectSummary)
def get_project_stats(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    billable = [p for p in projects if p.state != ProjectState.cancelled]

    return ProjectSummary(
        active_count=sum(1 for p in projects if p.state in _ACTIVE_STATES),
        total_earned=sum(float(p.earned) for p in billable),
        total_budget=sum(float(p.estimated_budget) for p in billable),
    )


@router.get("/", response_model=List[ProjectListItem])
def list_projects(
        state: Optional[ProjectState] = Query(None),
        client_id: Optional[str] = Query(None),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Project)
        .options(joinedload(Project.client), joinedload(Project.tasks))
        .filter(Project.user_id == current_user.id)
    )
    if state:
        query = query.filter(Project.state == state)
    if client_id:
        query = query.filter(Project.client_id == client_id)

    state_order = case(
        (Project.state == ProjectState.active, 1),
        (Project.state == ProjectState.completed, 2),
        (Project.state == ProjectState.cancelled, 3),
        else_=99
    )

    return [_to_list_item(p) for p in query.order_by(state_order, Project.deadline.asc().nulls_last()).all()]

@router.get("/{project_id}", response_model=ProjectListItem)
def get_project(
        project_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    project = (
        db.query(Project)
        .options(joinedload(Project.client), joinedload(Project.tasks))
        .filter(Project.id == project_id, Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return _to_list_item(project)


@router.put("/", response_model=ProjectResponse, status_code=200)
def update_project(
        project: ProjectUpdate,
        project_id: str = Query(...),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    existing = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    data = project.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(existing, key, value)

    try:
        db.commit()
        db.refresh(existing)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar el proyecto: {str(e)}")

    full_project = (
        db.query(Project)
        .options(joinedload(Project.client), joinedload(Project.tasks))
        .filter(Project.id == project_id)
        .first()
    )
    return _to_response(full_project)

  
@router.put("/{project_id}", response_model=ProjectResponse, status_code=200)
def update_project_by_id(
    project_id: str,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = (
        db.query(Project)
        .options(joinedload(Project.tasks))
        .filter(Project.id == project_id, Project.user_id == current_user.id)
        .first()
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    data = project.model_dump(exclude_unset=True)
    closing = data.get("state") == ProjectState.completed

    for key, value in data.items():
        setattr(existing, key, value)

    if closing:
        print(f"[DEBUG] Cerrando proyecto {project_id}, tareas: {len(existing.tasks)}")
        for task in existing.tasks:
            print(f"[DEBUG] Tarea {task.id} estado: {task.status}")
            if task.status != TaskStatus.completed:
                task.status = TaskStatus.completed

    try:
        db.commit()
        db.refresh(existing)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar el proyecto: {str(e)}")

    full_project = (
        db.query(Project)
        .options(joinedload(Project.client), joinedload(Project.tasks))
        .filter(Project.id == project_id)
        .first()
    )
    return _to_response(full_project)

# --- PROFITABILITY ---
@router.get("/{project_id}/profitability")
def project_profitability(
    project_id: str,    
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return ProfitCalculator.get_project_profitability(db, project_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

def _progress(total: int, completed: int) -> int:
    return round((completed / total) * 100) if total > 0 else 0


def _deadline_info(deadline_date: Optional[date]) -> tuple[Optional[int], Optional[str]]:
    if not deadline_date:
        return None, None

    days = (deadline_date - date.today()).days
    alert = next((level for limit, level in _ALERT_THRESHOLDS if 0 <= days <= limit), None)
    return days, alert


def _to_list_item(p: Project) -> ProjectListItem:
    total = len(p.tasks)
    completed = sum(1 for t in p.tasks if t.status in _COMPLETED_TASK_STATUS)
    days, alert = _deadline_info(p.deadline)

    return ProjectListItem(
        id=p.id, name=p.name, description=p.description,
        state=p.state, contract_type=p.contract_type,
        estimated_budget=float(p.estimated_budget), earned=float(p.earned),
        start_date=p.start_date, deadline=p.deadline,
        client_id=p.client_id,
        client_name=p.client.name if p.client else None,
        total_tasks=total, completed_tasks=completed,
        progress_percentage=_progress(total, completed),
        days_until_deadline=days, deadline_alert=alert,
    )


def _to_response(p: Project) -> ProjectResponse:
    total = len(p.tasks)
    completed = sum(1 for t in p.tasks if t.status in _COMPLETED_TASK_STATUS)
    days, alert = _deadline_info(p.deadline)

    return ProjectResponse(
        id=p.id, user_id=p.user_id,
        client_id=p.client_id,
        client_name=p.client.name if p.client else None,
        name=p.name, description=p.description,
        contract_type=p.contract_type, state=p.state,
        estimated_budget=float(p.estimated_budget), earned=float(p.earned),
        start_date=p.start_date, deadline=p.deadline,
        total_tasks=total, completed_tasks=completed,
        progress_percentage=_progress(total, completed),
        days_until_deadline=days, deadline_alert=alert,
    )
