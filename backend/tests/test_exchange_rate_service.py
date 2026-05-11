"""Tests for ExchangeRateService."""

import pytest
from sqlalchemy.orm import Session
from app.services.exchange_rate_service import (
    ExchangeRateService,
    ExchangeRateCache,
    CACHE_TTL_SECONDS
)
from app.models import ExchangeRate


class TestExchangeRateCache:
    """Tests for the cache mechanism."""
    
    def test_cache_storage_and_retrieval(self):
        """Test storing and retrieving from cache."""
        cache = ExchangeRateCache()
        test_data = {'USD_ARS': {'rate': 870}}
        
        cache.set('test_key', test_data)
        result = cache.get('test_key')
        
        assert result == test_data
    
    def test_cache_expiration(self):
        """Test cache expiration after TTL."""
        cache = ExchangeRateCache()
        cache.set('test_key', {'rate': 870})
        
        # Simulate expiration by manually changing timestamp
        import datetime
        cache.timestamp = datetime.datetime.now() - datetime.timedelta(
            seconds=CACHE_TTL_SECONDS + 1
        )
        
        result = cache.get('test_key')
        assert result is None
    
    def test_cache_clear(self):
        """Test clearing cache."""
        cache = ExchangeRateCache()
        cache.set('key1', {'rate': 870})
        cache.set('key2', {'rate': 0.92})
        
        cache.clear()
        
        assert cache.get('key1') is None
        assert cache.get('key2') is None


class TestExchangeRateService:
    """Tests for ExchangeRateService."""
    
    def test_get_rate_from_db(self, db):
        """Test retrieving rate from database."""
        service = ExchangeRateService()
        
        # Create a test rate
        rate = ExchangeRate(
            from_currency='USD',
            to_currency='ARS',
            rate=875.50
        )
        db.add(rate)
        db.commit()
        
        # Retrieve it
        retrieved_rate = service.get_rate_from_db(db, 'USD', 'ARS')
        
        assert retrieved_rate == 875.50
    
    def test_get_nonexistent_rate_from_db(self, db):
        """Test retrieving non-existent rate from database."""
        service = ExchangeRateService()
        
        result = service.get_rate_from_db(db, 'XYZ', 'ABC')
        
        assert result is None
    
    def test_cache_is_valid(self):
        """Test cache validity checking."""
        cache = ExchangeRateCache()
        
        # Initially invalid
        assert not cache.is_valid()
        
        # Set data
        cache.set('key', {'rate': 100})
        assert cache.is_valid()
