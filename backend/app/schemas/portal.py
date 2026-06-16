from datetime import date, datetime
from typing import List, Literal, Optional
from pydantic import BaseModel


class PortalTokenResponse(BaseModel):
    token: str

class PortalTaskItem(BaseModel):
    id: str
    title: str
    status: str

class PortalReceiptItem(BaseModel):
    id: str
    concept: str
    amount: float
    date_emitted: date
    status: str  # "pending" | "paid" | "cancelled"

class PortalBudgetItem(BaseModel):
    id: str
    name: str
    total_amount: float
    currency: str
    description: Optional[str] = None
    status: str  # "pending" | "approved" | "rejected"
    created_at: datetime
    responded_at: Optional[datetime] = None

class PortalBudgetRespondRequest(BaseModel):
    decision: Literal["approved", "rejected"]

class PortalProjectResponse(BaseModel):
    name: str
    description: Optional[str] = None
    state: str
    progress_percentage: int
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    client_name: Optional[str] = None
    tasks: List[PortalTaskItem] = []
    receipts: List[PortalReceiptItem] = []
    budgets: List[PortalBudgetItem] = []

    class Config:
        from_attributes = True