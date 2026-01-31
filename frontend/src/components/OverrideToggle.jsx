export default function OverrideToggle({ override, setOverride }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl flex justify-between items-center">
      <span className="font-semibold">Mode</span>

      <button
        onClick={() => setOverride(!override)}
        className={`px-4 py-2 rounded ${
          override ? "bg-yellow-500" : "bg-green-600"
        }`}
      >
        {override ? "MANUAL" : "AUTO"}
      </button>
    </div>
  );
}
