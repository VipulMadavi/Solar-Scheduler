export default function BatteryBar({ percent }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl">
      <p className="text-sm text-slate-400 mb-2">Battery</p>

      <div className="w-full bg-slate-700 h-4 rounded">
        <div
          className="h-4 bg-green-500 rounded"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 font-bold">{percent}%</p>
    </div>
  );
}
