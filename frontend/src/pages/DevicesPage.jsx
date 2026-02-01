import { useState, useEffect } from "react";
import DeviceCard from "../components/DeviceCard";
import AddDeviceForm from "../components/AddDeviceForm";
import OverrideToggle from "../components/OverrideToggle";
import {
    getDevices,
    addDevice,
    deleteDevice,
    toggleDevice,
    updateDevice,
    getState,
    setOverride as setOverrideApi
} from "../services/api";

export default function DevicesPage() {
    const [devices, setDevices] = useState([]);
    const [overrideMode, setOverrideMode] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch initial state
    useEffect(() => {
        fetchState();
        // Poll for updates (in case scheduler changes states)
        const interval = setInterval(fetchState, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchState = async () => {
        try {
            const res = await getState();
            const data = res?.data || {};
            setDevices(data.devices || []);
            setOverrideMode(data.overrideMode || false);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch state:", err);
            setLoading(false);
        }
    };

    const handleAddDevice = async (device) => {
        try {
            const res = await addDevice(device);
            setDevices(prev => [...prev, res.data]);
        } catch (error) {
            console.error("Failed to add device:", error);
        }
    };

    const handleDeleteDevice = async (id) => {
        try {
            await deleteDevice(id);
            setDevices(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error("Failed to delete device:", error);
        }
    };

    const handleToggleDevice = async (id, isOn) => {
        try {
            await toggleDevice(id, isOn);
            setDevices(prev => prev.map(d => d.id === id ? { ...d, isOn } : d));
        } catch (error) {
            console.error("Failed to toggle device:", error);
        }
    };

    const handleEditDevice = async (device) => {
        const name = prompt("Device name:", device.name);
        const power = prompt("Power (W):", device.powerW);
        const type = prompt("Type (CRITICAL/FLEXIBLE/OPTIONAL):", device.type);

        if (!name || !power || !type) return;

        const updated = {
            ...device,
            name,
            powerW: Number(power),
            type
        };

        try {
            await updateDevice(updated);
            setDevices(prev => prev.map(d => (d.id === device.id ? updated : d)));
        } catch (error) {
            console.error("Failed to update device:", error);
        }
    };

    const handleOverrideToggle = async (newMode) => {
        try {
            await setOverrideApi(newMode);
            setOverrideMode(newMode);
        } catch (error) {
            console.error("Failed to set override mode:", error);
        }
    };

    if (loading) return <div className="p-8 text-slate-400">Loading devices...</div>;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Device Management</h1>
                    <p className="text-slate-400 mt-1">Manage connected appliances and priority levels</p>
                </div>

                <OverrideToggle
                    override={overrideMode}
                    setOverride={handleOverrideToggle}
                />
            </div>

            {/* Warning if not in Manual Mode */}
            {!overrideMode && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                    <p className="text-sm">
                        System is in <strong>AUTO</strong> mode. Enable <strong>MANUAL</strong> mode above to toggle devices ON/OFF manually.
                    </p>
                </div>
            )}

            {/* Add Device/Device Grid */}
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Left Col: Add Form */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <h2 className="text-lg font-semibold text-slate-300 mb-4">Add New Device</h2>
                        <AddDeviceForm onAdd={handleAddDevice} />
                    </div>
                </div>

                {/* Right Col: Device List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-semibold text-slate-300">Connected Devices ({devices.length})</h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {devices.map(device => (
                            <DeviceCard
                                key={device.id}
                                device={device}
                                disabled={!overrideMode}
                                onToggle={handleToggleDevice}
                                onDelete={handleDeleteDevice}
                                onEdit={handleEditDevice}
                            />
                        ))}

                        {devices.length === 0 && (
                            <div className="col-span-full border-2 border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500">
                                No devices found. Add one to get started.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
