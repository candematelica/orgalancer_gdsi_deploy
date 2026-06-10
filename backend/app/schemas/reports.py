from pydantic import BaseModel
from typing import List, Optional

class CashFlowPeriod(BaseModel):
    period: str
    income: float
    expenses: float
    balance: float

class CashFlowReport(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float
    periods: List[CashFlowPeriod]

class ProjectProfitability(BaseModel):
    project_id: str
    project_name: str
    client_name: Optional[str]
    total_revenue: float
    total_expenses: float
    margin: float
    invested_hours: float
    effective_hourly_rate: float

class ProfitabilityReport(BaseModel):
    projects: List[ProjectProfitability]
