# 🎮 VoxelCrime World

> Open-world voxel game mixing Minecraft's building, GTA's action, and Ananta's features.

![VoxelCrime World](https://via.placeholder.com/800x400/1a1a2e/ffd93d?text=VoxelCrime+World)

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## 🎮 Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Space | Jump |
| Shift | Sprint |
| Mouse | Look |
| Left Click | Attack / Break block |
| Right Click | Place block |
| F | Enter/Exit vehicle |
| B | Toggle build mode |
| K | Open shop |
| M | View missions |
| 1-5 | Select weapon |
| ESC | Unlock mouse |

## 🔥 Features

| Feature | Status |
|---------|--------|
| Voxel world + procedural city | ✅ |
| Player movement (WASD, Jump, Sprint) | ✅ |
| Block breaking/placing system | ✅ |
| Day/night cycle + stars | ✅ |
| 5 vehicle types | ✅ |
| Combat + wanted level (1-5 stars) | ✅ |
| 6 missions with rewards | ✅ |
| Black Market shop | ✅ |
| Audio system | ✅ |
| Supabase Auth + Database | ✅ |
| Cloud saves | ✅ |

## 🛠️ Tech Stack

- **Three.js** - 3D rendering
- **Vite** - Build tool
- **Supabase** - Auth + Database
- **GitHub Actions** - Auto-deploy

## 🔗 Live Game

**https://20eq.github.io/voxel-crime-world**

## 📁 Project Structure

```
voxel-crime-world/
├── src/
│   ├── main.js              # Game entry
│   ├── supabase/config.js   # Supabase setup
│   ├── world/               # Voxel world system
│   ├── vehicles/            # Vehicle system
│   ├── combat/              # Combat system
│   ├── missions/            # Mission system
│   ├── ui/                  # UI components
│   └── audio/               # Audio system
├── package.json
└── vite.config.js
```

---

*Built with ❤️*