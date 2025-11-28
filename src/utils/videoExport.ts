/**
 * Video Export Utility
 * Handles rendering and exporting video from Three.js scene
 */

import * as THREE from 'three';
import type { Keyframe } from '../components/VideoTimeline';
import type { FrameAspectRatio } from '../components/ResizableFrame';

interface VideoExportOptions {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  keyframes: Keyframe[];
  duration: number;
  fps: number;
  aspectRatio: FrameAspectRatio;
  transparentBackground: boolean;
  backgroundColor: string;
  onProgress: (progress: number) => void;
}

// Easing function (ease in-out cubic) - same as in useVideoAnimation
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Interpolate between two keyframes
const interpolateKeyframes = (kf1: Keyframe, kf2: Keyframe, time: number): Keyframe => {
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
    controlsTarget: {
      x: kf1.controlsTarget.x + (kf2.controlsTarget.x - kf1.controlsTarget.x) * easedT,
      y: kf1.controlsTarget.y + (kf2.controlsTarget.y - kf1.controlsTarget.y) * easedT,
      z: kf1.controlsTarget.z + (kf2.controlsTarget.z - kf1.controlsTarget.z) * easedT,
    },
  };
};

// Get camera state at specific time
const getCameraStateAtTime = (keyframes: Keyframe[], time: number): Keyframe | null => {
  if (keyframes.length === 0) return null;
  if (keyframes.length === 1) return keyframes[0];

  const sortedKf = [...keyframes].sort((a, b) => a.time - b.time);
  
  if (time <= sortedKf[0].time) return sortedKf[0];
  if (time >= sortedKf[sortedKf.length - 1].time) return sortedKf[sortedKf.length - 1];

  for (let i = 0; i < sortedKf.length - 1; i++) {
    if (time >= sortedKf[i].time && time <= sortedKf[i + 1].time) {
      return interpolateKeyframes(sortedKf[i], sortedKf[i + 1], time);
    }
  }

  return sortedKf[0];
};

// Get export dimensions based on aspect ratio
const getExportDimensions = (aspectRatio: FrameAspectRatio): { width: number; height: number } => {
  if (aspectRatio === 'square') {
    return { width: 1080, height: 1080 };
  } else {
    // Vertical 9:16
    return { width: 1080, height: 1920 };
  }
};

export const exportVideo = async (options: VideoExportOptions): Promise<void> => {
  const {
    scene,
    camera,
    renderer,
    keyframes,
    duration,
    fps,
    aspectRatio,
    transparentBackground,
    backgroundColor,
    onProgress,
  } = options;

  const { width, height } = getExportDimensions(aspectRatio);
  const totalFrames = Math.ceil(duration * fps);
  
  console.log(`🎬 Starting video export: ${width}x${height}, ${fps}fps, ${duration}s, ${totalFrames} frames`);

  // Store original renderer state
  const originalSize = renderer.getSize(new THREE.Vector2());
  const originalBackground = scene.background;
  const originalCameraPosition = camera.position.clone();
  const originalAspect = camera.aspect;

  // Create offscreen canvas for rendering
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  const ctx = offscreenCanvas.getContext('2d')!;

  // Set up renderer for export
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // Set background
  if (transparentBackground) {
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
  } else {
    scene.background = new THREE.Color(backgroundColor);
  }

  // Determine MIME type based on transparency
  const mimeType = transparentBackground ? 'video/webm' : 'video/webm';
  const fileExtension = transparentBackground ? 'webm' : 'webm';
  
  // Create MediaRecorder with canvas stream
  const stream = offscreenCanvas.captureStream(fps);
  
  // Try to use VP9 for better quality, fall back to VP8
  let mediaRecorder: MediaRecorder;
  const codecOptions = transparentBackground 
    ? ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    : ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
  
  let selectedCodec = '';
  for (const codec of codecOptions) {
    if (MediaRecorder.isTypeSupported(codec)) {
      selectedCodec = codec;
      break;
    }
  }
  
  if (!selectedCodec) {
    throw new Error('No supported video codec found in this browser');
  }
  
  console.log(`📹 Using codec: ${selectedCodec}`);
  
  mediaRecorder = new MediaRecorder(stream, {
    mimeType: selectedCodec,
    videoBitsPerSecond: 8000000, // 8 Mbps for good quality
  });

  const chunks: Blob[] = [];
  
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  // Promise to wait for recording to finish
  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };
    mediaRecorder.onerror = (e) => {
      reject(e);
    };
  });

  // Start recording
  mediaRecorder.start();

  // Render each frame
  const frameInterval = 1000 / fps;
  
  for (let frame = 0; frame < totalFrames; frame++) {
    const time = (frame / totalFrames) * duration;
    
    // Get interpolated camera state
    const state = getCameraStateAtTime(keyframes, time);
    if (state) {
      camera.position.set(
        state.cameraPosition.x,
        state.cameraPosition.y,
        state.cameraPosition.z
      );
      camera.lookAt(
        state.controlsTarget.x,
        state.controlsTarget.y,
        state.controlsTarget.z
      );
    }

    // Render scene
    renderer.render(scene, camera);
    
    // Copy to offscreen canvas
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(renderer.domElement, 0, 0, width, height);

    // Update progress
    const progress = ((frame + 1) / totalFrames) * 100;
    onProgress(progress);

    // Wait for next frame timing (to maintain fps)
    await new Promise(resolve => setTimeout(resolve, frameInterval / 10)); // Speed up rendering
  }

  // Stop recording
  mediaRecorder.stop();

  // Wait for the blob
  const videoBlob = await recordingPromise;

  // Restore original renderer state
  renderer.setSize(originalSize.x, originalSize.y);
  camera.position.copy(originalCameraPosition);
  camera.aspect = originalAspect;
  camera.updateProjectionMatrix();
  scene.background = originalBackground;

  // Download the video
  const url = URL.createObjectURL(videoBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mockup-video-${Date.now()}.${fileExtension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`✅ Video export complete: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`);
};

