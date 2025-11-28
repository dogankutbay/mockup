/**
 * Custom hook for managing video animation
 * Handles keyframes, playback, and interpolation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { Keyframe } from '../components/VideoTimeline';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface UseVideoAnimationOptions {
  camera: THREE.Camera | null;
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

    camera.position.set(
      state.cameraPosition.x,
      state.cameraPosition.y,
      state.cameraPosition.z
    );

    // Note: We're using OrbitControls, so rotation is handled differently
    // We'll need to set the target instead
    controls.update();
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

  // Add keyframe at current camera position
  const addKeyframe = useCallback(() => {
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

    setKeyframes(prev => [...prev, newKeyframe].sort((a, b) => a.time - b.time));
  }, [camera, controls, currentTime]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
    setIsPlaying(false); // Pause when manually scrubbing
    
    const state = getCameraStateAtTime(time);
    if (state) {
      applyCameraState(state);
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
  };
};

