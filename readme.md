# ☀️ Solar-Scheduler

An intelligent, full-stack solar energy management system that predicts solar generation and optimizes device scheduling based on battery state and user priorities.

---

## 🏗️ Project Architecture

The system is divided into three main components:

- **[ML_Engine](./ML_Engine):** Python-based forecasting core using ARIMA + Persistence ensembles to predict solar output (kW).
- **[Backend](./Backend):** Node.js/TypeScript server that manages device states, battery monitoring, and bridges to the ML Engine.
- **Frontend (Upcoming):** React-based dashboard for real-time visualization and manual overrides.

---

## 📂 Root Directory Structure

```text
Solar-Scheduler/
├── ML_Engine/          # Python Forecasting Module
│   ├── src/            # Core ML algorithms
│   ├── api/            # Internal service wrappers
│   ├── data/           # Historical CSV datasets
│   ├── tests/          # Unit test suite
│   └── cli.py          # Integration interface
├── Backend/            # Node.js API & Scheduler
│   ├── src/            # Application logic
│   └── test/           # Backend tests
├── .gitignore          # Project-wide ignores
└── readme.md           # This file
```

---

## ⚡ ML Engine (Status: ✅ Ready)

The ML Engine is the "brain" of the project. It handles:
- **48h Forecasts:** Predicting solar power in kW.
- **Indian Date Format:** Support for `DD-MM-YYYY` inputs.
- **Real-Time Ingestion:** Support for adding new sensor readings on the fly.
- **Pattern Matching:** Smart fallback for out-of-range date requests.

### Quick Start (ML Engine):
```bash
cd ML_Engine
pip install -r requirements.txt
python cli.py --weather sunny --format text
```

---

## ⚙️ Backend Integration (Status: �️ In Progress)

The Backend bridges the physical hardware (simulated or real) with the ML forecasts.
- **Tech Stack:** Node.js, TypeScript, Express.
- **Bridge:** Uses `child_process` to call Python CLI scripts.
- **State Management:** Manages device priorities (CRITICAL, FLEXIBLE, OPTIONAL).

---

## � Features at a Glance

- **ARIMA Ensemble:** Hybrid statistical modeling for accurate solar paths.
- **Dynamic Scheduling:** 15-minute polling interval for device optimization.
- **Battery Protection:** Automatic shutoff of non-critical loads during low solar/battery scenarios.
- **Interactive Testing:** Built-in dashboard simulator for manual validation.

---

## �️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VipulMadavi/Solar-Scheduler.git
   ```

2. **Setup ML Engine:**
   Refer to the [ML_Engine README](./ML_Engine/README.md) for detailed Python setup.

3. **Setup Backend:**
   Refer to the [Backend README](./Backend/README.md) (coming soon) for Node.js setup.

---

*Built with ❤️ for GE-2 HackNagpur | Vipul Madavi*
