import { state } from "./state.service";
import { runScheduler } from "../index";
import { getNextSolarForecastWh } from "./solar.service";

/**
 * Run one scheduler timestep.
 * Reads state, gets forecast, runs scheduler, updates state.
 */
export function runSchedulerTick(): void {
  const solarForecastWh = getNextSolarForecastWh();
  
  const output = runScheduler({
    solarForecastWh,
    batteryRemainingWh: state.batteryRemainingWh,
    batteryCapacityWh: state.batteryCapacityWh,
    devices: state.devices,
    overrideMode: state.overrideMode,
    timestepHours: 0.25,
  });
  
  // Calculate energy deficit (using original battery state before consumption)
  const totalLoadWh = output.devices
    .filter(device => device.isOn)
    .reduce((sum, device) => sum + device.powerW * 0.25, 0);
  
  const availableEnergyWh = state.batteryRemainingWh + solarForecastWh;
  state.energyDeficitWh = Math.max(0, totalLoadWh - availableEnergyWh);
  
  // Update state after deficit calculation
  state.batteryRemainingWh = output.batteryRemainingWh;
  state.devices = output.devices;
  state.lastSolarForecastWh = solarForecastWh;
}
