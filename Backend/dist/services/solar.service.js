"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextSolarForecastWh = getNextSolarForecastWh;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const systemConfiguration_1 = require("./systemConfiguration");
/**
 * Reads ML forecast from file or falls back to mock logic.
 * Returns energy in Wh for next 15 minutes.
 */
function getNextSolarForecastWh() {
    const config = systemConfiguration_1.systemConfigurationService.getSystemConfig();
    // Attempt to read ML forecast file
    try {
        const forecastPath = path.resolve(__dirname, '../../ml_forecast.json');
        if (fs.existsSync(forecastPath)) {
            const rawData = fs.readFileSync(forecastPath, 'utf8');
            const forecast = JSON.parse(rawData);
            // Validate forecast data
            if (typeof forecast.avgKw1h === 'number') {
                const avgKw1h = forecast.avgKw1h;
                // Calculate Wh: AvgkW * 1000 * 0.25 hours * system_efficiency
                // Note: The math logic requested: Wh = avgKw1h * 1000 * 0.25 * efficiency
                // The prompt says "avgKw1h = value shown as Avg (1h)", which is usually per unit area or total.
                // Assuming avgKw1h from ML is capable power. If ML output is per panel capacity, we might need to multiply by capacity.
                // However, the prompt says "Convert avgKw1h (kW) into Wh... Wh = avgKw1h * 1000 * 0.25 * efficiency".
                // It does NOT mention multiplying by panelCapacityKw again implicitly if avgKw1h is already total.
                // If ML output is raw solar irradiance (kW/m2) or normalized, we might need capacity.
                // But let's follow the FORMULA given strictly: Wh = avgKw1h * 1000 * 0.25 * efficiency 
                const solarForecastWh = avgKw1h * 1000 * 0.25 * config.efficiency;
                console.log(`[SolarService] Using ML forecast: ${avgKw1h} kW -> ${solarForecastWh} Wh`);
                return solarForecastWh;
            }
        }
    }
    catch (error) {
        console.warn(`[SolarService] Failed to read ML forecast: ${error.message}. Using fallback.`);
    }
    // Fallback Logic
    // Assume ML provides baseSunlightKw (kW per 1kW panel).
    const baseSunlightKw = 1.2;
    // Compute actual power output in kW
    const actualPowerKw = baseSunlightKw * config.panelCapacityKw * config.efficiency;
    // Convert to Wh for the 15-minute window (0.25 hours)
    const solarForecastWh = actualPowerKw * 1000 * 0.25;
    return solarForecastWh;
}
