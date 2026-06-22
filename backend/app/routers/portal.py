# backend/app/routers/portal.py

import logging
import os
import secrets
from datetime import datetime

import resend
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Budget, BudgetStatus, Project, ProjectPortalToken, Receipt, Revenue, User
from app.routers.auth import get_current_user
from app.schemas.portal import (
    PortalBudgetItem,
    PortalBudgetRespondRequest,
    PortalProjectResponse,
    PortalReceiptItem,
    PortalTokenResponse,
)

router = APIRouter(prefix="/portal", tags=["portal"])
logger = logging.getLogger(__name__)


def _notify_freelancer_budget_decision(budget: Budget):
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key or not budget.user or not budget.user.email:
        logger.warning("No se pudo notificar al freelancer: falta RESEND_API_KEY o email")
        return

    resend.api_key = api_key

    approved = budget.status == BudgetStatus.approved
    decision_label = "aprobado" if approved else "rechazado"
    color = "#15803d" if approved else "#b91c1c"
    bg = "#f0fdf4" if approved else "#fef2f2"
    border = "#bbf7d0" if approved else "#fecaca"
    client_name = budget.client.name if budget.client else "El cliente"

    currency_symbols = {"USD": "$", "EUR": "€", "ARS": "$", "GBP": "£"}
    symbol = currency_symbols.get(budget.currency, budget.currency)
    amount = f"{symbol}{float(budget.total_amount):,.2f}"

    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#1f2937">
      <h1 style="font-size:22px;font-weight:700;color:#111827;margin-bottom:4px">{budget.name}</h1>
      <p style="color:#6b7280;font-size:14px;margin-bottom:24px">{client_name} {decision_label} este presupuesto desde el portal</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin-bottom:24px"/>
      <div style="background:{bg};border:1px solid {border};border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
        <p style="font-size:13px;color:{color};margin:0 0 4px">Presupuesto {decision_label}</p>
        <p style="font-size:28px;font-weight:700;color:{color};margin:0">{amount}</p>
      </div>
      <p style="font-size:13px;color:#9ca3af;text-align:center">
        Notificación generada desde el portal del cliente en Orgalancer.
      </p>
    </div>
    """

    try:
        resend.Emails.send({
            "from": "Orgalancer <noreply@mail.orgalancer.app>",
            "to": [budget.user.email],
            "subject": f"Presupuesto {decision_label}: {budget.name}",
            "html": html,
        })
    except Exception as e:
        logger.error(f"Error al notificar al freelancer sobre el presupuesto {budget.id}: {e}")


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

    # Presupuestos del proyecto
    budgets = (
        db.query(Budget)
        .filter(Budget.project_id == portal_token.project_id)
        .order_by(Budget.created_at.desc())
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
        budgets=[
            PortalBudgetItem(
                id=b.id,
                name=b.name,
                total_amount=float(b.total_amount),
                currency=b.currency,
                description=b.description,
                status=b.status.value,
                created_at=b.created_at,
                responded_at=b.responded_at,
            )
            for b in budgets
        ],
    )


# --- POST /portal/{token}/budgets/{budget_id}/respond ---
# Público: el cliente aprueba o rechaza un presupuesto desde el portal

@router.post("/{token}/budgets/{budget_id}/respond", response_model=PortalBudgetItem)
def respond_budget(
    token: str,
    budget_id: str,
    body: PortalBudgetRespondRequest,
    db: Session = Depends(get_db),
):
    portal_token = db.query(ProjectPortalToken).filter(
        ProjectPortalToken.token == token
    ).first()
    if not portal_token:
        raise HTTPException(status_code=404, detail="Portal no encontrado")

    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.project_id == portal_token.project_id,
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")

    if budget.status != BudgetStatus.pending:
        raise HTTPException(status_code=400, detail="Este presupuesto ya fue respondido")

    budget.status = BudgetStatus(body.decision)
    budget.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(budget)

    _notify_freelancer_budget_decision(budget)

    return PortalBudgetItem(
        id=budget.id,
        name=budget.name,
        total_amount=float(budget.total_amount),
        currency=budget.currency,
        description=budget.description,
        status=budget.status.value,
        created_at=budget.created_at,
        responded_at=budget.responded_at,
    )