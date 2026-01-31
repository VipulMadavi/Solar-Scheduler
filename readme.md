# Solar Energy Scheduler

An intelligent, prediction-driven decision engine for managing off-grid solar energy systems. This system optimizes device usage based on real-time solar forecasts, battery levels, and user-defined priorities.

## 1. Project Overview

**The Problem:** Traditional off-grid solar systems lack intelligence. They often drain batteries blindly or waste potential solar energy when batteries are full. Users must manually toggle appliances based on guesswork.

**Our Solution:** The Solar Energy Scheduler acts as the "brain" of the solar setup. It uses Machine Learning to forecast solar potential, simulates energy availability for the next 15 minutes, and actively manages loads to ensure:
*   **Critical devices** (e.g., security, fridge) always run.
*   **Flexible devices** run only when energy is sufficient.
*   **Battery health** is preserved by preventing deep depletion (Survival Mode).

## 2. High-Level Architecture

The system is composed of three distinct modules working in harmony:

1.  **ML Engine (Python)**
    *   Ingests historical solar data and weather conditions.
    *   Generates a solar generation potential forecast (kW/m² or normalized coeff).
    *   Writes forecasts to a shared interface file (`ml_forecast.json`).

2.  **Backend (Node.js + TypeScript)**
    *   **Decision Engine**: Runs every 15 minutes (tick).
    *   **Solar Service**: Reads ML forecasts and converts them to actual Wh based on system hardware config.
    *   **Scheduler**: Prioritizes devices based on available energy (Battery + Solar).
    *   **API Layer**: Exposes state and accepts configuration/overrides.

3.  **Frontend (React)**
    *   Real-time dashboard visualizing battery state, solar input, and device status.
    *   Read-only interface for monitoring system health.

**Data Flow:**
`ML Prediction` → `JSON Interface` → `Backend Solar Service` → `Scheduler Logic` → `State Update` → `API Exposure` → `Dashboard`

## 3. Core Concepts

*   **15-Minute Decision Window**: The system makes scheduling decisions in discrete 15-minute blocks (`timestep`). Energy is calculated in Watt-hours (Wh) for this duration.
*   **Device Priorities**:
    *   **CRITICAL**: Must run. System will sacrifice battery reserves to keep these on.
    *   **FLEXIBLE**: Run if energy > critical load + safety margin.
    *   **OPTIONAL**: Run only if surplus energy exists (battery full + high solar).
*   **Survival Mode**: If the battery drops to 0% (or low threshold) and solar is insufficient, the system cuts ALL non-critical loads to prevent blackout.
*   **Energy Deficit**: If demand > supply, the system tracks the "deficit" to inform the user of shortages.

## 4. System Configuration

Real-world setups vary. The scheduler uses a dedicated **System Configuration Service** to adapt its math:

*   `panelCapacityKw`: Actual size of the solar array (e.g., 3kW, 5kW).
*   `batteryCapacityWh`: Total storage capacity (e.g., 5000Wh).
*   `efficiency`: System loss factor (inverter/wiring losses, default 0.85).

*Why this matters:* The ML engine predicts generic "sunniness". The backend scales this by `panelCapacityKw * efficiency` to know how much power *this specific house* will generate.

## 5. Machine Learning Integration

The ML Engine does not know about the user's specific hardware. It provides a **Solar Potential Forecast** (Avg kW per 1kW capacity).

**Process:**
1.  Python script (`cli.py`) runs.
2.  Generates prediction: `avgKw1h` (e.g., 0.8 kW per installed kW).
3.  Writes to `Backend/ml_forecast.json` with timestamp and confidence score.
4.  Backend reads file.
5.  **Conversion Formula**:
    ```typescript
    SolarForecastWh = (avgKw1h * PanelCapacity * Efficiency) * 0.25 hours
    ```
6.  *Fallback*: If ML file is missing or stale, the backend falls back to a conservative calculation logic.

## 6. Backend API Reference

The backend exposes a RESTful API for monitoring system state, managing devices, and configuring hardware parameters.

### 1. System State

#### GET `/api/state`
Retrieves the real-time snapshot of the entire system, including battery levels, solar forecast, device statuses, and any active warnings.

*   **Response (JSON)**
    ```json
    {
      "batteryRemainingWh": 4500,
      "batteryCapacityWh": 5000,
      "solarForecastWh": 320.5,
      "energyDeficitWh": 0,
      "overrideMode": false,
      "timestepMinutes": 15,
      "warnings": [
        "Battery depleted",
        "System running in survival mode (critical loads only)"
      ],
      "systemConfig": {
        "panelCapacityKw": 3,
        "batteryCapacityWh": 5000,
        "efficiency": 0.85
      },
      "devices": [
        {
          "id": "1",
          "name": "Refrigerator",
          "powerW": 200,
          "type": "CRITICAL",
          "isOn": true
        }
      ],
      "windowStart": "2026-02-01T10:00:00.000Z",
      "windowEnd": "2026-02-01T10:15:00.000Z"
    }
    ```

### 2. System Configuration

#### GET `/api/config`
Returns the current hardware configuration parameters used for energy calculations.

*   **Response (JSON)**
    ```json
    {
      "panelCapacityKw": 3,
      "batteryCapacityWh": 5000,
      "efficiency": 0.85
    }
    ```

#### POST `/api/config`
Updates system hardware parameters. Supports partial updates (you can send just one field).

*   **Request Body**
    *   `panelCapacityKw` (optional, number > 0): Total solar panel capacity in kW.
    *   `batteryCapacityWh` (optional, number > 0): Total battery storage in Wh.
    *   `efficiency` (optional, number 0-1): System efficiency factor.

    ```json
    {
      "panelCapacityKw": 5.5,
      "efficiency": 0.9
    }
    ```

*   **Response (JSON)**: Returns the updated configuration object.

### 3. Manual Override

#### POST `/api/override`
Enables or disables manual override mode. When enabled, the scheduler stops automatic switching, allowing the user to manually toggle devices.

*   **Request Body**
    *   `overrideMode` (required, boolean): `true` to enable manual control, `false` to resume auto-scheduling.

    ```json
    {
      "overrideMode": true
    }
    ```

*   **Response (JSON)**
    ```json
    {
      "overrideMode": true
    }
    ```
*   **Side Effects**: Pauses/Resumes the automated 15-minute decision engine.

### 4. Device Management

#### GET `/api/devices`
Returns a list of all registered devices in the system.

*   **Response (JSON)**
    ```json
    [
      {
        "id": "1",
        "name": "Security System",
        "powerW": 50,
        "type": "CRITICAL",
        "isOn": true
      }
    ]
    ```

#### POST `/api/devices`
Adds a new device to the scheduler.

*   **Request Body**
    *   `name` (required, string): Device name.
    *   `powerW` (required, number): Power consumption in Watts.
    *   `type` (required, string): Priority level (`CRITICAL`, `FLEXIBLE`, or `OPTIONAL`).

    ```json
    {
      "name": "Electric Heater",
      "powerW": 1500,
      "type": "FLEXIBLE"
    }
    ```

*   **Response (JSON)**: Returns the created device object with a generated `id`.

#### DELETE `/api/devices/:id`
Removes a device from the system.

*   **Response (JSON)**
    ```json
    {
      "message": "Device deleted"
    }
    ```

### 5. Device Control

#### POST `/api/device/:id`
Manually turns a specific device ON or OFF.
**Note:** This endpoint returns a `403 Forbidden` error if `overrideMode` is not set to `true`.

*   **Request Body**
    *   `isOn` (required, boolean): Target status.

    ```json
    {
      "isOn": true
    }
    ```

*   **Response (JSON)**: Returns the updated device object.

## 8. Running the Project Locally

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)

### A. Run ML Engine (Generate Forecast)
```bash
cd ML_Engine
# Run standard forecast (updates ml_forecast.json)
python cli.py --weather sunny
```

### B. Run Backend
```bash
cd Backend
npm install
npm run dev
# Server starts at http://localhost:3000
```

### C. Run Frontend
```bash
cd frontend
npm install
npm run dev
# Dashboard available at http://localhost:5173
```

## 9. Why This Solution Is Different

1.  **Separation of Concerns**: ML focuses on weather/irradiance. Backend focuses on physics (batteries, loads). Frontend focuses on visualization.
2.  **Robust Fallbacks**: The system continues to operate safely even if the ML service goes offline.
3.  **Realistic Hardware Modeling**: We don't just predict "power"; we model the efficiency losses and actual capacity of the installation.

## 10. Future Improvements

*   **Microservice Deployment**: Wrap the Python CLI in a Flask/FastAPI container for live querying.
*   **Cost Optimization**: Integrate grid pricing to charge batteries from the grid during off-peak hours.
*   **Historical Analytics**: Store past performance to refine the user's specific efficiency rating over time (Self-Learning).
