export interface SystemConfig {
  panelCapacityKw: number;
  batteryCapacityWh: number;
  efficiency: number;
}

export class SystemConfigurationService {
  private config: SystemConfig;

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
  public getSystemConfig(): SystemConfig {
    return { ...this.config };
  }

  /**
   * Updates the system configuration with partial values.
   * @param partialConfig Partial configuration to update
   */
  public updateSystemConfig(partialConfig: Partial<SystemConfig>): void {
    this.config = {
      ...this.config,
      ...partialConfig,
    };
  }
}

export const systemConfigurationService = new SystemConfigurationService();
