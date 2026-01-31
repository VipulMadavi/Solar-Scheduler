import { Router } from "express";
import { getState, setOverride, setDevice, getDevices, addDevice, deleteDevice, getSystemConfig, updateSystemConfig } from "../controllers/system.controller";

const router = Router();

router.get("/state", getState);
router.post("/override", setOverride);
router.post("/device/:id", setDevice);
router.get("/devices", getDevices);
router.post("/devices", addDevice);
router.delete("/devices/:id", deleteDevice);
router.get("/config", getSystemConfig);
router.post("/config", updateSystemConfig);

export default router;
