/**
 * VideoTimeline Component
 * Timeline controls for video mode animation
 */

import React, { useState } from 'react';
import { FaPlay, FaPause, FaPlus, FaUndo, FaCheck, FaChevronDown } from 'react-icons/fa';

export type EasingType = 'ease-in' | 'ease-out' | 'ease-in-out' | 'bouncy' | 'soft-bouncy' | 'gentle';

export interface Keyframe {
  time: number; // 0-10 seconds
  cameraPosition: { x: number; y: number; z: number };
  cameraRotation: { x: number; y: number; z: number };
  controlsTarget: { x: number; y: number; z: number };
  easing?: EasingType; // Easing for the segment AFTER this keyframe (to the next one)
}

export type ExportState = 'idle' | 'rendering' | 'done';

interface VideoTimelineProps {
  currentTime: number;
  duration: number;
  keyframes: Keyframe[];
  isPlaying: boolean;
  isRecording: boolean;
  exportState: ExportState;
  exportProgress: number; // 0-100
  transparentBackground: boolean;
  onTimeChange: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayPause: () => void;
  onAddKeyframe: () => void;
  onResetAll: () => void;
  onExport: () => void;
  onTransparentBackgroundChange: (value: boolean) => void;
  onUpdateKeyframeTime?: (keyframeIndex: number, newTime: number) => void;
  onUpdateEasing?: (keyframeIndex: number, easing: EasingType) => void;
  disabled?: boolean;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  currentTime,
  duration,
  keyframes,
  isPlaying,
  isRecording,
  exportState,
  exportProgress,
  transparentBackground,
  onTimeChange,
  onDurationChange,
  onPlayPause,
  onAddKeyframe,
  onResetAll,
  onExport,
  onTransparentBackgroundChange,
  onUpdateKeyframeTime,
  onUpdateEasing,
  disabled = false,
}) => {
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [durationInputValue, setDurationInputValue] = useState(duration.toFixed(1));
  const [draggingKeyframeIndex, setDraggingKeyframeIndex] = useState<number | null>(null);
  const [openEasingIndex, setOpenEasingIndex] = useState<number | null>(null);
  const timelineTrackRef = React.useRef<HTMLDivElement>(null);
  const easingPopupRef = React.useRef<HTMLDivElement>(null);

  // Handle keyframe dragging
  React.useEffect(() => {
    if (draggingKeyframeIndex === null || !onUpdateKeyframeTime || !timelineTrackRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineTrackRef.current || draggingKeyframeIndex === null) return;
      
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const sliderWidth = rect.width - 18; // Account for thumb width
      const clickX = e.clientX - rect.left - 9; // Offset for thumb center
      const percentage = Math.max(0, Math.min(1, clickX / sliderWidth));
      const rawTime = percentage * duration;
      
      // Snap to 0.1-second intervals
      const newTime = Math.round(rawTime * 10) / 10;
      
      onUpdateKeyframeTime(draggingKeyframeIndex, newTime);
    };

    const handleMouseUp = () => {
      setDraggingKeyframeIndex(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingKeyframeIndex, duration, onUpdateKeyframeTime]);

  // Close easing popup when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (easingPopupRef.current && !easingPopupRef.current.contains(e.target as Node)) {
        setOpenEasingIndex(null);
      }
    };

    if (openEasingIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openEasingIndex]);

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  const handleDurationClick = () => {
    setIsEditingDuration(true);
    setDurationInputValue(duration.toFixed(1));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDurationInputValue(e.target.value);
  };

  const handleDurationBlur = () => {
    const newDuration = parseFloat(durationInputValue);
    if (!isNaN(newDuration) && newDuration >= 1 && newDuration <= 10) {
      onDurationChange(newDuration);
    } else {
      setDurationInputValue(duration.toFixed(1));
    }
    setIsEditingDuration(false);
  };

  const handleDurationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDurationBlur();
    } else if (e.key === 'Escape') {
      setDurationInputValue(duration.toFixed(1));
      setIsEditingDuration(false);
    }
  };

  const isExporting = exportState === 'rendering';
  const isExportDone = exportState === 'done';

  return (
    <div className="video-timeline">
      <div className="video-timeline-left">
        <button
          className="video-control-btn"
          onClick={onPlayPause}
          disabled={disabled || isRecording || isExporting}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        
        <button
          className="video-control-btn"
          onClick={onAddKeyframe}
          disabled={disabled || isRecording || isExporting}
          aria-label="Add keyframe"
        >
          <FaPlus /> Keyframe
        </button>
        
        <button
          className="video-control-btn"
          onClick={onResetAll}
          disabled={disabled || isRecording || isExporting || keyframes.length === 0}
          aria-label="Reset all keyframes"
          title="Reset all keyframes"
        >
          <FaUndo /> Reset All
        </button>
        
        <div className="video-timeline-info">
          <span className="video-time">{formatTime(currentTime)}</span>
          <span className="video-divider">/</span>
          {isEditingDuration ? (
            <input
              type="text"
              className="video-duration-input"
              value={durationInputValue}
              onChange={handleDurationChange}
              onBlur={handleDurationBlur}
              onKeyDown={handleDurationKeyDown}
              disabled={disabled || isRecording || isExporting}
              autoFocus
              placeholder="10.0"
            />
          ) : (
            <span 
              className="video-duration editable" 
              onClick={handleDurationClick}
              title="Click to edit duration (1-10s)"
            >
              {formatTime(duration)}
            </span>
          )}
        </div>
      </div>

      <div className="video-timeline-center">
        <div className="timeline-track">
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            disabled={disabled || isRecording || isExporting}
            className="timeline-slider"
          />
          
          {/* Keyframe markers - aligned with slider thumb (9px = half of 18px thumb) */}
          <div className="keyframe-markers" ref={timelineTrackRef}>
            {keyframes.map((keyframe, index) => {
              const handleMouseDown = (e: React.MouseEvent) => {
                if (disabled || isRecording || isExporting || !onUpdateKeyframeTime) return;
                e.preventDefault();
                e.stopPropagation();
                setDraggingKeyframeIndex(index);
              };

              return (
                <React.Fragment key={index}>
                  <div
                    className={`keyframe-marker ${draggingKeyframeIndex === index ? 'dragging' : ''}`}
                    style={{ left: `calc(9px + (100% - 18px) * ${keyframe.time / duration})` }}
                    title={`Keyframe at ${formatTime(keyframe.time)} - Drag to move`}
                    onMouseDown={handleMouseDown}
                    onClick={(e) => {
                      // Only jump to time if we're not dragging
                      if (draggingKeyframeIndex === null) {
                        onTimeChange(keyframe.time);
                      }
                    }}
                  />
                  
                  {/* Easing bar between keyframes */}
                  {index < keyframes.length - 1 && (
                    <div
                      className="easing-bar"
                      style={{
                        left: `calc(9px + (100% - 18px) * ${keyframe.time / duration})`,
                        width: `calc((100% - 18px) * ${(keyframes[index + 1].time - keyframe.time) / duration})`,
                      }}
                    >
                      <button
                        className="easing-bar-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenEasingIndex(openEasingIndex === index ? null : index);
                        }}
                        disabled={disabled || isRecording || isExporting}
                      >
                        <span className="easing-bar-text">
                          {keyframe.easing || 'ease-in-out'}
                        </span>
                        <FaChevronDown className="easing-bar-chevron" />
                      </button>
                      
                      {openEasingIndex === index && (
                        <div
                          ref={easingPopupRef}
                          className="easing-popup easing-popup-up"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(['ease-in', 'ease-out', 'ease-in-out', 'bouncy', 'soft-bouncy', 'gentle'] as EasingType[]).map((easing) => (
                            <button
                              key={easing}
                              className={`easing-option ${(keyframe.easing || 'ease-in-out') === easing ? 'selected' : ''}`}
                              onClick={() => {
                                onUpdateEasing?.(index, easing);
                                setOpenEasingIndex(null);
                              }}
                            >
                              {easing === 'ease-in' && 'Ease-in'}
                              {easing === 'ease-out' && 'Ease-out'}
                              {easing === 'ease-in-out' && 'Ease-in-out'}
                              {easing === 'bouncy' && 'Bouncy'}
                              {easing === 'soft-bouncy' && 'Soft bouncy'}
                              {easing === 'gentle' && 'Gentle'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="video-timeline-right">
      
        <button
          className={`btn video-export-btn ${isExportDone ? 'btn-success' : 'btn-primary'}`}
          onClick={onExport}
          disabled={disabled || isRecording || isExporting || keyframes.length < 2}
          aria-label="Render and export video"
        >
          {isExporting ? (
            <div className="export-progress-wrapper">
              <div className="export-progress-bar" style={{ width: `${exportProgress}%` }} />
              <span className="export-progress-text">{Math.round(exportProgress)}%</span>
            </div>
          ) : isExportDone ? (
            <>
              <FaCheck /> Done!
            </>
          ) : (
            'Render & Export'
          )}
        </button>
        <label 
          className="transparent-checkbox"
          data-tooltip="During rendering background will turn black, it's fine"
        >
          <input
            type="checkbox"
            checked={transparentBackground}
            onChange={(e) => onTransparentBackgroundChange(e.target.checked)}
            disabled={disabled || isRecording || isExporting}
          />
          <span>Transparent background</span>
        </label>
      </div>
    </div>
  );
};
