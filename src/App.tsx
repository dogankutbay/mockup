/**
 * Phone Mockup Tool - Main Application
 * A tool for creating phone mockups with custom screenshots
 */

import React, { useRef, useState } from 'react';
import { PhoneViewer } from './components/PhoneViewer';
import { ControlPanel } from './components/ControlPanel';
import { LoadingState } from './components/LoadingState';
import { ErrorMessage } from './components/ErrorMessage';
import { BackgroundColorPicker } from './components/BackgroundColorPicker';
import { PhoneModelSelector } from './components/PhoneModelSelector';
import { ResolutionInfo } from './components/ResolutionInfo';
import { CameraControls } from './components/CameraControls';
import { CameraSliders } from './components/CameraSliders';
import { ScreenshotGallery } from './components/ScreenshotGallery';
import { ModeToggle } from './components/ModeToggle';
import { VideoTimeline } from './components/VideoTimeline';
import { FrameZoomControls } from './components/FrameZoomControls';
import { ResizableFrame } from './components/ResizableFrame';
import type { AppMode } from './components/ModeToggle';
import { FaLightbulb, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useThreeScene } from './hooks/useThreeScene';
import { usePhoneModel } from './hooks/usePhoneModel';
import { useScreenshot } from './hooks/useScreenshot';
import { useBackgroundColor } from './hooks/useBackgroundColor';
import { useCameraPosition } from './hooks/useCameraPosition';
import { useVideoAnimation } from './hooks/useVideoAnimation';
import { useVideoFrameFitting } from './hooks/useVideoFrameFitting';
import { exportCanvasAsImage } from './utils/exportUtils';
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

  // Adjust camera position based on selected model (Picture mode only)
  useCameraPosition({
    camera: sceneObjects?.camera || null,
    controls: sceneObjects?.controls || null,
    modelConfig: selectedModel,
    enabled: mode === 'picture', // Only animate in picture mode
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
  } = useVideoAnimation({
    camera: sceneObjects?.camera || null,
    controls: sceneObjects?.controls || null,
    mode,
  });

  // Auto-fit phone to video frame when entering video mode
  useVideoFrameFitting({
    phoneModel,
    camera: sceneObjects?.camera || null,
    controls: sceneObjects?.controls || null,
    mode,
  });

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
    <div className="app">
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
          <img alt="" src="data:image/png;base64,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" />
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
            <span>You can rotate the phone by clicking and dragging. Zoom with scroll wheel.</span>
          </p>
        </div>
      </aside>

      <main className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mode === 'video' ? 'video-mode' : ''}`}>
        {isLoading && <LoadingState message="Loading phone model..." />}
        <PhoneViewer mountRef={mountRef} />
        
        {/* Resizable square frame in video mode */}
        {mode === 'video' && (
          <>
            <ResizableFrame
              zoom={frameZoom}
              onZoomChange={setFrameZoom}
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
        
        <ModeToggle mode={mode} onModeChange={setMode} />
        
        {mode === 'video' && (
          <div className="video-bottom-bar">
            <VideoTimeline
              currentTime={currentTime}
              duration={duration}
              keyframes={keyframes}
              isPlaying={isPlaying}
              isRecording={false}
              onTimeChange={handleTimeChange}
              onDurationChange={handleDurationChange}
              onPlayPause={handlePlayPause}
              onAddKeyframe={addKeyframe}
              onExport={() => {
                setError({ message: 'Video export coming soon!', type: 'export' });
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
