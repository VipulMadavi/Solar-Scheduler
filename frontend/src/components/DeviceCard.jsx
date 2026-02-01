import { Wind, Zap, Server, Trash2, Pencil } from "lucide-react";

const colors = {
  CRITICAL: "bg-red-500",
  FLEXIBLE: "bg-yellow-500",
  OPTIONAL: "bg-green-500",
};

const icons = {
  CRITICAL: <Server size={18} />,
  FLEXIBLE: <Wind size={18} />,
  OPTIONAL: <Zap size={18} />,
};

/**
 * Toggle Switch Component - Modern ON/OFF toggle
 */
function ToggleSwitch({ isOn, disabled, onChange }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`
        relative inline-flex h-7 w-12 items-center rounded-full 
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isOn ? 'bg-green-500' : 'bg-slate-600'}
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow-lg
          transition-transform duration-200 ease-in-out
          ${isOn ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}

export default function DeviceCard({
  device,
  disabled,
  onToggle,
  onDelete,
  onEdit
}) {
  return (
    <div className="
      bg-white dark:bg-slate-800 
      p-4 
      rounded-xl 
      shadow-md dark:shadow-lg 
      flex 
      justify-between 
      items-center
      hover:shadow-xl 
      transition-all duration-300
      border border-slate-200 dark:border-slate-700/50
    ">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[device.type]}/20 text-${device.type === 'CRITICAL' ? 'red' : device.type === 'FLEXIBLE' ? 'yellow' : 'green'}-400`}>
          {icons[device.type]}
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{device.name}</h3>

          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${colors[device.type]} text-white font-medium`}>
              {device.type}
            </span>
            <span className="text-xs text-slate-400">{device.powerW} W</span>
          </div>
        </div>
      </div>


      {/* RIGHT CONTROLS */}
      <div className="flex items-center gap-4">

        {/* Status Label */}
        <span className={`text-xs font-semibold ${device.isOn ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
          {device.isOn ? 'ON' : 'OFF'}
        </span>

        {/* Toggle Switch */}
        <ToggleSwitch
          isOn={device.isOn}
          disabled={disabled}
          onChange={() => onToggle(device.id, !device.isOn)}
        />

        {/* Edit */}
        {onEdit && (
          <button
            disabled={disabled}
            onClick={() => onEdit(device)}
            className="
              text-blue-400 
              hover:text-blue-300 
              disabled:opacity-40 
              disabled:cursor-not-allowed
              p-1.5 rounded-lg hover:bg-slate-700/50 transition
            "
            title="Edit device"
          >
            <Pencil size={16} />
          </button>
        )}

        {/* Delete with confirmation */}
        {onDelete && (
          <button
            disabled={disabled}
            onClick={() => {
              const ok = window.confirm(
                `Delete "${device.name}" permanently?`
              );
              if (ok) onDelete(device.id);
            }}
            className="
              text-red-400 
              hover:text-red-300 
              disabled:opacity-40 
              disabled:cursor-not-allowed
              p-1.5 rounded-lg hover:bg-slate-700/50 transition
            "
            title="Delete device"
          >
            <Trash2 size={16} />
          </button>
        )}

      </div>
    </div>
  );
}
