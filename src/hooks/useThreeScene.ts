/**
 * Custom hook for managing Three.js scene, camera, and renderer
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CAMERA, LIGHTING, ORBIT_CONTROLS } from '../config/constants';
import type { ThreeSceneObjects } from '../types';

export const useThreeScene = (mountRef: React.RefObject<HTMLDivElement>) => {
  const [sceneObjects, setSceneObjects] = useState<ThreeSceneObjects | null>(null);
  const animationFrameId = useRef<number>();
  
  // Function to toggle controls for video mode
  const setControlsForVideoMode = (isVideoMode: boolean) => {
    if (!sceneObjects?.controls) return;
    
    if (isVideoMode) {
      // Remove all restrictions in video mode for free movement
      sceneObjects.controls.minAzimuthAngle = -Infinity;
      sceneObjects.controls.maxAzimuthAngle = Infinity;
      sceneObjects.controls.minPolarAngle = 0;
      sceneObjects.controls.maxPolarAngle = Math.PI;
      sceneObjects.controls.enablePan = true;
      // Use world-space panning instead of screen-space for more predictable movement
      sceneObjects.controls.screenSpacePanning = false;
    } else {
      // Restore restrictions in picture mode
      sceneObjects.controls.minAzimuthAngle = ORBIT_CONTROLS.MIN_AZIMUTH;
      sceneObjects.controls.maxAzimuthAngle = ORBIT_CONTROLS.MAX_AZIMUTH;
      sceneObjects.controls.minPolarAngle = ORBIT_CONTROLS.MIN_POLAR;
      sceneObjects.controls.maxPolarAngle = ORBIT_CONTROLS.MAX_POLAR;
      sceneObjects.controls.enablePan = true;
      sceneObjects.controls.screenSpacePanning = true;
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      CAMERA.NEAR,
      CAMERA.FAR
    );
    camera.position.set(CAMERA.POSITION.X, CAMERA.POSITION.Y, CAMERA.POSITION.Z);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true, // Enable transparency
      preserveDrawingBuffer: true, // Required for canvas export
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    // Disable tone mapping to preserve accurate colors
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Note: Background color is managed by useBackgroundColor hook
    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    setupLighting(scene);

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true; // Enable panning for video mode
    controls.screenSpacePanning = true; // Default to screen-space panning
    setupControlLimits(controls);
    controls.update();

    // Store scene objects
    setSceneObjects({ scene, camera, renderer, controls });

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Log camera position on control change (for debugging/configuration)
    let lastLogTime = 0;
    const logCameraPosition = () => {
      const now = Date.now();
      // Log every 500ms to avoid console spam
      if (now - lastLogTime > 500) {
        console.log('📷 Camera Position:', {
          x: parseFloat(camera.position.x.toFixed(2)),
          y: parseFloat(camera.position.y.toFixed(2)),
          z: parseFloat(camera.position.z.toFixed(2)),
        });
        lastLogTime = now;
      }
    };

    controls.addEventListener('change', logCameraPosition);

    // Animation loop
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', logCameraPosition);
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // Dispose Three.js resources
      renderer.dispose();
      controls.dispose();
      
      // Remove canvas from DOM
      if (mountRef.current && renderer.domElement.parentNode) {
        mountRef.current.removeChild(renderer.domElement);
      }

      // Dispose scene resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
    };
  }, [mountRef]);

  return { sceneObjects, setControlsForVideoMode };
};

/**
 * Setup scene lighting
 */
const setupLighting = (scene: THREE.Scene): void => {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(
    LIGHTING.AMBIENT.COLOR,
    LIGHTING.AMBIENT.INTENSITY
  );
  scene.add(ambientLight);

  // Directional light
  const directionalLight = new THREE.DirectionalLight(
    LIGHTING.DIRECTIONAL.COLOR,
    LIGHTING.DIRECTIONAL.INTENSITY
  );
  directionalLight.position.set(
    LIGHTING.DIRECTIONAL.POSITION.X,
    LIGHTING.DIRECTIONAL.POSITION.Y,
    LIGHTING.DIRECTIONAL.POSITION.Z
  ).normalize();
  scene.add(directionalLight);

  // Spot light
  const spotLight = new THREE.SpotLight(
    LIGHTING.SPOT.COLOR,
    LIGHTING.SPOT.INTENSITY
  );
  spotLight.position.set(
    LIGHTING.SPOT.POSITION.X,
    LIGHTING.SPOT.POSITION.Y,
    LIGHTING.SPOT.POSITION.Z
  );
  spotLight.angle = LIGHTING.SPOT.ANGLE;
  spotLight.penumbra = LIGHTING.SPOT.PENUMBRA;
  spotLight.decay = LIGHTING.SPOT.DECAY;
  spotLight.distance = LIGHTING.SPOT.DISTANCE;
  scene.add(spotLight);

  // Point light
  const pointLight = new THREE.PointLight(
    LIGHTING.POINT.COLOR,
    LIGHTING.POINT.INTENSITY,
    LIGHTING.POINT.DISTANCE
  );
  pointLight.position.set(
    LIGHTING.POINT.POSITION.X,
    LIGHTING.POINT.POSITION.Y,
    LIGHTING.POINT.POSITION.Z
  );
  scene.add(pointLight);
};

/**
 * Setup orbit control limits to prevent seeing the back of the phone
 */
const setupControlLimits = (controls: OrbitControls): void => {
  controls.minAzimuthAngle = ORBIT_CONTROLS.MIN_AZIMUTH;
  controls.maxAzimuthAngle = ORBIT_CONTROLS.MAX_AZIMUTH;
  controls.minPolarAngle = ORBIT_CONTROLS.MIN_POLAR;
  controls.maxPolarAngle = ORBIT_CONTROLS.MAX_POLAR;
};

