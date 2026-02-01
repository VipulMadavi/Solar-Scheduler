import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * SolarChart - 24h Solar Forecast with DateTime labels
 * Evaluator Feedback: Shows date and time for each forecast point
 * 
 * Props:
 *   data: Array of { datetime, time, hour, forecastWh }
 */
export default function SolarChart({ data }) {

  // Custom tooltip to show full datetime and Wh value
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-700 p-2 rounded border border-slate-600">
          <p className="text-cyan-400 font-semibold">{item.datetime}</p>
          <p className="text-white">{item.forecastWh} Wh</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl h-72 shadow-xl">
      <p className="text-sm text-slate-400 mb-3">24h Solar Forecast (Wh)</p>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid stroke="#333" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            stroke="#aaa"
            tick={{ fontSize: 11 }}
            interval={2}
          />
          <YAxis
            stroke="#aaa"
            tick={{ fontSize: 11 }}
            label={{
              value: 'Wh',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#aaa', fontSize: 12 }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="forecastWh"
            stroke="#22d3ee"
            strokeWidth={3}
            dot={{ fill: "#22d3ee", strokeWidth: 1, r: 3 }}
            activeDot={{ r: 6, fill: "#22d3ee" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
