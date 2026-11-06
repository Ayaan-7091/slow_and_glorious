# 🛺 Tuk-Tuk Runner - 3D Indian Street Circuit (Sprint 2)

An arcade 3D time-trial racing game prototype featuring an authentic Indian Auto-Rickshaw, built with **Vite** and **vanilla Three.js** (zero external physics engines and zero external 3D model files).

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
| **W** or **↑ Up Arrow** | Accelerate (Gas) |
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

## 🏁 New Sprint 2 Upgrades

### 1. Closed-Loop Indian Street Circuit (`src/createTrack.js`)
- **Procedural Ribbon Geometry:** Uses `THREE.CatmullRomCurve3` to generate a 14m wide asphalt racing circuit with 5-6 corners (sweepers, technical chicanes, hairpins, and a main straight).
- **Curbstones & Barriers:** Alternating red-and-white arcade curbstones on inner/outer edges with safety guardrail posts.
- **Roadside Indian Props:**
  - Colorful roadside **Chai Stalls ("Tapri")** with corrugated roofs, kettle, benches, and warm glowing lanterns.
  - Stylized low-poly **Palm Trees**, **Banyan Trees**, and vintage **Streetlamps**.
- **Hazard Cones with Dynamic Airborne Physics:** Cones placed on corner apexes; when struck, they fly high into the air with spinning angular momentum and bounce back down.
- **Track Boundary Collision:** Bounces the rickshaw back onto the track and reduces speed when scraping barriers.

### 2. Checkpoints & Lap Timing System
- **Gates:** 1 Grand Festive Indian Start/Finish Arch + 4 glowing cyan semi-transparent checkpoint gates.
- **Anti-Cheat Sequential Order:** Tracks gate progression sequentially (Gate 0 -> 1 -> 2 -> 3 -> 4 -> 0).
- **Dark-Glass HUD Widget:**
  - `LAP: 1 / 3`
  - `TIME: MM:SS.SS`
  - `BEST: MM:SS.SS` (persisted in browser `localStorage`).
- **Checkpoint Respawn:** Pressing `R` or tapping `Respawn` resets the rickshaw to the last passed checkpoint, facing forward along the track spline with zero speed.

### 3. Drift-to-Boost ("Garam Chai Nitro") Mechanic
- **Drift Charging:** Holding a drift around corners charges the Garam Chai Nitro meter up to 100%.
- **Nitro Boost Activation:** Pressing **Shift** (or the mobile **⚡ NITRO** button) consumes nitro to:
  - Increase top speed from 25 km/h to 38 km/h.
  - Add +24 acceleration boost.
  - Emit bright cyan/electric blue exhaust flame particles (`src/particles.js`).
  - Dynamically widen the camera FOV from 55° to 72° using smooth `lerp` for high-speed sensation.

### 4. Synthesized Web Audio API (`src/audio.js`)
*Zero external MP3s or WAV files needed!* Real-time synthesis:
- **2-Stroke Engine Hum:** Sawtooth oscillator + low-pass filter dynamically pitch-shifting with speed and throttle.
- **Iconic Double-Beep Horn:** Dual-tone (440Hz + 554Hz major 3rd) rapid-fire beep ("PEEP-PEEP!").
- **Checkpoint & Lap Chimes:** Sparkling ascending musical arpeggios on gate pass and lap completion.
- **Nitro Boost Ignition:** Ascending whoosh and combustion roar.
- **Impact Sounds:** Hollow plastic impact for traffic cones and metallic crunch for barriers.
- **Mute Toggle:** Click the top-right button or press `M`.
