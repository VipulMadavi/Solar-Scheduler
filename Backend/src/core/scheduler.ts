import { Device, SchedulerInput } from "./types";

/**
 * Automatic scheduler logic.
 * Runs ONCE per timestep.
 */
export function scheduleDevices(input: SchedulerInput): Device[] {
  // If override is active, scheduler does nothing
  if (input.overrideMode) {
    return input.devices;
  }

  // Work on a copy to keep things deterministic
  const devices: Device[] = input.devices.map(d => ({ ...d }));

  // Calculate available energy: battery + solar forecast
  let availableEnergyWh = input.batteryRemainingWh + (input.solarForecastWh || 0);

  for (const device of devices) {
    if (device.type === "CRITICAL") {
      device.isOn = true;
      availableEnergyWh -= device.powerW * input.timestepHours;
    }
  }

  for (const device of devices) {
    if (device.type === "FLEXIBLE") {
      const requiredWh = device.powerW * input.timestepHours;

      if (availableEnergyWh >= requiredWh) {
        device.isOn = true;
        availableEnergyWh -= requiredWh;
      } else {
        device.isOn = false;
      }
    }
  }

  for (const device of devices) {
    if (device.type === "OPTIONAL") {
      const requiredWh = device.powerW * input.timestepHours;

      if (availableEnergyWh >= requiredWh) {
        device.isOn = true;
        availableEnergyWh -= requiredWh;
      } else {
        device.isOn = false;
      }
    }
  }

  return devices;
}
