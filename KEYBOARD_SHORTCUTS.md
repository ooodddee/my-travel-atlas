# ⌨️ Keyboard Shortcuts Guide

> Desktop-only feature for enhanced productivity

## 🧭 Navigation

| Shortcut | Description |
|----------|-------------|
| `←` or `H` | Previous city |
| `→` or `L` | Next city |
| `↑` or `K` | First city |
| `↓` or `J` | Last city |

## 📝 Actions

| Shortcut | Description |
|----------|-------------|
| `Space` or `Enter` | Open travel diary for current city |
| `Esc` | Close all modals (diary, keyboard help) |
| `/` | Focus search box |

## 🔄 Toggle Features

| Shortcut | Description |
|----------|-------------|
| `S` | Toggle statistics panel |
| `T` | Toggle theme (dark/light) |
| `P` | Toggle auto-play mode |
| `E` | Switch language (中文/English) |

## ❓ Help

| Shortcut | Description |
|----------|-------------|
| `?` | Show/hide keyboard shortcuts panel |

## 💡 Tips

- **Vim-style navigation**: Support for Vim users with `H` `J` `K` `L` keys
- **Input field aware**: Keyboard shortcuts are automatically disabled when typing in search box
- **Visual feedback**: Active shortcuts show hover effects and animations
- **Desktop only**: Optimized for desktop experience (hidden on mobile/tablet)

## 🎨 Design Features

- **Glassmorphism style**: Semi-transparent panel with backdrop blur
- **Theme-aware**: Automatically adapts to dark/light theme
- **Organized categories**: Navigation, Actions, Toggle, Help
- **Visual key indicators**: Styled `<kbd>` elements for better readability
- **Smooth animations**: Fade in/out with scale transition using Framer Motion

## 🚀 Usage Example

1. Press `?` to open the keyboard shortcuts panel
2. Use `←` or `→` to navigate between cities
3. Press `Space` to open the diary
4. Press `S` to check statistics
5. Press `T` to switch themes
6. Press `Esc` to close modals

## 📱 Platform Support

- ✅ Desktop (Windows, macOS, Linux)
- ❌ Mobile (touch-based interaction recommended)
- ❌ Tablet (touch-based interaction recommended)

## 🔧 Implementation Details

### Event Handler
```javascript
useEffect(() => {
  const handleKeyPress = (e) => {
    // Ignore shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
      case 'ArrowLeft':
      case 'h':
        // Navigate to previous city
        break;
      // ... other cases
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [timelineIdx, /* other dependencies */]);
```

### UI Component
- Located at fixed position (right side, vertically centered)
- Responsive to window size changes
- Scrollable content for smaller screens
- Click outside to close (via state management)

## 🎯 Accessibility

- Clear visual indicators for each shortcut
- Logical grouping by functionality
- Consistent with common keyboard shortcut conventions
- Easy to discover via `?` key or UI button

---

**Author**: Lucy Sun - Global Travel Enthusiast  
**Project**: My Travel Atlas  
**Live Site**: https://my-travel-atlas.vercel.app/
