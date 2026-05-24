# 🎮 VoxelCrime World - Complete Edition

> Open-world voxel game mixing Minecraft's building, GTA's action, and Ananta's features. Now with **Supabase** (open-source Firebase alternative)!

![VoxelCrime World](https://via.placeholder.com/800x400/1a1a2e/ffd93d?text=VoxelCrime+World)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Space | Jump |
| Shift | Sprint |
| Mouse | Look |
| Left Click | Attack / Break block |
| Right Click | Place block |
| E | Interact |
| F | Enter/Exit vehicle |
| B | Toggle build mode |
| K | Open shop |
| M | View missions |
| 1-5 | Select hotbar item |
| ESC | Unlock mouse |

## 🔥 Features

| Feature | Status |
|---------|--------|
| Voxel world + procedural city | ✅ |
| Player movement (WASD, Jump, Sprint) | ✅ |
| Block breaking/placing system | ✅ |
| Day/night cycle + stars | ✅ |
| 5 vehicle types (Sedan, Sports, SUV, Motorcycle, Helicopter) | ✅ |
| Combat + wanted level (1-5 stars) | ✅ |
| 6 missions with rewards | ✅ |
| Black Market shop | ✅ |
| Audio system (footsteps, gunshots, engine) | ✅ |
| **Supabase Auth + Database** | ✅ |

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Three.js | 3D WebGL rendering |
| Vite | Fast dev server & build |
| **Supabase** | Auth + Database (Firebase alternative) |
| GitHub Actions | Auto-deploy to GitHub Pages |

## 📁 Project Structure

```
voxel-crime-world/
├── src/
│   ├── main.js              # Game entry & systems
│   ├── supabase/
│   │   └── config.js        # Supabase setup
│   ├── world/
│   │   ├── World.js, Chunk.js, Generator.js
│   │   ├── BuildingSystem.js
│   │   └── DayNightCycle.js
│   ├── vehicles/VehicleManager.js
│   ├── combat/CombatSystem.js
│   ├── missions/MissionSystem.js
│   ├── ui/HUD.js, ShopSystem.js, Auth.js
│   └── audio/AudioManager.js
├── SUPABASE_SETUP.md        # Database setup guide
├── package.json
└── vite.config.js
```

## 🔧 Supabase Setup

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get your **Project URL** and **anon key**
4. Update `src/supabase/config.js` with your keys
5. Run the SQL from `SUPABASE_SETUP.md` in your dashboard
6. Enable Google Auth in Supabase dashboard
7. Commit & push - auto-deploys!

### Supabase Benefits (vs Firebase):
- ✅ Open source (no vendor lock-in)
- ✅ 500MB free database
- ✅ 50,000 monthly active users
- ✅ SQL-based (more powerful)
- ✅ Real-time subscriptions
- ✅ Self-hostable option

## 📜 License

MIT License - Built with ❤️ for gamers everywhere