/**
 * Application Constants
 * Central location for all magic numbers and configuration values
 */

// Camera Settings
export const CAMERA = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: {
    X: 5,
    Y: 0,
    Z: 10,
  },
} as const;

// Lighting Configuration
export const LIGHTING = {
  AMBIENT: {
    COLOR: 0xffffff,
    INTENSITY: 2,
  },
  DIRECTIONAL: {
    COLOR: 0xffffff,
    INTENSITY: 1,
    POSITION: { X: 5, Y: 5, Z: 5 },
  },
  SPOT: {
    COLOR: 0xffffff,
    INTENSITY: 0.9,
    POSITION: { X: 0, Y: 25, Z: 25 },
    ANGLE: 0.4,
    PENUMBRA: 0.8,
    DECAY: 1.5,
    DISTANCE: 100,
  },
  POINT: {
    COLOR: 0xffffff,
    INTENSITY: 2,
    DISTANCE: 50,
    POSITION: { X: 0, Y: 0, Z: 5 },
  },
} as const;

// Orbit Controls Configuration
export const ORBIT_CONTROLS = {
  // Azimuth angle limits (horizontal rotation)
  MIN_AZIMUTH: -Math.PI / 3, // -60 degrees
  MAX_AZIMUTH: Math.PI / 3,   // 60 degrees
  // Polar angle limits (vertical rotation)
  MIN_POLAR: Math.PI / 4,           // 45 degrees
  MAX_POLAR: (3 * Math.PI) / 4,     // 135 degrees
} as const;

// Export Settings
export const EXPORT = {
  IMAGE_FORMAT: 'image/png',
  FILE_NAME: 'mockup.png',
  WIDTH: 2048,
  HEIGHT: 2048,
} as const;

// File Upload
export const FILE_UPLOAD = {
  ACCEPTED_TYPES: 'image/*',
  MAX_SIZE_MB: 10,
} as const;

