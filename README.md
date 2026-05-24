# 🎮 VoxelCrime World - Complete Edition

> Open-world voxel game mixing Minecraft's building, GTA's action, and Ananta's features. Now with Firebase integration!

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

## 🔥 Features (All Phases Complete!)

### Phase 1: Foundation ✅
- Voxel world with chunk-based rendering
- Procedural city generation
- Player movement & camera controls
- HUD with health, minimap, hotbar

### Phase 2: World & Building ✅
- Block breaking (left click in break mode)
- Block placing (right click in place mode)
- Day/night cycle with dynamic lighting
- Stars at night
- Building materials (9 block types)

### Phase 3: Vehicles ✅
- 5 vehicle types (Sedan, Sports, SUV, Motorcycle, Helicopter)
- Driving physics
- Enter/exit vehicles (F key)
- Engine sounds

### Phase 4: Combat & Wanted System ✅
- 4 weapons (Fists, Pistol, Shotgun, Rifle)
- NPC cops and civilians
- Wanted level system (1-5 stars)
- Police pursuit AI

### Phase 5: Missions & Economy ✅
- 6 missions (Explore, Race, Heist, Survival, Delivery, Collection)
- Cash rewards
- XP & leveling system
- Black market shop

### Phase 6: Polish ✅
- Audio system (footsteps, gunshots, engine sounds)
- Particle effects
- Performance optimization

### Firebase Integration 🔥
- Google Sign-in
- Player data persistence
- Cash & inventory saved
- Leaderboards ready
- Multiplayer sync ready

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Three.js | 3D WebGL rendering |
| Vite | Fast dev server & build |
| Firebase Auth | User authentication |
| Firestore | Cloud database |

## 📁 Project Structure

```
voxel-crime-world/
├── src/
│   ├── main.js              # Game entry & systems
│   ├── style.css            # UI styling
│   ├── firebase/
│   │   └── config.js        # Firebase setup
│   ├── world/
│   │   ├── World.js         # World manager
│   │   ├── Chunk.js         # Voxel chunks
│   │   ├── Generator.js     # Procedural generation
│   │   ├── BuildingSystem.js # Block placing/breaking
│   │   └── DayNightCycle.js # Dynamic lighting
│   ├── player/
│   │   └── Player.js        # Player controller
│   ├── vehicles/
│   │   └── VehicleManager.js # Vehicle system
│   ├── combat/
│   │   └── CombatSystem.js  # Combat & wanted level
│   ├── missions/
│   │   └── MissionSystem.js # Mission & economy
│   ├── ui/
│   │   ├── HUD.js           # Heads-up display
│   │   ├── ShopSystem.js    # Black market shop
│   │   └── Auth.js          # Login screen
│   └── audio/
│       └── AudioManager.js  # Sound effects
└── ...
```

## 🔧 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Google sign-in)
3. Enable **Firestore Database**
4. Copy your config to `src/firebase/config.js`

## 📜 License

MIT License - Built with ❤️ for gamers everywhere