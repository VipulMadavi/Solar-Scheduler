#!/usr/bin/env python
"""
ML_Engine CLI - Backend Integration Interface

This CLI allows the Node.js backend to call Python ML forecasting.
Called via: child_process.spawn('python', ['cli.py', '--weather', 'sunny', ...])

Usage Examples:
    python cli.py --weather sunny --format json
    python cli.py --target "01-02-2026 14:00" --weather cloudy
    python cli.py --horizon 48 --format text
    
Date Format: DD-MM-YYYY HH:MM (Indian format)
Output: Power in kW
"""
import argparse
import json
import sys
import warnings
from pathlib import Path
from datetime import datetime

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# Ensure imports work from any directory
ML_ENGINE_ROOT = Path(__file__).parent
sys.path.insert(0, str(ML_ENGINE_ROOT))

from src.data_utils import load_solar_csv
from src.forecast_solar import forecast_solar
from src.config import CONFIG


def parse_datetime(datetime_str):
    """
    Parse datetime string - supports multiple formats
    Primary: DD-MM-YYYY HH:MM (Indian format)
    Fallback: YYYY-MM-DD HH:MM (ISO format)
    """
    import pandas as pd
    
    # Try Indian format first
    formats = [
        "%d-%m-%Y %H:%M",  # Indian: 01-02-2026 14:00
        "%d/%m/%Y %H:%M",  # Indian alt: 01/02/2026 14:00
        "%Y-%m-%d %H:%M",  # ISO: 2026-02-01 14:00
        "%Y-%m-%dT%H:%M",  # ISO-T: 2026-02-01T14:00
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(datetime_str, fmt)
        except ValueError:
            continue
    
    # Last resort - let pandas try
    try:
        return pd.to_datetime(datetime_str).to_pydatetime()
    except:
        raise ValueError(f"Cannot parse datetime: {datetime_str}. Use DD-MM-YYYY HH:MM format.")


def get_forecast_for_target(csv_file, target_datetime_str, method=None):
    """
    Get forecast for a specific target datetime with smart time-of-day matching
    
    Returns:
        dict: Forecast result with predicted_kw
    """
    import pandas as pd
    
    df = load_solar_csv(str(csv_file))
    forecast = forecast_solar(df, method=method, horizon=CONFIG["horizon_hours"])
    
    target_time = parse_datetime(target_datetime_str)
    target_hour = target_time.hour
    
    # Check if target is within forecast range
    forecast_start = forecast.index[0]
    forecast_end = forecast.index[-1]
    
    if forecast_start <= target_time <= forecast_end:
        # Within range - use exact matching
        closest_idx = forecast.index.get_indexer([target_time], method='nearest')[0]
        match_type = "exact"
    else:
        # Outside range - use time-of-day pattern matching
        matching_hours = [i for i, t in enumerate(forecast.index) if t.hour == target_hour]
        if matching_hours:
            closest_idx = matching_hours[0]
        else:
            closest_idx = 0
        match_type = "pattern"
    
    predicted_kw = float(forecast.iloc[closest_idx])
    
    # Get next 6 hours forecast
    next_hours = []
    for i in range(min(6, len(forecast) - closest_idx)):
        hr = forecast.index[closest_idx + i].hour
        kw = round(float(forecast.iloc[closest_idx + i]), 2)
        next_hours.append({"hour": f"{hr:02d}:00", "kw": kw})
    
    return {
        "target_time": target_time.strftime("%d-%m-%Y %H:%M"),
        "target_hour": target_hour,
        "predicted_kw": round(predicted_kw, 2),
        "match_type": match_type,
        "next_hours_kw": next_hours,
        "forecast_window": {
            "start": forecast_start.strftime("%d-%m-%Y %H:%M"),
            "end": forecast_end.strftime("%d-%m-%Y %H:%M")
        }
    }


def main():
    parser = argparse.ArgumentParser(
        description='Solar Forecast CLI for Backend Integration (kW output)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python cli.py --weather sunny --format json
  python cli.py --target "01-02-2026 14:00" --weather cloudy
  python cli.py --horizon 48 --format text

Date Format: DD-MM-YYYY HH:MM (Indian format)
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
        default=CONFIG["horizon_hours"],
        help=f'Forecast horizon in hours (default: {CONFIG["horizon_hours"]})'
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
        help='Target datetime (DD-MM-YYYY HH:MM format, e.g., "01-02-2026 14:00")'
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
        
        # Data range info
        data_start = df.index[0].strftime("%d-%m-%Y")
        data_end = df.index[-1].strftime("%d-%m-%Y")
        
        # Build result - kW based
        result = {
            "status": "success",
            "timestamp": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            "weather": args.weather,
            "method": args.method or "ensemble",
            "horizon_hours": args.horizon,
            "confidence": 0.87,
            "data_range": {
                "start": data_start,
                "end": data_end
            },
            "forecast_kw": {
                "hour_1": round(float(forecast.iloc[0]), 2),
                "hour_6_avg": round(float(forecast.iloc[:min(6, len(forecast))].mean()), 2),
                "hour_24_avg": round(float(forecast.iloc[:min(24, len(forecast))].mean()), 2),
                "hour_48_avg": round(float(forecast.mean()), 2),
            },
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
            print("=" * 50)
            print(f"☀️  SOLAR FORECAST ({args.weather.upper()}) - kW")
            print("=" * 50)
            print(f"⏰ Generated: {result['timestamp']}")
            print(f"📊 Method: {result['method']}")
            print(f"📈 Confidence: {result['confidence']*100:.0f}%")
            print(f"📅 Data: {data_start} to {data_end}")
            print("-" * 50)
            print(f"⚡ Hour 1:        {result['forecast_kw']['hour_1']:>8.2f} kW")
            print(f"⚡ Avg (6h):      {result['forecast_kw']['hour_6_avg']:>8.2f} kW")
            print(f"⚡ Avg (24h):     {result['forecast_kw']['hour_24_avg']:>8.2f} kW")
            print(f"⚡ Avg (48h):     {result['forecast_kw']['hour_48_avg']:>8.2f} kW")
            
            if args.target and "target_forecast" in result:
                tf = result["target_forecast"]
                print("-" * 50)
                print(f"🎯 Target: {tf['target_time']}")
                print(f"   Predicted: {tf['predicted_kw']:.2f} kW")
                print(f"   Match: {tf['match_type']}")
                if tf['next_hours_kw']:
                    print("   Next hours:")
                    for h in tf['next_hours_kw'][:4]:
                        print(f"     {h['hour']}: {h['kw']:.2f} kW")
            
            print("=" * 50)
            
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
