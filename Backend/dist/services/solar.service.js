"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextSolarForecastWh = getNextSolarForecastWh;
/**
 * Mock solar forecast prediction.
 * Returns energy in Wh for next 15 minutes.
 * Easy to replace with real ML model later.
 */
function getNextSolarForecastWh() {
    // Random value between 0 and 2000 Wh (realistic for 15-minute window)
    // Can be replaced with actual ML prediction
    return 100;
}
