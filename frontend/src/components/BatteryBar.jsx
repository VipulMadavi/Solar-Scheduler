export default function BatteryBar({ percent }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md dark:shadow-none transition-colors duration-300">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Battery</p>

      <div className="w-full bg-slate-200 dark:bg-slate-700 h-4 rounded overflow-hidden">
        <div
          className="h-4 bg-green-500 rounded transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 font-bold text-slate-900 dark:text-white">{percent}%</p>
    </div>
  );
}
