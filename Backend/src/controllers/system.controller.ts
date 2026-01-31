import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { state } from "../services/state.service";

/**
 * GET /state
 * Return current system state
 */
export function getState(req: Request, res: Response): void {
  res.json({
    batteryRemainingWh: state.batteryRemainingWh,
    batteryCapacityWh: state.batteryCapacityWh,
    devices: state.devices,
    overrideMode: state.overrideMode,
    lastSolarForecastWh: state.lastSolarForecastWh,
    energyDeficitWh: state.energyDeficitWh,
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
