/**
 * Custom hook for managing background color
 * Controls both scene and app background
 */

import { useState, useEffect } from 'react';
import * as THREE from 'three';

interface UseBackgroundColorOptions {
  scene: THREE.Scene | null;
  initialColor?: string;
}

export const useBackgroundColor = ({ scene, initialColor = '#FFFFFF' }: UseBackgroundColorOptions) => {
  const [backgroundColor, setBackgroundColor] = useState(initialColor);

  useEffect(() => {
    if (!scene) return;

    // Convert hex to THREE.Color
    const color = new THREE.Color(backgroundColor);
    scene.background = color;
  }, [backgroundColor, scene]);

  // Update app background color
  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;
    
    return () => {
      // Reset on unmount
      document.body.style.backgroundColor = '';
    };
  }, [backgroundColor]);

  return { backgroundColor, setBackgroundColor };
};

