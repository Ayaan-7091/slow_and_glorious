# 🛺 3D Auto-Rickshaw Arcade Prototype (Level 1)

A clean, beginner-friendly Level 1 prototype of an Indian Auto-Rickshaw (Tuk-Tuk) 3D arcade driving game built with **Vite** and **vanilla Three.js** (pure WebGL primitives, zero external 3D model files, and zero external physics libraries).

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
   Open the printed URL (typically `http://localhost:5173`) in your web browser.

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
| **SPACEBAR** | Power Drift (Slips wide & emits sparks) |
| **R** | Reset / Respawn Rickshaw & Cones |

### 📱 Mobile & Touch Devices
- **Bottom-Left:** `◀` and `▶` buttons for steering.
- **Bottom-Right:** `GAS` (accelerate), `BRAKE` (brake/reverse), and `DRIFT` (hold to slide).
- Supports full multi-touch so you can hold Gas while steering and drifting simultaneously.

---

## 🏗️ Architecture & Beginner-Friendly Code Tour

```
├── index.html              # Fullscreen canvas, HUD (speedometer, gear, drift badge), and touch overlay
├── style.css               # Warm sunset glassmorphism UI & responsive touch buttons
├── package.json            # Vite + Three.js scripts
└── src/
    ├── main.js             # Main game loop, scene/lighting, physics, camera chase, & HUD updates
    ├── createRickshaw.js   # Procedural auto-rickshaw group (3 wheels, yellow chassis, canopy, handlebar, blob shadow)
    ├── createCones.js      # 20 colorful slalom & track traffic cones with arcade bounce physics
    ├── particles.js        # Spark particle system emitted from rear wheels during drifts
    └── controls.js         # Unified input manager handling keyboard + mobile pointer events
```

### 1. Scene, Sunset Lighting & Blob Shadow
- **Warm Sunset Sky & Fog:** `THREE.Scene.background` with matching exponential distance fog (`THREE.FogExp2`) to blend the horizon into a golden-hour dusk.
- **Directional Sunlight:** Warm angled sun (`#ffb066`) casting soft real-time shadows (`THREE.PCFSoftShadowMap`).
- **Ground & Grid:** Large dark asphalt ground with a colorful `THREE.GridHelper` in sunset orange to give immediate visual speed and trajectory feedback.
- **Blob Shadow:** A custom radial gradient oval pinned directly under the rickshaw chassis at `y = 0.02` to give solid visual grounding without performance hitches.

### 2. Procedural Indian Auto-Rickshaw (`createRickshaw.js`)
Modeled entirely from Three.js primitives (`BoxGeometry`, `CylinderGeometry`, `PlaneGeometry`):
- **Iconic Yellow & Green Livery:** Yellow body panels (`#f5b000`) and emerald green lower trim (`#0c6833`).
- **Black Curved Canopy Roof:** Supported by 6 slender metal pillars with a curved crown.
- **Transparent Glass Windshield:** Semi-transparent blue-tinted windshield with single wiper.
- **Interior Details:** Driver bench, passenger cabin bench, steering column, handlebars with rubber grips, and the classic right-side fare meter.
- **3 Dynamic Wheels:**
  - Front wheel inside a steerable fork assembly that pivots with user steering.
  - Left & Right rear wheels positioned under the passenger chassis.
  - All 3 wheels visually spin around their axle based on linear driving speed.

### 3. Arcade Driving & 3-Wheel Tilt Dynamics
- **Motion Integration:** Delta-time (`dt`) based forward/reverse velocity, acceleration, braking, and natural rolling friction.
- **Steering only when moving:** Turns proportional to current speed (and reverses steering logic naturally when backing up).
- **Power Drift Mechanic:** When pressing **Spacebar** or holding **Drift**, tire grip loosens, lateral slip velocity builds up, turn rate increases, and fiery yellow/orange square spark particles shower backwards from both rear wheels.
- **Dynamic 3-Wheeler Tilt:**
  - **Chassis Roll (`rotation.z`):** Outward centrifugal lean when cornering at speed, simulating the characteristic high-center-of-gravity feel of a 3-wheeler.
  - **Chassis Pitch (`rotation.x`):** Nose squats during acceleration and dips forward under hard braking.
  - **Subtle Road Wobble:** High-speed vibration for visceral feedback.

### 4. Smooth Chase Camera
- Positioned behind the vehicle using trigonometric heading vectors (`sin(heading)`, `cos(heading)`).
- **Speed Pull-back:** As velocity increases, the camera dynamically pulls back further and slightly higher to enhance the sensation of speed.
- **Frame-rate independent lerp:** Camera position and look-at targets smoothly interpolate towards target positions using exponential damping (`1 - Math.exp(-k * dt)`).

