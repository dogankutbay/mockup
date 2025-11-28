/**
 * Custom hook for automatically fitting phone model inside video frame
 */

import { useEffect } from 'react';
import * as THREE from 'three';
import type { PhoneModel } from '../types';

interface UseVideoFrameFittingOptions {
  phoneModel: PhoneModel | null;
  camera: THREE.PerspectiveCamera | null;
  controls: any; // OrbitControls
  mode: 'picture' | 'video';
  hasKeyframes: boolean; // Don't auto-fit if user has keyframes
}

export const useVideoFrameFitting = ({
  phoneModel,
  camera,
  controls,
  mode,
  hasKeyframes,
}: UseVideoFrameFittingOptions) => {
  useEffect(() => {
    // Don't auto-fit if keyframes exist (user has custom positions)
    if (!phoneModel || !camera || !controls || mode !== 'video' || hasKeyframes) return;

    // Calculate bounding box of the phone model
    const boundingBox = new THREE.Box3().setFromObject(phoneModel);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    
    // Get the maximum dimension (width or height)
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Calculate optimal camera distance
    // FOV is in degrees, convert to radians
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / Math.tan(fov / 2));
    
    // Add 20% padding so phone isn't touching frame edges
    const paddedDistance = cameraDistance * 1.4;
    
    // Center the phone in the frame
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    
    // Position camera to look at the phone from the front
    camera.position.set(0, 0, paddedDistance);
    controls.target.set(center.x, center.y, center.z);
    controls.update();
    
    console.log('📦 Phone fitted to frame:', {
      boundingBoxSize: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
      maxDimension: maxDim.toFixed(2),
      cameraDistance: paddedDistance.toFixed(2),
      center: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) }
    });
  }, [phoneModel, camera, controls, mode]);
};

