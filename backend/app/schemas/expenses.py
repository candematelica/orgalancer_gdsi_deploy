from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date as Date


class ExpenseCategoryCreate(BaseModel):
    name:  str
    color: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("El nombre de la categoría no puede estar vacío")
        return v.strip()

    @field_validator("color")
    @classmethod
    def color_hex(cls, v):
        if v is not None:
            import re
            if not re.fullmatch(r"#[0-9A-Fa-f]{6}", v):
                raise ValueError("El color debe ser un hex válido (ej: #FF5733)")
        return v


class ExpenseCategoryUpdate(BaseModel):
    name:  Optional[str] = None
    color: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError("El nombre no puede estar vacío")
        return v.strip() if v else v

    @field_validator("color")
    @classmethod
    def color_hex(cls, v):
        if v is not None:
            import re
            if not re.fullmatch(r"#[0-9A-Fa-f]{6}", v):
                raise ValueError("El color debe ser un hex válido (ej: #FF5733)")
        return v



class ExpenseCategoryResponse(BaseModel):
    id:      str
    user_id: str
    name:    str
    color:   Optional[str] = None

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    category_id: Optional[str] = None
    amount:      float
    currency:    str
    date:        Date
    description: Optional[str] = None
    project_id:  Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("El monto debe ser mayor a 0")
        return v


class ExpenseUpdate(BaseModel):
    category_id: Optional[str]   = None
    amount:      Optional[float] = None
    currency:    Optional[str]   = None
    date:        Optional[Date]  = None
    description: Optional[str]   = None
    project_id:  Optional[str]   = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("El monto debe ser mayor a 0")
        return v


class ExpenseResponse(BaseModel):
    id:            str
    user_id:       str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    project_id:    Optional[str] = None
    project_name:  Optional[str] = None
    amount:        float
    currency:      str
    date:          Date
    description:   Optional[str] = None

    class Config:
        from_attributes = True