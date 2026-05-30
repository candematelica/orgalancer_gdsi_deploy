from sqlalchemy import func
from app.models import Project, FinancialConfiguration, Revenue, TimeEntry, Expense

class ProfitCalculator:
    @staticmethod
    def get_project_profitability(db, project_id: str, user_id: str):
        project = db.query(Project).filter_by(id=project_id, user_id=user_id).first()
        if not project:
            raise ValueError("Proyecto no encontrado")
        config  = db.query(FinancialConfiguration).filter_by(user_id=user_id).first()

        # Income
        total_income = db.query(func.sum(Revenue.amount))\
            .filter_by(project_id=project_id, user_id=user_id).scalar() or 0

        # Hours
        total_minutes = db.query(func.sum(TimeEntry.duration_minutes))\
            .filter_by(project_id=project_id, user_id=user_id).scalar() or 0
        total_hours = float(total_minutes) / 60
        hourly_rate = config.hourly_rate if config else 0
        labor_cost  = total_hours * hourly_rate

        # Expenses
        total_expenses = db.query(func.sum(Expense.amount))\
            .filter(Expense.project_id == project_id, Expense.user_id == user_id)\
            .scalar() or 0

        profitability = float(total_income) - labor_cost - float(total_expenses)

        return {
            "project_id":       project_id,
            "total_income":     float(total_income),
            "total_hours":      round(total_hours, 2),
            "labor_cost":       round(labor_cost, 2),
            "total_expenses":   float(total_expenses),
            "profitability":    round(profitability, 2),
            "is_negative":      profitability < 0,
       }
