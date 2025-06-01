# Blog Post Drag System

This repository now includes a fully interactive drag system for blog posts, mimicking the macOS window behavior.

## Features

### 🎯 Interactive Controls
- **Drag and Drop**: Click and drag the title bar to move blog posts around the screen
- **macOS-style Controls**: 
  - 🔴 Red button: Close window (with smooth animation)
  - 🟡 Yellow button: Minimize/restore window
  - 🟢 Green button: Maximize/restore window
- **Double-click**: Double-click the title bar to toggle maximize/restore
- **Smart Constraints**: Blog posts stay within the browser window boundaries

### ⌨️ Keyboard Shortcuts
- `Cmd/Ctrl + W`: Close window
- `Cmd/Ctrl + M`: Minimize/restore
- `Cmd/Ctrl + Enter`: Maximize/restore

### 📱 Mobile Support
- Touch events for drag functionality
- Responsive design for different screen sizes
- Optimized touch targets

## Technical Implementation

### Files
- `blog-drag.js` - Main drag system implementation
- `blog.html` - Demo page with draggable blog post
- `index.html` - Main page with basic drag functionality
- `styles.css` - Enhanced with drag-specific styles

### Key Features
- **Class-based Architecture**: Modular and maintainable code
- **Event Handling**: Supports both mouse and touch events
- **Visual Feedback**: Smooth animations and hover effects
- **Performance Optimized**: Uses CSS transforms and will-change properties
- **Accessibility**: Keyboard shortcuts and proper event handling

### Browser Compatibility
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Usage

### Basic Setup
1. Include the CSS and JavaScript files in your HTML:
```html
<link rel="stylesheet" href="./styles.css">
<script src="./blog-drag.js"></script>
```

2. Ensure your HTML has the correct structure:
```html
<div class="blog-post">
    <div class="macos-title-bar">
        <div class="macos-controls">
            <div class="macos-control close"></div>
            <div class="macos-control minimize"></div>
            <div class="macos-control maximize"></div>
        </div>
        <div class="macos-title">Your Title</div>
    </div>
    <div class="blog-post-content">
        <!-- Your content here -->
    </div>
</div>
```

### Utility Functions
The system exposes several utility functions via `window.blogDragSystem`:

```javascript
// Center the blog post
blogDragSystem.centerPost();

// Reset to original position
blogDragSystem.resetPosition();

// Access system state
console.log(blogDragSystem.isMinimized);
console.log(blogDragSystem.isMaximized);
```

## Demo

Visit `blog.html` for a comprehensive demo of all features, or `index.html` for a basic implementation.

## Customization

### CSS Variables
You can customize the appearance by modifying the CSS:

```css
.macos-control.close { background-color: #ff5f57; }
.macos-control.minimize { background-color: #ffbd2e; }
.macos-control.maximize { background-color: #28ca42; }
```

### JavaScript Configuration
The drag system can be extended by modifying the `BlogDragSystem` class:

```javascript
// Custom initialization
const customDragSystem = new BlogDragSystem();
customDragSystem.centerPost(); // Start centered
```

## Performance Notes

- The system uses `position: absolute` for optimal drag performance
- CSS `will-change` properties are applied for smooth animations
- Event listeners are properly managed to prevent memory leaks
- Touch events use `passive: false` only when necessary

## Browser DevTools

Open the browser console to see helpful debug information and available utility functions when the system loads. 