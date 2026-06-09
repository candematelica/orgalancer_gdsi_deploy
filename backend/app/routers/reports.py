from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
from collections import defaultdict
import calendar

from app.database import get_db
from app.routers.auth import get_current_user
from app.models import User, Revenue, Expense, Project, Client, TimeEntry
from app.schemas.reports import CashFlowReport, CashFlowPeriod, ProfitabilityReport, ProjectProfitability

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/cash-flow", response_model=CashFlowReport)
def get_cash_flow(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    client_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rev_query = db.query(Revenue).filter(Revenue.user_id == current_user.id)
    if start_date: rev_query = rev_query.filter(Revenue.date >= start_date)
    if end_date: rev_query = rev_query.filter(Revenue.date <= end_date)
    if client_id: rev_query = rev_query.filter(Revenue.client_id == client_id)
    if project_id: rev_query = rev_query.filter(Revenue.project_id == project_id)

    revenues = rev_query.all() if not category_id else []

    exp_query = db.query(Expense).filter(Expense.user_id == current_user.id)
    if start_date: exp_query = exp_query.filter(Expense.date >= start_date)
    if end_date: exp_query = exp_query.filter(Expense.date <= end_date)
    if project_id: exp_query = exp_query.filter(Expense.project_id == project_id)
    if category_id: exp_query = exp_query.filter(Expense.category_id == category_id)
    if client_id: exp_query = exp_query.join(Project, Expense.project_id == Project.id).filter(Project.client_id == client_id)
    
    expenses = exp_query.all()

    period_data = defaultdict(lambda: {"income": 0.0, "expenses": 0.0})
    
    total_income = 0.0
    for rev in revenues:
        period_str = f"{rev.date.year}-{rev.date.month:02d}"
        period_data[period_str]["income"] += float(rev.amount)
        total_income += float(rev.amount)
        
    total_expenses = 0.0
    for exp in expenses:
        period_str = f"{exp.date.year}-{exp.date.month:02d}"
        period_data[period_str]["expenses"] += float(exp.amount)
        total_expenses += float(exp.amount)

    periods = []
    for p in sorted(period_data.keys()):
        inc = period_data[p]["income"]
        exc = period_data[p]["expenses"]
        periods.append(CashFlowPeriod(
            period=p,
            income=inc,
            expenses=exc,
            balance=inc - exc
        ))

    return CashFlowReport(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=total_income - total_expenses,
        periods=periods
    )

@router.get("/profitability", response_model=ProfitabilityReport)
def get_profitability(
    client_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project).filter(Project.user_id == current_user.id)
    if client_id: query = query.filter(Project.client_id == client_id)
    if project_id: query = query.filter(Project.id == project_id)
    projects = query.all()

    report_projects = []
    for proj in projects:
        revs = db.query(func.sum(Revenue.amount)).filter(Revenue.project_id == proj.id).scalar()
        total_rev = float(revs) if revs else 0.0
        
        exp_query = db.query(func.sum(Expense.amount)).filter(Expense.project_id == proj.id)
        if category_id: exp_query = exp_query.filter(Expense.category_id == category_id)

        exps = exp_query.scalar()
        total_exp = float(exps) if exps else 0.0

        hours = db.query(func.sum(TimeEntry.duration_minutes)).filter(TimeEntry.project_id == proj.id).scalar()
        total_minutes = float(hours) if hours else 0.0
        invested_hours = total_minutes / 60.0
        
        margin = total_rev - total_exp
        effective_rate = margin / invested_hours if invested_hours > 0 else 0.0

        report_projects.append(ProjectProfitability(
            project_id=proj.id,
            project_name=proj.name,
            client_name=proj.client.name if proj.client else None,
            total_revenue=total_rev,
            total_expenses=total_exp,
            margin=margin,
            invested_hours=invested_hours,
            effective_hourly_rate=effective_rate
        ))

    return ProfitabilityReport(projects=report_projects)
