export default function ScheduleTimeline({ devices }) {

  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-xl mt-6">

      {/* Title */}
      <h2 className="text-sm text-slate-400 mb-4">
        Load Schedule (Next 24h)
      </h2>

      <div className="space-y-3">

        {devices.map((d) => {

          /* ===============================
             Dynamic usage %
             ON  → higher usage
             OFF → lower usage
          =============================== */

          const percent = d.isOn
            ? 40 + Math.random() * 60
            : Math.random() * 30;

          return (
            <div
              key={d.id}
              className="flex items-center gap-3"
            >

              {/* Device Name */}
              <span className="w-28 text-sm">
                {d.name}
              </span>


              {/* Timeline Bar */}
              <div className="flex-1 bg-slate-700 h-4 rounded overflow-hidden">

                <div
                  className="h-4 bg-green-500 transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />

              </div>


              {/* Percentage */}
              <span className="text-xs text-slate-400 w-10">
                {Math.round(percent)}%
              </span>

            </div>
          );
        })}

      </div>
    </div>
  );
}
