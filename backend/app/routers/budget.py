import os
import asyncio
import uuid
from datetime import datetime
import anthropic
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.routers.auth import get_current_user
from app.models import Budget
from app.schemas.budget import BudgetRequest, BudgetCreate, BudgetResponse

router = APIRouter(prefix="/budget", tags=["budget"])


def _build_prompt(req: BudgetRequest) -> str:
    return f"""Eres un asistente experto en presupuestación para freelancers. \
Tu tarea es analizar la descripción de un trabajo y generar un presupuesto profesional y detallado en español.

## Perfil del freelancer
- Profesión: {req.profession}
- Tarifa horaria: {req.currency} {req.hourly_rate:.2f}/hora
- Moneda: {req.currency}

## Descripción del trabajo recibida
"{req.description}"

## Tu tarea
Generá un presupuesto estructurado con el siguiente formato exacto:

### Alcance del proyecto
[2-3 oraciones resumiendo qué incluye el trabajo, qué entregables se esperan y qué está fuera del alcance]

### Desglose de horas estimadas
| Tarea | Horas estimadas |
|-------|----------------|
[Lista cada tarea principal con su estimación de horas, sé específico]
| **Total** | **XX horas** |

### Monto sugerido
- Horas totales estimadas: XX horas
- Tarifa horaria: {req.currency} {req.hourly_rate:.2f}/hora
- **Total: {req.currency} [TOTAL CALCULADO]**

### Notas y recomendaciones
[2-3 puntos breves: términos de pago sugeridos, contingencias, o aclaraciones importantes para este tipo de proyecto]

Sé preciso con los números. El total debe ser exactamente horas × tarifa horaria. \
Tutea al freelancer y sé conciso pero profesional."""


async def _stream_anthropic(prompt: str):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        yield "data: [ERROR] ANTHROPIC_API_KEY no configurada.\n\n"
        return

    client = anthropic.Anthropic(api_key=api_key)
    try:
        with client.messages.stream(
            model="claude-haiku-4-5-20251001",
            max_tokens=1200,
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            for text in stream.text_stream:
                escaped = text.replace("\n", "\\n")
                yield f"data: {escaped}\n\n"
                await asyncio.sleep(0)
    except Exception as e:
        yield f"data: [ERROR] {str(e)}\n\n"
    finally:
        yield "data: [DONE]\n\n"


@router.post("", response_model=BudgetResponse, status_code=201)
def save_budget(
    body: BudgetCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    budget = Budget(
        id           = str(uuid.uuid4()),
        user_id      = user.id,
        project_id   = body.project_id,
        client_id    = body.client_id,
        name         = body.name,
        total_amount = body.total_amount,
        currency     = body.currency,
        description  = body.description,
        created_at   = datetime.utcnow(),
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)

    return BudgetResponse(
        id           = budget.id,
        user_id      = budget.user_id,
        project_id   = budget.project_id,
        client_id    = budget.client_id,
        name         = budget.name,
        total_amount = float(budget.total_amount),
        currency     = budget.currency,
        description  = budget.description,
        created_at   = budget.created_at,
        project_name = budget.project.name if budget.project else None,
        client_name  = budget.client.name  if budget.client  else None,
    )


@router.get("", response_model=list[BudgetResponse])
def list_budgets(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    budgets = db.query(Budget).filter(Budget.user_id == user.id).order_by(Budget.created_at.desc()).all()
    return [
        BudgetResponse(
            id           = b.id,
            user_id      = b.user_id,
            project_id   = b.project_id,
            client_id    = b.client_id,
            name         = b.name,
            total_amount = float(b.total_amount),
            currency     = b.currency,
            description  = b.description,
            created_at   = b.created_at,
            project_name = b.project.name if b.project else None,
            client_name  = b.client.name  if b.client  else None,
        )
        for b in budgets
    ]


@router.post("/generate")
async def generate_budget(req: BudgetRequest):
    prompt = _build_prompt(req)
    return StreamingResponse(
        _stream_anthropic(prompt),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
