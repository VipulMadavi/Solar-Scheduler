"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runScheduler = runScheduler;
const scheduler_1 = require("./core/scheduler");
const battery_1 = require("./core/battery");
/**
 * Run scheduler for one timestep.
 * Returns updated device states and battery level.
 */
function runScheduler(input) {
    const devices = (0, scheduler_1.scheduleDevices)(input);
    const totalLoadWh = devices
        .filter(device => device.isOn)
        .reduce((sum, device) => sum + device.powerW * input.timestepHours, 0);
    const batteryRemainingWh = (0, battery_1.updateBattery)(input.batteryRemainingWh, input.solarForecastWh, totalLoadWh, input.batteryCapacityWh);
    return { devices, batteryRemainingWh };
}
