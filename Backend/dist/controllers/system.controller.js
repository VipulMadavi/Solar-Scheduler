"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getState = getState;
exports.setOverride = setOverride;
exports.setDevice = setDevice;
exports.getDevices = getDevices;
exports.addDevice = addDevice;
exports.deleteDevice = deleteDevice;
exports.getSystemConfig = getSystemConfig;
exports.updateSystemConfig = updateSystemConfig;
const crypto_1 = require("crypto");
const state_service_1 = require("../services/state.service");
const systemConfiguration_1 = require("../services/systemConfiguration");
/**
 * GET /state
 * Return current system state
 */
function getState(req, res) {
    const warnings = [];
    // Check for battery depletion
    if (state_service_1.state.batteryRemainingWh === 0) {
        warnings.push("Battery depleted");
    }
    // Check for energy deficit
    if (state_service_1.state.energyDeficitWh > 0) {
        warnings.push("Insufficient energy to sustain current loads");
        // Check if only CRITICAL devices are ON
        const devicesOn = state_service_1.state.devices.filter(d => d.isOn);
        const onlyCriticalOn = devicesOn.length > 0 && devicesOn.every(d => d.type === "CRITICAL");
        if (onlyCriticalOn) {
            warnings.push("System running in survival mode (critical loads only)");
        }
    }
    res.json({
        batteryRemainingWh: state_service_1.state.batteryRemainingWh,
        batteryCapacityWh: state_service_1.state.batteryCapacityWh,
        windowStart: state_service_1.state.windowStart,
        windowEnd: state_service_1.state.windowEnd,
        timestepMinutes: state_service_1.state.timestepMinutes,
        devices: state_service_1.state.devices,
        overrideMode: state_service_1.state.overrideMode,
        lastSolarForecastWh: state_service_1.state.lastSolarForecastWh,
        energyDeficitWh: state_service_1.state.energyDeficitWh,
        solarForecastWh: state_service_1.state.lastSolarForecastWh,
        warnings,
        systemConfig: systemConfiguration_1.systemConfigurationService.getSystemConfig(),
    });
}
/**
 * POST /override
 * Enable or disable override mode
 * Body: { overrideMode: boolean }
 */
function setOverride(req, res) {
    const { overrideMode } = req.body;
    if (typeof overrideMode !== "boolean") {
        res.status(400).json({ error: "overrideMode must be a boolean" });
        return;
    }
    state_service_1.state.overrideMode = overrideMode;
    res.json({ overrideMode: state_service_1.state.overrideMode });
}
/**
 * POST /device/:id
 * Manually turn a device ON/OFF
 * Body: { isOn: boolean }
 * Only allowed if overrideMode === true
 */
function setDevice(req, res) {
    if (!state_service_1.state.overrideMode) {
        res.status(403).json({ error: "Override mode must be enabled to manually control devices" });
        return;
    }
    const { id } = req.params;
    const { isOn } = req.body;
    if (typeof isOn !== "boolean") {
        res.status(400).json({ error: "isOn must be a boolean" });
        return;
    }
    const device = state_service_1.state.devices.find(d => d.id === id);
    if (!device) {
        res.status(404).json({ error: "Device not found" });
        return;
    }
    device.isOn = isOn;
    res.json(device);
}
/**
 * GET /devices
 * Return all devices
 */
function getDevices(req, res) {
    res.json(state_service_1.state.devices);
}
/**
 * POST /devices
 * Add a new device
 * Body: { name, powerW, type }
 */
function addDevice(req, res) {
    const { name, powerW, type } = req.body;
    if (!name || powerW === undefined || !type) {
        res.status(400).json({ error: "Missing required fields: name, powerW, type" });
        return;
    }
    const device = {
        id: (0, crypto_1.randomUUID)(),
        name,
        powerW,
        type,
        isOn: false,
    };
    state_service_1.state.devices.push(device);
    res.json(device);
}
/**
 * DELETE /devices/:id
 * Delete a device by id
 */
function deleteDevice(req, res) {
    const { id } = req.params;
    const index = state_service_1.state.devices.findIndex(d => d.id === id);
    if (index === -1) {
        res.status(404).json({ error: "Device not found" });
        return;
    }
    state_service_1.state.devices.splice(index, 1);
    res.json({ message: "Device deleted" });
}
/**
 * GET /config
 * Return system configuration
 */
function getSystemConfig(req, res) {
    res.json(systemConfiguration_1.systemConfigurationService.getSystemConfig());
}
/**
 * POST /config
 * Update system configuration (partial update)
 * Body: { panelCapacityKw?, batteryCapacityWh?, efficiency? }
 */
function updateSystemConfig(req, res) {
    const { panelCapacityKw, batteryCapacityWh, efficiency } = req.body;
    const updates = {};
    if (panelCapacityKw !== undefined) {
        if (typeof panelCapacityKw !== 'number' || panelCapacityKw <= 0) {
            res.status(400).json({ error: "panelCapacityKw must be a number > 0" });
            return;
        }
        updates.panelCapacityKw = panelCapacityKw;
    }
    if (batteryCapacityWh !== undefined) {
        if (typeof batteryCapacityWh !== 'number' || batteryCapacityWh <= 0) {
            res.status(400).json({ error: "batteryCapacityWh must be a number > 0" });
            return;
        }
        updates.batteryCapacityWh = batteryCapacityWh;
    }
    if (efficiency !== undefined) {
        if (typeof efficiency !== 'number' || efficiency <= 0 || efficiency > 1) {
            res.status(400).json({ error: "efficiency must be a number > 0 and <= 1" });
            return;
        }
        updates.efficiency = efficiency;
    }
    systemConfiguration_1.systemConfigurationService.updateSystemConfig(updates);
    res.json(systemConfiguration_1.systemConfigurationService.getSystemConfig());
}
