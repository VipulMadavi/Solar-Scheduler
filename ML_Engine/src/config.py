
CONFIG = {
    # Forecasting parameters
    "forecast_method": "arima",       # persistence, arima
    "horizon_hours": 48,              # Extended to 48 hours for better coverage
    "train_days": 7,
    "arima_order": (2, 1, 2),
    "arima_seasonal": (1, 1, 1, 24),
    "blend_ratio": 0.7,              # 70% ARIMA + 30% persistence
    
    # Output unit: "kw" (kilowatts - power) or "wh" (watt-hours - energy)
    "output_unit": "kw",
    
    # Forecast interval: "1h" (hourly) or "15min" (15-minute intervals)
    "forecast_interval": "1h",
}
