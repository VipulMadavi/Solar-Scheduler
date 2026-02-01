import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { state } from "../services/state.service";
import { systemConfigurationService } from "../services/systemConfiguration";

/**
 * GET /state
 * Return current system state
 */
export function getState(req: Request, res: Response): void {
  const warnings: string[] = [];

  // Check for battery depletion
  if (state.batteryRemainingWh === 0) {
    warnings.push("Battery depleted");
  }

  // Check for energy deficit
  if (state.energyDeficitWh > 0) {
    warnings.push("Insufficient energy to sustain current loads");

    // Check if only CRITICAL devices are ON
    const devicesOn = state.devices.filter(d => d.isOn);
    const onlyCriticalOn = devicesOn.length > 0 && devicesOn.every(d => d.type === "CRITICAL");

    if (onlyCriticalOn) {
      warnings.push("System running in survival mode (critical loads only)");
    }
  }

  res.json({
    batteryRemainingWh: state.batteryRemainingWh,
    batteryCapacityWh: state.batteryCapacityWh,
    windowStart: state.windowStart,
    windowEnd: state.windowEnd,
    timestepMinutes: state.timestepMinutes,
    devices: state.devices,
    overrideMode: state.overrideMode,
    lastSolarForecastWh: state.lastSolarForecastWh,
    energyDeficitWh: state.energyDeficitWh,
    solarForecastWh: state.lastSolarForecastWh,
    warnings,
    systemConfig: systemConfigurationService.getSystemConfig(),
  });
}

/**
 * POST /override
 * Enable or disable override mode
 * Body: { overrideMode: boolean }
 */
export function setOverride(req: Request, res: Response): void {
  const { overrideMode } = req.body;

  if (typeof overrideMode !== "boolean") {
    res.status(400).json({ error: "overrideMode must be a boolean" });
    return;
  }

  state.overrideMode = overrideMode;
  res.json({ overrideMode: state.overrideMode });
}

/**
 * POST /device/:id
 * Manually turn a device ON/OFF
 * Body: { isOn: boolean }
 * Only allowed if overrideMode === true
 */
export function setDevice(req: Request, res: Response): void {
  if (!state.overrideMode) {
    res.status(403).json({ error: "Override mode must be enabled to manually control devices" });
    return;
  }

  const { id } = req.params;
  const { isOn } = req.body;

  if (typeof isOn !== "boolean") {
    res.status(400).json({ error: "isOn must be a boolean" });
    return;
  }

  const device = state.devices.find(d => d.id === id);
  if (!device) {
    res.status(404).json({ error: "Device not found" });
    return;
  }

  device.isOn = isOn;
  res.json(device);
}

/**
 * GET /devices
 * Return all devices
 */
export function getDevices(req: Request, res: Response): void {
  res.json(state.devices);
}

/**
 * POST /devices
 * Add a new device
 * Body: { name, powerW, type }
 */
export function addDevice(req: Request, res: Response): void {
  const { name, powerW, type } = req.body;

  if (!name || powerW === undefined || !type) {
    res.status(400).json({ error: "Missing required fields: name, powerW, type" });
    return;
  }

  const device = {
    id: randomUUID(),
    name,
    powerW,
    type,
    isOn: false,
  };

  state.devices.push(device);
  res.json(device);
}

/**
 * PUT /devices/:id
 * Update an existing device
 * Body: { name?, powerW?, type? }
 */
export function updateDevice(req: Request, res: Response): void {
  const { id } = req.params;
  const { name, powerW, type } = req.body;

  const device = state.devices.find(d => d.id === id);
  if (!device) {
    res.status(404).json({ error: "Device not found" });
    return;
  }

  // Update only provided fields
  if (name !== undefined) device.name = name;
  if (powerW !== undefined) device.powerW = powerW;
  if (type !== undefined) device.type = type;

  res.json(device);
}

/**
 * DELETE /devices/:id
 * Delete a device by id
 */
export function deleteDevice(req: Request, res: Response): void {
  const { id } = req.params;

  const index = state.devices.findIndex(d => d.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Device not found" });
    return;
  }

  state.devices.splice(index, 1);
  res.json({ message: "Device deleted" });
}

/**
 * GET /config
 * Return system configuration
 */
export function getSystemConfig(req: Request, res: Response): void {
  res.json(systemConfigurationService.getSystemConfig());
}

/**
 * POST /config
 * Update system configuration (partial update)
 * Body: { panelCapacityKw?, batteryCapacityWh?, efficiency? }
 */
export function updateSystemConfig(req: Request, res: Response): void {
  const { panelCapacityKw, batteryCapacityWh, efficiency } = req.body;
  const updates: any = {};

  if (panelCapacityKw !== undefined) {
    if (typeof panelCapacityKw !== 'number' || panelCapacityKw <= 0) {
      res.status(400).json({ error: "panelCapacityKw must be a number > 0" });
      return;
    }
    updates.panelCapacityKw = panelCapacityKw;
  }

  if (batteryCapacityWh !== undefined) {
    if (typeof batteryCapacityWh !== 'number' || batteryCapacityWh <= 0) {
      res.status(400).json({ error: "batteryCapacityWh must be a number > 0" });
      return;
    }
    updates.batteryCapacityWh = batteryCapacityWh;
  }

  if (efficiency !== undefined) {
    if (typeof efficiency !== 'number' || efficiency <= 0 || efficiency > 1) {
      res.status(400).json({ error: "efficiency must be a number > 0 and <= 1" });
      return;
    }
    updates.efficiency = efficiency;
  }

  systemConfigurationService.updateSystemConfig(updates);
  res.json(systemConfigurationService.getSystemConfig());
}

/**
 * GET /forecast
 * Return 24h solar forecast with datetime labels
 * Evaluator Feedback: Show date and time for each forecast point
 */
export function get24hForecast(req: Request, res: Response): void {
  const config = systemConfigurationService.getSystemConfig();
  const now = new Date();

  // Generate 24 hourly forecast points with datetime
  const forecast: Array<{
    datetime: string;
    time: string;
    hour: number;
    forecastWh: number;
  }> = [];

  for (let i = 0; i < 24; i++) {
    const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = forecastTime.getHours();

    // Solar curve: peaks at noon (hour 12), zero at night
    // Using sine wave approximation for solar generation
    let solarMultiplier = 0;
    if (hour >= 6 && hour <= 18) {
      // Daylight hours: 6 AM to 6 PM
      // Peak at noon (hour 12)
      const dayProgress = (hour - 6) / 12; // 0 to 1
      solarMultiplier = Math.sin(dayProgress * Math.PI);
    }

    // Calculate Wh for 1-hour period
    // Formula: panelCapacity (kW) * 1000 * efficiency * solarMultiplier * 1 hour
    const forecastWh = Math.round(
      config.panelCapacityKw * 1000 * config.efficiency * solarMultiplier
    );

    // Format datetime for display (DD/MM HH:MM)
    const dateStr = forecastTime.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit'
    });
    const timeStr = forecastTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    forecast.push({
      datetime: `${dateStr} ${timeStr}`,
      time: timeStr,
      hour: hour,
      forecastWh: forecastWh
    });
  }

  res.json({
    generatedAt: now.toISOString(),
    panelCapacityKw: config.panelCapacityKw,
    efficiency: config.efficiency,
    forecast: forecast
  });
}
