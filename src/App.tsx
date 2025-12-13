/**
 * Phone Mockup Tool - Main Application
 * A tool for creating phone mockups with custom screenshots
 */

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
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
import { UploadTooltip } from './components/UploadTooltip';
import { ThemeSelector } from './components/ThemeSelector';
import type { AppMode } from './components/ModeToggle';
import type { FrameAspectRatio } from './components/ResizableFrame';
import type { ExportState } from './components/VideoTimeline';
import { FaLightbulb, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useThreeScene } from './hooks/useThreeScene';
import { usePhoneModel } from './hooks/usePhoneModel';
import { useScreenshot } from './hooks/useScreenshot';
import { useBackgroundColor } from './hooks/useBackgroundColor';
import { usePhoneColor } from './hooks/usePhoneColor';
import { useCameraPosition } from './hooks/useCameraPosition';
import { useVideoAnimation } from './hooks/useVideoAnimation';
import { useVideoFrameFitting } from './hooks/useVideoFrameFitting';
import { useTheme } from './hooks/useTheme';
import { exportCanvasAsImage } from './utils/exportUtils';
import { exportVideo } from './utils/videoExport';
import { DEFAULT_PHONE_MODEL } from './config/phoneModels';
import { getRouteByModelId } from './config/routes';
import type { AppError } from './types';
import type { PhoneModelConfig } from './config/phoneModels';
import './App.css';

interface AppProps {
  initialModel?: PhoneModelConfig;
}

function App({ initialModel }: AppProps = {}) {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  // Ensure we always have a valid model - use initialModel if provided, otherwise default
  const [selectedModel, setSelectedModel] = useState<PhoneModelConfig>(
    initialModel || DEFAULT_PHONE_MODEL
  );
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 10 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const { theme, setTheme } = useTheme();
  const [mode, setMode] = useState<AppMode>('picture');

  // Update selected model when initialModel prop changes (route change)
  useEffect(() => {
    if (initialModel && initialModel.id !== selectedModel.id) {
      setSelectedModel(initialModel);
    }
  }, [initialModel?.id]); // Only depend on the model ID, not the whole object

  const [frameZoom, setFrameZoom] = useState(0.7); // Default 70% of max viewport size
  const [frameAspectRatio, setFrameAspectRatio] = useState<FrameAspectRatio>('square');
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  type CameraState = { position: THREE.Vector3; target: THREE.Vector3 };
  const pictureCameraStateRef = useRef<CameraState | null>(null);
  const videoCameraStateRef = useRef<CameraState | null>(null);
  const lastModelIdRef = useRef<string>(selectedModel.id);

  // Detect Safari and disable transparent background if enabled
  useEffect(() => {
    const isSafari = /safari/.test(navigator.userAgent.toLowerCase()) && 
                     !/chrome/.test(navigator.userAgent.toLowerCase()) && 
                     !/chromium/.test(navigator.userAgent.toLowerCase());
    
    if (isSafari && transparentBackground) {
      setTransparentBackground(false);
    }
  }, []); // Only run once on mount

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

  // Auto-select background color based on theme (only when theme changes)
  useEffect(() => {
    if (theme === 'light') {
      setBackgroundColor('#FAFAFA'); // 1st option - White
    } else if (theme === 'light-contrast') {
      setBackgroundColor('#F8F8F8'); // 2nd option - Light Gray
    } else if (theme === 'dark') {
      setBackgroundColor('#0F0F10'); // 3rd option - Dark
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]); // Only depend on theme, not backgroundColor - allows manual changes

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

  // Handle mouse drag for mobile bottom sheet
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) return;
      
      const currentY = e.clientY;
      const deltaY = Math.abs(dragStartY - currentY);
      
      // Mark as moved if movement is more than 2px (very sensitive)
      if (deltaY > 2) {
        setHasMoved(true);
      }
      
      const deltaYDirection = dragStartY - currentY; // Positive = dragging up (expand)
      
      // Start dragging immediately, even with small movements
      if (sidebarRef.current) {
        const viewportHeight = window.innerHeight;
        const minHeight = viewportHeight * 0.15; // 15vh
        const maxHeight = viewportHeight * 0.9; // 90vh
        
        let newHeight = dragStartHeight + deltaYDirection;
        newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
        
        sidebarRef.current.style.height = `${newHeight}px`;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) return;
      
      setIsDragging(false);
      
      if (sidebarRef.current) {
        const currentHeight = sidebarRef.current.getBoundingClientRect().height;
        const viewportHeight = window.innerHeight;
        
        // If user didn't move much, treat as tap and toggle
        if (!hasMoved || Math.abs(currentHeight - dragStartHeight) < 10) {
          setMobileExpanded(!mobileExpanded);
          sidebarRef.current.style.height = '';
        } else {
          // Calculate velocity for quick swipes
          const endY = e.clientY;
          const totalDelta = dragStartY - endY;
          const velocity = Math.abs(totalDelta) / 100; // Simple velocity calculation
          
          // For quick swipes, use velocity to determine direction
          // Otherwise use height threshold
          if (velocity > 0.5) {
            // Quick swipe - go in the direction of the swipe
            if (totalDelta > 0) {
              // Swiped up - expand
              setMobileExpanded(true);
            } else {
              // Swiped down - collapse
              setMobileExpanded(false);
            }
          } else {
            // Slow drag - use height threshold (40% instead of 50% for easier expansion)
            const threshold = viewportHeight * 0.4;
            if (currentHeight > threshold) {
              setMobileExpanded(true);
            } else {
              setMobileExpanded(false);
            }
          }
          
          // Reset inline height to let CSS take over
          sidebarRef.current.style.height = '';
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartY, dragStartHeight, hasMoved, mobileExpanded]);

  return (
    <div className={`app ${mode === 'video' ? 'video-mode' : ''}`}>
      <ErrorMessage error={error} onDismiss={handleDismissError} />
      
      <aside 
        ref={sidebarRef}
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileExpanded ? 'mobile-expanded' : ''} ${isDragging ? 'dragging' : ''}`}
      >
        <button 
          className="sidebar-toggle"
          onClick={() => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
              // On mobile, toggle expansion instead of collapse
              setMobileExpanded(!mobileExpanded);
            } else {
              // On desktop, toggle collapse
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
        <div 
          className="sidebar-header"
          onTouchStart={(e) => {
            const isMobile = window.innerWidth <= 768;
            if (!isMobile) return;
            setIsDragging(true);
            setHasMoved(false);
            setDragStartY(e.touches[0].clientY);
            if (sidebarRef.current) {
              const rect = sidebarRef.current.getBoundingClientRect();
              setDragStartHeight(rect.height);
            }
          }}
          onTouchMove={(e) => {
            if (!isDragging) return;
            const isMobile = window.innerWidth <= 768;
            if (!isMobile) return;
            e.preventDefault(); // Prevent scrolling while dragging
            const currentY = e.touches[0].clientY;
            const deltaY = Math.abs(dragStartY - currentY);
            
            // Mark as moved if movement is more than 2px (very sensitive)
            if (deltaY > 2) {
              setHasMoved(true);
            }
            
            const deltaYDirection = dragStartY - currentY; // Positive = dragging up (expand)
            
            // Start dragging immediately, even with small movements
            if (sidebarRef.current) {
              const viewportHeight = window.innerHeight;
              const minHeight = viewportHeight * 0.15; // 15vh
              const maxHeight = viewportHeight * 0.9; // 90vh
              
              let newHeight = dragStartHeight + deltaYDirection;
              newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
              
              sidebarRef.current.style.height = `${newHeight}px`;
            }
          }}
          onTouchEnd={(e) => {
            if (!isDragging) return;
            const isMobile = window.innerWidth <= 768;
            if (!isMobile) return;
            
            setIsDragging(false);
            
            if (sidebarRef.current) {
              const currentHeight = sidebarRef.current.getBoundingClientRect().height;
              const viewportHeight = window.innerHeight;
              
              // If user didn't move much, treat as tap and toggle
              if (!hasMoved || Math.abs(currentHeight - dragStartHeight) < 10) {
                setMobileExpanded(!mobileExpanded);
                sidebarRef.current.style.height = '';
              } else {
                // Calculate velocity for quick swipes
                const endY = e.changedTouches[0].clientY;
                const totalDelta = dragStartY - endY;
                const velocity = Math.abs(totalDelta) / 100; // Simple velocity calculation
                
                // For quick swipes, use velocity to determine direction
                // Otherwise use height threshold
                if (velocity > 0.5) {
                  // Quick swipe - go in the direction of the swipe
                  if (totalDelta > 0) {
                    // Swiped up - expand
                    setMobileExpanded(true);
                  } else {
                    // Swiped down - collapse
                    setMobileExpanded(false);
                  }
                } else {
                  // Slow drag - use height threshold (40% instead of 50% for easier expansion)
                  const threshold = viewportHeight * 0.4;
                  if (currentHeight > threshold) {
                    setMobileExpanded(true);
                  } else {
                    setMobileExpanded(false);
                  }
                }
                
                // Reset inline height to let CSS take over
                sidebarRef.current.style.height = '';
              }
            }
          }}
          onMouseDown={(e) => {
            const isMobile = window.innerWidth <= 768;
            if (!isMobile) return;
            e.preventDefault();
            setIsDragging(true);
            setDragStartY(e.clientY);
            if (sidebarRef.current) {
              const rect = sidebarRef.current.getBoundingClientRect();
              setDragStartHeight(rect.height);
            }
          }}
          style={{ touchAction: 'none' }}
        >
          <img alt='Don Kutbay' src='donkutbay.png' width={48} height={48} className='rounded-full'/>
          <div className='d-flex flex-column' style={{ flex: 1 }}>
            <h1 className="sidebar-title tooltip-trigger">
              Don's mockups
              <span className="tooltip">don.kutbay@idt.net</span>
            </h1>
            <p className='text-muted font-size-12'>Supports android and ios devices</p>
          </div>
          <button
            className="mobile-expand-indicator"
            onClick={(e) => {
              const isMobile = window.innerWidth <= 768;
              if (isMobile) {
                e.stopPropagation();
                setMobileExpanded(!mobileExpanded);
              }
            }}
            aria-label={mobileExpanded ? "Collapse" : "Expand"}
          >
            {mobileExpanded ? <FaChevronDown /> : <FaChevronUp />}
          </button>
        </div>

        <div className="sidebar-content">
          <PhoneModelSelector
            selectedModel={selectedModel}
            onModelChange={(model) => {
              setSelectedModel(model);
              // Navigate to the route for this model
              const route = getRouteByModelId(model.id);
              if (route && route.path !== window.location.pathname) {
                navigate(route.path, { replace: true });
              }
            }}
            disabled={isLoading}
          />
          
          <ResolutionInfo model={selectedModel} />
          
          <PhoneColorPicker
            selectedColor={phoneColor}
            onColorChange={setPhoneColor}
            modelConfig={selectedModel}
            disabled={isLoading}
          />
          
          <div style={{ position: 'relative' }}>
            <ControlPanel
              onScreenshotUpload={handleScreenshotUpload}
              onExport={handleExport}
              disabled={isLoading}
              uploadButtonRef={uploadButtonRef}
            />
            <UploadTooltip targetRef={uploadButtonRef} />
          </div>

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

          <ThemeSelector
            theme={theme}
            onThemeChange={setTheme}
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
      <Analytics />
    </div>
  );
}

export default App;
