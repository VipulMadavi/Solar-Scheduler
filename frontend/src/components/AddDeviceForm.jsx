import { useState } from "react";
import { Plus } from "lucide-react";

export default function AddDeviceForm({ onAdd }) {
  const [name, setName] = useState("");
  const [power, setPower] = useState("");
  const [type, setType] = useState("FLEXIBLE");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !power) return;

    onAdd({
      id: Date.now().toString(),
      name,
      powerW: Number(power),
      type,
      isOn: false
    });

    setName("");
    setPower("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md dark:shadow-xl border border-slate-200 dark:border-slate-700/50 space-y-4"
    >
      {/* Device Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">
          Device Name
        </label>
        <input
          placeholder="e.g., Water Heater"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Power Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">
          Power Consumption (W)
        </label>
        <input
          type="number"
          placeholder="e.g., 1500"
          value={power}
          onChange={(e) => setPower(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Priority Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">
          Priority Level
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
        >
          <option value="CRITICAL">🔴 Critical (Always On)</option>
          <option value="FLEXIBLE">🟡 Flexible (When Available)</option>
          <option value="OPTIONAL">🟢 Optional (Surplus Only)</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-4 py-2.5 rounded-lg font-semibold text-white shadow-lg shadow-green-900/20 transition-all"
      >
        <Plus size={18} />
        Add Device
      </button>
    </form>
  );
}
