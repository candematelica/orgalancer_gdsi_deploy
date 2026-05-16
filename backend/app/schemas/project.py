from enum import Enum
from typing import Optional
from pydantic import BaseModel, field_validator
from app.models import ContractType, ProjectState
from datetime import date

class ProjectCreate(BaseModel):
    client_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    contract_type: ContractType
    estimated_budget: float
    deadline: Optional[date] = None

    @field_validator("contract_type")
    @classmethod
    def validate_contract_type(cls, v):
        if not isinstance(v, ContractType):
            raise ValueError("El tipo de contrato debe ser un valor válido")
        return v
    
    @field_validator("estimated_budget")
    @classmethod
    def validate_budget(cls, v):
        if v < 0:
            raise ValueError("El presupuesto estimado debe ser un valor positivo")
        return v
    
    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, v):
        if v is None:       
            return v
        if v < date.today():
            raise ValueError("La fecha límite no puede ser anterior a la fecha actual")
        return v

class ProjectListItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    state: ProjectState
    contract_type: ContractType
    estimated_budget: float
    earned: float
    start_date: Optional[date] = None
    deadline: Optional[date] = None

    client_id: Optional[str] = None
    client_name: Optional[str] = None

    total_tasks: int = 0
    completed_tasks: int = 0
    progress_percentage: int = 0

    days_until_deadline: Optional[int] = None
    deadline_alert: Optional[str] = None  # "urgent" | "warning" | "soon" | None

    class Config:
        from_attributes = True

class ProjectSummary(BaseModel):
    active_count: int
    total_earned: float
    total_budget: float

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    name: str
    description: Optional[str] = None
    contract_type: ContractType
    state: ProjectState
    estimated_budget: float
    earned: float
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    
    total_tasks: int = 0
    completed_tasks: int = 0
    progress_percentage: int = 0
    days_until_deadline: Optional[int] = None
    deadline_alert: Optional[str] = None

    class Config:
        from_attributes = True