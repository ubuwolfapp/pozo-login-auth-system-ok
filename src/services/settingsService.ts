
// Re-export all settings modules from this central file
import { userSettingsService } from './settings/userSettingsService';
import { wellThresholdsService } from './settings/wellThresholdsService';
export * from './settings';

// Create a combined service for backward compatibility
export const settingsService = {
  ...userSettingsService,
  ...wellThresholdsService
};
