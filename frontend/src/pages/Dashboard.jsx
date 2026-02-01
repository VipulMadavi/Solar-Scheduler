import { useEffect, useState } from "react";

import BatteryBar from "../components/BatteryBar";
import ForecastCard from "../components/ForecastCard";
import OverrideToggle from "../components/OverrideToggle";
import DeviceCard from "../components/DeviceCard";
import SolarChart from "../components/SolarChart";
import GanttTimeline from "../components/GanttTimeline";
import AddDeviceForm from "../components/AddDeviceForm";

import {
  getState,
  toggleDevice,
  addDevice,
  deleteDevice,
  updateDevice,
  setOverride as setOverrideApi,
  get24hForecast
} from "../services/api";


export default function Dashboard() {

  /* ===============================
     STATES
  =============================== */

  const [battery, setBattery] = useState(0);
  const [forecast, setForecast] = useState(0);
  const [overrideMode, setOverrideMode] = useState(false);
  const [devices, setDevices] = useState([]);
  const [chartData, setChartData] = useState([]);


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
     DELETE
  =============================== */

  const handleDeleteDevice = async (id) => {
    await deleteDevice(id);
    setDevices(prev => prev.filter(d => d.id !== id));
  };


  /* ===============================
     EDIT
  =============================== */

  const handleEditDevice = async (device) => {
    const name = prompt("Device name:", device.name);
    const power = prompt("Power (W):", device.powerW);
    const type = prompt("Type (CRITICAL/FLEXIBLE/OPTIONAL):", device.type);

    if (!name || !power || !type) return;

    const updated = {
      ...device,
      name,
      powerW: Number(power),
      type
    };

    await updateDevice(updated);

    setDevices(prev =>
      prev.map(d => (d.id === device.id ? updated : d))
    );
  };


  /* ===============================
     ADD
  =============================== */

  const handleAddDevice = async (device) => {
    try {
      const res = await addDevice(device);
      // Use the device from backend response (includes real UUID)
      setDevices(prev => [...prev, res.data]);
    } catch (error) {
      console.error("Failed to add device:", error);
    }
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
     UI
  =============================== */

  return (
    <div className="p-8 space-y-6">

      {/* TOP */}
      <div className="grid grid-cols-2 gap-6">
        <BatteryBar percent={battery} />
        <ForecastCard value={forecast} />
      </div>


      {/* CHART */}
      <SolarChart data={chartData} />


      {/* MODE TOGGLE */}
      <OverrideToggle
        override={overrideMode}
        setOverride={handleOverrideToggle}
      />


      {/* ADD DEVICE FORM */}
      <AddDeviceForm onAdd={handleAddDevice} />


      {/* DEVICE LIST */}
      <div className="grid grid-cols-2 gap-4">
        {devices.map(d => (
          <DeviceCard
            key={d.id}
            device={d}
            disabled={!overrideMode}
            onToggle={toggleDeviceLocal}
            onDelete={handleDeleteDevice}   // ✅ added
            onEdit={handleEditDevice}       // ✅ added
          />
        ))}
      </div>


      {/* GANTT TIMELINE */}
      <GanttTimeline devices={devices} forecast={chartData} />

    </div>
  );
}
