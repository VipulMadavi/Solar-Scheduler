import { useState, useEffect } from "react";
import { getConfig, updateConfig } from "../services/api";
import { Save, RefreshCw, Zap, Battery } from "lucide-react";

export default function SettingsPage() {
    const [config, setConfig] = useState({
        panelCapacityKw: 0,
        batteryCapacityWh: 0,
        efficiency: 0.9
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await getConfig();
            if (res.data) setConfig(res.data);
        } catch (err) {
            console.error("Failed to fetch config:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await updateConfig(config);
            setMessage({ type: "success", text: "Settings saved successfully!" });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error("Failed to save config:", err);
            setMessage({ type: "error", text: "Failed to save settings." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-slate-400">Loading settings...</div>;

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-100 mb-2">System Configuration</h1>
            <p className="text-slate-400 mb-8">Configure your solar panel and battery specifications.</p>

            <form onSubmit={handleSave} className="space-y-6">

                {/* Solar Settings */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                            <Zap size={24} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-200">Solar Array</h2>
                    </div>

                    <div className="grid gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Panel Capacity (kW)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name="panelCapacityKw"
                                value={config.panelCapacityKw}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">Total rated output of your solar panels.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                System Efficiency (0-1.0)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                name="efficiency"
                                value={config.efficiency}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">Efficiency factor accounting for inverter losses, wiring, etc.</p>
                        </div>
                    </div>
                </div>

                {/* Battery Settings */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                            <Battery size={24} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-200">Battery Storage</h2>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Battery Capacity (Wh)
                        </label>
                        <input
                            type="number"
                            step="100"
                            name="batteryCapacityWh"
                            value={config.batteryCapacityWh}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-2">Total energy storage capacity in Watt-hours.</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                    {message && (
                        <div className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {message.text}
                        </div>
                    )}
                    {!message && <div />}

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-cyan-900/20 disabled:opacity-50 transition-all"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                        {saving ? "Saving..." : "Save Configuration"}
                    </button>
                </div>

            </form>
        </div>
    );
}
