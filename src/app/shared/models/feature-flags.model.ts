export interface FeatureFlags {
  enableCategories: boolean;
  enableDarkMode: boolean;
  enableExport: boolean;
  maxTasksPerUser: number;
  maintenanceMode: boolean;
  welcomeMessage: string;
}

export const DEFAULT_FLAGS: FeatureFlags = {
  enableCategories: true,
  enableDarkMode: false,
  enableExport: false,
  maxTasksPerUser: 100,
  maintenanceMode: false,
  welcomeMessage: 'Bienvenido a TaskApp',
};
