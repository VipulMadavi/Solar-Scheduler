"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const system_routes_1 = __importDefault(require("./routes/system.routes"));
const scheduler_service_1 = require("./services/scheduler.service");
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
// Middleware
app.use(express_1.default.json());
// Mount API routes
app.use("/api", system_routes_1.default);
// Run scheduler tick on startup
(0, scheduler_service_1.runSchedulerTick)();
// Run scheduler tick every 15 minutes (900000 ms)
setInterval(() => {
    (0, scheduler_service_1.runSchedulerTick)();
}, 15 * 60 * 1000);
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
