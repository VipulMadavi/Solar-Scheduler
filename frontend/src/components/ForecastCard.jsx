export default function ForecastCard({ value }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl">
      <p className="text-sm text-slate-400">Next 15 min Solar</p>
      <h2 className="text-3xl font-bold">{value} Wh</h2>
    </div>
  );
}
