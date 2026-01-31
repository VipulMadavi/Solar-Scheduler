# tests/test_forecast.py
"""
Solar Forecast Unit Tests
Run: pytest tests/ -v
"""
import pytest
from src.forecast_solar import forecast_solar


class TestForecastShape:
    """Tests for forecast output structure"""
    
    def test_forecast_returns_24_hours(self, sunny_data):
        """Verify forecast returns 24 hourly values"""
        forecast = forecast_solar(sunny_data)
        assert len(forecast) == 24
    
    def test_forecast_has_datetime_index(self, sunny_data):
        """Verify forecast index is datetime"""
        import pandas as pd
        forecast = forecast_solar(sunny_data)
        assert isinstance(forecast.index, pd.DatetimeIndex)


class TestForecastValues:
    """Tests for forecast value correctness"""
    
    def test_no_negative_solar(self, sunny_data):
        """Ensure no negative power predictions"""
        forecast = forecast_solar(sunny_data)
        assert (forecast >= 0).all(), "Forecast contains negative values"
    
    def test_reasonable_max_value(self, sunny_data):
        """Solar output shouldn't exceed physical limits"""
        forecast = forecast_solar(sunny_data)
        assert forecast.max() < 50, "Solar output exceeds 50 kW (unrealistic)"


class TestForecastMethods:
    """Tests for different forecast methods"""
    
    def test_persistence_method(self, sunny_data):
        """Test persistence baseline works"""
        persist = forecast_solar(sunny_data, method="persistence")
        assert len(persist) == 24
        assert persist.sum() > 0
    
    def test_arima_method(self, sunny_data):
        """Test ARIMA forecasting works"""
        arima = forecast_solar(sunny_data, method="arima")
        assert len(arima) == 24
    
    def test_ensemble_is_blend(self, sunny_data):
        """Ensemble should be between persistence and ARIMA"""
        persist = forecast_solar(sunny_data, method="persistence")
        arima = forecast_solar(sunny_data, method="arima")
        ensemble = forecast_solar(sunny_data)  # Default is ensemble
        
        # Ensemble mean should be somewhere between the two
        assert ensemble.mean() <= max(persist.mean(), arima.mean()) * 1.1
        assert ensemble.mean() >= min(persist.mean(), arima.mean()) * 0.9


class TestWeatherScenarios:
    """Tests comparing sunny vs cloudy scenarios"""
    
    def test_cloudy_vs_sunny(self, sunny_data, cloudy_data):
        """Cloudy forecast should generally be equal or lower"""
        sunny_forecast = forecast_solar(sunny_data)
        cloudy_forecast = forecast_solar(cloudy_data)
        
        # Cloudy should be lower or similar (allow 20% tolerance)
        assert cloudy_forecast.mean() <= sunny_forecast.mean() * 1.2


class TestHorizon:
    """Tests for different forecast horizons"""
    
    def test_custom_horizon(self, sunny_data):
        """Test custom horizon values"""
        forecast_6h = forecast_solar(sunny_data, horizon=6)
        forecast_48h = forecast_solar(sunny_data, horizon=48)
        
        assert len(forecast_6h) == 6
        assert len(forecast_48h) == 48


# Run: pytest tests/ -v --tb=short
