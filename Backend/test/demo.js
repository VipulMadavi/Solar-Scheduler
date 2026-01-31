"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
// Define devices
const devices = [
    { id: "1", name: "Security System", powerW: 50, type: "CRITICAL", isOn: false },
    { id: "2", name: "Refrigerator", powerW: 200, type: "CRITICAL", isOn: false },
    { id: "3", name: "AC Unit", powerW: 1500, type: "FLEXIBLE", isOn: false },
    { id: "4", name: "Washing Machine", powerW: 500, type: "FLEXIBLE", isOn: false },
    { id: "5", name: "Pool Pump", powerW: 750, type: "OPTIONAL", isOn: false },
];
// Initial state
let batteryRemainingWh = 300;
const batteryCapacityWh = 5000;
const timestepHours = 0.25; // 15 minutes
// Solar forecast for each timestep (varying)
const solarForecasts = [500, 800, 1200, 300, 1000, 0, 1500];
// Run simulation
console.log("=== Solar Scheduler Demo ===\n");
for (let timestep = 0; timestep < solarForecasts.length; timestep++) {
    const solarForecastWh = solarForecasts[timestep];
    // Copy devices for this timestep
    const timestepDevices = devices.map(d => ({ ...d }));
    // Override mode on timestep 4 (index 3)
    const isOverrideMode = timestep === 3;
    if (isOverrideMode) {
        // Manual override: CRITICAL ON, others OFF
        timestepDevices.forEach(device => {
            device.isOn = device.type === "CRITICAL";
        });
    }
    const input = {
        solarForecastWh,
        batteryRemainingWh,
        batteryCapacityWh,
        devices: timestepDevices,
        overrideMode: isOverrideMode,
        timestepHours,
    };
    const output = (0, index_1.runScheduler)(input);
    // Update state for next iteration
    batteryRemainingWh = output.batteryRemainingWh;
    // Log results
    console.log(`Timestep ${timestep + 1}:`);
    if (isOverrideMode) {
        console.log(`  *** OVERRIDE MODE ACTIVE ***`);
    }
    console.log(`  Battery: ${batteryRemainingWh.toFixed(1)} Wh`);
    console.log(`  Solar Forecast: ${solarForecastWh} Wh`);
    console.log(`  Devices ON:`);
    const devicesOn = output.devices.filter(d => d.isOn);
    if (devicesOn.length === 0) {
        console.log(`    (none)`);
    }
    else {
        devicesOn.forEach(device => {
            console.log(`    - ${device.name} (${device.type}, ${device.powerW}W)`);
        });
    }
    console.log();
}
