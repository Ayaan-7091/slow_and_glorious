# 🛺 Tuk-Tuk Runner - Indian Bazaar Street Circuit (Sprint 4)

An authentic 3D arcade time-trial & rival racing game featuring an iconic Indian Auto-Rickshaw, built with **Vite** and **vanilla Three.js** (zero external physics libraries and zero external 3D model files).

---

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local dev server:**
   ```bash
   npm run dev
   ```
   Open the printed URL (typically `http://localhost:5173`) in your browser.

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🎮 Controls

### 💻 Desktop (Keyboard)
| Key | Action |
| :--- | :--- |
| **W** or **↑ Up Arrow** | Accelerate (Gas / Rev engine) |
| **S** or **↓ Down Arrow** | Brake / Reverse |
| **A** / **D** or **←** / **→** | Steer Left / Right |
| **SPACEBAR** | Power Drift (Slips wide & **charges the Nitro Boost Meter**) |
| **SHIFT** | ☕ **Garam Chai Nitro Boost** (Burst of top speed + FOV zoom + cyan exhaust flames) |
| **H** | 📯 **Double-Beep Horn** (Synthesized dual-tone Indian auto horn) |
| **R** | ↺ **Respawn** (Resets to the last passed checkpoint facing along the track) |
| **M** | 🔊 **Toggle Mute / Unmute** |

### 📱 Mobile & Touch Devices
- **Bottom-Left:**
  - `◀` and `▶` buttons for steering.
  - `📯 HORN` button.
- **Bottom-Right:**
  - `GAS` (accelerate) & `BRAKE` (brake/reverse).
  - `DRIFT` (hold to slide around corners and charge nitro).
  - `⚡ NITRO` (activate Garam Chai Nitro Boost).
- Full multi-touch support: hold Gas + Nitro while steering and tapping Horn or Drift.

---

## 🕌 What's New in Sprint 4: Indian Bazaar Overhaul

### 1. Daylight Atmosphere, Sky Dome & Dusty Terrain (`src/createEnvironment.js`)
- **Procedural Sky Dome:** Custom shader gradient transitioning from rich cerulean blue at the zenith down to warm golden-peach at the horizon.
- **Glowing Sun Disc:** Bright afternoon sun with a golden corona.
- **18 Low-Poly Puffy Clouds:** Soft 3D clouds drifting slowly across the sky.
- **Warm Indian Earth:** Replaced the black grid with warm sandy-ochre dusty earth (`#d4a373`) and lush green patches (`#6a994e`).
- **Crisp Medium-Gray Asphalt:** Textured road (`#3a3d45`) with razor-sharp white boundary lines and concrete curbstones.

### 2. Dense Indian Bazaar Streetscape (`src/createBazaar.js`)
- **36+ Multi-Story Indian Shop-Houses:** Handcrafted in Jaipur pink, turmeric yellow, terracotta, pastel blue, and mint green with balconies, parapets, and rooftop water tanks.
- **Procedural Hindi/English Signboards (`CanvasTexture`):**
  - "GARAM CHAI ☕ / ताजा कड़क चाय"
  - "ROYAL SWEETS 🪔 / शुद्ध देशी घी मिठाई"
  - "RAJU AUTO GARAGE 🔧 / ऑटो रिपेयर & स्पेयर"
  - "BOLLYWOOD CINEMA 🎬 / सुपरहिट शो चालू है"
  - "LASSI CORNER 🥛 / मलाई मार के लस्सी"
  - "DELHI CHAT BHANDAR 🌶️ / तीखी गोलगप्पे & टिक्की"
  - "BOMBAY SPICE MARKET 🍛 / खड़े मसाले"
- **Storefront Fabric Awnings:** Striped fabric awnings over entrance doors.
- **Overhead Festive Bunting & Fairy Lights:** Colorful triangular flags and glowing fairy light bulbs strung between wooden utility poles across the track at 4 scenic locations.
- **Roadside Props:** Handcrafted wooden fruit carts with mounds of fresh mangoes, and painted concrete National Highway milestones ("NH-48").

### 3. Pre-Race Difficulty Selector Modal
Choose your racing challenge before lights out (and re-selectable anytime via the HUD or post-race modal):
- **EASY (Galli Cruiser):** Relaxed pace; AI top speed capped at 85% of player speed. Great for practicing drifts.
- **MEDIUM (Bazaar Racer):** Competitive pace; AI matches player top speed (~92 km/h) with strategic boosts and lane-weaving.
- **HARD (Meter Down Pro):** Fast & aggressive! AI hits 115% top speed (~104 km/h), takes tight inside lines, and uses frequent Nitro boosts with active rubber-banding to overtake!

### 4. High-Speed Competitive AI Rivals (`src/createRivals.js`)
- **Real-World Acceleration Math:** Fixed acceleration math so AI rickshaws promptly accelerate up to full speed (75-100+ km/h) matching and challenging the player.
- **AI Nitro Flame Exhaust:** Rivals emit glowing cyan exhaust flames when triggering their nitro boost bursts.
- **Dynamic Arcade Rubber-Banding:** Keeps the pack tight, challenging, and thrilling all 3 laps!
