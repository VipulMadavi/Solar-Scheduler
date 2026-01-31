"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSchedulerTick = runSchedulerTick;
const state_service_1 = require("./state.service");
const index_1 = require("../index");
const solar_service_1 = require("./solar.service");
/**
 * Run one scheduler timestep.
 * Reads state, gets forecast, runs scheduler, updates state.
 */
function runSchedulerTick() {
    const solarForecastWh = (0, solar_service_1.getNextSolarForecastWh)();
    const output = (0, index_1.runScheduler)({
        solarForecastWh,
        batteryRemainingWh: state_service_1.state.batteryRemainingWh,
        batteryCapacityWh: state_service_1.state.batteryCapacityWh,
        devices: state_service_1.state.devices,
        overrideMode: state_service_1.state.overrideMode,
        timestepHours: 0.25,
    });
    // Calculate energy deficit (using original battery state before consumption)
    const totalLoadWh = output.devices
        .filter(device => device.isOn)
        .reduce((sum, device) => sum + device.powerW * 0.25, 0);
    const availableEnergyWh = state_service_1.state.batteryRemainingWh + solarForecastWh;
    state_service_1.state.energyDeficitWh = Math.max(0, totalLoadWh - availableEnergyWh);
    // Update state after deficit calculation
    state_service_1.state.batteryRemainingWh = output.batteryRemainingWh;
    state_service_1.state.devices = output.devices;
    state_service_1.state.lastSolarForecastWh = solarForecastWh;
    // Update time window metadata
    state_service_1.state.windowStart = new Date().toISOString();
    state_service_1.state.windowEnd = new Date(Date.now() + state_service_1.state.timestepMinutes * 60 * 1000).toISOString();
}
