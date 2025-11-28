/**
 * Utility functions for exporting images
 */

import * as THREE from 'three';
import { EXPORT } from '../config/constants';

/**
 * Export canvas content as PNG image at fixed square resolution with transparent background
 */
export const exportCanvasAsImage = (
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer
): void => {
  try {
    // Store original settings
    const originalWidth = renderer.domElement.width;
    const originalHeight = renderer.domElement.height;
    const originalAspect = (camera as THREE.PerspectiveCamera).aspect;
    const originalBackground = scene.background;

    // Set transparent background for export
    scene.background = null;

    // Set export size (square)
    renderer.setSize(EXPORT.WIDTH, EXPORT.HEIGHT, false);
    (camera as THREE.PerspectiveCamera).aspect = EXPORT.WIDTH / EXPORT.HEIGHT;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    // Render at export size with transparent background
    renderer.render(scene, camera);

    // Get the image data (PNG with alpha channel)
    const dataUrl = renderer.domElement.toDataURL(EXPORT.IMAGE_FORMAT);
    
    // Restore original settings
    scene.background = originalBackground;
    renderer.setSize(originalWidth, originalHeight, false);
    (camera as THREE.PerspectiveCamera).aspect = originalAspect;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    // Download the image
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = EXPORT.FILE_NAME;
    link.click();
  } catch (error) {
    console.error('Failed to export image:', error);
    throw new Error('Failed to export image. Please try again.');
  }
};

/**
 * Validate file is an image and within size limits
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file' };
  }

  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeBytes) {
    return { valid: false, error: 'Image file is too large (max 10MB)' };
  }

  return { valid: true };
};

