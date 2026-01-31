/**
 * Mock solar forecast prediction.
 * Returns energy in Wh for next 15 minutes.
 * Easy to replace with real ML model later.
 */
export function getNextSolarForecastWh(): number {
  // Random value between 0 and 2000 Wh (realistic for 15-minute window)
  // Can be replaced with actual ML prediction
  return 10;
}
