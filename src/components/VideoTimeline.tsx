/**
 * VideoTimeline Component
 * Timeline controls for video mode animation
 */

import React from 'react';
import { FaPlay, FaPause, FaPlus, FaDownload } from 'react-icons/fa';

export interface Keyframe {
  time: number; // 0-10 seconds
  cameraPosition: { x: number; y: number; z: number };
  cameraRotation: { x: number; y: number; z: number };
}

interface VideoTimelineProps {
  currentTime: number;
  duration: number;
  keyframes: Keyframe[];
  isPlaying: boolean;
  isRecording: boolean;
  onTimeChange: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayPause: () => void;
  onAddKeyframe: () => void;
  onExport: () => void;
  disabled?: boolean;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  currentTime,
  duration,
  keyframes,
  isPlaying,
  isRecording,
  onTimeChange,
  onDurationChange,
  onPlayPause,
  onAddKeyframe,
  onExport,
  disabled = false,
}) => {
  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  return (
    <div className="video-timeline">
      <div className="video-timeline-left">
        <button
          className="video-control-btn"
          onClick={onPlayPause}
          disabled={disabled || isRecording}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        
        <button
          className="video-control-btn"
          onClick={onAddKeyframe}
          disabled={disabled || isRecording}
          aria-label="Add keyframe"
        >
          <FaPlus /> Keyframe
        </button>
        
        <div className="video-timeline-info">
          <span className="video-time">{formatTime(currentTime)}</span>
          <span className="video-divider">/</span>
          <span className="video-duration">{formatTime(duration)}</span>
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
            disabled={disabled || isRecording}
            className="timeline-slider"
          />
          
          {/* Keyframe markers */}
          <div className="keyframe-markers">
            {keyframes.map((keyframe, index) => (
              <div
                key={index}
                className="keyframe-marker"
                style={{ left: `${(keyframe.time / duration) * 100}%` }}
                title={`Keyframe at ${formatTime(keyframe.time)}`}
              />
            ))}
          </div>
        </div>
        
        <div className="duration-control">
          <label htmlFor="duration-slider" className="duration-label">
            Duration:
          </label>
          <input
            id="duration-slider"
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={duration}
            onChange={(e) => onDurationChange(parseFloat(e.target.value))}
            disabled={disabled || isRecording}
            className="duration-slider"
          />
        </div>
      </div>

      <div className="video-timeline-right">
        <button
          className="btn btn-primary video-export-btn"
          onClick={onExport}
          disabled={disabled || isRecording || keyframes.length < 2}
          aria-label="Export video"
        >
          <FaDownload /> Export MP4
        </button>
      </div>
    </div>
  );
};

