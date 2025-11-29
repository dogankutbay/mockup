/**
 * Custom hook for managing phone body color
 * Applies color to phone model meshes (excluding screen)
 */

import { useState, useEffect } from 'react';
import * as THREE from 'three';
import type { PhoneModel } from '../types';
import type { PhoneModelConfig } from '../config/phoneModels';

interface UsePhoneColorOptions {
  phoneModel: PhoneModel | null;
  modelConfig: PhoneModelConfig;
  initialColor?: string;
}

/**
 * Get the mesh names that should be colored for each phone model
 */
const getColorableMeshNames = (manufacturer: 'apple' | 'samsung'): string[] => {
  if (manufacturer === 'samsung') {
    // For Android: frame, bezel, camera ring
    return [ 'Rearcase_1', 'Antenna_Plastic_1'];
  } else {
    // For iPhone: body and backside meshes
    return ['Body_R3', 'Backside'];
  }
};

/**
 * Apply color to phone body meshes
 */
const applyPhoneColor = (
  phone: PhoneModel,
  color: string,
  modelConfig: PhoneModelConfig
): void => {
  const colorableMeshNames = getColorableMeshNames(modelConfig.manufacturer);
  const threeColor = new THREE.Color(color);
  
  phone.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Skip the screen mesh
      if (child.name === modelConfig.screenMeshName) {
        return;
      }
      
      // Check if this mesh name matches the colorable meshes for this manufacturer
      // For exact matches or names that start with the target name (e.g., "Backside_1" matches "Backside")
      const shouldColor = colorableMeshNames.some(name => {
        const childNameLower = child.name.toLowerCase();
        const targetNameLower = name.toLowerCase();
        return childNameLower === targetNameLower || childNameLower.startsWith(targetNameLower + '_');
      });
      
      if (shouldColor) {
        console.log(`🎨 Applying color to mesh: "${child.name}", material type: ${child.material?.constructor?.name || 'unknown'}`);
        
        // For iPhone, always replace material completely to ensure color is visible
        // For Samsung, we can update existing materials
        const shouldReplaceMaterial = modelConfig.manufacturer === 'apple';
        
        // Handle array of materials
        if (Array.isArray(child.material)) {
          const oldMaterials = child.material;
          child.material = oldMaterials.map((mat) => {
            if (shouldReplaceMaterial) {
              // Always replace for iPhone
              return new THREE.MeshStandardMaterial({
                color: threeColor,
                metalness: 0.7,
                roughness: 0.3,
                emissive: 0x000000,
              });
            } else {
              // For Samsung, try to update existing material
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                const newMat = mat.clone();
                newMat.color.copy(threeColor);
                newMat.map = null; // Remove texture map
                newMat.needsUpdate = true;
                return newMat;
              } else {
                return new THREE.MeshStandardMaterial({
                  color: threeColor,
                  metalness: 0.5,
                  roughness: 0.5,
                  emissive: 0x000000,
                });
              }
            }
          });
          // Dispose old materials
          oldMaterials.forEach((mat) => mat.dispose());
        } else {
          // Single material
          const oldMaterial = child.material;
          
          if (shouldReplaceMaterial) {
            // Always replace for iPhone to ensure color is visible
            child.material = new THREE.MeshStandardMaterial({
              color: threeColor,
              metalness: 0.7,
              roughness: 0.3,
              emissive: 0x000000,
            });
            console.log(`✅ Replaced material for "${child.name}" with new MeshStandardMaterial (color: ${color})`);
          } else {
            // For Samsung, try to update existing material
            if (oldMaterial instanceof THREE.MeshStandardMaterial || 
                oldMaterial instanceof THREE.MeshPhysicalMaterial) {
              const clonedMaterial = oldMaterial.clone();
              clonedMaterial.color.copy(threeColor);
              clonedMaterial.map = null; // Remove texture map
              clonedMaterial.needsUpdate = true;
              child.material = clonedMaterial;
              oldMaterial.dispose();
              console.log(`✅ Updated material color for "${child.name}" to ${color}`);
            } else {
              // Replace non-standard materials
              child.material = new THREE.MeshStandardMaterial({
                color: threeColor,
                metalness: 0.5,
                roughness: 0.5,
                emissive: 0x000000,
              });
              if (oldMaterial) {
                oldMaterial.dispose();
              }
              console.log(`✅ Replaced material for "${child.name}" with new MeshStandardMaterial`);
            }
          }
        }
      }
    }
  });
};

export const usePhoneColor = ({ 
  phoneModel, 
  modelConfig,
  initialColor = '#1C1C1E' // Black Titanium / Phantom Black
}: UsePhoneColorOptions) => {
  const [phoneColor, setPhoneColor] = useState(initialColor);

  useEffect(() => {
    if (!phoneModel) return;

    applyPhoneColor(phoneModel, phoneColor, modelConfig);
  }, [phoneColor, phoneModel, modelConfig]);

  return { phoneColor, setPhoneColor };
};

