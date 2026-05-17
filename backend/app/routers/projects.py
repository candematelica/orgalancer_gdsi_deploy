from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import User, Project, Client, ProjectState
from app.schemas.project import (
    ProjectCreate,
    ProjectListItem,
    ProjectResponse,
    ProjectSummary,
)
from app.routers.auth import get_current_user

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
            Client.user_id == current_user.id
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

@router.get("/", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return projects

@router.put("/{project_id}", response_model=ProjectResponse, status_code=200)
def update_project(project_id: int, project: ProjectResponse, db: Session = Depends(get_db)):
    existing = db.query(Project).filter(Project.id == project_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    existing.name = project.name
    existing.contract_type = project.contract_type
    existing.estimated_budget = project.estimated_budget
    existing.deadline = project.deadline
    existing.state = project.state

    try:
        db.commit()
        db.refresh(existing)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al actualizar el proyecto: " + str(e))
    
    return existing
