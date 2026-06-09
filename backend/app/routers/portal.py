# backend/app/routers/portal.py

import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Project, ProjectPortalToken, Receipt, Revenue, User
from app.routers.auth import get_current_user
from app.schemas.portal import PortalProjectResponse, PortalTokenResponse, PortalReceiptItem

router = APIRouter(prefix="/portal", tags=["portal"])


# --- POST /portal/{project_id}/generate-token ---
# Autenticado: el freelancer genera o recupera el token de su proyecto

@router.post("/{project_id}/generate-token", response_model=PortalTokenResponse)
def generate_portal_token(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    existing = db.query(ProjectPortalToken).filter(
        ProjectPortalToken.project_id == project_id
    ).first()
    if existing:
        return PortalTokenResponse(token=existing.token)

    token = secrets.token_hex(24)
    portal_token = ProjectPortalToken(project_id=project_id, token=token)

    try:
        db.add(portal_token)
        db.commit()
        db.refresh(portal_token)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al generar token: {str(e)}")

    return PortalTokenResponse(token=portal_token.token)


# --- GET /portal/{token} ---
# Público: el cliente accede sin autenticación

@router.get("/{token}", response_model=PortalProjectResponse)
def get_portal(
    token: str,
    db: Session = Depends(get_db),
):
    portal_token = db.query(ProjectPortalToken).filter(
        ProjectPortalToken.token == token
    ).first()
    if not portal_token:
        raise HTTPException(status_code=404, detail="Portal no encontrado")

    project = (
        db.query(Project)
        .options(joinedload(Project.client), joinedload(Project.tasks))
        .filter(Project.id == portal_token.project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    total = len(project.tasks)
    completed = sum(1 for t in project.tasks if t.status.value == "Completada")

    # Recibos del proyecto
    receipts = (
        db.query(Receipt)
        .filter(Receipt.project_id == portal_token.project_id)
        .order_by(Receipt.date_emitted.desc())
        .all()
    )

    return PortalProjectResponse(
        name=project.name,
        description=project.description,
        state=project.state.value,
        progress_percentage=round((completed / total) * 100) if total > 0 else 0,
        start_date=project.start_date,
        deadline=project.deadline,
        client_name=project.client.name if project.client else None,
        tasks=[
            {
                "id": str(t.id),
                "title": t.title,
                "status": t.status.value if hasattr(t.status, "value") else t.status,
            }
            for t in project.tasks
        ],
        receipts=[
            PortalReceiptItem(
                id=r.id,
                concept=r.concept,
                amount=float(r.amount),
                date_emitted=r.date_emitted,
                status=r.status.value,
            )
            for r in receipts
        ],
    )