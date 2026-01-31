"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.state = void 0;
const systemConfiguration_1 = require("./systemConfiguration");
const config = systemConfiguration_1.systemConfigurationService.getSystemConfig();
/**
 * In-memory state object.
 * Mutate directly: state.batteryRemainingWh = 1000;
 */
exports.state = {
    batteryRemainingWh: config.batteryCapacityWh,
    batteryCapacityWh: config.batteryCapacityWh,
    devices: [
        { id: "1", name: "Security System", powerW: 50, type: "CRITICAL", isOn: false },
        { id: "2", name: "Refrigerator", powerW: 200, type: "CRITICAL", isOn: false },
        { id: "3", name: "AC Unit", powerW: 1500, type: "FLEXIBLE", isOn: false },
        { id: "4", name: "Washing Machine", powerW: 500, type: "FLEXIBLE", isOn: false },
        { id: "5", name: "Pool Pump", powerW: 750, type: "OPTIONAL", isOn: false },
    ],
    overrideMode: false,
    lastSolarForecastWh: 0,
    energyDeficitWh: 0,
    timestepMinutes: 15,
    windowStart: new Date().toISOString(),
    windowEnd: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
};
