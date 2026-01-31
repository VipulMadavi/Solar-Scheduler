"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAvailableEnergy = calculateAvailableEnergy;
exports.updateBattery = updateBattery;
/**
 * Calculate total available energy from battery and solar forecast.
 */
function calculateAvailableEnergy(batteryWh, solarForecastWh) {
    return batteryWh + (solarForecastWh || 0);
}
/**
 * Update battery state after consumption and solar generation.
 * Clamps result between 0 and capacity.
 */
function updateBattery(batteryNow, solarForecastWh, totalLoadWh, capacityWh) {
    const solar = solarForecastWh || 0;
    const newBattery = batteryNow + solar - totalLoadWh;
    return Math.max(0, Math.min(newBattery, capacityWh));
}
