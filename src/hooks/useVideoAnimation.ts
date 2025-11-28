/**
 * Custom hook for managing video animation
 * Handles keyframes, playback, and interpolation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { Keyframe } from '../components/VideoTimeline';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface UseVideoAnimationOptions {
  camera: THREE.PerspectiveCamera | null;
  controls: OrbitControls | null;
  mode: 'picture' | 'video';
}

export const useVideoAnimation = ({ camera, controls, mode }: UseVideoAnimationOptions) => {
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(5); // Default 5 seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const lastCameraPositionRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const isApplyingStateRef = useRef<boolean>(false); // Track programmatic camera changes

  // Stop playback when switching modes
  useEffect(() => {
    if (mode === 'picture') {
      setIsPlaying(false);
    }
  }, [mode]);

  // Easing function (ease in-out)
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Interpolate between two keyframes
  const interpolate = useCallback((kf1: Keyframe, kf2: Keyframe, time: number): Keyframe => {
    const timeDiff = kf2.time - kf1.time;
    const t = timeDiff > 0 ? (time - kf1.time) / timeDiff : 0;
    const easedT = easeInOutCubic(Math.max(0, Math.min(1, t)));

    return {
      time,
      cameraPosition: {
        x: kf1.cameraPosition.x + (kf2.cameraPosition.x - kf1.cameraPosition.x) * easedT,
        y: kf1.cameraPosition.y + (kf2.cameraPosition.y - kf1.cameraPosition.y) * easedT,
        z: kf1.cameraPosition.z + (kf2.cameraPosition.z - kf1.cameraPosition.z) * easedT,
      },
      cameraRotation: {
        x: kf1.cameraRotation.x + (kf2.cameraRotation.x - kf1.cameraRotation.x) * easedT,
        y: kf1.cameraRotation.y + (kf2.cameraRotation.y - kf1.cameraRotation.y) * easedT,
        z: kf1.cameraRotation.z + (kf2.cameraRotation.z - kf1.cameraRotation.z) * easedT,
      },
    };
  }, []);

  // Get camera state at specific time
  const getCameraStateAtTime = useCallback((time: number): Keyframe | null => {
    if (keyframes.length === 0) return null;
    if (keyframes.length === 1) return keyframes[0];

    // Find surrounding keyframes
    const sortedKf = [...keyframes].sort((a, b) => a.time - b.time);
    
    // Before first keyframe
    if (time <= sortedKf[0].time) return sortedKf[0];
    
    // After last keyframe
    if (time >= sortedKf[sortedKf.length - 1].time) return sortedKf[sortedKf.length - 1];

    // Between keyframes - interpolate
    for (let i = 0; i < sortedKf.length - 1; i++) {
      if (time >= sortedKf[i].time && time <= sortedKf[i + 1].time) {
        return interpolate(sortedKf[i], sortedKf[i + 1], time);
      }
    }

    return sortedKf[0];
  }, [keyframes, interpolate]);

  // Apply camera state
  const applyCameraState = useCallback((state: Keyframe) => {
    if (!camera || !controls) return;

    isApplyingStateRef.current = true; // Mark as programmatic change

    isApplyingStateRef.current = true;

    camera.position.set(
      state.cameraPosition.x,
      state.cameraPosition.y,
      state.cameraPosition.z
    );

    // Update last position to prevent auto-keyframe trigger
    lastCameraPositionRef.current = {
      x: state.cameraPosition.x,
      y: state.cameraPosition.y,
      z: state.cameraPosition.z,
    };

    // Note: We're using OrbitControls, so rotation is handled differently
    // We'll need to set the target instead
    controls.update();

    // Allow manual changes again after a short delay
    setTimeout(() => {
      isApplyingStateRef.current = false;
    }, 50);
  }, [camera, controls]);

  // Animation loop for playback
  useEffect(() => {
    if (!isPlaying || mode !== 'video') return;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp;
      }

      const elapsed = (timestamp - startTimeRef.current) / 1000; // Convert to seconds
      const newTime = elapsed % duration; // Loop

      setCurrentTime(newTime);

      const state = getCameraStateAtTime(newTime);
      if (state) {
        applyCameraState(state);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      startTimeRef.current = 0;
    };
  }, [isPlaying, duration, getCameraStateAtTime, applyCameraState, mode]);

  // Add or update keyframe at current camera position
  const addOrUpdateKeyframe = useCallback((auto: boolean = false) => {
    if (!camera || !controls) return;

    const newKeyframe: Keyframe = {
      time: currentTime,
      cameraPosition: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      },
      cameraRotation: {
        x: 0, // We'll calculate from controls if needed
        y: 0,
        z: 0,
      },
    };

    setKeyframes(prev => {
      // Check if keyframe exists at current time (within 0.05s tolerance)
      const existingIndex = prev.findIndex(kf => Math.abs(kf.time - currentTime) < 0.05);
      
      let updated: Keyframe[];
      if (existingIndex !== -1) {
        // Update existing keyframe
        updated = [...prev];
        updated[existingIndex] = newKeyframe;
        console.log(
          auto ? '🔄 Auto keyframe (updated)' : '✏️ Keyframe updated',
          JSON.stringify({
            time: currentTime.toFixed(2),
            y: camera.position.y.toFixed(2),
          })
        );
      } else {
        // Add new keyframe
        updated = [...prev, newKeyframe].sort((a, b) => a.time - b.time);
        console.log(
          auto ? '🎬 Auto keyframe' : '🎬 Keyframe',
          JSON.stringify({
            time: currentTime.toFixed(2),
            y: camera.position.y.toFixed(2),
          })
        );
      }
      
      console.table(
        updated.map(kf => ({
          time: kf.time.toFixed(2),
          y: kf.cameraPosition.y.toFixed(2),
        }))
      );
      return updated;
    });

    // Update last position ref
    lastCameraPositionRef.current = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };
  }, [camera, controls, currentTime]);

  // Manual add keyframe (from button)
  const addKeyframe = useCallback(() => {
    addOrUpdateKeyframe(false);
  }, [addOrUpdateKeyframe]);

  // DISABLED: Auto-add keyframe (causing too many false triggers)
  // Users will use the manual "Add Keyframe" button instead
  // This is more predictable and gives better control
  
  // Track user interaction instead of 'change' events
  useEffect(() => {
    if (!camera || !controls || mode !== 'video') return;

    let isUserInteracting = false;
    let interactionTimeout: NodeJS.Timeout;

    const handleInteractionStart = () => {
      isUserInteracting = true;
      if (lastCameraPositionRef.current === null) {
        lastCameraPositionRef.current = {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        };
      }
    };

    const handleInteractionEnd = () => {
      // Wait a bit after interaction ends to capture final position
      clearTimeout(interactionTimeout);
      interactionTimeout = setTimeout(() => {
        if (isUserInteracting && !isPlaying) {
          const current = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
          };

          if (lastCameraPositionRef.current) {
            const dx = Math.abs(current.x - lastCameraPositionRef.current.x);
            const dy = Math.abs(current.y - lastCameraPositionRef.current.y);
            const dz = Math.abs(current.z - lastCameraPositionRef.current.z);
            
            if (dx > 0.1 || dy > 0.1 || dz > 0.1) {
              // Significant movement detected, auto-add keyframe
              addOrUpdateKeyframe(true);
            }
          }
        }
        isUserInteracting = false;
      }, 100);
    };

    // Listen to mousedown/mouseup on the canvas
    const canvas = controls.domElement;
    const wheelOptions = { passive: true };
    canvas.addEventListener('mousedown', handleInteractionStart, false);
    canvas.addEventListener('mouseup', handleInteractionEnd, false);
    canvas.addEventListener('wheel', handleInteractionStart, wheelOptions); // For zoom
    canvas.addEventListener('wheel', handleInteractionEnd, wheelOptions);

    return () => {
      canvas.removeEventListener('mousedown', handleInteractionStart, false);
      canvas.removeEventListener('mouseup', handleInteractionEnd, false);
      canvas.removeEventListener('wheel', handleInteractionStart, wheelOptions);
      canvas.removeEventListener('wheel', handleInteractionEnd, wheelOptions);
      clearTimeout(interactionTimeout);
    };
  }, [camera, controls, mode, isPlaying, addOrUpdateKeyframe]);

  // Reset all keyframes and animation state
  const handleResetAll = useCallback(() => {
    setKeyframes([]);
    setCurrentTime(0);
    setIsPlaying(false);
    lastCameraPositionRef.current = null;
    
    // Reset camera to default centered position
    if (camera && controls) {
      camera.position.set(0, 0, 24.29); // Default Z from auto-fit
      controls.target.set(0, 0, 0);
      controls.update();
      console.log('🔄 Animation reset - keyframes cleared & camera centered');
    } else {
      console.log('🔄 Animation reset - all keyframes cleared');
    }
  }, [camera, controls]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
    setIsPlaying(false); // Pause when manually scrubbing
    
    const state = getCameraStateAtTime(time);
    if (state) {
      applyCameraState(state);
      setTimeout(() => {
        if (camera) {
          console.log(
            '⏱️ Timeline',
            JSON.stringify({
              time: time.toFixed(2),
              targetY: state.cameraPosition.y.toFixed(2),
              actualY: camera.position.y.toFixed(2),
            })
          );
        }
      }, 80);
    }
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    // Adjust current time if it exceeds new duration
    if (currentTime > newDuration) {
      setCurrentTime(newDuration);
    }
  };

  return {
    keyframes,
    currentTime,
    duration,
    isPlaying,
    handlePlayPause,
    handleTimeChange,
    handleDurationChange,
    addKeyframe,
    handleResetAll,
  };
};

