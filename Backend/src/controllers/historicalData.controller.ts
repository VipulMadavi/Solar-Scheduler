import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

interface HistoricalDataPoint {
    timestamp: string;
    solar_power_kw: number;
    load_total_kw: number;
}

/**
 * GET /historical-data
 * Returns historical solar and load data from CSV.
 */
export function getHistoricalData(req: Request, res: Response): void {
    try {
        // Path to CSV file in ML_Engine
        const csvPath = path.resolve(__dirname, "../../../ML_Engine/data/solar_data_sunny.csv");

        if (!fs.existsSync(csvPath)) {
            res.status(404).json({ error: "Historical data file not found" });
            return;
        }

        const rawData = fs.readFileSync(csvPath, "utf8");
        const lines = rawData.trim().split(/\r?\n/);

        // Skip header
        const dataLines = lines.slice(1);
        const data: HistoricalDataPoint[] = dataLines.map((line) => {
            const [timestamp, solar_power_kw, load_total_kw] = line.split(",");
            return {
                timestamp: timestamp.trim(),
                solar_power_kw: parseFloat(solar_power_kw),
                load_total_kw: parseFloat(load_total_kw),
            };
        });

        res.json({
            source: "solar_data_sunny.csv",
            recordCount: data.length,
            data,
        });
    } catch (error) {
        console.error("[HistoricalData] Error reading CSV:", error);
        res.status(500).json({ error: "Failed to read historical data" });
    }
}
