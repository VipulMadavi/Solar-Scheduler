# conftest.py
"""
Pytest configuration and fixtures for ML_Engine tests
"""
import pytest
import sys
from pathlib import Path

# Add ML_Engine root to Python path for imports
ML_ENGINE_ROOT = Path(__file__).parent
sys.path.insert(0, str(ML_ENGINE_ROOT))


@pytest.fixture
def sunny_data():
    """Load sunny weather historical data"""
    from src.data_utils import load_solar_csv
    csv_path = ML_ENGINE_ROOT / "data" / "solar_data_sunny.csv"
    return load_solar_csv(str(csv_path))


@pytest.fixture
def cloudy_data():
    """Load cloudy weather historical data"""
    from src.data_utils import load_solar_csv
    csv_path = ML_ENGINE_ROOT / "data" / "solar_data_cloudy.csv"
    return load_solar_csv(str(csv_path))


@pytest.fixture
def sample_forecast(sunny_data):
    """Generate a 24-hour forecast from sunny data"""
    from src.forecast_solar import forecast_solar
    return forecast_solar(sunny_data)
