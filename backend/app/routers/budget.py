import os
import asyncio
import anthropic
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.schemas.budget import BudgetRequest

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


@router.post("/generate")
async def generate_budget(req: BudgetRequest):
    prompt = _build_prompt(req)
    return StreamingResponse(
        _stream_anthropic(prompt),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
