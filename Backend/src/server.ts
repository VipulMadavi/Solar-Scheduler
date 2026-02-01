import express from "express";
import cors from "cors";
import routes from "./routes/system.routes";
import historicalDataRoutes from "./routes/historicalData.routes";
import { runSchedulerTick } from "./services/scheduler.service";
const app = express();
const PORT = 5000;

app.use(cors());

// Middleware
app.use(express.json());

// Mount API routes
app.use("/api", routes);
app.use("/api/historical-data", historicalDataRoutes);

// Run scheduler tick on startup
runSchedulerTick();

// Run scheduler tick every 15 minutes (900000 ms)
setInterval(() => {
  runSchedulerTick();
}, 15 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
