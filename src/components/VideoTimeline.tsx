/**
 * VideoTimeline Component
 * Timeline controls for video mode animation
 */

import React, { useState } from 'react';
import { FaPlay, FaPause, FaPlus, FaUndo, FaCheck } from 'react-icons/fa';

export interface Keyframe {
  time: number; // 0-10 seconds
  cameraPosition: { x: number; y: number; z: number };
  cameraRotation: { x: number; y: number; z: number };
  controlsTarget: { x: number; y: number; z: number };
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
  disabled = false,
}) => {
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [durationInputValue, setDurationInputValue] = useState(duration.toFixed(1));

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
          
          {/* Keyframe markers */}
          <div className="keyframe-markers">
            {keyframes.map((keyframe, index) => (
              <div
                key={index}
                className="keyframe-marker"
                style={{ left: `calc(1.5% + ${(keyframe.time / duration) * 97.6}%)` }}
                title={`Keyframe at ${formatTime(keyframe.time)}`}
                onClick={() => onTimeChange(keyframe.time)}
              />
            ))}
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
        <label className="transparent-checkbox">
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
