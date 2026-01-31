import { Wind, Zap, Server } from "lucide-react";

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

export default function DeviceCard({ device, disabled, onToggle }) {
  return (
    <div className="
      bg-slate-800 
      p-4 
      rounded-xl 
      flex 
      justify-between 
      items-center 
      shadow-lg 
      hover:scale-[1.02] 
      transition
    ">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">

        {/* ICON */}
        <div className="text-slate-300">
          {icons[device.type]}
        </div>

        {/* NAME + TYPE */}
        <div>
          <h3 className="font-semibold">{device.name}</h3>

          <span
            className={`text-xs px-2 py-1 rounded ${colors[device.type]}`}
          >
            {device.type}
          </span>
        </div>
      </div>


      {/* RIGHT SIDE (modern toggle) */}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={device.on}
          disabled={disabled}
          onChange={() => onToggle(device.id, !device.on)}
        />

        <div className="
          w-11 h-6 bg-gray-600 rounded-full 
          peer-checked:bg-green-500
          peer-disabled:opacity-40
          after:content-['']
          after:absolute after:top-[2px] after:left-[2px]
          after:bg-white after:h-5 after:w-5
          after:rounded-full after:transition-all
          peer-checked:after:translate-x-5
        "></div>
      </label>

    </div>
  );
}
