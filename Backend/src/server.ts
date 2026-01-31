import express from "express";
import routes from "./routes/system.routes";
import { runSchedulerTick } from "./services/scheduler.service";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Mount API routes
app.use("/api", routes);

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
