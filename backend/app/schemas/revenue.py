from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date as Date


VALID_PAYMENT_TYPES = {"monetario", "canje"}
VALID_PAYMENT_METHODS = {"Transferencia", "Efectivo", "Tarjeta", "PayPal", "Canje", "Otro"}


class RevenueCreate(BaseModel):
    amount: float
    currency: str
    date: Date
    payment_type: str
    payment_method: str
    description: Optional[str] = None
    project_id: Optional[str] = None
    client_id: Optional[str] = None
    receipt_id: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("El monto debe ser mayor a 0")
        return v

    @field_validator("payment_type")
    @classmethod
    def validate_payment_type(cls, v):
        if v not in VALID_PAYMENT_TYPES:
            raise ValueError(f"El tipo de pago debe ser uno de: {', '.join(VALID_PAYMENT_TYPES)}")
        return v

    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, v):
        if v not in VALID_PAYMENT_METHODS:
            raise ValueError(f"El método de pago debe ser uno de: {', '.join(VALID_PAYMENT_METHODS)}")
        return v


class RevenueUpdate(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    date: Date | None = None
    payment_type: Optional[str] = None
    payment_method: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[str] = None
    client_id: Optional[str] = None
    receipt_id: str | None = None

    _validate_amount = field_validator("amount")(RevenueCreate.amount_positive)
    _validate_type = field_validator("payment_type")(RevenueCreate.validate_payment_type)
    _validate_method = field_validator("payment_method")(RevenueCreate.validate_payment_method)


class RevenueResponse(BaseModel):
    id: str
    user_id: str
    amount: float
    currency: str
    date: Date
    payment_type: str
    payment_method: str
    description: Optional[str] = None
    project_id: Optional[str] = None
    client_id: Optional[str] = None
    receipt_id:     Optional[str] = None
    project_name: Optional[str] = None
    client_name: Optional[str] = None

    class Config:
        from_attributes = True
