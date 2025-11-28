/**
 * TypeScript Type Definitions
 */

import * as THREE from 'three';

// Phone Model Types
export interface PhoneModel extends THREE.Group {
  traverse: (callback: (object: THREE.Object3D) => void) => void;
}

// Screenshot Types
export type ScreenshotData = string | null;

// Error Types
export interface AppError {
  message: string;
  type: 'model_load' | 'screenshot_upload' | 'export' | 'unknown';
}

// Loading State
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Three.js Scene Objects
export interface ThreeSceneObjects {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: any; // OrbitControls type from three/examples
}

