# Cursor Layout Settings Guide

**Purpose**: Capture and apply Cursor IDE layout and sizing as default  
**Last Updated**: 2025-01-01

## Overview

This guide explains how to capture your current Cursor IDE layout (panel sizes, sidebar width, etc.) and save them as default settings.

---

## How to Capture Current Layout

### Step 1: Open Settings

1. Click the **gear icon** (⚙️) in the top-right corner
2. Or press `Ctrl/⌘ + Shift + J` to open settings
3. Navigate to **Settings** → **Layout** (if available)

### Step 2: Check Current Layout Values

Open Command Palette (`Ctrl/⌘ + Shift + P`) and run:
- `Preferences: Open User Settings (JSON)` - For user-level settings
- `Preferences: Open Workspace Settings (JSON)` - For workspace settings

### Step 3: Inspect Layout Settings

Look for these settings in your settings JSON:

```json
{
  // Panel sizes
  "workbench.panel.defaultLocation": "bottom",
  "workbench.panel.opensMaximized": "never",
  
  // Sidebar
  "workbench.sideBar.location": "left",
  "workbench.activityBar.visible": true,
  
  // Editor layout
  "workbench.editor.splitInGroupLayout": "vertical",
  "workbench.editor.enablePreview": true,
  
  // Terminal
  "terminal.integrated.defaultLocation": "panel",
  
  // Chat/Composer panel
  "cursor.chat.panelSize": 400,
  "cursor.composer.panelSize": 500,
  
  // Activity bar
  "workbench.activityBar.orientation": "horizontal"
}
```

---

## Layout Settings to Capture

### Panel Sizes

**Chat Panel**:
- Width/Height of chat panel
- Position (left/right/bottom)

**Composer Panel**:
- Width/Height of composer
- Position relative to editor

**Terminal Panel**:
- Height when opened
- Split layout

**Sidebar**:
- Width when open
- Auto-hide behavior

### Activity Bar

- Orientation (horizontal/vertical)
- Visibility
- Position

### Editor Layout

- Split editor layout
- Grid layout preferences
- Tab sizing

---

## How to Save as Default

### Method 1: User Settings (Global Default)

1. Open Command Palette (`Ctrl/⌘ + Shift + P`)
2. Run: `Preferences: Open User Settings (JSON)`
3. Add layout settings:

```json
{
  // Your current layout values here
  "workbench.panel.defaultLocation": "bottom",
  "workbench.sideBar.location": "left",
  "cursor.chat.panelSize": 400,
  "cursor.composer.panelSize": 500,
  "workbench.activityBar.orientation": "horizontal"
}
```

4. Save the file
5. Settings apply to all workspaces

### Method 2: Workspace Settings (Project-Specific)

1. Open Command Palette (`Ctrl/⌘ + Shift + P`)
2. Run: `Preferences: Open Workspace Settings (JSON)`
3. Add layout settings to workspace file
4. Settings apply only to this workspace

### Method 3: Workspace File

Edit `CF-bluehand_webPage.code-workspace`:

```json
{
  "folders": [...],
  "settings": {
    // Layout settings
    "workbench.panel.defaultLocation": "bottom",
    "workbench.sideBar.location": "left",
    "cursor.chat.panelSize": 400,
    "cursor.composer.panelSize": 500,
    "workbench.activityBar.orientation": "horizontal"
  }
}
```

---

## Current Layout Detection Script

Create a script to detect current layout (if accessible via API):

```javascript
// This would need to be run in Cursor's developer console
// or via extension API

const layout = {
  panelLocation: vscode.workspace.getConfiguration('workbench.panel').get('defaultLocation'),
  sidebarLocation: vscode.workspace.getConfiguration('workbench.sideBar').get('location'),
  activityBarOrientation: vscode.workspace.getConfiguration('workbench.activityBar').get('orientation'),
  chatPanelSize: vscode.workspace.getConfiguration('cursor.chat').get('panelSize'),
  composerPanelSize: vscode.workspace.getConfiguration('cursor.composer').get('panelSize')
}

console.log(JSON.stringify(layout, null, 2))
```

---

## Recommended Layout Settings

Based on typical Cursor usage:

```json
{
  // Panel configuration
  "workbench.panel.defaultLocation": "bottom",
  "workbench.panel.opensMaximized": "never",
  
  // Sidebar
  "workbench.sideBar.location": "left",
  "workbench.sideBar.visible": true,
  
  // Activity bar (Cursor default is horizontal)
  "workbench.activityBar.orientation": "horizontal",
  "workbench.activityBar.visible": true,
  
  // Editor
  "workbench.editor.splitInGroupLayout": "vertical",
  "workbench.editor.enablePreview": true,
  "workbench.editor.showTabs": true,
  
  // Terminal
  "terminal.integrated.defaultLocation": "panel",
  
  // Cursor-specific (if available)
  "cursor.chat.panelSize": 400,
  "cursor.composer.panelSize": 500,
  "cursor.chat.autoScroll": true,
  "cursor.chat.showHistory": true
}
```

---

## Manual Layout Capture

### Step-by-Step Process

1. **Measure Current Layout**:
   - Note panel widths/heights
   - Check sidebar width
   - Observe activity bar position

2. **Open Settings JSON**:
   - `Ctrl/⌘ + Shift + P` → `Preferences: Open User Settings (JSON)`

3. **Add Settings**:
   - Copy recommended settings above
   - Adjust values to match your current layout

4. **Save and Test**:
   - Save settings
   - Restart Cursor
   - Verify layout matches

---

## Layout Persistence

### Settings Storage Location

**macOS**:
```
~/Library/Application Support/Cursor/User/settings.json
```

**Windows**:
```
%APPDATA%\Cursor\User\settings.json
```

**Linux**:
```
~/.config/Cursor/User/settings.json
```

### Workspace Settings

Workspace settings are stored in:
```
.cursor/settings.json (if exists)
or
.code-workspace file
```

---

## Troubleshooting

### Layout Resets After Update

1. Check settings file still exists
2. Verify settings syntax is valid JSON
3. Check for conflicting workspace settings
4. Update Cursor to latest version

### Settings Not Applying

1. Check JSON syntax (no trailing commas)
2. Verify setting names are correct
3. Restart Cursor IDE
4. Check for user vs workspace conflicts

### Can't Find Layout Settings

1. Some layout settings may be UI-only
2. Check Cursor-specific settings in preferences
3. Use Command Palette to search settings
4. Check Cursor documentation for layout API

---

## Next Steps

1. **Capture Current Layout**: Note your current panel sizes and positions
2. **Add to Settings**: Add layout settings to user or workspace settings
3. **Test**: Restart Cursor and verify layout persists
4. **Document**: Note any custom values in this file

---

## References

- **Cursor Settings**: https://cursordocs.com/en/docs/settings/ide/overview
- **VS Code Settings**: https://code.visualstudio.com/docs/getstarted/settings
- **Workspace Settings**: `.code-workspace` file format

---

**To apply your current layout, add the settings to your user settings JSON file.**

