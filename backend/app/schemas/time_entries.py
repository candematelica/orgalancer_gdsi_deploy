from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import date
from typing import Optional
from app.models import TimeSource


class TimeEntryCreate(BaseModel):
    project_id:       str
    task_id:          Optional[str] = None
    entry_date:       date
    duration_minutes: int = Field(gt=0, le=1440)  # max 24hs
    description:      Optional[str] = None
    source:           TimeSource = TimeSource.manual

    @field_validator("project_id")
    @classmethod
    def project_id_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("project_id no puede estar vacío")
        return v

    @field_validator("entry_date")
    @classmethod
    def date_not_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("La fecha no puede ser futura")
        return v


class TimeEntryUpdate(BaseModel):
    entry_date:       Optional[date] = None
    duration_minutes: Optional[int] = Field(default=None, gt=0, le=1440)
    description:      Optional[str] = None

    @field_validator("entry_date")
    @classmethod
    def date_not_future(cls, v: Optional[date]) -> Optional[date]:
        if v and v > date.today():
            raise ValueError("La fecha no puede ser futura")
        return v

    @field_validator("duration_minutes")
    @classmethod
    def duration_not_negative(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("La duración no puede ser negativa")
        return v

    @model_validator(mode="after")
    def at_least_one_field(self) -> "TimeEntryUpdate":
        if all(v is None for v in self.model_dump().values()):
            raise ValueError("Debe enviar al menos un campo para actualizar")
        return self