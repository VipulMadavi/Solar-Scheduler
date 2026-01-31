"""
HackNagpur GE-2 Solar Forecasting
Mutation A: Historical data only, no APIs
"""
import pandas as pd
import numpy as np
from .config import CONFIG
from statsmodels.tsa.arima.model import ARIMA

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

def forecast_solar(historical_df, method=None, horizon=None):
    """
    Main forecast function
    Input: historical_df (timestamp, solar_power_kw)
    Output: forecast_series (24h solar_forecast_kw)
    """
    method = method or CONFIG["forecast_method"]
    horizon = horizon or CONFIG["horizon_hours"]
    
    # Validate input
    if len(historical_df) < 24:
        raise ValueError("Need 1+ days historical data")
    
    # Generate forecasts
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
    
    return pred.clip(lower=0)  # No negative solar
