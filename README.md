# 🌍 My Travel Atlas

> ✨ An elegant 3D interactive travel journal that visualizes my global adventures on an interactive globe

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Website-blue?style=for-the-badge)](https://my-travel-atlas.vercel.app/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📸 Preview

**Live Site**: [https://my-travel-atlas.vercel.app/](https://my-travel-atlas.vercel.app/)

### 🌟 Key Features
- 🌏 **3D Globe Visualization** - Powered by react-globe.gl for a realistic Earth experience
- 📖 **Travel Diary Capsules** - Document stories, moods, and photos from each journey
- 🎨 **Dual Theme Toggle** - Dark mode (starry night) / Light mode (sky blue)
- 📊 **Smart Statistics** - Auto-calculate trips, cities, countries, and total distance
- 🔍 **Semantic Search** - Bilingual search support (Chinese/English) for cities and mood tags
- ⏯️ **Auto-Play Mode** - Timeline auto-play with 2-second intervals
- 🌐 **Bilingual Support** - Switch between Chinese and English instantly
- 🎭 **Smooth Animations** - Framer Motion-powered transitions

---

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run dev
```
Visit `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🎮 How to Use

### 📖 View Travel Diaries (3 Ways)

#### Method 1: Click City Name in Bottom Bar ⭐ Recommended
- **Click the city name** in the bottom control bar
- Hover effect with highlighting and 📖 icon indicator
- Most intuitive and user-friendly!

#### Method 2: Double-Click Timeline
- **Single click**: Switch to that city
- **Double click**: Open the diary entry
- Current city has highlighted background

#### Method 3: Click Globe Markers
- Click the glowing markers on the 3D Earth
- Multiple visits to the same location show a selection list

### 🔧 Other Features

| Feature | Action | Description |
|---------|--------|-------------|
| 🔍 **Search** | Click top search bar | Search by city name or mood tags |
| ⏮️ ⏭️ **Navigate** | Bottom ← → buttons | Switch between previous/next cities |
| 🌓 **Theme** | Click ☀️/🌙 icon | Toggle day/night theme |
| 📊 **Statistics** | Click 📊 icon | View travel statistics |
| ▶️ **Auto-Play** | Click ▶️ icon | Auto-cycle through cities every 2s |
| 🌐 **Language** | Click 中/EN button | Switch interface language |

---

## 🗂️ Project Structure

```
my-travel-atlas/
├── src/
│   ├── components/
│   │   └── Atlas.jsx          # Main component (3D globe + interactions)
│   ├── assets/                # Static assets
│   ├── App.jsx                # App entry point
│   ├── main.jsx               # React mount point
│   └── index.css              # Global styles
├── public/                    # Public resources
├── FEATURES.md                # Detailed feature documentation
├── USAGE_GUIDE.md             # User guide (adding photos, etc.)
├── INTERACTION_GUIDE.md       # Interaction guide
├── DESIGN_IMPROVEMENTS.md     # Design improvements documentation
├── package.json
└── vite.config.js
```

---

## 🛠️ Tech Stack

### Core Framework
- **React 19.2.0** - UI framework
- **Vite 7.2.5** - Build tool (using rolldown)
- **react-globe.gl 2.37.0** - 3D globe visualization
- **framer-motion 12.23.24** - Animation library

### Visualization Engine
- **Three.js 0.181.2** - WebGL 3D rendering
- **d3-geo** - Geographic projection calculations

---

## ✨ Feature Highlights

### 🎨 Premium UI Design
- **Search Bar**: Inspired by Apple/iOS design with glassmorphism + focus lift animation
- **Timeline**: Double-click interaction + current city highlighting
- **Bottom Control Bar**: Three-tier info architecture (flag + country + city)
- **Diary Modal**: Photo gallery + AI tags + mood colors

### 📊 Smart Statistics System
- **Total Trips**: 12 global adventures
- **Unique Cities**: Deduplicated count of cities visited
- **Countries**: Coverage across 4 countries (🇨🇳 China, 🇹🇭 Thailand, 🇺🇸 USA, 🇨🇦 Canada)
- **Total Distance**: Calculated using Haversine formula for great-circle distance

### 🌈 Visual Optimizations
- **Thin Line Design**: Arc stroke optimized from 2.0 to 0.5 for elegance
- **Dynamic Coloring**: Current city in white, others in mood colors
- **Pulse Rings**: Breathing light animation around markers
- **Atmospheric Effect**: Glowing halo around Earth

---

## 📝 Customize Your Travel Data

### Add a New City
Edit the `TRAVEL_DATA` array in `src/components/Atlas.jsx`:

```javascript
{
  id: 12,                                    // Unique ID
  lat: 48.8566,                              // Latitude
  lng: 2.3522,                               // Longitude
  date: "2025.06",                           // Date
  city: { zh: "巴黎", en: "Paris" },         // City name (bilingual)
  country: { 
    zh: "法国", 
    en: "France", 
    code: "🇫🇷" 
  },                                         // Country info
  description: { 
    zh: "艾菲尔铁塔下的浪漫...", 
    en: "Romance under Eiffel Tower..." 
  },                                         // Travel description
  aiTags: ["Romance", "Art", "Culture"],     // AI tags
  moodColor: "#ff6b6b",                      // Mood color
  photos: [                                   // Photos (optional)
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ]
}
```

### Add Photos
See [`USAGE_GUIDE.md`](./USAGE_GUIDE.md) for details

---

## 🎯 Roadmap

- [ ] **Data Management Optimization**
  - Extract TRAVEL_DATA to separate JSON file
  - Support loading data from backend API

- [ ] **Performance Optimization**
  - Add search debouncing
  - Optimize Globe rendering performance
  - Add image lazy loading

- [ ] **User Experience Improvements**
  - Responsive design (mobile/tablet adaptation)
  - Keyboard shortcuts (← → Space Esc)
  - Touch gesture support

- [ ] **Code Quality Improvements**
  - Component splitting (SearchBar, Timeline, StatsPanel, etc.)
  - Migrate to TypeScript
  - Add unit tests

- [ ] **New Features**
  - Export travel route images
  - Share to social media
  - Travel statistics charts (line charts, heatmaps)

---

## 📄 Documentation

- [FEATURES.md](./FEATURES.md) - Detailed feature documentation
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - User guide (adding photos, etc.)
- [INTERACTION_GUIDE.md](./INTERACTION_GUIDE.md) - Interaction guide
- [DESIGN_IMPROVEMENTS.md](./DESIGN_IMPROVEMENTS.md) - Design improvements

---

## 🌟 Design Inspiration

This project draws inspiration from:
- **Apple** - Glassmorphism effects, refined shadow systems
- **iOS** - Smooth animations, intuitive interactions
- **Google Earth** - 3D globe visualization
- **Dribbble / Behance** - Modern design principles

---

## 📦 Deployment

### Vercel Deployment (Recommended)
1. Fork this repository
2. Import project on [Vercel](https://vercel.com)
3. Auto-detect Vite configuration and deploy
4. Access your custom domain ✨

### Other Deployment Options
- **Netlify**: Supports automatic builds
- **GitHub Pages**: Requires base path configuration
- **Self-hosted**: Deploy `dist` directory after `npm run build`

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

## 📜 License

MIT License - Free to use with attribution

---

## 👨‍💻 Author

**Lucy Sun** - Global Travel Enthusiast 🌏

- Website: [https://my-travel-atlas.vercel.app/](https://my-travel-atlas.vercel.app/)
- GitHub: [@ooodddee](https://github.com/ooodddee)

---

<div align="center">

### ⭐ If this project helps you, please give it a Star!

**Documenting life through code, witnessing journeys through the globe** 🌍✨

Made with ❤️ and React

</div>
