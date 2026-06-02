from pydantic import BaseModel

class BudgetRequest(BaseModel):
    description: str         # texto libre del freelancer
    hourly_rate: float       # tarifa horaria del usuario
    currency: str            # USD, ARS, EUR, etc.
    profession: str          # para contexto del prompt