"""Router for exchange rate endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import ExchangeRate
from app.schemas import ExchangeRateSchema, ExchangeRateCreateUpdate
from app.services.exchange_rate_service import exchange_rate_service

router = APIRouter(
    prefix="/api/rates",
    tags=["rates"],
)


@router.get("/exchange", response_model=ExchangeRateSchema)
def get_exchange_rate(
    from_currency: str = Query(..., description="Source currency code (e.g., USD)"),
    to_currency: str = Query(..., description="Target currency code (e.g., ARS)"),
    db: Session = Depends(get_db)
):
    """Get exchange rate between two currencies."""
    rate = db.query(ExchangeRate).filter(
        ExchangeRate.from_currency == from_currency.upper(),
        ExchangeRate.to_currency == to_currency.upper()
    ).first()
    
    if not rate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exchange rate from {from_currency} to {to_currency} not found"
        )
    
    return rate


@router.get("/all", response_model=List[ExchangeRateSchema])
def get_all_rates(
    db: Session = Depends(get_db)
):
    """Get all exchange rates."""
    rates = db.query(ExchangeRate).all()
    return rates


@router.post("/exchange", response_model=ExchangeRateSchema, status_code=status.HTTP_201_CREATED)
def create_exchange_rate(
    rate_data: ExchangeRateCreateUpdate,
    db: Session = Depends(get_db)
):
    """Create or update an exchange rate."""
    # Check if rate already exists
    existing = db.query(ExchangeRate).filter(
        ExchangeRate.from_currency == rate_data.from_currency,
        ExchangeRate.to_currency == rate_data.to_currency
    ).first()
    
    if existing:
        # Update existing rate
        existing.rate = rate_data.rate
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new rate
    rate = ExchangeRate(
        from_currency=rate_data.from_currency,
        to_currency=rate_data.to_currency,
        rate=rate_data.rate
    )
    
    db.add(rate)
    db.commit()
    db.refresh(rate)
    
    return rate


@router.put("/exchange", response_model=ExchangeRateSchema)
def update_exchange_rate(
    from_currency: str = Query(...),
    to_currency: str = Query(...),
    rate_data: ExchangeRateCreateUpdate = None,
    db: Session = Depends(get_db)
):
    """Update an exchange rate."""
    rate = db.query(ExchangeRate).filter(
        ExchangeRate.from_currency == from_currency.upper(),
        ExchangeRate.to_currency == to_currency.upper()
    ).first()
    
    if not rate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exchange rate from {from_currency} to {to_currency} not found"
        )
    
    if rate_data and rate_data.rate:
        rate.rate = rate_data.rate
    
    db.commit()
    db.refresh(rate)
    
    return rate


@router.post("/sync", status_code=status.HTTP_200_OK)
async def sync_exchange_rates(db: Session = Depends(get_db)):
    """
    Fetch and sync exchange rates from DolarApi.com to database.
    
    This endpoint:
    1. Calls DolarApi.com to get current rates
    2. Caches the result for 1 hour
    3. Saves rates to database
    4. Returns sync status
    
    Returns:
        dict: {'status': 'success'|'error', 'synced_count': int, 'message': str}
    
    Raises:
        HTTPException: If sync fails completely
    """
    result = await exchange_rate_service.sync_rates_to_db(db)
    
    if result['status'] == 'error':
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result['message']
        )
    
    return result
