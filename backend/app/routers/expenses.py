from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.database import get_db
from app.models import Expense, ExpenseCategory, Project, ProjectState, User
from app.schemas.expenses import (
    ExpenseCategoryCreate, ExpenseCategoryUpdate, ExpenseCategoryResponse,
    ExpenseCreate, ExpenseUpdate, ExpenseResponse,
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/categories", response_model=ExpenseCategoryResponse, status_code=201)
def create_category(
    data: ExpenseCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(ExpenseCategory).filter(
        ExpenseCategory.user_id == current_user.id,
        ExpenseCategory.name == data.name.strip(),
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")

    cat = ExpenseCategory(**data.model_dump(), user_id=current_user.id)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.get("/categories", response_model=list[ExpenseCategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.user_id == current_user.id)
        .order_by(ExpenseCategory.name)
        .all()
    )


@router.patch("/categories/{category_id}", response_model=ExpenseCategoryResponse)
def update_category(
    category_id: str,
    data: ExpenseCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cat = db.query(ExpenseCategory).filter(
        ExpenseCategory.id == category_id,
        ExpenseCategory.user_id == current_user.id,
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)

    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cat = db.query(ExpenseCategory).filter(
        ExpenseCategory.id == category_id,
        ExpenseCategory.user_id == current_user.id,
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    db.query(Expense).filter(
        Expense.category_id == category_id,
        Expense.user_id == current_user.id,
    ).update({"category_id": None})

    db.delete(cat)
    db.commit()
    

@router.post("", response_model=ExpenseResponse, status_code=201)
def create_expense(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _validate_category(data.category_id, current_user.id, db)
    if data.project_id:
        _validate_project(data.project_id, current_user.id, db)

    expense = Expense(**data.model_dump(), user_id=current_user.id)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return _enrich(expense, db)


@router.get("", response_model=list[ExpenseResponse])
def list_expenses(
    category_id: Optional[str] = Query(None),
    project_id:  Optional[str] = Query(None),
    from_date:   Optional[date] = Query(None, alias="from"),
    to_date:     Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Expense).filter(Expense.user_id == current_user.id)

    if category_id:
        q = q.filter(Expense.category_id == category_id)
    if project_id:
        q = q.filter(Expense.project_id == project_id)
    if from_date:
        q = q.filter(Expense.date >= from_date)
    if to_date:
        q = q.filter(Expense.date <= to_date)

    return [_enrich(e, db) for e in q.order_by(Expense.date.desc()).all()]


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id,
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    return _enrich(expense, db)



@router.patch("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: str,
    data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id,
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")

    if data.project_id:
        _validate_project(data.project_id, current_user.id, db)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return _enrich(expense, db)


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id,
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")

    if expense.project_id:
        project = db.query(Project).filter(Project.id == expense.project_id).first()
        if project and project.state == ProjectState.completed:
            raise HTTPException(
                status_code=409,
                detail="No se puede eliminar un gasto asociado a un proyecto finalizado",
            )

    db.delete(expense)
    db.commit()

def _validate_category(category_id: str, user_id: str, db: Session) -> ExpenseCategory:
    cat = db.query(ExpenseCategory).filter(
        ExpenseCategory.id == category_id,
        ExpenseCategory.user_id == user_id,
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return cat


def _validate_project(project_id: str, user_id: str, db: Session) -> Project:
    p = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user_id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    if p.state == ProjectState.completed:
        raise HTTPException(status_code=409, detail="No se puede asociar un gasto a un proyecto finalizado")
    return p


def _enrich(expense: Expense, db: Session) -> ExpenseResponse:
    cat = None
    if expense.category_id:
        cat = db.query(ExpenseCategory).filter(ExpenseCategory.id == expense.category_id).first()
    
    project_name = None
    if expense.project_id:
        p = db.query(Project).filter(Project.id == expense.project_id).first()
        project_name = p.name if p else None

    return ExpenseResponse(
        id=expense.id,
        user_id=expense.user_id,
        category_id=expense.category_id,
        category_name=cat.name if cat else None,
        category_color=cat.color if cat else None,
        project_id=expense.project_id,
        project_name=project_name,
        amount=float(expense.amount),
        currency=expense.currency,
        date=expense.date,
        description=expense.description,
    )