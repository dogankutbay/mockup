/**
 * Custom hook for loading and managing the phone 3D model
 */

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { initializeScreenMaterials } from '../utils/phoneModelUtils';
import type { PhoneModel, AppError } from '../types';
import type { PhoneModelConfig } from '../config/phoneModels';

interface UsePhoneModelOptions {
  scene: THREE.Scene | null;
  modelConfig: PhoneModelConfig;
  onError?: (error: AppError) => void;
}

export const usePhoneModel = ({ scene, modelConfig, onError }: UsePhoneModelOptions) => {
  const [phoneModel, setPhoneModel] = useState<PhoneModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!scene) return;

    // Clean up previous model if it exists
    if (phoneModel) {
      scene.remove(phoneModel);
      phoneModel.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
      setPhoneModel(null);
    }

    setIsLoading(true);
    const loader = new GLTFLoader();
    
    loader.load(
      modelConfig.modelPath,
      // Success callback
      (gltf) => {
        const phone = gltf.scene as PhoneModel;
        scene.add(phone);
        
        // Debug: Log all mesh names to help find the screen mesh
        console.log(`📱 Loading model: ${modelConfig.name}`);
        console.log('🔍 All meshes in this model:');
        phone.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            console.log(`  - "${child.name}" (type: Mesh)`);
          }
        });
        console.log(`Looking for screen mesh named: "${modelConfig.screenMeshName}"`);
        
        // Fix frame/bezel colors for Samsung (change to dark)
        if (modelConfig.manufacturer === 'samsung') {
          phone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              // Change bezel, rear case, and antenna to dark color
              if (child.name === 'Bezel_1' || 
                  child.name === 'Rearcase_1' || 
                  child.name === 'Antenna_Plastic_1') {
                // Replace material entirely with a dark one
                const newMaterial = new THREE.MeshStandardMaterial({
                  color: 0x1a1a1a,      // Dark gray/black
                  metalness: 0.5,       // Slightly metallic
                  roughness: 0.5,       // Semi-glossy
                  emissive: 0x000000,   // No glow
                });
                
                // Dispose old material
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach((mat: THREE.Material) => mat.dispose());
                  } else {
                    child.material.dispose();
                  }
                }
                
                child.material = newMaterial;
                console.log(`✅ Changed ${child.name} to dark material`);
              }
            }
          });
        }
        
        // Initialize screen materials with the correct screen mesh name
        initializeScreenMaterials(phone, modelConfig.screenMeshName);
        
        setPhoneModel(phone);
        setIsLoading(false);
      },
      // Progress callback
      undefined,
      // Error callback
      (error) => {
        console.error('Failed to load phone model:', error);
        setIsLoading(false);
        onError?.({
          message: 'Failed to load phone model. Please refresh the page.',
          type: 'model_load',
        });
      }
    );

    // Cleanup
    return () => {
      if (phoneModel) {
        scene.remove(phoneModel);
        
        // Dispose of geometries and materials
        phoneModel.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material?.dispose();
            }
          }
        });
      }
    };
  }, [scene, modelConfig.modelPath]);

  return { phoneModel, isLoading };
};

