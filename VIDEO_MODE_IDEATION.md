# Video Mode Feature - Ideation Document

## 🎯 Overview
Add animated mockup generation capability alongside static mockup export.

## ⚡ MVP Constraints (V1) - SIMPLIFIED

### Fixed Settings (No User Choice)
- **Format**: MP4 only
- **Resolution**: 1080x1080 (square)
- **Frame Rate**: 30 FPS
- **Duration**: 1-10 seconds (slider)

### What This Means
✅ **Simpler UI** - Less overwhelming for users  
✅ **Better Performance** - Fixed res = predictable speed  
✅ **Faster Development** - No complex encoding logic  
✅ **Smaller Scope** - Ship faster, iterate based on feedback  

### Estimated Export Times
- 3 second video = ~3-5 seconds to export
- 10 second video = ~10-15 seconds to export
- File size: 1-3MB for most animations

**Perfect for social media!** Instagram posts, stories, Twitter, etc.

---

## 🎨 UI/UX Design

### Mode Toggle
- **Location**: Bottom-center of viewport, floating above content
- **Style**: Pill-shaped toggle (shadcn style)
- **States**: 
  - Picture Mode (default/selected)
  - Video Mode
- **Behavior**: Smooth transition between modes

### Picture Mode (Current)
- Keep all existing functionality
- Sidebar visible
- Static mockup export

### Video Mode Layout
```
┌─────────────────────────────────────┐
│                                     │
│    [Darkened Background]            │
│                                     │
│    ┌─────────────────┐             │
│    │  White Frame    │             │
│    │   (Export Area) │             │
│    │                 │             │
│    │   📱 Phone      │             │
│    │                 │             │
│    └─────────────────┘             │
│                                     │
│  [Timeline Controls at Bottom]     │
└─────────────────────────────────────┘
```

---

## 🎬 Video Mode Features

### 1. Export Settings Panel (Compact)
**Resolution:**
- Fixed: 1080x1080 (square)
- Display info: "Optimized for Instagram & social media"
  
**Frame Rate:**
- Fixed: 30 FPS
- Display info: "Smooth & efficient"

**Duration:**
- Slider: 1-10 seconds
- Current time display
- Info: "10 second max for optimal performance"

**Background:**
- Color picker (same as picture mode)
- ~~Image upload option~~ (V2 feature)
- ~~Gradient option~~ (V2 feature)

**Export Format:**
- MP4 only
- Info: "MP4 format for best quality & size"

---

## 🎭 Animation System

### Timeline UI
```
[0s]━━━━━[3s]━━━━━[6s]━━━━━[10s]
  ●        ●        ●        ← Keyframes (max 10 seconds)
  [▶ Preview] [+ Add] [🗑️ Delete]
```

### Keyframe Editor
Each keyframe contains:
- **Time**: Position on timeline (0-10s)
- **Camera Position**:
  - X axis (left/right)
  - Y axis (up/down)
  - Z axis (zoom)
- **Phone Rotation**:
  - X axis (tilt forward/back)
  - Y axis (rotate left/right)
  - Z axis (roll)
- **Easing** (V1 - keep simple):
  - Linear
  - Ease In-Out (default)

### Controls
- **Play/Pause**: Preview animation
- **Scrub**: Drag timeline to see phone at any point
- **Add Keyframe**: Click timeline to add keyframe at current time
- **Edit Keyframe**: Click existing keyframe to edit values
- **Delete Keyframe**: Select and delete
- **Duplicate Keyframe**: Copy current state

---

## 🛠️ Technical Implementation

### Libraries to Consider

**Video Rendering:**
- ✅ `MediaRecorder API` - **CHOSEN**: Native browser recording (lightest, simplest)
- ~~`canvas-to-video`~~ - Not needed
- ~~`ffmpeg.wasm`~~ - Too heavy (400MB+)

**GIF Export:**
- ❌ **REMOVED** - Files too large, slow generation

**WebP Animation:**
- ❌ **REMOVED** - Limited browser support, V1 not needed

**Animation:**
- `gsap` (GreenSock) - Professional animation library
- Or use native `requestAnimationFrame` with interpolation
- Easing functions: `bezier-easing` package

**Timeline UI:**
- Custom React component
- Or use `react-timeline-editor` (if suitable)

### Rendering Pipeline
```
1. User creates keyframes
2. Click "Export"
3. Interpolate between keyframes
4. Render each frame to canvas
5. Compile frames to video/gif
6. Download file
```

### Performance Considerations
- Fixed 1080x1080 = consistent performance
- 30 FPS = 300 frames for 10s (very manageable)
- MediaRecorder handles encoding automatically
- Show progress during export
- Preview at full resolution (possible with fixed size)
- No Web Worker needed (MediaRecorder is non-blocking)

---

## 🎯 User Flow

### Creating an Animation

1. **Switch to Video Mode**
   - Toggle button → Video Mode
   - Sidebar collapses
   - Frame appears around phone
   - Timeline appears at bottom

2. **Set Export Settings**
   - Choose resolution (or keep default)
   - Choose frame rate
   - Set duration

3. **Create Keyframes**
   - At 0s: Set initial position/rotation
   - Click timeline at 3s → Add keyframe
   - Adjust phone (rotate, zoom, etc.)
   - Click timeline at 6s → Add keyframe
   - Adjust again
   - Repeat...

4. **Preview**
   - Click Play
   - Watch animation loop
   - Adjust timing/values as needed

5. **Export**
   - Click "Export Video" (MP4)
   - See progress bar with percentage
   - Wait for rendering (~5-10 seconds)
   - Download automatically starts

---

## 💡 My Take & Recommendations

### ✅ GOOD Ideas
1. **Mode Toggle**: Clean separation of features
2. **Visual Frame**: Shows export area clearly
3. **15s limit**: Reasonable for web rendering
4. **Multiple formats**: Gives users flexibility
5. **Frame rate options**: Good balance

### 🚀 Suggestions

**Phase 1 (MVP) - Current Scope:**
- ✅ Simple timeline with keyframes (no limit, but 10s max)
- ✅ Camera movement (X/Y/Z axes)
- ✅ Phone rotation (X/Y/Z axes)
- ✅ MP4 export only
- ✅ Fixed 1080x1080 resolution
- ✅ 30 FPS only
- ✅ 10 second max duration
- ✅ Basic easing (Linear + Ease In-Out)

**Phase 2 (Future):**
- Custom resolutions (1920x1080, etc.)
- 60 FPS option
- More easing options
- Background images
- Longer duration (15-30s)

**Phase 3 (Advanced):**
- GIF export (if users really want it)
- Screenshot transitions (animate between uploaded images)
- Advanced easing curves
- Camera path visualization

### 🎨 UX Improvements
1. **Preset Animations**: 
   - "Rotate 360°"
   - "Tilt & Spin"
   - "Zoom In"
   - Users can start with these and customize

2. **Onboarding**:
   - First time in Video Mode → Show quick tutorial
   - "Click timeline to add keyframe"
   - "Drag phone to change position"

3. **Real-time Preview**:
   - Show animation loop automatically
   - No need to click play every time

4. **Smart Warnings**:
   - "GIF files over 10s will be very large (>50MB)"
   - "Reduce duration or use MP4 instead"

### ⚠️ Challenges to Consider

**1. Performance**
- Rendering 10s at 30fps = 300 frames ✅ Very manageable!
- MediaRecorder captures in real-time
- Export time ≈ 10-15 seconds (just slightly longer than video)
- Solution: Show progress bar, should feel fast

**2. File Size**
- MP4: 10s at 1080x1080/30fps ≈ 2-5MB (very reasonable)
- Solution: No issue with MP4!

**3. Browser Compatibility**
- Some older browsers can't handle video encoding
- Solution: Show compatibility warning

**4. Memory**
- Storing all frames before encoding
- Solution: Stream frames directly to encoder if possible

**5. Complexity**
- Timeline UI is complex to build well
- Solution: Start simple, iterate based on feedback

---

## 📋 Implementation Checklist

### UI Components
- [ ] Mode toggle button (bottom-center)
- [ ] Export settings panel (collapsible)
- [ ] Timeline component
- [ ] Keyframe markers
- [ ] Play/Pause controls
- [ ] Frame visualization (white box)
- [ ] Progress bar for export

### Animation Engine
- [ ] Keyframe data structure
- [ ] Interpolation between keyframes
- [ ] Easing functions
- [ ] Preview playback
- [ ] Canvas frame capture

### Export System
- [ ] MP4 encoder (MediaRecorder API)
- [ ] Progress bar during recording
- [ ] Automatic download handler
- [ ] File naming (mockup-video-{timestamp}.mp4)

### State Management
- [ ] Video mode state
- [ ] Keyframes array
- [ ] Timeline position
- [ ] Export settings
- [ ] Preview playing state

---

## 🎬 Future Enhancements (Post-Launch)

1. **Screenshot Transitions**: Animate between uploaded screenshots
2. **Text Overlays**: Add animated text to video
3. **Audio**: Add background music/sound
4. **Templates**: Pre-made animation presets
5. **Collaborative**: Share animation configs
6. **Cloud Rendering**: Offload heavy rendering to server

---

## 📊 Success Metrics

- % of users who try Video Mode
- Average video duration created
- Most popular export format
- Most popular resolution
- User feedback on animation complexity

---

## 🚦 Go/No-Go Decision Points

### Must-Have for Launch:
- Smooth 30fps preview ✅
- MP4 export working reliably ✅
- Export time < 15 seconds for 10s video ✅
- Desktop browser support (mobile = V2)

### Nice-to-Have (V2):
- 60fps option
- Custom resolutions
- Background images
- Mobile browser support
- GIF export (if users request it)

---

**Status**: 💭 Ideation Phase  
**Next Steps**: Prototype timeline UI → Test video rendering → Decide on MVP scope


