import { Shield, Cpu } from "lucide-react";

/**
 * Override Toggle - Switch between AUTO and MANUAL (Emergency Override) mode
 * Mutation B: Manual override required for emergency operations
 */
export default function OverrideToggle({ override, setOverride }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md dark:shadow-none bg-slate-100 flex justify-between items-center transition-colors duration-300">
      {/* Mode Label */}
      <div className="flex items-center gap-2">
        {override ? (
          <Shield size={18} className="text-yellow-400" />
        ) : (
          <Cpu size={18} className="text-green-400" />
        )}
        <span className="text-sm font-medium text-slate-400">Mode:</span>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setOverride(!override)}
        className={`
          relative flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
          transition-all duration-200 shadow-lg
          ${override
            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-900/30"
            : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-900/30"
          }
        `}
      >
        <span className={`
          w-2 h-2 rounded-full
          ${override ? 'bg-white animate-pulse' : 'bg-white/80'}
        `} />
        {override ? "MANUAL OVERRIDE" : "AUTO SCHEDULER"}
      </button>

    </div>
  );
}
