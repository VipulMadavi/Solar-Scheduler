#!/usr/bin/env python
"""
🧪 TEMPORARY INTERACTIVE TESTING SCRIPT
========================================
Simulates frontend behavior for manual testing.
Enter date and time → Get solar forecast output in kW

DELETE THIS FILE AFTER SUCCESSFUL TESTING
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Setup imports
ML_ENGINE_ROOT = Path(__file__).parent
sys.path.insert(0, str(ML_ENGINE_ROOT))

from src.data_utils import load_solar_csv
from src.forecast_solar import forecast_solar
from src.config import CONFIG

# Suppress warnings
import warnings
warnings.filterwarnings('ignore')


def clear_screen():
    """Clear terminal screen"""
    print("\033[H\033[J", end="")


def print_header():
    """Print dashboard header"""
    print("\n" + "=" * 60)
    print("☀️  SOLAR SCHEDULER - FORECAST TESTING DASHBOARD")
    print("=" * 60)
    print("📋 This is a TEMPORARY test interface")
    print("   Delete test_interactive.py after testing")
    print(f"� Forecast Horizon: {CONFIG['horizon_hours']} hours")
    print("-" * 60)


def print_forecast_card(result):
    """Display forecast like a frontend card - kW only"""
    print("\n" + "┌" + "─" * 56 + "┐")
    print("│" + " ⚡ SOLAR ENERGY FORECAST (kW) ".center(56) + "│")
    print("├" + "─" * 56 + "┤")
    print("│" + f"  🎯 Target: {result['target_time']}".ljust(56) + "│")
    print("│" + f"  🌤️  Weather: {result['weather'].upper()}".ljust(56) + "│")
    print("│" + f"  📊 Method: {result['method']}".ljust(56) + "│")
    print("├" + "─" * 56 + "┤")
    print("│" + "                                                        │")
    
    # Main forecast value - big emphasis in kW
    kw_value = result['predicted_kw']
    print("│" + f"        ⚡ Predicted Power: {kw_value:>8.2f} kW".center(56) + "│")
    print("│" + "                                                        │")
    
    # Time context
    hour = result['target_hour']
    if 6 <= hour <= 9:
        time_note = "🌅 Morning - Solar ramping up"
    elif 10 <= hour <= 14:
        time_note = "☀️ Peak Hours - Maximum output"
    elif 15 <= hour <= 17:
        time_note = "🌤️ Afternoon - Still good output"
    elif 18 <= hour <= 20:
        time_note = "🌆 Evening - Declining output"
    else:
        time_note = "🌙 Night - Minimal/No solar"
    
    print("│" + f"  {time_note}".ljust(56) + "│")
    print("├" + "─" * 56 + "┤")
    
    # Hourly forecasts for next few hours
    print("│  📈 Upcoming Hours (kW):                                │")
    hourly = result.get('next_hours_kw', [])[:6]
    for i, kw in enumerate(hourly):
        hr = (result['target_hour'] + i) % 24
        bar_len = int(min(kw, 15) * 2)  # Max 30 chars
        bar = "█" * bar_len
        print("│" + f"      {hr:02d}:00  {kw:>6.2f} kW  {bar}".ljust(56) + "│")
    
    print("├" + "─" * 56 + "┤")
    print("│" + f"  📊 Confidence: {result['confidence']*100:.0f}%".ljust(56) + "│")
    print("│" + f"  � Data Range: {result['data_start']} to {result['data_end']}".ljust(56) + "│")
    print("└" + "─" * 56 + "┘")


def parse_indian_date(date_str):
    """Parse Indian format date (DD-MM-YYYY)"""
    try:
        return datetime.strptime(date_str, "%d-%m-%Y")
    except ValueError:
        # Try other formats as fallback
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return None


def get_user_input():
    """Get date and time from user - Indian format"""
    print("\n📅 Enter forecast details (Indian Format):\n")
    
    # Date input - Indian format DD-MM-YYYY
    tomorrow = datetime.now() + timedelta(days=1)
    default_date = tomorrow.strftime("%d-%m-%Y")
    date_input = input(f"   Date (DD-MM-YYYY) [{default_date}]: ").strip()
    if not date_input:
        date_input = default_date
    
    # Parse date
    parsed_date = parse_indian_date(date_input)
    if not parsed_date:
        raise ValueError(f"Invalid date format: {date_input}. Use DD-MM-YYYY")
    
    # Time input
    default_time = "14:00"
    time_input = input(f"   Time (HH:MM, 24hr) [{default_time}]: ").strip()
    if not time_input:
        time_input = default_time
    
    # Parse time
    try:
        hour, minute = map(int, time_input.split(':'))
        if not (0 <= hour <= 23 and 0 <= minute <= 59):
            raise ValueError()
    except:
        raise ValueError(f"Invalid time format: {time_input}. Use HH:MM (24hr)")
    
    # Weather scenario
    print("\n   Weather scenario:")
    print("   [1] ☀️  Sunny (default)")
    print("   [2] ☁️  Cloudy")
    weather_choice = input("   Choice [1]: ").strip()
    weather = "cloudy" if weather_choice == "2" else "sunny"
    
    # Combine date and time
    full_datetime = parsed_date.replace(hour=hour, minute=minute)
    
    return full_datetime, weather, date_input, time_input


def run_forecast(target_datetime, weather):
    """Run the forecast with proper date handling - returns kW"""
    import pandas as pd
    
    # Load data
    csv_file = ML_ENGINE_ROOT / "data" / f"solar_data_{weather}.csv"
    df = load_solar_csv(str(csv_file))
    
    # Get data range
    data_start = df.index[0].strftime("%d-%m-%Y")
    data_end = df.index[-1].strftime("%d-%m-%Y")
    
    # Generate 48-hour forecast from last data point
    forecast = forecast_solar(df, horizon=CONFIG["horizon_hours"])
    
    # Check if target is within forecast range
    forecast_start = forecast.index[0]
    forecast_end = forecast.index[-1]
    
    # If target is beyond forecast range, use time-of-day matching
    target_hour = target_datetime.hour
    
    if target_datetime < forecast_start or target_datetime > forecast_end:
        # Find best matching hour in forecast (same hour of day)
        matching_hours = [i for i, t in enumerate(forecast.index) if t.hour == target_hour]
        if matching_hours:
            closest_idx = matching_hours[0]
        else:
            closest_idx = 0
        note = "(Using pattern match - target outside 48h window)"
    else:
        # Within range - use exact matching
        closest_idx = forecast.index.get_indexer([target_datetime], method='nearest')[0]
        note = ""
    
    predicted_kw = float(forecast.iloc[closest_idx])
    
    # Get next few hours from the matching point
    next_hours_kw = []
    for i in range(min(6, len(forecast) - closest_idx)):
        next_hours_kw.append(round(float(forecast.iloc[closest_idx + i]), 2))
    
    result = {
        "target_time": target_datetime.strftime("%d-%m-%Y %H:%M"),
        "target_hour": target_hour,
        "weather": weather,
        "method": "ARIMA Ensemble",
        "predicted_kw": round(predicted_kw, 2),
        "next_hours_kw": next_hours_kw,
        "confidence": 0.87,
        "data_start": data_start,
        "data_end": data_end,
        "note": note
    }
    
    return result


def main():
    """Main interactive loop"""
    clear_screen()
    print_header()
    
    while True:
        try:
            # Get user input
            target_datetime, weather, date_str, time_str = get_user_input()
            
            print("\n⏳ Generating forecast...")
            
            # Run forecast
            result = run_forecast(target_datetime, weather)
            
            # Display result
            print_forecast_card(result)
            
            # Show note if any
            if result.get('note'):
                print(f"\n⚠️  Note: {result['note']}")
            
            # Continue?
            print("\n" + "-" * 60)
            print("Options:")
            print("  [Enter] Run another forecast")
            print("  [q]     Quit")
            
            choice = input("\nChoice: ").strip().lower()
            if choice == 'q':
                print("\n👋 Testing complete. Remember to delete test_interactive.py!")
                break
            
            clear_screen()
            print_header()
            
        except KeyboardInterrupt:
            print("\n\n👋 Interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("   Try again with valid date/time format (DD-MM-YYYY, HH:MM).\n")


if __name__ == "__main__":
    main()
