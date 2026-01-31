import { systemConfigurationService } from "./systemConfiguration";
import { Device } from "../core/types";

const config = systemConfigurationService.getSystemConfig();

/**
 * In-memory state object.
 * Mutate directly: state.batteryRemainingWh = 1000;
 */
export const state = {
  batteryRemainingWh: config.batteryCapacityWh,
  batteryCapacityWh: config.batteryCapacityWh,
  devices: [
    { id: "1", name: "Security System", powerW: 50, type: "CRITICAL", isOn: false },
    { id: "2", name: "Refrigerator", powerW: 200, type: "CRITICAL", isOn: false },
    { id: "3", name: "AC Unit", powerW: 1500, type: "FLEXIBLE", isOn: false },
    { id: "4", name: "Washing Machine", powerW: 500, type: "FLEXIBLE", isOn: false },
    { id: "5", name: "Pool Pump", powerW: 750, type: "OPTIONAL", isOn: false },
  ] as Device[],
  overrideMode: false,
  lastSolarForecastWh: 0,
  energyDeficitWh: 0,
  timestepMinutes: 15,
  windowStart: new Date().toISOString(),
  windowEnd: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
};
