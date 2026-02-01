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

export default function DeviceCard({
  device,
  disabled,
  onToggle,
  onDelete,
  onEdit
}) {
  return (
    <div className="
      bg-slate-800 
      p-4 
      rounded-xl 
      shadow-lg 
      flex 
      justify-between 
      items-center
      hover:shadow-xl 
      transition
    ">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        {icons[device.type]}

        <div>
          <h3 className="font-semibold">{device.name}</h3>

          <span className={`text-xs px-2 py-1 rounded ${colors[device.type]}`}>
            {device.type}
          </span>

          <p className="text-xs text-slate-400">{device.powerW} W</p>
        </div>
      </div>


      {/* RIGHT CONTROLS */}
      <div className="flex items-center gap-3">

        {/* Toggle */}
        <input
          type="checkbox"
          checked={device.isOn}
          disabled={disabled}
          onChange={() => onToggle(device.id, !device.isOn)}
          className="cursor-pointer"
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
            "
            title="Edit device"
          >
            <Pencil size={18} />
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
            "
            title="Delete device"
          >
            <Trash2 size={18} />
          </button>
        )}

      </div>
    </div>
  );
}
