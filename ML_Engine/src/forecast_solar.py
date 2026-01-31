"""
HackNagpur GE-2 Solar Forecasting
Mutation A: Historical data only, no APIs
"""
import pandas as pd
import numpy as np
from .config import CONFIG
from statsmodels.tsa.arima.model import ARIMA


def convert_kw_to_wh(kw_value, interval_minutes=60):
    """
    Convert kW (power) to Wh (energy) over given interval.
    
    Formula: Wh = kW × (interval_minutes / 60) × 1000
    
    Examples:
        - 1 kW over 60 min = 1000 Wh
        - 1 kW over 15 min = 250 Wh
        - 2 kW over 15 min = 500 Wh
    
    Args:
        kw_value: Power in kW (can be scalar or array-like)
        interval_minutes: Time interval in minutes (default: 60)
    
    Returns:
        Energy in Wh
    """
    hours = interval_minutes / 60  # 15 min = 0.25 hours, 60 min = 1 hour
    return kw_value * hours * 1000  # Convert kW*h to Wh


def persistence_forecast(historical_df, horizon=CONFIG["horizon_hours"]):
    """Baseline: Tomorrow = yesterday"""
    last_day = historical_df['solar_power_kw'].tail(24).values
    future_times = pd.date_range(start=historical_df.index[-1] + pd.Timedelta(hours=1), periods=horizon, freq='h')
    return pd.Series(np.tile(last_day[:24], horizon//24 + 1)[:horizon], 
                    index=future_times)


def arima_forecast(historical_df, horizon=CONFIG["horizon_hours"]):
    """ARIMA time series forecast"""
    solar = historical_df['solar_power_kw']
    model = ARIMA(solar, order=CONFIG["arima_order"], 
                  seasonal_order=CONFIG["arima_seasonal"])
    fitted = model.fit()
    forecast_steps = fitted.forecast(steps=horizon)
    future_times = pd.date_range(start=historical_df.index[-1] + pd.Timedelta(hours=1), periods=horizon, freq='h')
    return pd.Series(forecast_steps, index=future_times)


def interpolate_to_15min(hourly_forecast):
    """
    Interpolate hourly forecast to 15-minute intervals.
    
    Args:
        hourly_forecast: pd.Series with hourly frequency
    
    Returns:
        pd.Series with 15-minute frequency (4x the data points)
    """
    # Resample to 15-minute intervals and interpolate
    forecast_15min = hourly_forecast.resample('15min').interpolate(method='linear')
    
    # Forward fill any remaining NaN at the end
    forecast_15min = forecast_15min.ffill()
    
    return forecast_15min


def forecast_solar(historical_df, method=None, horizon=None, interval=None, unit=None):
    """
    Main forecast function with configurable interval and output unit.
    
    Input: 
        historical_df: DataFrame with (timestamp, solar_power_kw)
        method: "persistence", "arima", or None for ensemble blend
        horizon: Number of hours to forecast
        interval: "1h" (hourly) or "15min" (15-minute intervals)
        unit: "kw" (kilowatts) or "wh" (watt-hours)
    
    Output: 
        pd.Series with forecast values in specified unit
    """
    method = method or CONFIG["forecast_method"]
    horizon = horizon or CONFIG["horizon_hours"]
    interval = interval or CONFIG.get("forecast_interval", "1h")
    unit = unit or CONFIG.get("output_unit", "kw")
    
    # Validate input
    if len(historical_df) < 24:
        raise ValueError("Need 1+ days historical data")
    
    # Generate hourly forecasts first
    if method == "persistence":
        pred = persistence_forecast(historical_df, horizon)
    elif method == "arima":
        pred = arima_forecast(historical_df, horizon)
    else:
        raise ValueError("method: 'persistence' or 'arima'")
    
    # Ensemble blend
    if CONFIG["blend_ratio"] < 1.0:
        persist = persistence_forecast(historical_df, horizon)
        pred = (CONFIG["blend_ratio"] * pred + 
                (1 - CONFIG["blend_ratio"]) * persist)
    
    # Clip negative values (no negative solar)
    pred = pred.clip(lower=0)
    
    # Convert to 15-minute intervals if requested
    if interval == "15min":
        pred = interpolate_to_15min(pred)
    
    # Convert to Wh if requested
    if unit == "wh":
        interval_minutes = 15 if interval == "15min" else 60
        pred = convert_kw_to_wh(pred, interval_minutes)
    
    return pred

