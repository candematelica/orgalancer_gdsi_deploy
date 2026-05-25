from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import Revenue, Project, Client, User
from app.schemas.revenue import RevenueCreate, RevenueResponse, RevenueUpdate
from app.routers.auth import get_current_user

router = APIRouter(prefix="/revenue", tags=["revenue"])


@router.post("", response_model=RevenueResponse, status_code=201)
def create_revenue(
    revenue: RevenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if revenue.project_id:
        project = db.query(Project).filter(
            Project.id == revenue.project_id,
            Project.user_id == current_user.id,
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if revenue.client_id:
        client = db.query(Client).filter(
            Client.id == revenue.client_id,
            Client.user_id == current_user.id,
        ).first()
        if not client:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")

    entry = Revenue(**revenue.model_dump(), user_id=current_user.id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _enrich(entry, db)


@router.get("", response_model=list[RevenueResponse])
def list_revenues(
    client_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Revenue).filter(Revenue.user_id == current_user.id)

    if client_id:
        q = q.filter(Revenue.client_id == client_id)
    if project_id:
        q = q.filter(Revenue.project_id == project_id)
    if from_date:
        q = q.filter(Revenue.date >= from_date)
    if to_date:
        q = q.filter(Revenue.date <= to_date)

    return [_enrich(e, db) for e in q.order_by(Revenue.date.desc()).all()]


@router.get("/{revenue_id}", response_model=RevenueResponse)
def get_revenue(
    revenue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(Revenue).filter(
        Revenue.id == revenue_id,
        Revenue.user_id == current_user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")
    return _enrich(entry, db)


@router.patch("/{revenue_id}", response_model=RevenueResponse)
def update_revenue(
    revenue_id: str,
    data: RevenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(Revenue).filter(
        Revenue.id == revenue_id,
        Revenue.user_id == current_user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return _enrich(entry, db)


@router.delete("/{revenue_id}", status_code=204)
def delete_revenue(
    revenue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(Revenue).filter(
        Revenue.id == revenue_id,
        Revenue.user_id == current_user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")
    db.delete(entry)
    db.commit()


# ── Helper ──────────────────────────────────────────────────────────────────

def _enrich(entry: Revenue, db: Session) -> RevenueResponse:
    project_name = None
    client_name = None
    if entry.project_id:
        p = db.query(Project).filter(Project.id == entry.project_id).first()
        project_name = p.name if p else None
    if entry.client_id:
        c = db.query(Client).filter(Client.id == entry.client_id).first()
        client_name = c.name if c else None

    return RevenueResponse(
        id=entry.id,
        user_id=entry.user_id,
        amount=float(entry.amount),
        currency=entry.currency,
        date=entry.date,
        payment_type=entry.payment_type,
        payment_method=entry.payment_method,
        description=entry.description,
        project_id=entry.project_id,
        client_id=entry.client_id,
        project_name=project_name,
        client_name=client_name,
    )
