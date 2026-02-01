import { useEffect, useState } from "react";
import BatteryBar from "../components/BatteryBar";
import ForecastCard from "../components/ForecastCard";
import OverrideToggle from "../components/OverrideToggle";
import DeviceCard from "../components/DeviceCard";
import SolarChart from "../components/SolarChart";
import GanttTimeline from "../components/GanttTimeline";

import {
  getState,
  toggleDevice,
  setOverride as setOverrideApi,
  get24hForecast
} from "../services/api";

import { RefreshCw } from "lucide-react";
import Spinner from "../components/Spinner";


export default function Dashboard() {

  /* ===============================
     STATES
  =============================== */

  const [battery, setBattery] = useState(0);
  const [forecast, setForecast] = useState(0);
  const [overrideMode, setOverrideMode] = useState(false);
  const [devices, setDevices] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());


  /* ===============================
     FETCH STATE
  =============================== */

  const fetchState = async () => {
    try {
      const res = await getState();
      const data = res?.data || {};

      const percent =
        (data.batteryRemainingWh / data.batteryCapacityWh) * 100;

      setBattery(Math.round(percent));
      setForecast(data.lastSolarForecastWh ?? 0);
      setDevices(data.devices ?? []);
      setOverrideMode(data.overrideMode ?? false);

    } catch {
      console.log("API fallback");
    }
  };


  /* ===============================
     FETCH 24H FORECAST
  =============================== */

  const fetch24hForecast = async () => {
    try {
      const res = await get24hForecast();
      const data = res?.data?.forecast || [];
      setChartData(data);
    } catch {
      console.log("Forecast fallback");
    }
  };


  /* ===============================
     POLLING
  =============================== */

  useEffect(() => {
    fetchState();
    fetch24hForecast();
    const id = setInterval(fetchState, 8000);
    return () => clearInterval(id);
  }, []);


  /* ===============================
     TOGGLE
  =============================== */

  const toggleDeviceLocal = async (id, newState) => {
    await toggleDevice(id, newState);

    setDevices(prev =>
      prev.map(d =>
        d.id === id ? { ...d, isOn: newState } : d
      )
    );
  };


  /* ===============================
     OVERRIDE TOGGLE
  =============================== */

  const handleOverrideToggle = async (newMode) => {
    try {
      await setOverrideApi(newMode);
      setOverrideMode(newMode);
    } catch (error) {
      console.error("Failed to set override mode:", error);
    }
  };


  /* ===============================
     REFRESH
  =============================== */

  const handleManualRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchState(), fetch24hForecast()]);
    setLastUpdated(new Date());
    setLoading(false);
  };


  /* ===============================
     UI
  =============================== */

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
            {loading && <Spinner size="sm" />}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="p-1 hover:text-cyan-400 disabled:opacity-50 transition"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <OverrideToggle
          override={overrideMode}
          setOverride={handleOverrideToggle}
        />
      </div>

      {/* TOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BatteryBar percent={battery} />
        <ForecastCard value={forecast} />
      </div>

      {/* CHART */}
      <SolarChart data={chartData} />

      {/* TIMELINE */}
      <GanttTimeline devices={devices} forecast={chartData} />

      {/* DEVICE STATUS (Read Only) */}
      <div className="pt-4">
        <h2 className="text-lg font-semibold text-slate-300 mb-4">Device Status</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(d => (
            <DeviceCard
              key={d.id}
              device={d}
              disabled={!overrideMode}
              onToggle={toggleDeviceLocal}
            // No delete/edit props = read-only mode
            />
          ))}
          {devices.length === 0 && (
            <p className="text-slate-500 italic col-span-full">
              No devices connected.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
