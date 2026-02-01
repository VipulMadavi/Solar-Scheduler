/**
 * GanttTimeline - Load Schedule as Gantt Chart
 * Evaluator Feedback: Show power usage by time (not percentages)
 * 
 * Displays a 24-hour timeline (0h-24h) with device power usage bars
 * Each device shows scheduled ON periods with actual power (W)
 */

const HOURS = Array.from({ length: 25 }, (_, i) => i); // 0 to 24

// Color coding by device type
const typeColors = {
    CRITICAL: { bg: "bg-red-500", fill: "#ef4444" },
    FLEXIBLE: { bg: "bg-yellow-500", fill: "#eab308" },
    OPTIONAL: { bg: "bg-green-500", fill: "#22c55e" },
};

export default function GanttTimeline({ devices, forecast = [] }) {

    // Get current hour for timeline marker
    const currentHour = new Date().getHours();

    // Calculate scheduled hours for each device based on forecast
    // Devices run when there's enough solar (simplified logic)
    const getScheduledHours = (device) => {
        const scheduled = [];

        // CRITICAL: Always on (24h)
        if (device.type === "CRITICAL") {
            return Array.from({ length: 24 }, (_, i) => i);
        }

        // FLEXIBLE/OPTIONAL: Run during peak solar hours (or when device is ON)
        if (device.isOn) {
            // If currently ON, show as running from current hour
            for (let h = currentHour; h < Math.min(currentHour + 4, 24); h++) {
                scheduled.push(h);
            }
        }

        // Also add high-solar hours (10-16)
        if (device.type === "FLEXIBLE") {
            for (let h = 10; h <= 16; h++) {
                if (!scheduled.includes(h)) scheduled.push(h);
            }
        }

        if (device.type === "OPTIONAL") {
            // Only peak hours (12-14)
            for (let h = 12; h <= 14; h++) {
                if (!scheduled.includes(h)) scheduled.push(h);
            }
        }

        return scheduled.sort((a, b) => a - b);
    };

    // Calculate total power consumption
    const getTotalPower = () => {
        return devices
            .filter(d => d.isOn)
            .reduce((sum, d) => sum + d.powerW, 0);
    };

    return (
        <div className="bg-slate-800 p-4 rounded-xl shadow-xl mt-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm text-slate-400">
                    Load Schedule (Next 24h)
                </h2>
                <span className="text-xs text-slate-400">
                    Current Load: <span className="text-cyan-400 font-semibold">{getTotalPower()} W</span>
                </span>
            </div>

            {/* Time axis header */}
            <div className="flex mb-2 pl-28">
                <div className="flex-1 flex">
                    {[0, 6, 12, 18, 24].map(h => (
                        <div
                            key={h}
                            className="text-xs text-slate-500"
                            style={{
                                width: h === 24 ? 'auto' : '25%',
                                marginLeft: h === 0 ? 0 : '-8px'
                            }}
                        >
                            {h.toString().padStart(2, '0')}:00
                        </div>
                    ))}
                </div>
            </div>

            {/* Device rows */}
            <div className="space-y-2">
                {devices.map((device) => {
                    const scheduledHours = getScheduledHours(device);
                    const color = typeColors[device.type] || typeColors.FLEXIBLE;

                    return (
                        <div key={device.id} className="flex items-center gap-3">

                            {/* Device info */}
                            <div className="w-28 flex-shrink-0">
                                <span className="text-sm font-medium truncate block">
                                    {device.name}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {device.powerW} W
                                </span>
                            </div>

                            {/* Gantt bar container */}
                            <div className="flex-1 relative bg-slate-700 h-8 rounded overflow-hidden">

                                {/* Current time marker */}
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-10"
                                    style={{ left: `${(currentHour / 24) * 100}%` }}
                                />

                                {/* Scheduled blocks */}
                                {scheduledHours.map(hour => (
                                    <div
                                        key={hour}
                                        className={`absolute top-1 bottom-1 rounded-sm ${color.bg} opacity-80 hover:opacity-100 transition-opacity`}
                                        style={{
                                            left: `${(hour / 24) * 100}%`,
                                            width: `${(1 / 24) * 100}%`,
                                        }}
                                        title={`${device.name}: ${device.powerW}W @ ${hour.toString().padStart(2, '0')}:00`}
                                    />
                                ))}

                                {/* Hour grid lines */}
                                {[6, 12, 18].map(h => (
                                    <div
                                        key={h}
                                        className="absolute top-0 bottom-0 w-px bg-slate-600"
                                        style={{ left: `${(h / 24) * 100}%` }}
                                    />
                                ))}
                            </div>

                            {/* Status indicator */}
                            <div className="w-12 text-right">
                                <span className={`text-xs font-medium ${device.isOn ? 'text-green-400' : 'text-slate-500'}`}>
                                    {device.isOn ? 'ON' : 'OFF'}
                                </span>
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 pt-3 border-t border-slate-700">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-500 rounded-sm" />
                    <span className="text-xs text-slate-400">Critical</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
                    <span className="text-xs text-slate-400">Flexible</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-green-500 rounded-sm" />
                    <span className="text-xs text-slate-400">Optional</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-3 h-0.5 bg-cyan-400" />
                    <span className="text-xs text-slate-400">Now</span>
                </div>
            </div>

        </div>
    );
}
