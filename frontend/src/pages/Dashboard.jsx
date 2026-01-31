import { useEffect, useState } from "react";
import BatteryBar from "../components/BatteryBar";
import ForecastCard from "../components/ForecastCard";
import OverrideToggle from "../components/OverrideToggle";
import DeviceCard from "../components/DeviceCard";
import { getState, toggleDevice } from "../services/mockApi";
import SolarChart from "../components/SolarChart";
import ScheduleTimeline from "../components/ScheduleTimeline";


export default function Dashboard() {

  // ✅ dummy chart data
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}h`,
    value: 120 + Math.floor(Math.random() * 150),
  }));

  const [battery, setBattery] = useState(70);
  const [forecast, setForecast] = useState(200);
  const [override, setOverride] = useState(false);
  const [devices, setDevices] = useState([]);

  // ✅ polling
  const fetchState = async () => {
    try {
      const res = await getState();
      const data = res?.data || {};

      setBattery(data.battery ?? 70);
      setForecast(data.forecast ?? 200);
      setDevices(data.devices ?? []);
      setOverride(data.override ?? false);

    } catch {
      setDevices([
        { id: 1, name: "Pump", type: "FLEXIBLE", on: true },
        { id: 2, name: "AC", type: "OPTIONAL", on: false },
        { id: 3, name: "Server", type: "CRITICAL", on: true },
      ]);
    }
  };

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 8000);
    return () => clearInterval(id);
  }, []);

  // ✅ CORRECT toggle (uses mock API)
  const toggleDeviceLocal = async (id, newState) => {
    await toggleDevice(id, newState);

    setDevices(prev =>
      prev.map(d =>
        d.id === id ? { ...d, on: newState } : d
      )
    );
  };

  return (
    <div className="p-8 space-y-6">

      {/* TOP */}
      <div className="grid grid-cols-2 gap-6">
        <BatteryBar percent={battery} />
        <ForecastCard value={forecast} />
      </div>

      {/* ✅ CHART ADDED HERE */}
      <SolarChart data={chartData} />

      {/* MIDDLE */}
      <OverrideToggle override={override} setOverride={setOverride} />

      {/* BOTTOM */}
      <div className="grid grid-cols-2 gap-4">
        {devices.map(d => (
          <DeviceCard
            key={d.id}
            device={d}
            disabled={!override}
            onToggle={toggleDeviceLocal}   // ✅ fixed
          />
        ))}
      </div>
      <ScheduleTimeline devices={devices} />
    </div>
    
  );
}
