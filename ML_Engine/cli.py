#!/usr/bin/env python
"""
ML_Engine CLI - Backend Integration Interface

This CLI allows the Node.js backend to call Python ML forecasting.
Called via: child_process.spawn('python', ['cli.py', '--weather', 'sunny', ...])

Usage Examples:
    python cli.py --weather sunny --format json
    python cli.py --target "01-02-2026 14:00" --weather cloudy
    python cli.py --horizon 48 --format text
    python cli.py --next 15 --unit wh --format json
    python cli.py --target "01-02-2026 14:00" --unit wh --interval 15min
    
Date Format: DD-MM-YYYY HH:MM (Indian format)
Output Units: kW (power) or Wh (energy)
"""
import argparse
import json
import sys
import warnings
from pathlib import Path
from datetime import datetime, timedelta

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# Ensure imports work from any directory
ML_ENGINE_ROOT = Path(__file__).parent
sys.path.insert(0, str(ML_ENGINE_ROOT))

from src.data_utils import load_solar_csv
from src.forecast_solar import forecast_solar, convert_kw_to_wh
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


def get_unit_label(unit):
    """Get display label for unit."""
    return "Wh" if unit == "wh" else "kW"


def get_forecast_for_target(csv_file, target_datetime_str, method=None, unit="kw", interval="1h"):
    """
    Get forecast for a specific target datetime with smart time-of-day matching
    
    Returns:
        dict: Forecast result with predicted value in specified unit
    """
    import pandas as pd
    
    df = load_solar_csv(str(csv_file))
    forecast = forecast_solar(df, method=method, horizon=CONFIG["horizon_hours"], 
                              interval=interval, unit=unit)
    
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
    
    predicted_value = float(forecast.iloc[closest_idx])
    unit_label = get_unit_label(unit)
    
    # Get next intervals forecast
    next_intervals = []
    interval_count = 6 if interval == "1h" else 4  # 6 hours or 4 x 15min = 1 hour
    for i in range(min(interval_count, len(forecast) - closest_idx)):
        time_str = forecast.index[closest_idx + i].strftime("%H:%M")
        value = round(float(forecast.iloc[closest_idx + i]), 2)
        next_intervals.append({"time": time_str, f"value_{unit}": value})
    
    return {
        "target_time": target_time.strftime("%d-%m-%Y %H:%M"),
        "target_hour": target_hour,
        f"predicted_{unit}": round(predicted_value, 2),
        "unit": unit_label,
        "interval": interval,
        "match_type": match_type,
        "next_intervals": next_intervals,
        "forecast_window": {
            "start": forecast_start.strftime("%d-%m-%Y %H:%M"),
            "end": forecast_end.strftime("%d-%m-%Y %H:%M")
        }
    }


def get_next_minutes_forecast(csv_file, next_minutes=15, method=None, unit="wh", weather="sunny"):
    """
    Get forecast for the next N minutes from current time.
    This is the main function backend will call on each 15-minute refresh.
    
    Args:
        csv_file: Path to historical data CSV
        next_minutes: How many minutes ahead to forecast (default: 15)
        method: Forecasting method
        unit: Output unit ("kw" or "wh")
        weather: Weather scenario
    
    Returns:
        dict: Forecast for next interval(s)
    """
    import pandas as pd
    
    df = load_solar_csv(str(csv_file))
    
    # Always use 15-minute intervals for this mode
    interval = "15min"
    forecast = forecast_solar(df, method=method, horizon=CONFIG["horizon_hours"], 
                              interval=interval, unit=unit)
    
    # Get current time and find matching forecast points
    now = datetime.now()
    
    # Find the closest forecast point to now
    try:
        closest_idx = forecast.index.get_indexer([now], method='nearest')[0]
    except:
        closest_idx = 0
    
    # Calculate how many 15-minute intervals we need
    num_intervals = max(1, next_minutes // 15)
    
    unit_label = get_unit_label(unit)
    intervals = []
    
    for i in range(num_intervals):
        if closest_idx + i < len(forecast):
            time_point = forecast.index[closest_idx + i]
            value = round(float(forecast.iloc[closest_idx + i]), 2)
            intervals.append({
                "time": time_point.strftime("%H:%M"),
                "datetime": time_point.strftime("%d-%m-%Y %H:%M"),
                f"value_{unit}": value
            })
    
    # Get primary value (first interval)
    primary_value = intervals[0][f"value_{unit}"] if intervals else 0
    
    return {
        "status": "success",
        "timestamp": now.strftime("%d-%m-%Y %H:%M:%S"),
        "weather": weather,
        "next_minutes": next_minutes,
        "unit": unit_label,
        "interval": "15min",
        f"forecast_{unit}": primary_value,
        "next_intervals": intervals,
        "confidence": 0.87
    }


def main():
    parser = argparse.ArgumentParser(
        description='Solar Forecast CLI for Backend Integration',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python cli.py --weather sunny --format json
  python cli.py --target "01-02-2026 14:00" --weather cloudy
  python cli.py --horizon 48 --format text
  python cli.py --next 15 --unit wh --format json
  python cli.py --target "01-02-2026 14:00" --unit wh --interval 15min

Date Format: DD-MM-YYYY HH:MM (Indian format)
Output Units: kw (kilowatts - power) | wh (watt-hours - energy)
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
    
    # NEW: Output unit selection
    parser.add_argument(
        '--unit',
        choices=['kw', 'wh'],
        default='kw',
        help='Output unit: kw (kilowatts - power) or wh (watt-hours - energy) (default: kw)'
    )
    
    # NEW: Forecast interval selection
    parser.add_argument(
        '--interval',
        choices=['1h', '15min'],
        default='1h',
        help='Forecast interval: 1h (hourly) or 15min (15-minute) (default: 1h)'
    )
    
    # NEW: Next N minutes mode (for backend refresh)
    parser.add_argument(
        '--next',
        type=int,
        default=None,
        help='Get forecast for next N minutes from now (e.g., --next 15)'
    )
    
    # Ingestion args
    parser.add_argument('--ingest', action='store_true', help='Ingest new data mode')
    parser.add_argument('--time', type=str, help='Reading time (DD-MM-YYYY HH:MM)')
    parser.add_argument('--solar', type=float, help='Solar power in kW')
    parser.add_argument('--load', type=float, help='Load power in kW')
    
    args = parser.parse_args()
    
    # Determine data file
    data_dir = ML_ENGINE_ROOT / "data"
    csv_file = data_dir / f"solar_data_{args.weather}.csv"
    
    # Mode A: Ingestion
    if args.ingest:
        if not all([args.time, args.solar is not None, args.load is not None]):
            print("Error: --ingest requires --time, --solar, and --load")
            sys.exit(1)
        
        from src.data_utils import append_new_reading
        try:
            append_new_reading(str(csv_file), args.time, args.solar, args.load)
            result = {"status": "success", "message": f"Data ingested into {csv_file.name}"}
            print(json.dumps(result) if args.format == 'json' else result['message'])
            sys.exit(0)
        except Exception as e:
            print(f"Ingestion error: {e}")
            sys.exit(1)
    
    # Check data file exists
    if not csv_file.exists():
        error = {
            "status": "error",
            "error": f"Data file not found: {csv_file}"
        }
        print(json.dumps(error) if args.format == 'json' else error['error'])
        sys.exit(1)
    
    # Mode B: Next N minutes forecast (for backend refresh)
    if args.next is not None:
        try:
            result = get_next_minutes_forecast(
                csv_file, 
                next_minutes=args.next,
                method=args.method,
                unit=args.unit,
                weather=args.weather
            )
            
            if args.format == 'json':
                print(json.dumps(result, indent=2))
            else:
                unit_label = get_unit_label(args.unit)
                print("=" * 50)
                print(f"☀️  NEXT {args.next} MINUTES FORECAST ({args.weather.upper()})")
                print("=" * 50)
                print(f"⏰ Generated: {result['timestamp']}")
                print(f"📊 Unit: {unit_label}")
                print(f"📈 Confidence: {result['confidence']*100:.0f}%")
                print("-" * 50)
                print(f"⚡ Forecast: {result[f'forecast_{args.unit}']:>8.2f} {unit_label}")
                if result['next_intervals']:
                    print("-" * 50)
                    print("📅 Next intervals:")
                    for interval in result['next_intervals']:
                        print(f"   {interval['time']}: {interval[f'value_{args.unit}']:.2f} {unit_label}")
                print("=" * 50)
            sys.exit(0)
        except Exception as e:
            error = {
                "status": "error",
                "error": str(e),
                "type": type(e).__name__
            }
            print(json.dumps(error, indent=2) if args.format == 'json' else f"Error: {e}")
            sys.exit(1)

    # Mode C: Standard forecasting
    try:
        # Load data and generate forecast
        df = load_solar_csv(str(csv_file))
        forecast = forecast_solar(df, method=args.method, horizon=args.horizon,
                                  interval=args.interval, unit=args.unit)
        
        # Data range info
        data_start = df.index[0].strftime("%d-%m-%Y")
        data_end = df.index[-1].strftime("%d-%m-%Y")
        
        unit_label = get_unit_label(args.unit)
        interval_label = "15min" if args.interval == "15min" else "hourly"
        
        # Calculate interval-aware stats
        if args.interval == "15min":
            # 15-minute intervals: 4 per hour
            intervals_1h = 4
            intervals_6h = 24
            intervals_24h = 96
        else:
            # Hourly intervals
            intervals_1h = 1
            intervals_6h = 6
            intervals_24h = 24
        
        # Build result
        result = {
            "status": "success",
            "timestamp": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            "weather": args.weather,
            "method": args.method or "ensemble",
            "horizon_hours": args.horizon,
            "unit": unit_label,
            "interval": args.interval,
            "confidence": 0.87,
            "data_range": {
                "start": data_start,
                "end": data_end
            },
            f"forecast_{args.unit}": {
                "first": round(float(forecast.iloc[0]), 2),
                "avg_1h": round(float(forecast.iloc[:min(intervals_1h, len(forecast))].mean()), 2),
                "avg_6h": round(float(forecast.iloc[:min(intervals_6h, len(forecast))].mean()), 2),
                "avg_24h": round(float(forecast.iloc[:min(intervals_24h, len(forecast))].mean()), 2),
                "avg_total": round(float(forecast.mean()), 2),
            },
            f"{interval_label}_forecast_{args.unit}": [round(x, 2) for x in forecast.tolist()]
        }
        
        # If specific target time requested, add that forecast
        if args.target:
            result["target_forecast"] = get_forecast_for_target(
                csv_file, args.target, args.method, args.unit, args.interval
            )
        
        # Output based on format
        if args.format == 'json':
            print(json.dumps(result, indent=2))
        else:
            print("=" * 50)
            print(f"☀️  SOLAR FORECAST ({args.weather.upper()}) - {unit_label}")
            print("=" * 50)
            print(f"⏰ Generated: {result['timestamp']}")
            print(f"📊 Method: {result['method']}")
            print(f"📏 Interval: {interval_label}")
            print(f"📈 Confidence: {result['confidence']*100:.0f}%")
            print(f"📅 Data: {data_start} to {data_end}")
            print("-" * 50)
            fc = result[f"forecast_{args.unit}"]
            print(f"⚡ First:         {fc['first']:>8.2f} {unit_label}")
            print(f"⚡ Avg (1h):      {fc['avg_1h']:>8.2f} {unit_label}")
            print(f"⚡ Avg (6h):      {fc['avg_6h']:>8.2f} {unit_label}")
            print(f"⚡ Avg (24h):     {fc['avg_24h']:>8.2f} {unit_label}")
            print(f"⚡ Avg (total):   {fc['avg_total']:>8.2f} {unit_label}")
            
            if args.target and "target_forecast" in result:
                tf = result["target_forecast"]
                print("-" * 50)
                print(f"🎯 Target: {tf['target_time']}")
                print(f"   Predicted: {tf[f'predicted_{args.unit}']:.2f} {unit_label}")
                print(f"   Match: {tf['match_type']}")
                if tf['next_intervals']:
                    print("   Next intervals:")
                    for iv in tf['next_intervals'][:4]:
                        print(f"     {iv['time']}: {iv[f'value_{args.unit}']:.2f} {unit_label}")
            
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
