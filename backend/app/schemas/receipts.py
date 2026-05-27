from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date

from app.models import ReceiptStatus


class ReceiptCreate(BaseModel):
    client_id:    Optional[str]  = None
    project_id:   Optional[str]  = None
    concept:      str
    amount:       float
    date_emitted: date

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v


class ReceiptUpdate(BaseModel):
    client_id:    Optional[str]           = None
    project_id:   Optional[str]           = None
    concept:      Optional[str]           = None
    amount:       Optional[float]         = None
    date_emitted: Optional[date]          = None
    status:       Optional[ReceiptStatus] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v


class ReceiptResponse(BaseModel):
    id:           str
    user_id:      str
    project_id:   Optional[str] = None
    client_id:    Optional[str] = None
    project_name: Optional[str] = None
    client_name:  Optional[str] = None
    concept:      str
    amount:       float
    date_emitted: date
    status:       ReceiptStatus

    class Config:
        from_attributes = True