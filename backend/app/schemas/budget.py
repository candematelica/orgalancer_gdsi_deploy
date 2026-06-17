from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BudgetRequest(BaseModel):
    description: str
    hourly_rate: float
    currency:    str
    profession:  str


class BudgetCreate(BaseModel):
    name:         str
    total_amount: float
    currency:     str
    description:  Optional[str] = None
    project_id:   Optional[str] = None
    client_id:    Optional[str] = None


class BudgetResponse(BaseModel):
    id:           str
    user_id:      str
    project_id:   Optional[str]
    client_id:    Optional[str]
    name:         str
    total_amount: float
    currency:     str
    description:  Optional[str]
    status:       str
    responded_at: Optional[datetime] = None
    created_at:   datetime

    project_name: Optional[str] = None
    client_name:  Optional[str] = None

    class Config:
        from_attributes = True
