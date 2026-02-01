import { Router } from "express";
import { getState, setOverride, setDevice, getDevices, addDevice, updateDevice, deleteDevice, getSystemConfig, updateSystemConfig, get24hForecast } from "../controllers/system.controller";

const router = Router();

router.get("/state", getState);
router.post("/override", setOverride);
router.post("/device/:id", setDevice);
router.get("/devices", getDevices);
router.post("/devices", addDevice);
router.put("/devices/:id", updateDevice);
router.delete("/devices/:id", deleteDevice);
router.get("/config", getSystemConfig);
router.post("/config", updateSystemConfig);
router.get("/forecast", get24hForecast);

export default router;
