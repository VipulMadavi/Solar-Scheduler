export default function ForecastCard({ value }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md dark:shadow-none transition-colors duration-300">
      <p className="text-sm text-slate-500 dark:text-slate-400">Next 15 min Solar</p>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{value} Wh</h2>
    </div>
  );
}
