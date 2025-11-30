/**
 * Phone Mockup Tool - Main Application
 * A tool for creating phone mockups with custom screenshots
 */

import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { PhoneViewer } from './components/PhoneViewer';
import { ControlPanel } from './components/ControlPanel';
import { LoadingState } from './components/LoadingState';
import { ErrorMessage } from './components/ErrorMessage';
import { BackgroundColorPicker } from './components/BackgroundColorPicker';
import { PhoneColorPicker } from './components/PhoneColorPicker';
import { PhoneModelSelector } from './components/PhoneModelSelector';
import { ResolutionInfo } from './components/ResolutionInfo';
import { CameraControls } from './components/CameraControls';
import { CameraSliders } from './components/CameraSliders';
import { ScreenshotGallery } from './components/ScreenshotGallery';
import { ModeToggle } from './components/ModeToggle';
import { VideoTimeline } from './components/VideoTimeline';
import { FrameZoomControls } from './components/FrameZoomControls';
import { ResizableFrame } from './components/ResizableFrame';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import type { AppMode } from './components/ModeToggle';
import type { FrameAspectRatio } from './components/ResizableFrame';
import type { ExportState } from './components/VideoTimeline';
import { FaLightbulb, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useThreeScene } from './hooks/useThreeScene';
import { usePhoneModel } from './hooks/usePhoneModel';
import { useScreenshot } from './hooks/useScreenshot';
import { useBackgroundColor } from './hooks/useBackgroundColor';
import { usePhoneColor } from './hooks/usePhoneColor';
import { useCameraPosition } from './hooks/useCameraPosition';
import { useVideoAnimation } from './hooks/useVideoAnimation';
import { useVideoFrameFitting } from './hooks/useVideoFrameFitting';
import { exportCanvasAsImage } from './utils/exportUtils';
import { exportVideo } from './utils/videoExport';
import { DEFAULT_PHONE_MODEL } from './config/phoneModels';
import type { AppError } from './types';
import type { PhoneModelConfig } from './config/phoneModels';
import './App.css';

function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [selectedModel, setSelectedModel] = useState<PhoneModelConfig>(DEFAULT_PHONE_MODEL);
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 10 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mode, setMode] = useState<AppMode>('picture');
  const [frameZoom, setFrameZoom] = useState(0.7); // Default 70% of max viewport size
  const [frameAspectRatio, setFrameAspectRatio] = useState<FrameAspectRatio>('square');
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  type CameraState = { position: THREE.Vector3; target: THREE.Vector3 };
  const pictureCameraStateRef = useRef<CameraState | null>(null);
  const videoCameraStateRef = useRef<CameraState | null>(null);
  const lastModelIdRef = useRef<string>(selectedModel.id);

  // Initialize Three.js scene
  const { sceneObjects, setControlsForVideoMode } = useThreeScene(mountRef);
  
  // Update controls when mode changes
  React.useEffect(() => {
    if (setControlsForVideoMode) {
      setControlsForVideoMode(mode === 'video');
    }
  }, [mode, setControlsForVideoMode]);

  // Track camera position changes from OrbitControls
  React.useEffect(() => {
    if (!sceneObjects?.camera || !sceneObjects?.controls) return;

    const updateCameraPosition = () => {
      setCameraPos({
        x: parseFloat(sceneObjects.camera.position.x.toFixed(2)),
        y: parseFloat(sceneObjects.camera.position.y.toFixed(2)),
        z: parseFloat(sceneObjects.camera.position.z.toFixed(2)),
      });
    };

    // Update on control changes
    sceneObjects.controls.addEventListener('change', updateCameraPosition);
    
    // Initial update
    updateCameraPosition();

    return () => {
      sceneObjects.controls.removeEventListener('change', updateCameraPosition);
    };
  }, [sceneObjects]);

  // Load phone model
  const { phoneModel, isLoading } = usePhoneModel({
    scene: sceneObjects?.scene || null,
    modelConfig: selectedModel,
    onError: setError,
  });

  // Handle screenshot upload and application
  const { 
    screenshots,
    activeIndex,
    handleScreenshotUpload,
    clearAllScreenshots,
    setActiveScreenshot,
  } = useScreenshot({
    phoneModel,
    modelConfig: selectedModel,
    onError: setError,
  });

  // Handle background color
  const { backgroundColor, setBackgroundColor } = useBackgroundColor({
    scene: sceneObjects?.scene || null,
    initialColor: '#FAFAFA',
  });

  // Handle phone color
  const { phoneColor, setPhoneColor } = usePhoneColor({
    phoneModel,
    modelConfig: selectedModel,
    initialColor: '#1C1C1E', // Black Titanium / Phantom Black (default)
  });

  // Reset saved camera states when phone model changes
  useEffect(() => {
    if (selectedModel.id !== lastModelIdRef.current) {
      pictureCameraStateRef.current = null;
      videoCameraStateRef.current = null;
      lastModelIdRef.current = selectedModel.id;
      
      // Reset phone color to first preset color for the new model (Black)
      const defaultColor = '#1C1C1E'; // Black Titanium / Phantom Black
      setPhoneColor(defaultColor);
    }
  }, [selectedModel.id, selectedModel.manufacturer, setPhoneColor]);

  // Adjust camera position based on selected model (Picture mode only)
  // Re-run when model changes (pictureCameraStateRef gets cleared above)
  useCameraPosition({
    camera: sceneObjects?.camera || null,
    controls: sceneObjects?.controls || null,
    modelConfig: selectedModel,
    enabled: mode === 'picture' && !pictureCameraStateRef.current,
  });

  // Video animation controls
  const {
    keyframes,
    currentTime,
    duration,
    isPlaying,
    handlePlayPause,
    handleTimeChange,
    handleDurationChange,
    addKeyframe,
    handleResetAll,
    updateKeyframeTime,
    updateEasing,
  } = useVideoAnimation({
    camera: sceneObjects?.camera || null,
    controls: sceneObjects?.controls || null,
    mode,
  });

  // Auto-fit phone to video frame when entering video mode (only if no keyframes)
  const shouldAutoFitVideo = mode === 'video' && !videoCameraStateRef.current && keyframes.length === 0;
  useVideoFrameFitting({
    phoneModel,
    camera: sceneObjects?.camera || null,
    controls: sceneObjects?.controls || null,
    mode,
    shouldAutoFit: shouldAutoFitVideo,
  });

  const applyCameraState = (state: CameraState) => {
    if (!sceneObjects?.camera || !sceneObjects?.controls) return;
    sceneObjects.controls.target.copy(state.target);
    sceneObjects.camera.position.copy(state.position);
    sceneObjects.controls.update();
  };

  // Track latest camera state based on mode
  useEffect(() => {
    if (!sceneObjects?.camera || !sceneObjects?.controls) return;
    const controls = sceneObjects.controls;
    const updateState = () => {
      const snapshot: CameraState = {
        position: sceneObjects.camera.position.clone(),
        target: sceneObjects.controls.target.clone(),
      };
      if (mode === 'picture') {
        pictureCameraStateRef.current = snapshot;
      } else {
        videoCameraStateRef.current = snapshot;
      }
    };
    controls.addEventListener('change', updateState);
    updateState();
    return () => controls.removeEventListener('change', updateState);
  }, [sceneObjects, mode]);

  const handleModeChange = (nextMode: AppMode) => {
    if (nextMode === mode) return;

    if (sceneObjects?.camera && sceneObjects?.controls) {
      const snapshot: CameraState = {
        position: sceneObjects.camera.position.clone(),
        target: sceneObjects.controls.target.clone(),
      };
      if (mode === 'picture') {
        pictureCameraStateRef.current = snapshot;
      } else {
        videoCameraStateRef.current = snapshot;
      }
    }

    setMode(nextMode);

    const targetState =
      nextMode === 'picture' ? pictureCameraStateRef.current : videoCameraStateRef.current;

    if (targetState) {
      requestAnimationFrame(() => applyCameraState(targetState));
    }
  };

  // Reset camera to flat/centered position (0, 0, z)
  const handleResetCamera = () => {
    if (!sceneObjects?.camera || !sceneObjects?.controls) return;
    
    const { z } = selectedModel.cameraPosition;
    sceneObjects.camera.position.set(0, 0, z); // Flat centered view
    sceneObjects.controls.target.set(0, 0, 0);
    sceneObjects.controls.update();
  };

  // Reset zoom to default
  const handleResetZoom = () => {
    if (!sceneObjects?.camera || !sceneObjects?.controls) return;
    
    const { z } = selectedModel.cameraPosition;
    sceneObjects.camera.position.z = z;
    sceneObjects.controls.update();
  };

  // Handle slider changes
  const handleSliderChange = (axis: 'x' | 'y' | 'z', value: number) => {
    if (!sceneObjects?.camera || !sceneObjects?.controls) return;
    
    sceneObjects.camera.position[axis] = value;
    sceneObjects.controls.update();
    
    // Update state immediately for slider feedback
    setCameraPos(prev => ({ ...prev, [axis]: value }));
  };

  // Export mockup as image
  const handleExport = () => {
    try {
      if (!sceneObjects?.scene || !sceneObjects?.camera || !sceneObjects?.renderer) {
        throw new Error('Scene not ready');
      }
      exportCanvasAsImage(
        sceneObjects.scene,
        sceneObjects.camera,
        sceneObjects.renderer
      );
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to export image',
        type: 'export',
      });
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className={`app ${mode === 'video' ? 'video-mode' : ''}`}>
      <ErrorMessage error={error} onDismiss={handleDismissError} />
      
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
        <div className="sidebar-header">
          <img alt='Don Kutbay' src='donkutbay.png' width={48} height={48} className='rounded-full'/>
          <div className='d-flex flex-column'>
            <h1 className="sidebar-title tooltip-trigger">
              Don's mockups
              <span className="tooltip">don.kutbay@idt.net</span>
            </h1>
            <p className='text-muted font-size-12'>Supports android and ios devices</p>
          </div>
        </div>

        <div className="sidebar-content">
          <PhoneModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isLoading}
          />
          
          <ResolutionInfo model={selectedModel} />
          
          <PhoneColorPicker
            selectedColor={phoneColor}
            onColorChange={setPhoneColor}
            modelConfig={selectedModel}
            disabled={isLoading}
          />
          
          <ControlPanel
            onScreenshotUpload={handleScreenshotUpload}
            onExport={handleExport}
            disabled={isLoading}
          />

          <ScreenshotGallery
            screenshots={screenshots}
            activeIndex={activeIndex}
            onSelectScreenshot={setActiveScreenshot}
            onClearAll={clearAllScreenshots}
            disabled={isLoading}
          />

          <BackgroundColorPicker
            selectedColor={backgroundColor}
            onColorChange={setBackgroundColor}
            disabled={isLoading}
          />

          <CameraSliders
            cameraPosition={cameraPos}
            onPositionChange={handleSliderChange}
            disabled={isLoading}
          />

          <CameraControls
            onResetCamera={handleResetCamera}
            onResetZoom={handleResetZoom}
            disabled={isLoading}
          />
        </div>

        <div className="sidebar-footer">
          <p className="sidebar-tip">
            <FaLightbulb className="tip-icon" />
            <span>Left click to rotate the phone. Right click to drag up/down/left/right. Scroll to zoom.</span>
          </p>
        </div>
      </aside>

      <main className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mode === 'video' ? 'video-mode' : ''}`}>
        {isLoading && <LoadingState message="Loading phone model..." />}
        <PhoneViewer mountRef={mountRef} />
        
        {/* Frame with aspect ratio controls in video mode */}
        {mode === 'video' && (
          <>
            <ResizableFrame
              zoom={frameZoom}
              aspectRatio={frameAspectRatio}
            />
            <AspectRatioSelector
              aspectRatio={frameAspectRatio}
              onAspectRatioChange={setFrameAspectRatio}
              disabled={false}
            />
            <FrameZoomControls
              zoom={frameZoom}
              onZoomIn={() => setFrameZoom(Math.min(1.5, frameZoom + 0.1))}
              onZoomOut={() => setFrameZoom(Math.max(0.3, frameZoom - 0.1))}
              onReset={() => setFrameZoom(0.7)}
              disabled={false}
            />
          </>
        )}
        
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
        
        {mode === 'video' && (
          <div className="video-bottom-bar">
            <VideoTimeline
              currentTime={currentTime}
              duration={duration}
              keyframes={keyframes}
              isPlaying={isPlaying}
              isRecording={false}
              exportState={exportState}
              exportProgress={exportProgress}
              transparentBackground={transparentBackground}
              onTimeChange={handleTimeChange}
              onDurationChange={handleDurationChange}
              onPlayPause={handlePlayPause}
              onAddKeyframe={addKeyframe}
              onResetAll={handleResetAll}
              onTransparentBackgroundChange={setTransparentBackground}
              onUpdateKeyframeTime={updateKeyframeTime}
              onUpdateEasing={updateEasing}
              onExport={async () => {
                if (!sceneObjects) {
                  setError({ message: 'Scene not ready', type: 'export' });
                  return;
                }

                try {
                  setExportState('rendering');
                  setExportProgress(0);
                  
                  await exportVideo({
                    scene: sceneObjects.scene,
                    camera: sceneObjects.camera,
                    renderer: sceneObjects.renderer,
                    keyframes,
                    duration,
                    fps: 60,
                    aspectRatio: frameAspectRatio,
                    frameZoom,
                    transparentBackground,
                    backgroundColor,
                    onProgress: setExportProgress,
                  });
                  
                  setExportState('done');
                  
                  // Reset after 3 seconds
                  setTimeout(() => {
                    setExportState('idle');
                    setExportProgress(0);
                  }, 3000);
                } catch (err) {
                  console.error('Video export error:', err);
                  setError({ 
                    message: err instanceof Error ? err.message : 'Video export failed', 
                    type: 'export' 
                  });
                  setExportState('idle');
                  setExportProgress(0);
                }
              }}
              disabled={isLoading}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
