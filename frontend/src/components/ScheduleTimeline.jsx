export default function ScheduleTimeline({ devices }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-xl">
      <h2 className="text-sm text-slate-400 mb-4">Load Schedule (Next 24h)</h2>

      <div className="space-y-3">
        {devices.map(d => (
          <div key={d.id} className="flex items-center gap-3">

            <span className="w-20 text-sm">{d.name}</span>

            <div className="flex-1 bg-slate-700 h-4 rounded overflow-hidden">
              <div
                className={`h-4 ${
                  d.on ? "bg-green-500 w-3/4" : "bg-gray-500 w-1/4"
                }`}
              />
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
