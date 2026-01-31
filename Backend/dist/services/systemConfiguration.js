"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemConfigurationService = exports.SystemConfigurationService = void 0;
class SystemConfigurationService {
    constructor() {
        this.config = {
            panelCapacityKw: 3,
            batteryCapacityWh: 5000,
            efficiency: 0.85,
        };
    }
    /**
     * Returns the current system configuration.
     * Returns a copy to prevent direct mutation.
     */
    getSystemConfig() {
        return { ...this.config };
    }
    /**
     * Updates the system configuration with partial values.
     * @param partialConfig Partial configuration to update
     */
    updateSystemConfig(partialConfig) {
        this.config = {
            ...this.config,
            ...partialConfig,
        };
    }
}
exports.SystemConfigurationService = SystemConfigurationService;
exports.systemConfigurationService = new SystemConfigurationService();
