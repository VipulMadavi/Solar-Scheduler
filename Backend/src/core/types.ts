// Device priority categories
export type DeviceType = "CRITICAL" | "FLEXIBLE" | "OPTIONAL";

// Single controllable load
export interface Device {
  id: string;
  name: string;
  powerW: number;     // rated power in watts
  type: DeviceType;
  isOn: boolean;
}

// Input to scheduler for ONE time step
export interface SchedulerInput {
  solarForecastWh?: number;     // predicted solar energy for next timestep
  batteryRemainingWh: number;   // current battery energy
  batteryCapacityWh: number;    // max battery energy
  devices: Device[];
  overrideMode: boolean;        // manual override flag
  timestepHours: number;        // e.g. 0.25 for 15 minutes
}

// Output after scheduler runs
export interface SchedulerOutput {
  devices: Device[];
  batteryRemainingWh: number;
}
