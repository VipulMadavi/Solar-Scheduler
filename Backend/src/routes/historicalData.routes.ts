import { Router } from "express";
import { getHistoricalData } from "../controllers/historicalData.controller";

const router = Router();

router.get("/", getHistoricalData);

export default router;
