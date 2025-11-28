/**
 * Utility functions for phone model operations
 */

import * as THREE from 'three';

/**
 * Apply a screenshot texture to the phone's screen mesh
 */
export const applyScreenshotToScreen = (
  phone: THREE.Group,
  screenshotUrl: string,
  screenMeshName: string,
  textureTransform?: {
    scale?: { x: number; y: number };
    offset?: { x: number; y: number };
    rotation?: number;
  },
  onError?: (error: Error) => void
): void => {
  const texture = new THREE.TextureLoader().load(
    screenshotUrl,
    () => {
      // Configure texture to display exactly as uploaded
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      
      // Apply texture transforms if provided
      if (textureTransform) {
        if (textureTransform.scale) {
          texture.repeat.set(textureTransform.scale.x, textureTransform.scale.y);
        }
        if (textureTransform.offset) {
          texture.offset.set(textureTransform.offset.x, textureTransform.offset.y);
        }
        if (textureTransform.rotation !== undefined) {
          texture.rotation = textureTransform.rotation;
          texture.center.set(0.5, 0.5); // Rotate around center
        }
        
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
      }
      
      // Success callback
      phone.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.name === screenMeshName) {
          updateScreenMaterial(child, texture);
        }
      });
    },
    undefined,
    (error: Error) => {
      // Error callback
      console.error('Failed to load texture:', error);
      onError?.(error);
    }
  );
};

/**
 * Update the screen mesh material with the provided texture
 * Uses MeshBasicMaterial to display the screenshot without lighting effects
 */
const updateScreenMaterial = (mesh: THREE.Mesh, texture: THREE.Texture): void => {
  // Dispose old material to prevent memory leaks
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((m: THREE.Material) => m.dispose());
    } else {
      mesh.material.dispose();
    }
  }
  
  // Use MeshBasicMaterial for the screen to avoid ALL lighting effects
  mesh.material = new THREE.MeshBasicMaterial({
    map: texture,
    toneMapped: false,  // Disable tone mapping
    fog: false,         // Ignore fog
    transparent: false,
    depthWrite: true,
    depthTest: true,
  });
  
  // Ensure the mesh doesn't receive shadows or cast them
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  
  mesh.material.needsUpdate = true;
};

/**
 * Initialize screen materials on the phone model
 * Sets up the screen to display content without lighting effects
 */
export const initializeScreenMaterials = (phone: THREE.Group, screenMeshName: string): void => {
  phone.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh && child.name === screenMeshName) {
      // Use MeshBasicMaterial for unlit, true-to-original appearance
      const existingMap = child.material instanceof THREE.MeshStandardMaterial || 
                         child.material instanceof THREE.MeshBasicMaterial
                         ? child.material.map 
                         : null;
      
      child.material = new THREE.MeshBasicMaterial({
        map: existingMap,
        color: 0xffffff,
        toneMapped: false,
      });
    }
  });
};

