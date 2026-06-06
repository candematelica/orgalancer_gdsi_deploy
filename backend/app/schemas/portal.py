from datetime import date
from typing import List, Optional
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

    class Config:
        from_attributes = True