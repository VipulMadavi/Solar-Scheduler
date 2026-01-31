import { Device } from "../core/types";

/**
 * In-memory state object.
 * Mutate directly: state.batteryRemainingWh = 1000;
 */
export const state = {
  batteryRemainingWh: 0,
  batteryCapacityWh: 5000,
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
};
