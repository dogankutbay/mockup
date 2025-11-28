/**
 * Phone Model Configurations
 * Define available phone models and their properties
 */

export interface PhoneModelConfig {
  id: string;
  name: string;
  displayName: string;
  modelPath: string;
  screenMeshName: string;
  screenResolution: {
    width: number;
    height: number;
  };
  manufacturer: 'apple' | 'samsung';
  cameraPosition: {
    x: number;
    y: number;
    z: number;
  };
  textureTransform?: {
    scale?: { x: number; y: number };
    offset?: { x: number; y: number };
    rotation?: number; // in radians
  };
}

export const PHONE_MODELS: PhoneModelConfig[] = [
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    displayName: 'iPhone 15 Pro',
    modelPath: '/iphone2.glb',
    screenMeshName: 'Screen',
    screenResolution: {
      width: 393,
      height: 852,
    },
    manufacturer: 'apple',
    cameraPosition: {
      x: 5,
      y: 0,
      z: 12.40,
    },
  },
  {
    id: 'samsung-s21',
    name: 'Samsung Galaxy S21',
    displayName: 'Samsung Galaxy S21',
    modelPath: '/samsung21.glb',
    screenMeshName: 'Display_ActiveArea_1',
    screenResolution: {
      width: 360,
      height: 800,
    },
    manufacturer: 'samsung',
    cameraPosition: {
      x: 0.08,
      y: 0,
      z: 0.14,
    },
    textureTransform: {
      scale: { x: 2.2, y: 1 },  // Start with 0.5 width to make it narrower
      offset: { x: 0.6, y: 0 }, // Center it (0.25 = (1-0.5)/2)
      rotation: 0,
    },
  },
];

export const getPhoneModelById = (id: string): PhoneModelConfig | undefined => {
  return PHONE_MODELS.find((model) => model.id === id);
};

export const DEFAULT_PHONE_MODEL = PHONE_MODELS[0];

