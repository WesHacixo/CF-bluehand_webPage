# Media Assets Required

This directory contains video and image assets for the Atmospheric Frame component.

## Required Assets

### Cinematic Introduction (First Visit)
- **File**: `intro-cinematic.mp4`
- **Duration**: 30 seconds maximum
- **Aspect Ratio**: 21:9 (cinematic widescreen) or 16:9
- **Format**: MP4 (H.264)
- **Resolution**: 1920x1080 minimum, 4K preferred
- **Purpose**: High-production captive intro shown once on first visit
- **Encoding**: Web-optimized, progressive download

- **File**: `intro-poster.jpg`
- **Aspect Ratio**: Match video (21:9 or 16:9)
- **Resolution**: 1920x1080
- **Purpose**: Poster frame while video loads

### Ambient Background (Default State)
- **File**: `ambient-loop.mp4`
- **Duration**: 60 seconds
- **Aspect Ratio**: 16:9
- **Format**: MP4 (H.264)
- **Resolution**: 1920x1080 minimum
- **Purpose**: Seamless looping passive background
- **Encoding**: Optimized for seamless loop, web delivery

## Future Expansion

Additional ambient media can be added to create a rotating pool:
- `ambient-loop-2.mp4`
- `ambient-loop-3.mp4`
- etc.

These will be randomly selected when the user scrolls back to the top.

## Fallback Behavior

If media files are missing, the component will display a gradient placeholder with branding.
This prevents breaking the site while assets are being created.

## Content Recommendations

### Cinematic Intro
- Showcase sovereign intelligence theme
- Neural networks, data patterns, hand symbology
- Slow, deliberate pacing
- Consider ambient sound design (users can unmute)

### Ambient Loops
- Subtle, non-distracting motion
- Cosmic, technical, or abstract themes
- Should enhance state-setting without demanding attention
- Seamless loop points are critical
