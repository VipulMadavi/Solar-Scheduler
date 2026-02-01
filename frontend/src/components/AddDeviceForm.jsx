import { useState } from "react";

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
      className="bg-slate-800 p-4 rounded-xl shadow-xl flex gap-3 items-end"
    >
      <input
        placeholder="Device name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-2 rounded bg-slate-700"
      />

      <input
        type="number"
        placeholder="Power (W)"
        value={power}
        onChange={(e) => setPower(e.target.value)}
        className="p-2 rounded bg-slate-700 w-28"
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="p-2 rounded bg-slate-700"
      >
        <option>CRITICAL</option>
        <option>FLEXIBLE</option>
        <option>OPTIONAL</option>
      </select>

      <button
        className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
      >
        Add
      </button>
    </form>
  );
}
