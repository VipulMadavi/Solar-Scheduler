import { SchedulerInput, SchedulerOutput } from "./core/types";
import { scheduleDevices } from "./core/scheduler";
import { updateBattery } from "./core/battery";

/**
 * Run scheduler for one timestep.
 * Returns updated device states and battery level.
 */
export function runScheduler(input: SchedulerInput): SchedulerOutput {
  const devices = scheduleDevices(input);
  
  const totalLoadWh = devices
    .filter(device => device.isOn)
    .reduce((sum, device) => sum + device.powerW * input.timestepHours, 0);
  
  const batteryRemainingWh = updateBattery(
    input.batteryRemainingWh,
    input.solarForecastWh,
    totalLoadWh,
    input.batteryCapacityWh
  );
  
  return { devices, batteryRemainingWh };
}
