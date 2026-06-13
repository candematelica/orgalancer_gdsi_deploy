from pydantic import BaseModel, field_validator
from typing import ClassVar, Optional


class FinancialConfig(BaseModel):
    coin_type: str
    hourly_rate: float
    profit_margin: float

    VALID_COINS: ClassVar[list[str]] = [
        'USD',
        'EUR',
        'GBP',
        'ARS',
        'MXN',
        'CLP',
        'COP',
        'BRL',
        'JPY'
    ]

    @field_validator("coin_type")
    @classmethod
    def validate_coin(cls, v):
        coin = v.strip().upper()
        if not coin:
            raise ValueError("El tipo de moneda no puede estar vacío")
        if coin not in cls.VALID_COINS:
            raise ValueError(f"El tipo de moneda debe ser uno de: {', '.join(cls.VALID_COINS)}")
        return coin

    @field_validator("hourly_rate")
    @classmethod
    def validate_rate(cls, v):
        if v < 0:
            raise ValueError("La tarifa horaria debe ser un valor positivo")
        return v

    @field_validator("profit_margin")
    @classmethod
    def validate_margin(cls, v):
        if v < 0 or v >= 100:
            raise ValueError("El margen de beneficio debe ser un valor entre 0 y 100")
        return v

class FinancialConfigResponse(BaseModel):
    coin_type: str
    hourly_rate: float
    profit_margin: float
    desired_salary: Optional[float] = 0.0
    monthly_hours: Optional[float] = 160.0
    fixed_expenses: Optional[float] = 0.0

    class Config:
        from_attributes = True


class TariffSuggestionRequest(BaseModel):
    user_id: str
    desired_salary: float
    monthly_hours: float
    fixed_expenses: float
    current_hourly_rate: float
    coin_type: str
    profession: str
    years_of_experience: Optional[str] = "1-3"
    country: Optional[str] = None


class ProjectRateAdjustmentSuggestion(BaseModel):
    project_id: str
    project_name: str
    contract_type: str
    effective_hourly_rate: float
    total_hours: float
    has_suggestion: bool
    suggested_hourly_rate: Optional[float] = None


class RateAdjustmentSuggestion(BaseModel):
    has_suggestion: bool
    current_hourly_rate: float
    min_acceptable_rate: Optional[float] = None
    threshold_margin_pct: float
    currency: str
    reason: Optional[str] = None
    projects: list[ProjectRateAdjustmentSuggestion] = []