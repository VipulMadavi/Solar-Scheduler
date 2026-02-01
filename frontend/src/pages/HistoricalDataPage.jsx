import { useEffect, useState, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush,
} from "recharts";
import axios from "axios";
import Spinner from "../components/Spinner";
import { Calendar, Clock, Filter } from "lucide-react";

export default function HistoricalDataPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState("24h"); // '24h', '3d', 'all'

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

    const filteredData = useMemo(() => {
        if (!data || data.length === 0) return [];
        if (timeRange === "all") return data;

        const limit = timeRange === "24h" ? 24 : 72;
        // Assuming data is sorted by timestamp, return the most recent points
        return data.slice(-limit);
    }, [data, timeRange]);

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

    const formatTimestamp = (val) => {
        const date = new Date(val);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const RangeButton = ({ range, label, icon: Icon }) => (
        <button
            onClick={() => setTimeRange(range)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${timeRange === range
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
        >
            <Icon size={16} />
            <span className="font-medium text-sm">{label}</span>
        </button>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Historical Data
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Visualizing historical generation and load patterns
                    </p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <RangeButton range="24h" label="Last 24h" icon={Clock} />
                    <RangeButton range="3d" label="Last 3 Days" icon={Calendar} />
                    <RangeButton range="all" label="All History" icon={Filter} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl transition-colors duration-300">
                <div className="h-[500px] w-100%">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="timestamp"
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                                tickFormatter={formatTimestamp}
                                minTickGap={30}
                                axisLine={{ stroke: '#334155' }}
                                tickLine={{ stroke: '#334155' }}
                            />
                            <YAxis
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                                unit=" kW"
                                axisLine={{ stroke: '#334155' }}
                                tickLine={{ stroke: '#334155' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#0f172a",
                                    borderColor: "#334155",
                                    borderRadius: "0.75rem",
                                    color: "#f8fafc",
                                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                                }}
                                itemStyle={{ fontSize: '13px' }}
                                labelStyle={{ color: "#94a3b8", marginBottom: '8px', fontWeight: 'bold' }}
                            />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ paddingBottom: '20px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="solar_power_kw"
                                name="Solar Power"
                                stroke="#facc15"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                            <Line
                                type="monotone"
                                dataKey="load_total_kw"
                                name="Total Load"
                                stroke="#38bdf8"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                            <Brush
                                dataKey="timestamp"
                                height={40}
                                stroke="#334155"
                                fill="#0f172a"
                                tickFormatter={formatTimestamp}
                            >
                                <LineChart>
                                    <Line dataKey="solar_power_kw" stroke="#facc15" strokeWidth={1} dot={false} />
                                    <Line dataKey="load_total_kw" stroke="#38bdf8" strokeWidth={1} dot={false} />
                                </LineChart>
                            </Brush>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <h3 className="text-yellow-500 font-bold mb-1 flex items-center gap-2">
                        <Clock size={16} /> Solar Peak Insight
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Highest solar generation typically occurs between 11:00 AM and 2:00 PM.
                    </p>
                </div>
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                    <h3 className="text-cyan-500 font-bold mb-1 flex items-center gap-2">
                        <Filter size={16} /> Load Consistency
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Identifying recurring load spikes helps in optimizing device schedules.
                    </p>
                </div>
            </div>
        </div>
    );
}
