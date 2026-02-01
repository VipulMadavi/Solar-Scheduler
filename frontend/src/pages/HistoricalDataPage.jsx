import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import axios from "axios";
import Spinner from "../components/Spinner";

export default function HistoricalDataPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get("http://localhost:5000/api/historical-data");
                setData(res.data.data);
            } catch (err) {
                setError("Failed to load historical data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-red-500 text-center">
                {error}
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
                Historical Data
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
                This chart displays historical solar power generation and load consumption data used for forecasting.
            </p>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="timestamp"
                            tick={{ fill: "#94a3b8", fontSize: 10 }}
                            tickFormatter={(val) => val.slice(5, 16)}
                            interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fill: "#94a3b8" }} unit=" kW" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e293b",
                                borderColor: "#334155",
                                borderRadius: "0.5rem",
                            }}
                            labelStyle={{ color: "#94a3b8" }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="solar_power_kw"
                            name="Solar Power (kW)"
                            stroke="#facc15"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="load_total_kw"
                            name="Load (kW)"
                            stroke="#38bdf8"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
