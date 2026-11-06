import * as THREE from 'three';
import { createRickshaw } from './createRickshaw.js';
import { createTrack } from './createTrack.js';
import { SparkParticleSystem, NitroFlameSystem } from './particles.js';
import { ControlsManager } from './controls.js';
import { AudioManager } from './audio.js';

/**
 * ============================================================================
 * 3D AUTO-RICKSHAW ARCADE RACER (SPRINT 2 - STREET CIRCUIT EDITION)
 * Built with Three.js & Vite
 * ============================================================================
 * 
 * Game Loop & Systems:
 *  1. Scene, Sunset Lighting, Soft Shadows, Atmospheric Fog & Grid Ground
 *  2. Synthesized Web Audio API Manager (Engine hum, double-beep horn, chimes)
 *  3. Closed-Loop Indian Street Circuit (Asphalt ribbon, curbs, barriers, chai stalls, trees)
 *  4. Procedural Auto-Rickshaw Instance (Iconic yellow/green, 3 wheels, tilt dynamics)
 *  5. Dual Particle Systems: Drift Sparks + Garam Chai Nitro Flame Exhaust
 *  6. Sequential Checkpoints & Lap Timing with Best Lap LocalStorage
 *  7. Dynamic FOV Boost & 3-Wheeler Handling Physics
 *  8. Barrier & Cone Collisions with Flying Physics
 *  9. Full Responsive HUD & Mobile Multi-Touch Overlay
 */

// ----------------------------------------------------------------------------
// 1. SCENE SETUP & SUNSET ATMOSPHERE
// ----------------------------------------------------------------------------
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Warm sunset palette
const sunsetColor = 0xf58a4b;
scene.background = new THREE.Color(sunsetColor);
scene.fog = new THREE.FogExp2(sunsetColor, 0.009); // Sunset distance haze

// Camera with dynamic FOV (widens to 72 on Nitro Boost!)
const defaultFOV = 55;
const boostFOV = 72;
const camera = new THREE.PerspectiveCamera(
  defaultFOV,
  window.innerWidth / window.innerHeight,
  0.1,
  600
);

// High-performance WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
container.appendChild(renderer.domElement);

// ----------------------------------------------------------------------------
// 2. SUNSET LIGHTING & SHADOWS
// ----------------------------------------------------------------------------
// Hemisphere ambient sky bounce
const hemiLight = new THREE.HemisphereLight(0xffdfba, 0x3d201c, 1.15);
scene.add(hemiLight);

// Angled directional sunlight casting long golden shadows
const sunLight = new THREE.DirectionalLight(0xffb066, 1.9);
sunLight.position.set(45, 45, 30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 160;
const d = 55;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0004;
scene.add(sunLight);

const sunTarget = new THREE.Object3D();
scene.add(sunTarget);
sunLight.target = sunTarget;

// ----------------------------------------------------------------------------
// 3. GROUND PLANE & VISIBLE GRID HELPER
// ----------------------------------------------------------------------------
const groundGeo = new THREE.PlaneGeometry(600, 600);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x1f2329,
  roughness: 0.95,
  metalness: 0.05,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Sunset orange / slate ground grid
const gridHelper = new THREE.GridHelper(600, 200, 0xff8c42, 0x343b45);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// ----------------------------------------------------------------------------
// 4. AUDIO SYSTEM & INPUT CONTROLS
// ----------------------------------------------------------------------------
const audio = new AudioManager();
const controls = new ControlsManager(audio);

// Bind HUD Horn button as well
const hudHornBtn = document.getElementById('btn-horn-hud');
if (hudHornBtn) {
  hudHornBtn.addEventListener('click', (e) => {
    e.preventDefault();
    audio.playHorn();
  });
}

// ----------------------------------------------------------------------------
// 5. CLOSED-LOOP INDIAN STREET CIRCUIT & PROPS
// ----------------------------------------------------------------------------
const track = createTrack(scene);

// ----------------------------------------------------------------------------
// 6. PROCEDURAL AUTO-RICKSHAW & PARTICLES
// ----------------------------------------------------------------------------
const rickshaw = createRickshaw();
scene.add(rickshaw.group);

// Headlight forward beam
const headlightBeam = new THREE.SpotLight(0xfff1cf, 2.8, 35, Math.PI / 5.5, 0.4, 1.2);
headlightBeam.position.set(0, 0.45, 1.2);
rickshaw.frontForkGroup.add(headlightBeam);

const headlightTarget = new THREE.Object3D();
headlightTarget.position.set(0, 0.1, 9.0);
rickshaw.frontForkGroup.add(headlightTarget);
headlightBeam.target = headlightTarget;

// Particle systems: Drift sparks + Nitro boost flames
const sparkSystem = new SparkParticleSystem(scene, 80);
const nitroFlameSystem = new NitroFlameSystem(scene, 60);

// ----------------------------------------------------------------------------
// 7. VEHICLE PHYSICS STATE & TUNING
// ----------------------------------------------------------------------------
// Start/Finish checkpoint
const startGate = track.checkpointGates[0];

const vehicle = {
  // World Transform
  position: startGate.position.clone(),
  heading: startGate.heading,

  // Speed & Accelerations
  speed: 0,
  baseMaxSpeed: 25.0,
  boostMaxSpeed: 38.0,
  maxSpeed: 25.0,
  maxReverseSpeed: -8.0,
  acceleration: 16.0,
  brakingDecel: 25.0,
  naturalFriction: 6.0,

  // Steering & Turning
  steerAngle: 0,
  maxSteerAngle: 0.65,
  steerResponsiveness: 6.5,
  turnRate: 2.2,

  // Drift Mechanics
  isDrifting: false,
  driftYawMultiplier: 1.75,
  lateralSlip: 0,

  // Garam Chai Nitro Boost Mechanics
  boostMeter: 0, // 0 to 100
  isBoosting: false,
  boostChargeRate: 35.0, // Charges in ~3s of continuous drifting
  boostDrainRate: 26.0, // Drains in ~4s

  // Dynamic 3-Wheeler Tilt (Chassis Lean & Pitch)
  bodyRoll: 0,
  bodyPitch: 0,
};

// Align rickshaw at starting line initially
rickshaw.group.position.copy(vehicle.position);
rickshaw.group.rotation.y = vehicle.heading;

// ----------------------------------------------------------------------------
// 8. CHECKPOINT ARCHES & LAP TIMER SYSTEM
// ----------------------------------------------------------------------------
const raceState = {
  currentLap: 1,
  totalLaps: 3,
  lapStartTime: performance.now(),
  currentLapTime: 0,
  bestLapTime: parseFloat(localStorage.getItem('tuktuk_best_lap')) || null,
  nextRequiredGateIdx: 1, // Start by crossing Gate 1 after Start Line
  lastPassedGateIdx: 0,
  isFinished: false,
};

// Format milliseconds into MM:SS.SS
function formatTime(ms) {
  if (!ms || ms === Infinity) return '--:--.--';
  const totalSec = ms / 1000;
  const mins = Math.floor(totalSec / 60);
  const secs = Math.floor(totalSec % 60);
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

// Show animated banner popup when clearing checkpoints
const checkpointBannerEl = document.getElementById('checkpoint-banner');
let bannerTimeout = null;
function showCheckpointBanner(text) {
  if (!checkpointBannerEl) return;
  checkpointBannerEl.textContent = text;
  checkpointBannerEl.classList.add('show');
  clearTimeout(bannerTimeout);
  bannerTimeout = setTimeout(() => {
    checkpointBannerEl.classList.remove('show');
  }, 1400);
}

// Respawn vehicle at the last validated checkpoint
function respawnAtLastCheckpoint() {
  const gate = track.checkpointGates[raceState.lastPassedGateIdx];
  if (!gate) return;

  vehicle.position.copy(gate.position);
  vehicle.heading = gate.heading;
  vehicle.speed = 0;
  vehicle.steerAngle = 0;
  vehicle.lateralSlip = 0;
  vehicle.bodyRoll = 0;
  vehicle.bodyPitch = 0;
  vehicle.isBoosting = false;

  rickshaw.group.position.copy(vehicle.position);
  rickshaw.group.rotation.set(0, vehicle.heading, 0);
  rickshaw.tiltGroup.rotation.set(0, 0, 0);
  rickshaw.frontForkGroup.rotation.y = 0;
}

// Check if vehicle has passed the next required gate in sequential order
function updateCheckpoints() {
  const nextGate = track.checkpointGates[raceState.nextRequiredGateIdx];
  if (!nextGate) return;

  const dist = vehicle.position.distanceTo(nextGate.position);
  if (dist < nextGate.radius + 1.2) {
    // Valid checkpoint reached!
    raceState.lastPassedGateIdx = raceState.nextRequiredGateIdx;

    if (nextGate.isStartFinish) {
      // 🏁 FINISHED A LAP!
      audio.playLapSound();

      const completedLapTime = performance.now() - raceState.lapStartTime;
      raceState.lapStartTime = performance.now();

      // Check for new best lap
      if (!raceState.bestLapTime || completedLapTime < raceState.bestLapTime) {
        raceState.bestLapTime = completedLapTime;
        localStorage.setItem('tuktuk_best_lap', completedLapTime.toString());
        showCheckpointBanner(`🔥 NEW BEST LAP: ${formatTime(completedLapTime)}!`);
      } else {
        showCheckpointBanner(`🏁 LAP ${raceState.currentLap} COMPLETE: ${formatTime(completedLapTime)}!`);
      }

      // Increment Lap
      if (raceState.currentLap < raceState.totalLaps) {
        raceState.currentLap++;
      } else {
        showCheckpointBanner(`🏆 GRAND PRIX FINISHED! Best: ${formatTime(raceState.bestLapTime)}`);
      }

      // Next gate after Start/Finish is Gate 1
      raceState.nextRequiredGateIdx = 1;
    } else {
      // Crossed intermediate checkpoint gate
      audio.playCheckpointChime();
      showCheckpointBanner(`⚡ CHECKPOINT ${nextGate.index} / 4 CLEARED!`);

      // Advance to next gate (or 0 for Start/Finish after 4)
      raceState.nextRequiredGateIdx = (raceState.nextRequiredGateIdx + 1) % track.checkpointGates.length;
    }
  }
}

// ----------------------------------------------------------------------------
// 9. HUD REFERENCES & UPDATES
// ----------------------------------------------------------------------------
const speedValueEl = document.getElementById('speed-value');
const driftBadgeEl = document.getElementById('drift-badge');
const gearValueEl = document.getElementById('gear-value');
const boostBarFillEl = document.getElementById('boost-bar-fill');
const boostPercentEl = document.getElementById('boost-percent');
const lapValueEl = document.getElementById('lap-value');
const timeValueEl = document.getElementById('time-value');
const bestValueEl = document.getElementById('best-value');
const gateValueEl = document.getElementById('gate-value');

function updateHUD() {
  // Speedometer
  if (speedValueEl) {
    const kmh = Math.round(Math.abs(vehicle.speed) * 3.6);
    speedValueEl.textContent = kmh;
  }

  // Drift Badge
  if (driftBadgeEl) {
    driftBadgeEl.classList.toggle('active', vehicle.isDrifting);
  }

  // Gear Display
  if (gearValueEl) {
    if (vehicle.isBoosting) {
      gearValueEl.textContent = 'NITRO';
      gearValueEl.style.color = '#00f0ff';
    } else if (vehicle.isDrifting) {
      gearValueEl.textContent = 'DRIFT';
      gearValueEl.style.color = '#ff9900';
    } else if (vehicle.speed > 0.5) {
      gearValueEl.textContent = 'D';
      gearValueEl.style.color = '#33dd55';
    } else if (vehicle.speed < -0.5) {
      gearValueEl.textContent = 'R';
      gearValueEl.style.color = '#ff4444';
    } else {
      gearValueEl.textContent = 'N';
      gearValueEl.style.color = '#cccccc';
    }
  }

  // Garam Chai Nitro Boost Meter
  if (boostBarFillEl && boostPercentEl) {
    const pct = Math.round(vehicle.boostMeter);
    boostBarFillEl.style.width = `${pct}%`;
    boostPercentEl.textContent = `${pct}%`;
    boostBarFillEl.classList.toggle('ready', pct >= 95);
  }

  // Lap & Timer Widget
  if (lapValueEl) {
    lapValueEl.textContent = `${raceState.currentLap} / ${raceState.totalLaps}`;
  }

  if (timeValueEl) {
    raceState.currentLapTime = performance.now() - raceState.lapStartTime;
    timeValueEl.textContent = formatTime(raceState.currentLapTime);
  }

  if (bestValueEl) {
    bestValueEl.textContent = formatTime(raceState.bestLapTime);
  }

  if (gateValueEl) {
    const nextIdx = raceState.nextRequiredGateIdx;
    gateValueEl.textContent = nextIdx === 0 ? 'FINISH' : `GATE ${nextIdx}`;
  }
}

// ----------------------------------------------------------------------------
// 10. CHASE CAMERA CONTROLLER (DYNAMIC FOV & PULL-BACK)
// ----------------------------------------------------------------------------
const cameraCurrentPos = new THREE.Vector3(0, 4, -8);
const cameraLookTarget = new THREE.Vector3(0, 1, 0);

function updateChaseCamera(dt) {
  const speedRatio = Math.min(Math.abs(vehicle.speed) / vehicle.boostMaxSpeed, 1.0);

  // Dynamic distance and height based on speed and boost
  const baseDistance = 6.4;
  const speedPullback = speedRatio * 3.4;
  const followDistance = baseDistance + speedPullback;

  const baseHeight = 3.0;
  const followHeight = baseHeight + speedRatio * 0.9;

  const forwardX = Math.sin(vehicle.heading);
  const forwardZ = Math.cos(vehicle.heading);

  const desiredCamX = vehicle.position.x - forwardX * followDistance;
  const desiredCamZ = vehicle.position.z - forwardZ * followDistance;
  const desiredCamY = vehicle.position.y + followHeight;

  // Frame-rate independent lerp
  const camLerp = 1.0 - Math.exp(-6.5 * dt);
  cameraCurrentPos.lerp(new THREE.Vector3(desiredCamX, desiredCamY, desiredCamZ), camLerp);
  camera.position.copy(cameraCurrentPos);

  // Look-at point slightly ahead of vehicle
  const desiredLookX = vehicle.position.x + forwardX * 1.8;
  const desiredLookZ = vehicle.position.z + forwardZ * 1.8;
  const desiredLookY = vehicle.position.y + 1.25;

  const lookLerp = 1.0 - Math.exp(-9.0 * dt);
  cameraLookTarget.lerp(new THREE.Vector3(desiredLookX, desiredLookY, desiredLookZ), lookLerp);
  camera.lookAt(cameraLookTarget);

  // Dynamic Camera FOV: widens during Garam Chai Nitro Boost!
  const targetFOV = vehicle.isBoosting ? boostFOV : defaultFOV;
  if (Math.abs(camera.fov - targetFOV) > 0.1) {
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 8.0 * dt);
    camera.updateProjectionMatrix();
  }

  // Update shadow light position to follow player
  sunTarget.position.set(vehicle.position.x, 0, vehicle.position.z);
  sunLight.position.set(vehicle.position.x + 45, 45, vehicle.position.z + 30);
}

// ----------------------------------------------------------------------------
// 11. MAIN ANIMATION & GAME LOOP
// ----------------------------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);

  // Check Respawn Trigger
  if (controls.consumeReset()) {
    respawnAtLastCheckpoint();
  }

  // -----------------------------------------------------------
  // A. STEERING & FRONT FORK
  // -----------------------------------------------------------
  let targetSteer = 0;
  if (controls.state.left) targetSteer += 1;
  if (controls.state.right) targetSteer -= 1;

  const steerSpeed = vehicle.steerResponsiveness * dt;
  vehicle.steerAngle = THREE.MathUtils.lerp(
    vehicle.steerAngle,
    targetSteer * vehicle.maxSteerAngle,
    steerSpeed
  );
  rickshaw.frontForkGroup.rotation.y = vehicle.steerAngle;

  // -----------------------------------------------------------
  // B. GARAM CHAI NITRO BOOST MECHANIC
  // -----------------------------------------------------------
  // Want boost when pressing Shift / mobile boost button, has meter, and moving forward
  const wantsBoost = controls.state.boost && vehicle.boostMeter > 3.0 && vehicle.speed > 0.5;

  if (wantsBoost) {
    if (!vehicle.isBoosting) {
      audio.playBoostIgnition();
    }
    vehicle.isBoosting = true;
    vehicle.maxSpeed = vehicle.boostMaxSpeed;
    // Consume boost meter
    vehicle.boostMeter = Math.max(0, vehicle.boostMeter - vehicle.boostDrainRate * dt);
  } else {
    vehicle.isBoosting = false;
    vehicle.maxSpeed = vehicle.baseMaxSpeed;
  }

  // -----------------------------------------------------------
  // C. ACCELERATION, BRAKING & NATURAL FRICTION
  // -----------------------------------------------------------
  const isGas = controls.state.gas || vehicle.isBoosting;
  const isBrake = controls.state.brake;

  const currentAccel = vehicle.isBoosting ? vehicle.acceleration + 24.0 : vehicle.acceleration;

  if (isGas) {
    vehicle.speed += currentAccel * dt;
    if (vehicle.speed > vehicle.maxSpeed) vehicle.speed = vehicle.maxSpeed;
  } else if (isBrake) {
    if (vehicle.speed > 0.5) {
      vehicle.speed -= vehicle.brakingDecel * dt;
      if (vehicle.speed < 0) vehicle.speed = 0;
    } else {
      vehicle.speed -= vehicle.acceleration * 0.65 * dt;
      if (vehicle.speed < vehicle.maxReverseSpeed) vehicle.speed = vehicle.maxReverseSpeed;
    }
  } else {
    // Natural friction
    if (vehicle.speed > 0) {
      vehicle.speed -= vehicle.naturalFriction * dt;
      if (vehicle.speed < 0) vehicle.speed = 0;
    } else if (vehicle.speed < 0) {
      vehicle.speed += vehicle.naturalFriction * dt;
      if (vehicle.speed > 0) vehicle.speed = 0;
    }
  }

  // -----------------------------------------------------------
  // D. DRIFT MECHANICS & BOOST CHARGING
  // -----------------------------------------------------------
  // Drifting is active when pressing Space/Drift button with forward speed
  const wantsDrift = controls.state.drift && Math.abs(vehicle.speed) > 4.0;
  vehicle.isDrifting = wantsDrift;

  // Holding a drift while turning charges the boost meter!
  if (vehicle.isDrifting && Math.abs(vehicle.steerAngle) > 0.15) {
    vehicle.boostMeter = Math.min(100, vehicle.boostMeter + vehicle.boostChargeRate * dt);
  }

  const speedMagnitude = Math.abs(vehicle.speed);

  if (speedMagnitude > 0.1) {
    const turnDirection = Math.sign(vehicle.speed);
    const driftMultiplier = vehicle.isDrifting ? vehicle.driftYawMultiplier : 1.0;
    const yawDelta =
      vehicle.steerAngle *
      vehicle.turnRate *
      turnDirection *
      driftMultiplier *
      dt;

    vehicle.heading += yawDelta;
  }

  // -----------------------------------------------------------
  // E. LATERAL SLIP & POSITION INTEGRATION
  // -----------------------------------------------------------
  const forwardX = Math.sin(vehicle.heading);
  const forwardZ = Math.cos(vehicle.heading);

  const rightX = Math.cos(vehicle.heading);
  const rightZ = -Math.sin(vehicle.heading);

  if (vehicle.isDrifting && Math.abs(vehicle.steerAngle) > 0.15) {
    const slipTarget = -Math.sign(vehicle.steerAngle) * (speedMagnitude * 0.48);
    vehicle.lateralSlip = THREE.MathUtils.lerp(vehicle.lateralSlip, slipTarget, 5.0 * dt);
  } else {
    vehicle.lateralSlip = THREE.MathUtils.lerp(vehicle.lateralSlip, 0, 10.0 * dt);
  }

  // Integrate position
  vehicle.position.x += (forwardX * vehicle.speed + rightX * vehicle.lateralSlip) * dt;
  vehicle.position.z += (forwardZ * vehicle.speed + rightZ * vehicle.lateralSlip) * dt;

  // -----------------------------------------------------------
  // F. TRACK BOUNDARY & BARRIER COLLISION
  // -----------------------------------------------------------
  const boundaryCheck = track.checkBoundaryCollision(vehicle.position);
  if (boundaryCheck.collided) {
    // Bounce off barrier!
    vehicle.position.copy(boundaryCheck.correctedPos);
    vehicle.speed *= 0.65; // Speed penalty
    audio.playBarrierHitSound();
  }

  // Update root mesh transform
  rickshaw.group.position.copy(vehicle.position);
  rickshaw.group.rotation.y = vehicle.heading;

  // -----------------------------------------------------------
  // G. 3-WHEELER TILT & SUSPENSION DYNAMICS
  // -----------------------------------------------------------
  const rollIntensity = vehicle.isDrifting ? 0.34 : 0.24;
  const targetRoll =
    -(vehicle.steerAngle / vehicle.maxSteerAngle) *
    (speedMagnitude / vehicle.baseMaxSpeed) *
    rollIntensity;
  vehicle.bodyRoll = THREE.MathUtils.lerp(vehicle.bodyRoll, targetRoll, 8.0 * dt);

  let targetPitch = 0;
  if (isBrake && vehicle.speed > 1.0) {
    targetPitch = 0.09; // Nose dips under braking
  } else if (vehicle.isBoosting) {
    targetPitch = -0.07; // Aggressive squat during boost!
  } else if (isGas && vehicle.speed < vehicle.maxSpeed * 0.8) {
    targetPitch = -0.04; // Nose lifts under acceleration
  }

  const bumpWobble = speedMagnitude > 2.0 ? Math.sin(clock.getElapsedTime() * 20.0) * 0.009 : 0;
  vehicle.bodyPitch = THREE.MathUtils.lerp(vehicle.bodyPitch, targetPitch + bumpWobble, 7.0 * dt);

  rickshaw.tiltGroup.rotation.z = vehicle.bodyRoll;
  rickshaw.tiltGroup.rotation.x = vehicle.bodyPitch;

  // -----------------------------------------------------------
  // H. WHEEL ROTATION & TIRE PARTICLES
  // -----------------------------------------------------------
  const wheelRadius = 0.32;
  const wheelSpinDelta = (vehicle.speed / wheelRadius) * dt;
  rickshaw.frontWheel.rotation.x += wheelSpinDelta;
  rickshaw.rearLeftWheel.rotation.x += wheelSpinDelta;
  rickshaw.rearRightWheel.rotation.x += wheelSpinDelta;

  const forwardVec = new THREE.Vector3(forwardX, 0, forwardZ);

  // 1. Drift sparks from rear wheels
  if (vehicle.isDrifting || (speedMagnitude > 14.0 && Math.abs(vehicle.steerAngle) > 0.4)) {
    const leftWheelPos = new THREE.Vector3(-0.66, 0.06, -0.65)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicle.heading)
      .add(vehicle.position);

    const rightWheelPos = new THREE.Vector3(0.66, 0.06, -0.65)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicle.heading)
      .add(vehicle.position);

    sparkSystem.emitSpark(leftWheelPos, forwardVec);
    sparkSystem.emitSpark(rightWheelPos, forwardVec);
  }

  // 2. Cyan Nitro flame particles from exhaust pipe
  if (vehicle.isBoosting) {
    const exhaustWorldPos = new THREE.Vector3(-0.45, 0.26, -1.45)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicle.heading)
      .add(vehicle.position);

    nitroFlameSystem.emitFlame(exhaustWorldPos, forwardVec);
  }

  sparkSystem.update(dt, camera);
  nitroFlameSystem.update(dt, camera);

  // -----------------------------------------------------------
  // I. CONE HAZARDS & FLYING COLLISION PHYSICS
  // -----------------------------------------------------------
  track.trackCones.forEach((cone) => {
    const dist = vehicle.position.distanceTo(cone.mesh.position);
    const hitRadius = 1.4;

    if (dist < hitRadius && !cone.isAirborne) {
      // Launch cone into the air!
      cone.isAirborne = true;
      audio.playConeHitSound();

      const bumpDir = cone.mesh.position.clone().sub(vehicle.position).normalize();
      const flingSpeed = 10.0 + speedMagnitude * 0.4;

      cone.velocity.set(
        bumpDir.x * flingSpeed,
        12.0 + Math.random() * 4.0, // High vertical pop!
        bumpDir.z * flingSpeed
      );

      cone.angularVelocity.set(
        (Math.random() - 0.5) * 18.0,
        (Math.random() - 0.5) * 18.0,
        (Math.random() - 0.5) * 18.0
      );
    }
  });

  track.updateConesPhysics(dt);

  // -----------------------------------------------------------
  // J. CHECKPOINTS, SOUND & HUD
  // -----------------------------------------------------------
  updateCheckpoints();
  audio.updateEngine(vehicle.speed, vehicle.maxSpeed, isGas);
  updateChaseCamera(dt);
  updateHUD();

  renderer.render(scene, camera);
}

// Start Game Loop
animate();

// ----------------------------------------------------------------------------
// 12. WINDOW RESIZE HANDLER
// ----------------------------------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
