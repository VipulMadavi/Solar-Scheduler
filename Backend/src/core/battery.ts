/**
 * Calculate total available energy from battery and solar forecast.
 */
export function calculateAvailableEnergy(
  batteryWh: number,
  solarForecastWh?: number
): number {
  return batteryWh + (solarForecastWh || 0);
}

/**
 * Update battery state after consumption and solar generation.
 * Clamps result between 0 and capacity.
 */
export function updateBattery(
  batteryNow: number,
  solarForecastWh: number | undefined,
  totalLoadWh: number,
  capacityWh: number
): number {
  const solar = solarForecastWh || 0;
  const newBattery = batteryNow + solar - totalLoadWh;
  return Math.max(0, Math.min(newBattery, capacityWh));
}
