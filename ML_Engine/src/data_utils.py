import pandas as pd
import os

def load_solar_csv(filename):
    """Load + clean historical solar CSV"""
    if not os.path.exists(filename):
        raise FileNotFoundError(f"{filename} not found")
    
    df = pd.read_csv(filename)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Last 7 days only
    df = df.tail(168).sort_values('timestamp').reset_index(drop=True)
    
    # Fill missing
    df['solar_power_kw'] = df['solar_power_kw'].ffill().fillna(0)
    df['load_total_kw'] = df['load_total_kw'].ffill().fillna(5)
    
    return df.set_index('timestamp')

def validate_data(df):
    """Basic data validation"""
    if len(df) < 24:
        raise ValueError("Need at least 1 day data")
    if df['solar_power_kw'].max() > 50:
        print("⚠️ High solar values detected")
    return True

def append_new_reading(filename, timestamp_str, solar_kw, load_kw):
    """
    Safely appends a new sensor reading to the historical CSV while maintaining order.
    """
    import os
    
    # 1. Create the row
    new_data = pd.DataFrame([{
        'timestamp': timestamp_str,
        'solar_power_kw': float(solar_kw),
        'load_total_kw': float(load_kw)
    }])
    
    # 2. Convert timestamp to datetime for verification
    new_data['timestamp'] = pd.to_datetime(new_data['timestamp'])
    
    # 3. Handle file writing
    if os.path.exists(filename):
        df = pd.read_csv(filename)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Merge and remove duplicates
        df = pd.concat([df, new_data])
        df = df.drop_duplicates(subset=['timestamp'], keep='last')
        
        # Sort values and keep last 30 days (720 hours)
        df = df.sort_values('timestamp').tail(720)
    else:
        df = new_data
        
    # 4. Save back to CSV
    df.to_csv(filename, index=False)
    return True
