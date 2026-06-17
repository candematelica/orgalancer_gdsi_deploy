from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas.financial_profile import FinancialConfig, FinancialConfigResponse
from app.models import FinancialConfiguration
from app.routers.auth import get_current_user

router = APIRouter(prefix="/finances", tags=["finances"])


@router.get("/me", response_model=FinancialConfigResponse)
def get_my_financial_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    config = db.query(FinancialConfiguration).filter(
        FinancialConfiguration.user_id == current_user.id
    ).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuración financiera no encontrada")
    return config


@router.post("/me", response_model=FinancialConfigResponse)
def upsert_my_financial_profile(
    data: FinancialConfig,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    config = db.query(FinancialConfiguration).filter(
        FinancialConfiguration.user_id == current_user.id
    ).first()

    if config:
        response.status_code = 200
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(config, key, value)
    else:
        response.status_code = 201
        config = FinancialConfiguration(user_id=current_user.id, **data.model_dump())
        db.add(config)

    db.commit()
    db.refresh(config)
    return config


@router.post("/{user_id}", response_model=FinancialConfigResponse)
def edit_financial_profile(user_id: str, data: FinancialConfig, response: Response, db: Session = Depends(get_db)):
    user_exists = db.query(User).filter(User.id == user_id).first()
    if not user_exists:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    config = db.query(FinancialConfiguration).filter(FinancialConfiguration.user_id == user_id).first()

    if config:
        status_code = 200
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(config, key, value)
    else:
        status_code = 201
        config = FinancialConfiguration(user_id=user_id, **data.model_dump())
        db.add(config)

    db.commit()
    db.refresh(config)
    response.status_code = status_code
    return config


@router.get("/{user_id}", response_model=FinancialConfigResponse)
def get_financial_profile(user_id: str, db: Session = Depends(get_db)):
    config = db.query(FinancialConfiguration).filter(FinancialConfiguration.user_id == user_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuración financiera no encontrada")
    return config