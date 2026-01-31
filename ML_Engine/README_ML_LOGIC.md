# ML Engine - Solar Forecasting System

This module provides solar energy forecasting capabilities for the Solar-Scheduler backend. It uses historical solar data and weather patterns to predict energy generation for future dates and times.

## 🚀 Overview

The ML Engine is designed to be called by a **Node.js/Express backend** using standard CLI interfaces. It returns structured JSON data containing power forecasts, confidence levels, and trend analysis.

### Key Features
- **Weather-Aware**: Supports `sunny` and `cloudy` scenario-based modeling.
- **Flexible Targeting**: Specific time-of-day matching for any future date.
- **Configurable Units**: Output in **kW** (power) or **Wh** (energy).
- **15-Minute Intervals**: Sub-hourly forecasting for backend refresh.
- **Indian Date Format**: Supports `DD-MM-YYYY HH:MM` for ease of integration.

---

## 🛠️ Setup & Installation

Ensure you have Python 3.8+ installed.

1. **Navigate to the ML_Engine directory**:
   ```bash
   cd ML_Engine
   ```

2. **Create a virtual environment (Recommended)**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## 🔌 Integration (Backend Calling ML)

The backend should call the ML engine via `cli.py`.

### Base Command Structure
```bash
python cli.py --target "DD-MM-YYYY HH:MM" --weather [sunny|cloudy] --unit [kw|wh] --interval [1h|15min] --format json
```

### Parameters
| Flag | Options | Description |
| :--- | :--- | :--- |
| `--target` | String | Target date/time (e.g., `"02-02-2026 14:00"`) |
| `--weather` | `sunny`, `cloudy` | Historical pattern to use (Default: `sunny`) |
| `--format` | `json`, `text` | Response format (Default: `json`) |
| `--horizon` | Integer | Hours to forecast ahead (Default: 48) |
| `--method` | `arima`, `persistence` | Forecasting model (Default: Ensemble Blend) |
| `--unit` | `kw`, `wh` | **NEW** Output unit: kilowatts or watt-hours (Default: `kw`) |
| `--interval` | `1h`, `15min` | **NEW** Forecast interval (Default: `1h`) |
| `--next` | Integer | **NEW** Get forecast for next N minutes from now |

---

## 📊 Output Units

### kW (Kilowatts) - Power
- Instantaneous power at a moment in time
- Default output format
- Use case: Real-time monitoring

### Wh (Watt-hours) - Energy
- Energy produced over a time interval
- Conversion: `Wh = kW × (interval_hours) × 1000`
- For 15-min intervals: `Wh = kW × 0.25 × 1000`
- Use case: Energy scheduling, battery planning

---

## 🕐 15-Minute Refresh Mode

For backend that refreshes every 15 minutes, use the `--next` parameter:

```bash
# Get forecast for next 15 minutes in Wh
python cli.py --next 15 --unit wh --format json
```

### Example Output
```json
{
  "status": "success",
  "timestamp": "01-02-2026 00:15:00",
  "weather": "sunny",
  "next_minutes": 15,
  "unit": "Wh",
  "interval": "15min",
  "forecast_wh": 125.5,
  "next_intervals": [
    {"time": "00:15", "datetime": "01-02-2026 00:15", "value_wh": 125.5}
  ],
  "confidence": 0.87
}
```

### Node.js Integration Example
```javascript
const { spawn } = require('child_process');
const path = require('path');

async function getNext15MinForecastWh() {
  return new Promise((resolve, reject) => {
    const mlEnginePath = path.resolve(__dirname, '../ML_Engine');
    
    const pythonProcess = spawn('python', [
      'cli.py', 
      '--next', '15', 
      '--unit', 'wh', 
      '--format', 'json'
    ], { cwd: mlEnginePath });

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        const result = JSON.parse(output);
        resolve(result.forecast_wh);  // Returns Wh value
      } else {
        reject(new Error('ML Engine failed'));
      }
    });
  });
}
```

---

## 📈 Standard Forecasting

### Get kW Forecast (Default)
```bash
python cli.py --target "05-02-2026 14:30" --weather sunny --format json
```

### Get Wh Forecast with 15-min Intervals
```bash
python cli.py --target "05-02-2026 14:30" --unit wh --interval 15min --format json
```

### Example Node.js Execution
```javascript
const { spawn } = require('child_process');

const pythonProcess = spawn('python', [
  'cli.py', 
  '--target', '05-02-2026 14:30', 
  '--unit', 'wh',
  '--interval', '15min',
  '--weather', 'sunny', 
  '--format', 'json'
]);

pythonProcess.stdout.on('data', (data) => {
  const result = JSON.parse(data.toString());
  console.log(`Predicted Energy: ${result.target_forecast.predicted_wh} Wh`);
});
```

---

## 📊 Data Specifications

### Input Date Formats
- `DD-MM-YYYY HH:MM` (Primary - Indian format)
- `YYYY-MM-DD HH:MM` (ISO)

### Output JSON Structure (Standard Mode)
```json
{
  "status": "success",
  "timestamp": "01-02-2026 22:15:00",
  "weather": "sunny",
  "method": "ensemble",
  "horizon_hours": 48,
  "unit": "Wh",
  "interval": "15min",
  "confidence": 0.87,
  "data_range": {
    "start": "01-01-2026",
    "end": "31-01-2026"
  },
  "forecast_wh": {
    "first": 125.5,
    "avg_1h": 130.2,
    "avg_6h": 145.8,
    "avg_24h": 98.3,
    "avg_total": 85.1
  },
  "target_forecast": {
    "target_time": "02-02-2026 14:00",
    "predicted_wh": 245.5,
    "unit": "Wh",
    "interval": "15min",
    "match_type": "pattern",
    "next_intervals": [
      {"time": "14:00", "value_wh": 245.5},
      {"time": "14:15", "value_wh": 250.2},
      {"time": "14:30", "value_wh": 248.8},
      {"time": "14:45", "value_wh": 242.1}
    ]
  }
}
```

---

## 🧪 Testing

You can test the engine manually using the provided test scripts:

### CLI Tests
```bash
# Standard kW output
python cli.py --target "01-02-2026 12:00"

# Wh output with 15-min intervals
python cli.py --target "01-02-2026 12:00" --unit wh --interval 15min

# Next 15 minutes forecast (for backend refresh)
python cli.py --next 15 --unit wh

# Human-readable text output
python cli.py --next 15 --unit wh --format text
```

### Automated Tests
```bash
pytest tests/
```

### Interactive System
```bash
python test_interactive.py
```

---

## 📁 Directory Structure

- `/api`: Programmatic Python wrappers (`forecast_service.py`).
- `/data`: CSV files containing historical generation patterns.
- `/models`: Saved model weights and configurations.
- `/src`: Core forecasting logic and data utilities.
  - `config.py`: Configuration (horizon, units, intervals).
  - `forecast_solar.py`: Main forecasting logic with kW→Wh conversion.
  - `data_utils.py`: Data loading utilities.
- `cli.py`: Main entry point for backend integration.

---

## ⚙️ Configuration

Edit `src/config.py` to change defaults:

```python
CONFIG = {
    "forecast_method": "arima",       # persistence, arima
    "horizon_hours": 48,              # Hours to forecast
    "train_days": 7,
    "arima_order": (2, 1, 2),
    "arima_seasonal": (1, 1, 1, 24),
    "blend_ratio": 0.7,               # 70% ARIMA + 30% persistence
    
    "output_unit": "kw",              # Default: "kw" or "wh"
    "forecast_interval": "1h",        # Default: "1h" or "15min"
}
```
