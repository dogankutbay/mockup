/**
 * Custom hook for managing camera position based on phone model
 * Animates camera from initial position (x:0, y:0) to final position
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { PhoneModelConfig } from '../config/phoneModels';

interface UseCameraPositionOptions {
  camera: THREE.PerspectiveCamera | null;
  controls: any; // OrbitControls
  modelConfig: PhoneModelConfig;
}

export const useCameraPosition = ({ camera, controls, modelConfig }: UseCameraPositionOptions) => {
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!camera || !controls) return;

    const { x: configX, y: configY, z: configZ } = modelConfig.cameraPosition;
    
    // Start position (tilted - the configured position)
    const startX = configX;
    const startY = configY;
    const startZ = configZ;
    
    // End position (centered)
    const targetX = 0;
    const targetY = 0;
    const targetZ = configZ;
    
    // Set initial position
    camera.position.set(startX, startY, startZ);
    
    // Animation parameters
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    // Easing function (ease-out cubic for smooth deceleration)
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };
    
    // Animation loop
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      // Interpolate positions (from tilted to center)
      const currentX = startX + (targetX - startX) * easedProgress;
      const currentY = startY + (targetY - startY) * easedProgress;
      const currentZ = startZ + (targetZ - startZ) * easedProgress;
      
      camera.position.set(currentX, currentY, currentZ);
      
      // Reset controls target to center
      controls.target.set(0, 0, 0);
      controls.update();
      
      // Continue animation if not complete
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [camera, controls, modelConfig.id, modelConfig.cameraPosition]);
};

