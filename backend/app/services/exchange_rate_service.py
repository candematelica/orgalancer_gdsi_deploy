"""Exchange rate service with DolarApi integration."""

import httpx
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import ExchangeRate

logger = logging.getLogger(__name__)

DOLARAPI_BASE_URL = "https://dolarapi.com/v1"
CACHE_TTL_SECONDS = 3600  # 1 hour


class ExchangeRateCache:
    """Simple in-memory cache for exchange rates."""
    
    def __init__(self):
        self.data = {}
        self.timestamp = None
    
    def is_valid(self) -> bool:
        """Check if cache is still valid (not expired)."""
        if not self.timestamp:
            return False
        elapsed = datetime.now() - self.timestamp
        return elapsed.total_seconds() < CACHE_TTL_SECONDS
    
    def set(self, key: str, value: dict):
        """Store value in cache."""
        self.data[key] = value
        self.timestamp = datetime.now()
    
    def get(self, key: str):
        """Retrieve value from cache if valid."""
        if self.is_valid():
            return self.data.get(key)
        return None
    
    def clear(self):
        """Clear cache."""
        self.data = {}
        self.timestamp = None


class ExchangeRateService:
    """Service for managing exchange rates from DolarApi.com."""
    
    def __init__(self):
        self.cache = ExchangeRateCache()
    
    async def fetch_from_dolarapi(self) -> dict:
        """
        Fetch exchange rates from DolarApi.com.
        
        Returns:
            dict: Mapping of currency pairs to rates
            {
                'USD_ARS': {'compra': 870, 'venta': 880, ...},
                'USD_EUR': {'compra': 0.92, 'venta': 0.93, ...},
                ...
            }
        
        Raises:
            httpx.HTTPError: If API request fails
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{DOLARAPI_BASE_URL}/dolares",
                    timeout=10
                )
                response.raise_for_status()
                
                data = response.json()
                logger.info(f"✅ Fetched {len(data)} exchange rates from DolarApi")
                
                # Process data into our format
                rates_dict = {}
                for rate_data in data:
                    casa = rate_data.get('casa', 'Unknown')
                    compra = rate_data.get('compra', 0)
                    venta = rate_data.get('venta', 0)
                    moneda = rate_data.get('moneda', 'USD')
                    nombre = rate_data.get('nombre', casa)
                    
                    # Use average of compra/venta as the rate
                    avg_rate = (compra + venta) / 2 if compra and venta else 0
                    
                    key = f"USD_{moneda}"
                    if key not in rates_dict:
                        rates_dict[key] = {
                            'rate': avg_rate,
                            'source': casa,
                            'compra': compra,
                            'venta': venta,
                            'nombre': nombre
                        }
                
                # Cache the result
                self.cache.set('dolarapi_rates', rates_dict)
                return rates_dict
                
        except httpx.TimeoutException:
            logger.error("❌ DolarApi request timed out")
            raise
        except httpx.HTTPError as e:
            logger.error(f"❌ DolarApi request failed: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ Unexpected error fetching from DolarApi: {e}")
            raise
    
    def get_cached_rates(self) -> dict:
        """Get rates from cache if available and valid."""
        cached = self.cache.get('dolarapi_rates')
        if cached:
            logger.info("🔄 Using cached exchange rates")
        return cached
    
    async def sync_rates_to_db(self, db: Session) -> dict:
        """
        Fetch rates from DolarApi and save to database.
        
        Args:
            db: SQLAlchemy session
        
        Returns:
            dict: Status information
        """
        try:
            # Try to fetch fresh rates from API
            rates_dict = await self.fetch_from_dolarapi()
        except Exception as e:
            # Fallback to cache if available
            cached = self.get_cached_rates()
            if cached:
                logger.warning(f"⚠️  Using cached rates due to API error: {e}")
                rates_dict = cached
            else:
                logger.error("❌ Could not fetch rates and cache is empty")
                return {
                    'status': 'error',
                    'message': f'Failed to fetch rates: {str(e)}',
                    'synced_count': 0
                }
        
        try:
            # Save/update rates in database
            synced_count = 0
            for pair_key, rate_info in rates_dict.items():
                from_curr, to_curr = pair_key.split('_')
                
                # Check if rate exists
                existing = db.query(ExchangeRate).filter(
                    ExchangeRate.from_currency == from_curr,
                    ExchangeRate.to_currency == to_curr
                ).first()
                
                if existing:
                    # Update existing
                    existing.rate = rate_info['rate']
                    existing.updated_at = datetime.utcnow()
                else:
                    # Create new
                    new_rate = ExchangeRate(
                        from_currency=from_curr,
                        to_currency=to_curr,
                        rate=rate_info['rate']
                    )
                    db.add(new_rate)
                
                synced_count += 1
            
            db.commit()
            logger.info(f"✅ Synced {synced_count} exchange rates to database")
            
            return {
                'status': 'success',
                'synced_count': synced_count,
                'message': f'Successfully synced {synced_count} rates'
            }
        
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to save rates to DB: {e}")
            return {
                'status': 'error',
                'message': f'Failed to save to database: {str(e)}',
                'synced_count': 0
            }
    
    def get_rate_from_db(self, db: Session, from_curr: str, to_curr: str) -> float:
        """Get rate from database with optional fallback."""
        try:
            rate = db.query(ExchangeRate).filter(
                ExchangeRate.from_currency == from_curr,
                ExchangeRate.to_currency == to_curr
            ).first()
            
            if rate:
                return rate.rate
            
            logger.warning(f"⚠️  Rate not found for {from_curr}→{to_curr}")
            return None
        except Exception as e:
            logger.error(f"❌ Error getting rate from DB: {e}")
            return None


# Global service instance
exchange_rate_service = ExchangeRateService()
