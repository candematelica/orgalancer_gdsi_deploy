from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import Receipt, Project, Client, User
from app.schemas.receipts import ReceiptCreate, ReceiptUpdate, ReceiptResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/receipts", tags=["receipts"])


@router.post("/", response_model=ReceiptResponse, status_code=201)
def create_receipt(
    receipt_data: ReceiptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if receipt_data.project_id:
        project = db.query(Project).filter(
            Project.id == receipt_data.project_id,
            Project.user_id == current_user.id,
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or not authorized")

    if receipt_data.client_id:
        client = db.query(Client).filter(
            Client.id == receipt_data.client_id,
            Client.user_id == current_user.id,
        ).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found or not authorized")

    new_receipt = Receipt(**receipt_data.model_dump(), user_id=current_user.id)

    try:
        db.add(new_receipt)
        db.commit()
        db.refresh(new_receipt)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating receipt: {str(e)}")

    return _enrich(new_receipt, db)


@router.get("/", response_model=list[ReceiptResponse])
def list_receipts(
    project_id: Optional[str] = Query(None),
    client_id:  Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Receipt).filter(Receipt.user_id == current_user.id)

    if project_id:
        q = q.filter(Receipt.project_id == project_id)
    if client_id:
        q = q.filter(Receipt.client_id == client_id)

    return [_enrich(r, db) for r in q.order_by(Receipt.date_emitted.desc()).all()]


@router.get("/{receipt_id}", response_model=ReceiptResponse)
def get_receipt(
    receipt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    receipt = db.query(Receipt).filter(
        Receipt.id == receipt_id,
        Receipt.user_id == current_user.id,
    ).first()

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    return _enrich(receipt, db)


@router.patch("/{receipt_id}", response_model=ReceiptResponse)
def update_receipt(
    receipt_id: str,
    data: ReceiptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    receipt = db.query(Receipt).filter(
        Receipt.id == receipt_id,
        Receipt.user_id == current_user.id,
    ).first()

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    if data.project_id:
        project = db.query(Project).filter(
            Project.id == data.project_id,
            Project.user_id == current_user.id,
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or not authorized")

    if data.client_id:
        client = db.query(Client).filter(
            Client.id == data.client_id,
            Client.user_id == current_user.id,
        ).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found or not authorized")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(receipt, field, value)

    try:
        db.commit()
        db.refresh(receipt)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating receipt: {str(e)}")

    return _enrich(receipt, db)


@router.delete("/{receipt_id}", status_code=204)
def delete_receipt(
    receipt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    receipt = db.query(Receipt).filter(
        Receipt.id == receipt_id,
        Receipt.user_id == current_user.id,
    ).first()

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    db.delete(receipt)
    db.commit()


def _enrich(receipt: Receipt, db: Session) -> ReceiptResponse:
    project_name = None
    client_name  = None

    if receipt.project_id:
        p = db.query(Project).filter(Project.id == receipt.project_id).first()
        project_name = p.name if p else None

    if receipt.client_id:
        c = db.query(Client).filter(Client.id == receipt.client_id).first()
        client_name = c.name if c else None

    return ReceiptResponse(
        id=receipt.id,
        user_id=receipt.user_id,
        project_id=receipt.project_id,
        client_id=receipt.client_id,
        project_name=project_name,
        client_name=client_name,
        concept=receipt.concept,
        amount=float(receipt.amount),
        date_emitted=receipt.date_emitted,
        status=receipt.status,
    )