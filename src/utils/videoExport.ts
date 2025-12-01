/**
 * Video Export Utility
 * Handles rendering and exporting video from Three.js scene
 * Exports exactly what's visible inside the frame guide
 */

import * as THREE from 'three';
import type { Keyframe, EasingType } from '../components/VideoTimeline';
import type { FrameAspectRatio } from '../components/ResizableFrame';

interface VideoExportOptions {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  keyframes: Keyframe[];
  duration: number;
  fps: number;
  aspectRatio: FrameAspectRatio;
  frameZoom: number;
  transparentBackground: boolean;
  backgroundColor: string;
  onProgress: (progress: number) => void;
}

// Easing functions (must match useVideoAnimation.ts)
const easingFunctions: Record<EasingType, (t: number) => number> = {
  'ease-in': (t: number) => t * t * t, // Cubic ease-in
  'ease-out': (t: number) => 1 - Math.pow(1 - t, 3), // Cubic ease-out
  'ease-in-out': (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, // Cubic ease-in-out
  'bouncy': (t: number) => {
    // Bouncy easing with multiple bounces
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  'soft-bouncy': (t: number) => {
    // Softer bounce
    const c1 = 1.1;
    const c3 = c1 + 0.5;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  'gentle': (t: number) => {
    // Gentle ease (sine-based)
    return -(Math.cos(Math.PI * t) - 1) / 2;
  },
};

// Interpolate between two keyframes
const interpolateKeyframes = (kf1: Keyframe, kf2: Keyframe, time: number): Keyframe => {
  const timeDiff = kf2.time - kf1.time;
  const t = timeDiff > 0 ? (time - kf1.time) / timeDiff : 0;
  const clampedT = Math.max(0, Math.min(1, t));
  
  // Use easing from kf1 (easing applies to the segment after this keyframe)
  const easingType: EasingType = kf1.easing || 'ease-in-out';
  const easingFn = easingFunctions[easingType];
  const easedT = easingFn(clampedT);

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
    return { width: 1080, height: 1920 };
  }
};

// Calculate frame dimensions in pixels based on viewport and zoom
// This must match the CSS in ResizableFrame.tsx exactly!
const getFramePixelDimensions = (
  aspectRatio: FrameAspectRatio, 
  frameZoom: number,
  viewportWidth: number,
  viewportHeight: number
): { width: number; height: number } => {
  const vh = viewportHeight / 100;
  const vw = viewportWidth / 100;
  
  if (aspectRatio === 'square') {
    // CSS: min(${zoom * 70}vh, ${zoom * 70}vw)
    const size = Math.min(frameZoom * 70 * vh, frameZoom * 70 * vw);
    return { width: size, height: size };
  } else {
    // CSS: height = ${zoom * 80}vh, width = ${zoom * 35}vh
    const height = frameZoom * 80 * vh;
    const width = frameZoom * 35 * vh;
    return { width, height };
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
    frameZoom,
    transparentBackground,
    backgroundColor,
    onProgress,
  } = options;

  // Validate inputs
  if (keyframes.length === 0) {
    throw new Error('Cannot export video: No keyframes added. Add at least 2 keyframes to create animation.');
  }
  if (keyframes.length === 1) {
    console.warn('⚠️ Only 1 keyframe - video will be static (no animation)');
  }

  const { width: exportWidth, height: exportHeight } = getExportDimensions(aspectRatio);
  const totalFrames = Math.ceil(duration * fps);
  
  // Get current viewport dimensions (the Three.js canvas size)
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate the frame's pixel dimensions on screen
  const framePixels = getFramePixelDimensions(aspectRatio, frameZoom, viewportWidth, viewportHeight);
  
  // The frame is centered in the viewport
  // Calculate the offset from top-left of viewport to top-left of frame
  const frameOffsetX = (viewportWidth - framePixels.width) / 2;
  const frameOffsetY = (viewportHeight - framePixels.height) / 2;
  
  console.log(`🎬 Starting video export: ${exportWidth}x${exportHeight}, ${fps}fps, ${duration}s, ${totalFrames} frames`);
  console.log(`📐 Viewport: ${viewportWidth}x${viewportHeight}px`);
  console.log(`📐 Frame: ${framePixels.width.toFixed(0)}x${framePixels.height.toFixed(0)}px at offset (${frameOffsetX.toFixed(0)}, ${frameOffsetY.toFixed(0)})`);
  console.log(`🎨 Transparent: ${transparentBackground}, Background: ${backgroundColor}`);

  // Create export canvas at exact output dimensions
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;
  
  const exportRenderer = new THREE.WebGLRenderer({
    canvas: exportCanvas,
    alpha: true, // Always enable alpha buffer
    antialias: true,
    preserveDrawingBuffer: true,
    premultipliedAlpha: false, // Important for proper transparency in video
  });
  exportRenderer.setSize(exportWidth, exportHeight);
  exportRenderer.setPixelRatio(1);
  exportRenderer.toneMapping = THREE.NoToneMapping;
  exportRenderer.toneMappingExposure = 1.0;

  // Clone camera for export
  const exportCamera = camera.clone();
  
  // Use setViewOffset to render only the frame portion
  // This tells the camera to render as if it's a tile of a larger view
  // fullWidth/fullHeight = the full viewport size
  // width/height = the portion we want to render (the frame)
  // offsetX/offsetY = where the frame starts in the viewport
  exportCamera.setViewOffset(
    viewportWidth,           // fullWidth - the original viewport width
    viewportHeight,          // fullHeight - the original viewport height  
    frameOffsetX,            // offsetX - left edge of frame in viewport
    frameOffsetY,            // offsetY - top edge of frame in viewport
    framePixels.width,       // width - frame width
    framePixels.height       // height - frame height
  );
  
  // Update aspect ratio for the export dimensions
  exportCamera.aspect = exportWidth / exportHeight;
  exportCamera.updateProjectionMatrix();

  // Store original background to restore later
  const originalBackground = scene.background;
  
  // Set background for export only
  if (transparentBackground) {
    // Temporarily remove scene background for transparent export
    scene.background = null;
    exportRenderer.setClearColor(0x000000, 0);
    exportRenderer.autoClear = true;
    console.log('🔍 Transparent mode: clearColor=(0,0,0,0)');
  } else {
    // Use the user's selected background color
    scene.background = new THREE.Color(backgroundColor);
    exportRenderer.setClearColor(new THREE.Color(backgroundColor), 1);
  }

  // Determine file format
  // Note: True transparent video (alpha channel) is only supported in:
  // - WebM with VP9 in Chrome 94+ (experimental)
  // - Most video players will show black background instead of transparency
  // - For true transparency, users should use the video in video editors that support alpha
  const preferMP4 = !transparentBackground;
  
  const codecOptions = preferMP4
    ? ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=h264', 'video/webm;codecs=vp9', 'video/webm']
    : ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  
  if (transparentBackground) {
    console.log('⚠️ Note: Transparent WebM may show black in some video players.');
    console.log('   The alpha channel IS encoded - use in video editors like Premiere/DaVinci for transparency.');
  }
  
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
  
  const isMP4 = selectedCodec.includes('mp4') || selectedCodec.includes('avc1') || selectedCodec.includes('h264');
  const fileExtension = isMP4 ? 'mp4' : 'webm';
  const mimeType = isMP4 ? 'video/mp4' : 'video/webm';
  
  console.log(`📹 Using codec: ${selectedCodec} → .${fileExtension}`);

  // Create MediaRecorder
  const stream = exportCanvas.captureStream(fps);
  
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: selectedCodec,
    videoBitsPerSecond: 12000000,
  });

  const chunks: Blob[] = [];
  
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
      console.log(`📦 Chunk received: ${(e.data.size / 1024).toFixed(2)} KB (total: ${chunks.length})`);
    } else {
      console.warn('⚠️ Received empty chunk');
    }
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      console.log(`🎬 Recording stopped. Total chunks: ${chunks.length}`);
      if (chunks.length === 0) {
        console.error('❌ No video data was recorded!');
        reject(new Error('No video data was recorded. Try adding more keyframes or increasing duration.'));
        return;
      }
      const blob = new Blob(chunks, { type: mimeType });
      console.log(`📦 Final blob size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
      resolve(blob);
    };
    mediaRecorder.onerror = (e) => {
      console.error('❌ MediaRecorder error:', e);
      reject(e);
    };
  });

  // Start recording
  // Request data every 100ms to avoid losing chunks
  mediaRecorder.start(100);
  console.log(`🎥 MediaRecorder started (state: ${mediaRecorder.state})`);

  // Render each frame
  for (let frame = 0; frame < totalFrames; frame++) {
    const time = (frame / totalFrames) * duration;
    
    // Clear the canvas for transparent exports
    if (transparentBackground) {
      exportRenderer.clear();
    }
    
    // Get interpolated camera state
    const state = getCameraStateAtTime(keyframes, time);
    if (state) {
      exportCamera.position.set(
        state.cameraPosition.x,
        state.cameraPosition.y,
        state.cameraPosition.z
      );
      exportCamera.lookAt(
        state.controlsTarget.x,
        state.controlsTarget.y,
        state.controlsTarget.z
      );
      
      // Re-apply view offset after changing position (lookAt resets it)
      exportCamera.setViewOffset(
        viewportWidth,
        viewportHeight,
        frameOffsetX,
        frameOffsetY,
        framePixels.width,
        framePixels.height
      );
      exportCamera.updateProjectionMatrix();
    }

    // Render scene
    exportRenderer.render(scene, exportCamera);

    // Update progress
    const progress = ((frame + 1) / totalFrames) * 100;
    onProgress(progress);

    // Delay for MediaRecorder to capture the frame
    // Use 1000/fps to match the target frame rate
    const frameDelay = 1000 / fps;
    await new Promise(resolve => setTimeout(resolve, frameDelay));
  }

  // Stop recording
  console.log(`🛑 Stopping MediaRecorder (state: ${mediaRecorder.state})`);
  mediaRecorder.stop();
  
  // Restore scene background immediately so the live view isn't affected
  scene.background = originalBackground;

  // Wait for blob (this can take a moment as the encoder finalizes)
  console.log('⏳ Waiting for video encoding to complete...');
  const videoBlob = await recordingPromise;

  // Clean up export resources
  exportCamera.clearViewOffset();
  exportRenderer.dispose();

  // Download
  if (videoBlob.size === 0) {
    throw new Error('Video export failed: 0 KB file generated. Check console for details.');
  }
  
  const url = URL.createObjectURL(videoBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mockup-video-${Date.now()}.${fileExtension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`✅ Video export complete: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB (.${fileExtension})`);
};
