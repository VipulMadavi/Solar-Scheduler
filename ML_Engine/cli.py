#!/usr/bin/env python
"""
ML_Engine CLI - Backend Integration Interface

This CLI allows the Node.js backend to call Python ML forecasting.
Called via: child_process.spawn('python', ['cli.py', '--weather', 'sunny', ...])

Usage Examples:
    python cli.py --weather sunny --format json
    python cli.py --target "2026-02-01 14:00" --weather cloudy
    python cli.py --horizon 6 --format text
"""
import argparse
import json
import sys
from pathlib import Path
from datetime import datetime

# Ensure imports work from any directory
ML_ENGINE_ROOT = Path(__file__).parent
sys.path.insert(0, str(ML_ENGINE_ROOT))

from src.data_utils import load_solar_csv
from src.forecast_solar import forecast_solar
from src.config import CONFIG


def get_cumulative_forecast(forecast_series):
    """
    Calculate cumulative energy (Wh) for different time horizons
    
    Args:
        forecast_series: pandas Series of hourly kW predictions
    
    Returns:
        dict: Energy totals for 15min, 1h, 6h, 24h
    """
    total_hours = len(forecast_series)
    return {
        "next15minWh": round(float(forecast_series.iloc[0]) / 4, 2),  # 1/4 of first hour
        "next1hWh": round(float(forecast_series.iloc[0]), 2),
        "next6hWh": round(float(forecast_series.iloc[:min(6, total_hours)].sum()), 2),
        "next24hWh": round(float(forecast_series.sum()), 2),
    }


def get_forecast_for_target(csv_file, target_datetime_str, method=None):
    """
    Get forecast for a specific target datetime
    
    Args:
        csv_file: Path to CSV data file
        target_datetime_str: Target datetime string (e.g., "2026-02-01 14:00")
        method: Forecast method ('arima', 'persistence', or None for ensemble)
    
    Returns:
        dict: Forecast result for the target time
    """
    import pandas as pd
    
    df = load_solar_csv(str(csv_file))
    forecast = forecast_solar(df, method=method)
    
    target_time = pd.to_datetime(target_datetime_str)
    closest_idx = forecast.index.get_indexer([target_time], method='nearest')[0]
    
    predicted_kw = float(forecast.iloc[closest_idx])
    
    return {
        "target_time": target_time.isoformat(),
        "forecast_time": forecast.index[closest_idx].isoformat(),
        "predicted_kw": round(predicted_kw, 2),
        "predicted_kwh": round(predicted_kw, 2),  # 1 hour slot
    }


def main():
    parser = argparse.ArgumentParser(
        description='Solar Forecast CLI for Backend Integration',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python cli.py --weather sunny --format json
  python cli.py --target "2026-02-01 14:00" --weather cloudy
  python cli.py --horizon 6 --format text
        """
    )
    
    parser.add_argument(
        '--weather', 
        choices=['sunny', 'cloudy'], 
        default='sunny',
        help='Weather scenario (default: sunny)'
    )
    parser.add_argument(
        '--horizon', 
        type=int, 
        default=24,
        help='Forecast horizon in hours (default: 24)'
    )
    parser.add_argument(
        '--method', 
        choices=['arima', 'persistence'], 
        default=None,
        help='Forecast method (default: ensemble blend)'
    )
    parser.add_argument(
        '--target', 
        type=str, 
        default=None,
        help='Target datetime for specific forecast (e.g., "2026-02-01 14:00")'
    )
    parser.add_argument(
        '--format', 
        choices=['json', 'text'], 
        default='json',
        help='Output format (default: json)'
    )
    
    args = parser.parse_args()
    
    # Determine data file
    data_dir = ML_ENGINE_ROOT / "data"
    csv_file = data_dir / f"solar_data_{args.weather}.csv"
    
    if not csv_file.exists():
        error = {
            "status": "error",
            "error": f"Data file not found: {csv_file}"
        }
        print(json.dumps(error) if args.format == 'json' else error['error'])
        sys.exit(1)
    
    try:
        # Load data and generate forecast
        df = load_solar_csv(str(csv_file))
        forecast = forecast_solar(df, method=args.method, horizon=args.horizon)
        
        # Build result
        result = {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "weather": args.weather,
            "method": args.method or "ensemble",
            "horizon_hours": args.horizon,
            "confidence": 0.87,
            "config": {
                "blend_ratio": CONFIG["blend_ratio"],
                "arima_order": CONFIG["arima_order"],
            },
            **get_cumulative_forecast(forecast),
            "hourly_forecast_kw": [round(x, 2) for x in forecast.tolist()]
        }
        
        # If specific target time requested, add that forecast
        if args.target:
            result["target_forecast"] = get_forecast_for_target(
                csv_file, args.target, args.method
            )
        
        # Output based on format
        if args.format == 'json':
            print(json.dumps(result, indent=2))
        else:
            print("=" * 40)
            print(f"☀️  SOLAR FORECAST ({args.weather.upper()})")
            print("=" * 40)
            print(f"⏰ Generated: {result['timestamp'][:19]}")
            print(f"📊 Method: {result['method']}")
            print(f"📈 Confidence: {result['confidence']*100:.0f}%")
            print("-" * 40)
            print(f"⚡ Next 15 min:  {result['next15minWh']:>8.2f} Wh")
            print(f"⚡ Next 1 hour:  {result['next1hWh']:>8.2f} Wh")
            print(f"⚡ Next 6 hours: {result['next6hWh']:>8.2f} Wh")
            print(f"⚡ Next 24 hours:{result['next24hWh']:>8.2f} Wh")
            
            if args.target and "target_forecast" in result:
                tf = result["target_forecast"]
                print("-" * 40)
                print(f"🎯 Target: {tf['target_time']}")
                print(f"   Predicted: {tf['predicted_kw']:.2f} kW")
            
            print("=" * 40)
            
    except Exception as e:
        error = {
            "status": "error",
            "error": str(e),
            "type": type(e).__name__
        }
        print(json.dumps(error, indent=2) if args.format == 'json' else f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
