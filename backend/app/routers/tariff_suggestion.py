import os
import asyncio
import anthropic
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import get_current_user
from app.models import User, FinancialConfiguration, Revenue, TimeEntry, Project, ContractType, ProjectState
from app.schemas.financial_profile import TariffSuggestionRequest, RateAdjustmentSuggestion, ProjectRateAdjustmentSuggestion

PRICED_CONTRACT_TYPES = (ContractType.fixed_price, ContractType.retainer)

router = APIRouter(prefix="/tariff", tags=["tariff"])

LEVEL_MULTIPLIERS = {"0-1": 1.2, "1-3": 1.2, "3-5": 1.5, "5-10": 2.0, "10+": 2.0}
LEVEL_LABELS = {"0-1": "Junior", "1-3": "Junior/Mid", "3-5": "Mid/Senior", "5-10": "Senior", "10+": "Expert"}


def _build_prompt(req: TariffSuggestionRequest) -> str:
    min_rate = (req.desired_salary + req.fixed_expenses) / req.monthly_hours
    multiplier = LEVEL_MULTIPLIERS.get(req.years_of_experience or "1-3", 1.5)
    level = LEVEL_LABELS.get(req.years_of_experience or "1-3", "Mid")
    market_rate = round(min_rate * multiplier, 2)
    gap = round(req.current_hourly_rate - min_rate, 2)
    status = "por encima" if gap >= 0 else "por debajo"

    return f"""Eres un asesor financiero experto en carreras freelance.
Analiza la situación tarifaria de este freelancer y dá un análisis conciso, accionable y motivador en español.

## Perfil del freelancer
- Profesión: {req.profession}
- Experiencia: {req.years_of_experience} años → nivel {level}
- País: {req.country or "no especificado"}
- Moneda: {req.coin_type}

## Datos financieros
- Sueldo pretendido mensual: {req.coin_type} {req.desired_salary:,.0f}
- Gastos fijos mensuales: {req.coin_type} {req.fixed_expenses:,.0f}
- Horas disponibles al mes: {req.monthly_hours:.0f} h

## Cálculo de tarifa mínima
- Tarifa mínima (cobertura de costos): {req.coin_type} {min_rate:.2f}/hora
- Tarifa actual del freelancer: {req.coin_type} {req.current_hourly_rate:.2f}/hora
- Estado: está {abs(gap):.2f} {req.coin_type} {status} de la tarifa mínima
- Tarifa de mercado sugerida ({level} × {multiplier}x): {req.coin_type} {market_rate:.2f}/hora

## Tu tarea
Redactá un análisis de 3-4 párrafos breves que incluya:
1. Diagnóstico claro de la situación actual (¿está cubriendo costos? ¿cuánto margen tiene?)
2. Una recomendación concreta de tarifa objetivo con justificación de mercado
3. Dos acciones inmediatas específicas para alcanzar esa tarifa
4. Una perspectiva motivadora sobre el potencial de crecimiento

Sé directo, usa números concretos y tutea al freelancer."""


async def _stream_anthropic(prompt: str):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        yield "data: [ERROR] ANTHROPIC_API_KEY no configurada en el servidor.\n\n"
        return

    client = anthropic.Anthropic(api_key=api_key)
    try:
        with client.messages.stream(
            model="claude-haiku-4-5-20251001",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            for text in stream.text_stream:
                # Escape newlines so each SSE message is a single line
                escaped = text.replace("\n", "\\n")
                yield f"data: {escaped}\n\n"
                await asyncio.sleep(0)  # yield control to event loop
    except Exception as e:
        yield f"data: [ERROR] {str(e)}\n\n"
    finally:
        yield "data: [DONE]\n\n"


CONTRACT_TYPE_LABELS = {
    "fixed_price": "precio fijo",
    "retainer": "retainer",
    "hourly": "por hora",
}


def _build_rate_adjustment_prompt(suggestion: RateAdjustmentSuggestion, project: ProjectRateAdjustmentSuggestion, user: User) -> str:
    level_key = user.years_of_experience or "1-3"
    multiplier = LEVEL_MULTIPLIERS.get(level_key, 1.5)
    level = LEVEL_LABELS.get(level_key, "Mid")
    market_rate = round(project.suggested_hourly_rate * multiplier, 2)
    gap = round(project.suggested_hourly_rate - suggestion.current_hourly_rate, 2)
    income_gap = round(project.potential_income - project.actual_income, 2)
    contract_label = CONTRACT_TYPE_LABELS.get(project.contract_type, project.contract_type)

    return f"""Eres un asesor financiero experto en carreras freelance.
Un freelancer cerró un proyecto que, cobrado a su tarifa horaria actual, habría sido más rentable de lo que terminó siendo.
El sistema le sugiere ajustar la tarifa para proyectos similares. Dale contexto de mercado para trabajos similares y un análisis conciso, accionable y motivador en español.

## Perfil del freelancer
- Profesión: {user.profession}
- Experiencia: {user.years_of_experience or "no especificado"} años → nivel {level}
- País: {user.country or "no especificado"}
- Moneda: {suggestion.currency}

## Proyecto analizado
- Nombre: {project.project_name}
- Modalidad de contratación: {contract_label}
- Horas trabajadas: {project.total_hours:.1f} h
- Lo presupuestado/cobrado: {suggestion.currency} {project.actual_income:.2f}
- Lo que hubiera facturado a tu tarifa actual ({project.total_hours:.1f}h × {suggestion.currency} {suggestion.current_hourly_rate:.2f}/hora): {suggestion.currency} {project.potential_income:.2f}
- Diferencia: {suggestion.currency} {income_gap:.2f} menos de lo que podrías haber facturado
- Tarifa efectiva real (presupuestado/cobrado / horas trabajadas): {suggestion.currency} {project.effective_hourly_rate:.2f}/hora

## Datos de referencia
- Tarifa actual configurada: {suggestion.currency} {suggestion.current_hourly_rate:.2f}/hora
- Margen mínimo configurado: {suggestion.threshold_margin_pct:.0f}%
- Tarifa sugerida para proyectos similares de {contract_label}: {suggestion.currency} {project.suggested_hourly_rate:.2f}/hora

## Referencia de mercado
- Tarifa de mercado estimada para nivel {level} en {user.profession} ({multiplier}x sobre la tarifa sugerida): {suggestion.currency} {market_rate:.2f}/hora

## Tu tarea
Redactá un análisis de 3 párrafos breves que incluya:
1. Qué significa haber dejado {suggestion.currency} {income_gap:.2f} sobre la mesa en "{project.project_name}", y por qué cotizar por {suggestion.currency} {gap:.2f}/hora más en proyectos similares evitaría esto
2. Cómo se compara la tarifa sugerida con lo que cobran freelancers de nivel {level} en trabajos similares de {user.profession}
3. Una recomendación concreta para cotizar proyectos de {contract_label} de este tipo a futuro

Sé directo, usa números concretos y tutea al freelancer."""


def _compute_rate_adjustment(db: Session, user: User) -> RateAdjustmentSuggestion:
    config = db.query(FinancialConfiguration).filter(
        FinancialConfiguration.user_id == user.id
    ).first()

    if not config or not config.hourly_rate:
        return RateAdjustmentSuggestion(
            has_suggestion=False,
            current_hourly_rate=0,
            threshold_margin_pct=0,
            currency="USD",
            reason="Configurá tu tarifa por hora y margen de ganancia para recibir sugerencias.",
        )

    hourly_rate = config.hourly_rate
    threshold = config.profit_margin or 0
    min_acceptable_rate = hourly_rate * (1 - threshold / 100)

    # Por cada proyecto finalizado de precio fijo o retainer, estimamos cuánto se
    # habría facturado cobrando las horas trabajadas a la tarifa actual
    # (potential_income) y lo comparamos contra lo presupuestado o cobrado
    # finalmente (actual_income). Si lo cobrado quedó por debajo del margen
    # configurado sobre lo que se podría haber facturado, el proyecto pudo haber
    # sido más rentable.
    projects: list[ProjectRateAdjustmentSuggestion] = []

    for proj in db.query(Project).filter(
        Project.user_id == user.id,
        Project.state == ProjectState.completed,
        Project.contract_type.in_(PRICED_CONTRACT_TYPES),
    ).all():
        total_minutes = float(db.query(func.sum(TimeEntry.duration_minutes)).filter(TimeEntry.project_id == proj.id).scalar() or 0)
        hours = total_minutes / 60.0
        if hours <= 0:
            continue

        total_income = float(db.query(func.sum(Revenue.amount)).filter(Revenue.project_id == proj.id).scalar() or 0)
        actual_income = total_income if total_income > 0 else float(proj.estimated_budget or 0)
        if actual_income <= 0:
            continue

        potential_income = hours * hourly_rate
        effective_rate = actual_income / hours

        below = effective_rate < min_acceptable_rate
        suggested_rate = round(hourly_rate + (min_acceptable_rate - effective_rate), 2) if below else None

        projects.append(ProjectRateAdjustmentSuggestion(
            project_id=proj.id,
            project_name=proj.name,
            contract_type=proj.contract_type.value,
            total_hours=round(hours, 2),
            actual_income=round(actual_income, 2),
            potential_income=round(potential_income, 2),
            effective_hourly_rate=round(effective_rate, 2),
            has_suggestion=below,
            suggested_hourly_rate=suggested_rate,
        ))

    if not projects:
        return RateAdjustmentSuggestion(
            has_suggestion=False,
            current_hourly_rate=hourly_rate,
            min_acceptable_rate=round(min_acceptable_rate, 2),
            threshold_margin_pct=threshold,
            currency=config.coin_type,
            reason="Necesitás proyectos finalizados de precio fijo o retainer con horas e ingresos registrados para evaluar si tu tarifa está desactualizada.",
        )

    has_any = any(p.has_suggestion for p in projects)
    return RateAdjustmentSuggestion(
        has_suggestion=has_any,
        current_hourly_rate=hourly_rate,
        min_acceptable_rate=round(min_acceptable_rate, 2),
        threshold_margin_pct=threshold,
        currency=config.coin_type,
        reason="Algunos de tus proyectos de precio fijo/retainer tuvieron una rentabilidad por debajo del margen configurado." if has_any else None,
        projects=projects,
    )


async def _stream_no_suggestion_message():
    message = "Tu tarifa actual está alineada con tu rentabilidad esperada, no necesitás ajustarla por el momento."
    yield f"data: {message}\n\n"
    yield "data: [DONE]\n\n"


@router.post("/suggest")
async def suggest_tariff(req: TariffSuggestionRequest):
    prompt = _build_prompt(req)
    return StreamingResponse(
        _stream_anthropic(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/rate-adjustment", response_model=RateAdjustmentSuggestion)
def get_rate_adjustment_suggestion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _compute_rate_adjustment(db, current_user)


@router.post("/rate-adjustment/insight/{project_id}")
async def get_rate_adjustment_insight(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suggestion = _compute_rate_adjustment(db, current_user)
    project = next((p for p in suggestion.projects if p.project_id == project_id), None)

    if not project or not project.has_suggestion or project.suggested_hourly_rate is None:
        return StreamingResponse(
            _stream_no_suggestion_message(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    prompt = _build_rate_adjustment_prompt(suggestion, project, current_user)
    return StreamingResponse(
        _stream_anthropic(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
