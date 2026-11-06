import * as THREE from 'three';
import { createRickshaw } from './createRickshaw.js';
import { createTrack } from './createTrack.js';
import { createRivals } from './createRivals.js';
import { createEnvironment } from './createEnvironment.js';
import { createBazaar } from './createBazaar.js';
import { createStreetClutter } from './createStreetClutter.js';
import { createObstacles } from './createObstacles.js';
import { VoiceSystem } from './createVoiceSystem.js';
import { SparkParticleSystem, NitroFlameSystem, TireSmokeSystem } from './particles.js';
import { ControlsManager } from './controls.js';
import { AudioManager } from './audio.js';

/**
 * ============================================================================
 * 3D AUTO-RICKSHAW ARCADE RACER (SPRINT 4 - INDIAN BAZAAR OVERHAUL)
 * Built with Three.js & Vite
 * ============================================================================
 * 
 * Major Features in Sprint 4:
 *  1. Crisp, Bright Indian Day Atmosphere: 3D Sky Dome with gradient shader,
 *     drifting 3D clouds, sun disc, and sandy-ochre/grassy terrain.
 *  2. Dense Indian Bazaar Streetscape: 36+ shop-houses in Jaipur pink, turmeric
 *     yellow, and terracotta with Hindi/English signboards, awnings, and bunting.
 *  3. Textured medium-gray asphalt with white boundary lines and concrete curbs.
 *  4. Pre-Race Difficulty Selector Modal (Easy, Medium, Hard).
 *  5. Fixed AI Competitor Movement & Acceleration (75-100+ KM/H) + Dynamic Rubber-Banding.
 */

// ----------------------------------------------------------------------------
// 1. SCENE SETUP & CRISP DAYLIGHT ATMOSPHERE
// ----------------------------------------------------------------------------
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Subtle warm atmospheric distance haze (no heavy orange fog!)
scene.fog = new THREE.FogExp2(0xf0c294, 0.0016);

const defaultFOV = 55;
const boostFOV = 72;
const camera = new THREE.PerspectiveCamera(
  defaultFOV,
  window.innerWidth / window.innerHeight,
  0.1,
  800
);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

// ----------------------------------------------------------------------------
// 2. SUNLIGHT & AMBIENT ILLUMINATION
// ----------------------------------------------------------------------------
// Rich sky bounce + dusty earth bounce (neutral dark gray shadows)
const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0xd4a373, 0.7);
scene.add(hemiLight);

// Bright Indian afternoon sun casting crisp real-time shadows
const sunLight = new THREE.DirectionalLight(0xfffdf5, 2.0);
sunLight.position.set(50, 65, 45);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 180;
const d = 60;
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
// 3. SKY DOME, TERRAIN & INDIAN BAZAAR STREETSCAPE
// ----------------------------------------------------------------------------
const track = createTrack(scene);
const environment = createEnvironment(scene, track.trackCurve);
const bazaar = createBazaar(scene, track.trackCurve, track.trackWidth);
const obstacles = createObstacles(scene, track.trackCurve, track.trackWidth);
const rivalsManager = createRivals(scene, track.trackCurve, track.trackWidth, track);

// Audio collision cooldown timers to eliminate sound stutter
let lastBarrierHitTime = 0;
let lastBumperSoundTime = 0;
let lastConeSoundTime = 0;

// ----------------------------------------------------------------------------
// 4. AUDIO SYSTEM & INPUT CONTROLS
// ----------------------------------------------------------------------------
const audio = new AudioManager();
const controls = new ControlsManager(audio);

// Desi Street Clutter & Voice Banter System (Sprint 5)
const clutter = createStreetClutter(scene, track.trackCurve, track.trackWidth);
const voiceSystem = new VoiceSystem(audio, scene, camera);

// Intercept playHorn to trigger nearby rival AI voice reaction & cow reaction
const originalPlayHorn = audio.playHorn.bind(audio);
audio.playHorn = () => {
  originalPlayHorn();
  if (obstacles && obstacles.reactToHorn) {
    obstacles.reactToHorn();
  }
  if (rivalsManager && rivalsManager.rivals && typeof vehicle !== 'undefined' && vehicle.position) {
    let closestRival = null;
    let closestDistSq = Infinity;
    rivalsManager.rivals.forEach((r) => {
      const distSq = vehicle.position.distanceToSquared(r.position);
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closestRival = r;
      }
    });
    if (closestRival && Math.sqrt(closestDistSq) < 28) {
      voiceSystem.triggerDialogue(closestRival.name, 'horn', closestRival.mesh);
    }
  }
};

const hudHornBtn = document.getElementById('btn-horn-hud');
if (hudHornBtn) {
  hudHornBtn.addEventListener('click', (e) => {
    e.preventDefault();
    audio.playHorn();
  });
}

// ----------------------------------------------------------------------------
// 5. PLAYER AUTO-RICKSHAW & PARTICLES
// ----------------------------------------------------------------------------
const rickshaw = createRickshaw({
  name: 'Player',
  bodyColor: 0xf5b000, // Iconic Auto Yellow
  trimColor: 0x0c6833, // Emerald Green
  canopyColor: 0x1c1e21,
});
scene.add(rickshaw.group);

// Headlight forward beam
const headlightBeam = new THREE.SpotLight(0xfff1cf, 2.8, 35, Math.PI / 5.5, 0.4, 1.2);
headlightBeam.position.set(0, 0.45, 1.2);
rickshaw.frontForkGroup.add(headlightBeam);

const headlightTarget = new THREE.Object3D();
headlightTarget.position.set(0, 0.1, 9.0);
rickshaw.frontForkGroup.add(headlightTarget);
headlightBeam.target = headlightTarget;

// Particle systems: Tire drift sparks + Garam Chai Nitro flames + Billowy Tire Smoke
const sparkSystem = new SparkParticleSystem(scene, 90);
const nitroFlameSystem = new NitroFlameSystem(scene, 60);
const tireSmokeSystem = new TireSmokeSystem(scene, 90);

// ----------------------------------------------------------------------------
// 6. STAGGERED STARTING GRID & VEHICLE STATE
// ----------------------------------------------------------------------------
const startGate = track.checkpointGates[0];

// Player starting slot (Front row right)
const startCenter = track.trackCurve.getPointAt(0);
startCenter.y = 0;
const startTan = track.trackCurve.getTangentAt(0);
startTan.y = 0;
startTan.normalize();
const startNorm = new THREE.Vector3(-startTan.z, 0, startTan.x).normalize();
const playerStartPos = startCenter.clone().addScaledVector(startNorm, 2.4);

const vehicle = {
  // World Transform
  position: playerStartPos.clone(),
  heading: startGate.heading,

  // Speed & Accelerations
  speed: 0,
  verticalVelocity: 0,
  baseMaxSpeed: 25.0, // m/s (~90 km/h)
  boostMaxSpeed: 38.0, // m/s (~136 km/h)
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
  boostMeter: 0,
  isBoosting: false,
  boostChargeRate: 35.0,
  boostDrainRate: 26.0,

  // Dynamic 3-Wheeler Tilt (Chassis Lean & Pitch)
  bodyRoll: 0,
  bodyPitch: 0,
};

rickshaw.group.position.copy(vehicle.position);
rickshaw.group.rotation.y = vehicle.heading;

// Race manager state
const raceState = {
  mode: 'DIFFICULTY_SELECT', // 'DIFFICULTY_SELECT' | 'COUNTDOWN' | 'RACING' | 'FINISHED'
  countdownTimer: 3.8,
  countdownStep: 3,
  currentLap: 1,
  totalLaps: 3,
  raceStartTime: 0,
  lapStartTime: 0,
  currentLapTime: 0,
  totalRaceTime: 0,
  bestLapTime: parseFloat(localStorage.getItem('tuktuk_best_lap')) || null,
  nextRequiredGateIdx: 1,
  lastPassedGateIdx: 0,
  playerPosition: 1,
  playerTotalProgress: 0,
};

let lastOvertakeCheckPos = 4;

// ----------------------------------------------------------------------------
// 7. PRE-RACE DIFFICULTY SELECTOR & UI OVERLAYS
// ----------------------------------------------------------------------------
const difficultyModalEl = document.getElementById('difficulty-modal');
const diffOptions = document.querySelectorAll('.diff-option-btn');
const startRaceBtn = document.getElementById('btn-start-race');
const diffHudBtn = document.getElementById('btn-difficulty-hud');
const diffHudLabel = document.getElementById('diff-hud-label');

const countdownOverlayEl = document.getElementById('countdown-overlay');
const countdownTextEl = document.getElementById('countdown-text');
const finishModalEl = document.getElementById('finish-modal');
const finishTrophyEl = document.getElementById('finish-trophy');
const finishRankBadgeEl = document.getElementById('finish-rank-badge');
const finishTotalTimeEl = document.getElementById('finish-total-time');
const finishBestLapEl = document.getElementById('finish-best-lap');
const finishLeaderboardListEl = document.getElementById('finish-leaderboard-list');
const restartBtn = document.getElementById('btn-restart-race');

// Lap Selector (Sprint 9)
const lapOptionBtns = document.querySelectorAll('.lap-option-btn');
lapOptionBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    lapOptionBtns.forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    const laps = parseInt(btn.getAttribute('data-laps'), 10) || 3;
    raceState.totalLaps = laps;
    if (lapValueEl) {
      lapValueEl.textContent = `${raceState.currentLap} / ${raceState.totalLaps}`;
    }
  });
});

// Difficulty Option selection
diffOptions.forEach((btn) => {
  btn.addEventListener('click', () => {
    diffOptions.forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    const chosenDiff = btn.dataset.diff;
    rivalsManager.setDifficulty(chosenDiff);
    if (diffHudLabel) diffHudLabel.textContent = chosenDiff;
  });
});

if (startRaceBtn) {
  startRaceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (difficultyModalEl) difficultyModalEl.classList.add('hidden');
    startRaceCountdown();
  });
}

if (diffHudBtn) {
  diffHudBtn.addEventListener('click', (e) => {
    e.preventDefault();
    raceState.mode = 'DIFFICULTY_SELECT';
    vehicle.speed = 0;
    if (difficultyModalEl) difficultyModalEl.classList.remove('hidden');
    if (countdownOverlayEl) countdownOverlayEl.classList.add('hidden');
  });
}

function formatTime(ms) {
  if (!ms || ms === Infinity || isNaN(ms)) return '--:--.--';
  const totalSec = ms / 1000;
  const mins = Math.floor(totalSec / 60);
  const secs = Math.floor(totalSec % 60);
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

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

// Reset the entire race back to countdown and grid slots
function startRaceCountdown() {
  raceState.mode = 'COUNTDOWN';
  raceState.countdownTimer = 3.8;
  raceState.countdownStep = 3;
  raceState.currentLap = 1;
  raceState.nextRequiredGateIdx = 1;
  raceState.lastPassedGateIdx = 0;
  raceState.playerPosition = 1;

  // Reset player to front row right
  vehicle.position.copy(playerStartPos);
  vehicle.heading = startGate.heading;
  vehicle.speed = 0;
  vehicle.steerAngle = 0;
  vehicle.lateralSlip = 0;
  vehicle.bodyRoll = 0;
  vehicle.bodyPitch = 0;
  vehicle.boostMeter = 0;
  vehicle.isBoosting = false;

  rickshaw.group.position.copy(vehicle.position);
  rickshaw.group.rotation.set(0, vehicle.heading, 0);
  rickshaw.tiltGroup.rotation.set(0, 0, 0);
  rickshaw.frontForkGroup.rotation.y = 0;

  // Reset AI Rivals to starting grid
  rivalsManager.resetRivals();

  // Reset UI
  if (finishModalEl) finishModalEl.classList.add('hidden');
  stopConfetti();
  if (countdownOverlayEl) {
    countdownOverlayEl.classList.remove('hidden');
    countdownTextEl.textContent = '3';
    countdownTextEl.className = 'countdown-text';
  }
}

if (restartBtn) {
  restartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    stopConfetti();
    if (finishModalEl) finishModalEl.classList.add('hidden');
    if (difficultyModalEl) difficultyModalEl.classList.remove('hidden');
  });
}

function respawnAtLastCheckpoint() {
  if (raceState.mode === 'FINISHED' || raceState.mode === 'DIFFICULTY_SELECT') {
    startRaceCountdown();
    return;
  }

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

// ----------------------------------------------------------------------------
// 8. CHECKPOINTS & LAP COMPLETION LOGIC
// ----------------------------------------------------------------------------
function updateCheckpoints() {
  if (raceState.mode !== 'RACING') return;

  const nextGate = track.checkpointGates[raceState.nextRequiredGateIdx];
  if (!nextGate) return;

  const dist = vehicle.position.distanceTo(nextGate.position);
  if (dist < nextGate.radius + 1.2) {
    raceState.lastPassedGateIdx = raceState.nextRequiredGateIdx;

    if (nextGate.isStartFinish) {
      // 🏁 FINISHED A LAP!
      audio.playLapSound();

      const completedLapTime = performance.now() - raceState.lapStartTime;
      raceState.lapStartTime = performance.now();

      // Check Best Lap
      if (!raceState.bestLapTime || completedLapTime < raceState.bestLapTime) {
        raceState.bestLapTime = completedLapTime;
        localStorage.setItem('tuktuk_best_lap', completedLapTime.toString());
        showCheckpointBanner(`🔥 NEW BEST LAP: ${formatTime(completedLapTime)}!`);
      } else {
        showCheckpointBanner(`🏁 LAP ${raceState.currentLap} COMPLETE: ${formatTime(completedLapTime)}!`);
      }

      if (raceState.currentLap < raceState.totalLaps) {
        raceState.currentLap++;
        raceState.nextRequiredGateIdx = 1;
      } else {
        // 🏆 FINISHED ENTIRE RACE!
        raceState.mode = 'FINISHED';
        raceState.totalRaceTime = performance.now() - raceState.raceStartTime;
        showRaceFinishedModal();
      }
    } else {
      audio.playCheckpointChime();
      showCheckpointBanner(`⚡ CHECKPOINT ${nextGate.index} / 4 CLEARED!`);
      raceState.nextRequiredGateIdx = (raceState.nextRequiredGateIdx + 1) % track.checkpointGates.length;
    }
  }
}

// Confetti Animation Controller (Sprint 9)
let confettiAnimId = null;

function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const pieces = [];
  const colors = ['#ffd700', '#ff0055', '#00f0ff', '#38b000', '#ff9e00', '#9d4edd', '#ffffff'];

  for (let i = 0; i < 110; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 6 + Math.random() * 8,
      h: 10 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 2.8,
      vy: 2.2 + Math.random() * 3.8,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.12,
    });
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      if (p.y > canvas.height) {
        p.y = -15;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    confettiAnimId = requestAnimationFrame(renderConfetti);
  }
  renderConfetti();
}

function stopConfetti() {
  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
    confettiAnimId = null;
  }
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function showRaceFinishedModal() {
  if (!finishModalEl) return;

  const rank = raceState.playerPosition;
  const suffix = ['th', 'st', 'nd', 'rd', 'th'][rank] || 'th';
  const trophies = ['', '🏆', '🥈', '🥉', '🏁'];

  finishTrophyEl.textContent = trophies[rank] || '🏆';
  finishRankBadgeEl.textContent = `${rank}${suffix} PLACE`;

  finishTotalTimeEl.textContent = formatTime(raceState.totalRaceTime);
  finishBestLapEl.textContent = formatTime(raceState.bestLapTime);

  // Build Leaderboard List
  const standings = [
    { name: 'You (Player)', progress: raceState.playerTotalProgress, isPlayer: true },
    ...rivalsManager.rivals.map((r) => ({ name: r.name, progress: r.totalProgress, isPlayer: false })),
  ].sort((a, b) => b.progress - a.progress);

  // Populate 3-Tier Visual Podium
  const pName1 = document.getElementById('podium-name-1');
  const pName2 = document.getElementById('podium-name-2');
  const pName3 = document.getElementById('podium-name-3');
  if (pName1 && standings[0]) pName1.textContent = standings[0].name;
  if (pName2 && standings[1]) pName2.textContent = standings[1].name;
  if (pName3 && standings[2]) pName3.textContent = standings[2].name;

  finishLeaderboardListEl.innerHTML = '';
  standings.forEach((st, idx) => {
    const row = document.createElement('div');
    row.className = `lb-row ${st.isPlayer ? 'player' : ''}`;
    const rankNum = idx + 1;
    const rankSuffix = ['th', 'st', 'nd', 'rd', 'th'][rankNum] || 'th';
    const statusText = st.isPlayer ? 'FINISHED' : (rankNum === 1 ? 'WINNER' : `+${(rankNum * 1.6).toFixed(1)}s`);

    row.innerHTML = `
      <span>${rankNum}${rankSuffix}</span>
      <span>${st.name}</span>
      <span style="text-align: right; color: ${st.isPlayer ? '#ffd700' : '#888'};">${statusText}</span>
    `;
    finishLeaderboardListEl.appendChild(row);
  });

  finishModalEl.classList.remove('hidden');
  startConfetti();

  // Play ElevenLabs winning cheer or grumbling voice line
  try {
    const voiceLine = rank === 1 ? '/new_voices/overtake_1.mp3' : '/new_voices/bump_1.mp3';
    const finishAudio = new Audio(voiceLine);
    finishAudio.volume = 1.0;
    finishAudio.play().catch(() => {});
  } catch (e) {}
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
const posValueEl = document.getElementById('pos-value');
const posClusterEl = document.getElementById('pos-cluster');

function updateHUD() {
  if (speedValueEl) {
    const kmh = Math.round(Math.abs(vehicle.speed) * 3.6);
    speedValueEl.textContent = kmh;
  }

  if (driftBadgeEl) {
    driftBadgeEl.classList.toggle('active', vehicle.isDrifting);
  }

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

  if (boostBarFillEl && boostPercentEl) {
    const pct = Math.round(vehicle.boostMeter);
    boostBarFillEl.style.width = `${pct}%`;
    boostPercentEl.textContent = `${pct}%`;
    boostBarFillEl.classList.toggle('ready', pct >= 95);
  }

  if (lapValueEl) {
    lapValueEl.textContent = `${raceState.currentLap} / ${raceState.totalLaps}`;
  }

  if (timeValueEl) {
    if (raceState.mode === 'RACING') {
      raceState.currentLapTime = performance.now() - raceState.lapStartTime;
      timeValueEl.textContent = formatTime(raceState.currentLapTime);
    } else if (raceState.mode === 'COUNTDOWN' || raceState.mode === 'DIFFICULTY_SELECT') {
      timeValueEl.textContent = '00:00.00';
    }
  }

  if (bestValueEl) {
    bestValueEl.textContent = formatTime(raceState.bestLapTime);
  }

  if (gateValueEl) {
    const nextIdx = raceState.nextRequiredGateIdx;
    gateValueEl.textContent = nextIdx === 0 ? 'FINISH' : `GATE ${nextIdx}`;
  }

  if (posValueEl && posClusterEl) {
    const rank = raceState.playerPosition;
    const suffixes = ['th', 'st', 'nd', 'rd', 'th'];
    posValueEl.textContent = `${rank}${suffixes[rank] || 'th'}`;

    const rankColors = ['', '#ffd700', '#00f0ff', '#ff8c00', '#888888'];
    posClusterEl.style.borderColor = rankColors[rank] || '#ffd700';
    posValueEl.style.color = rankColors[rank] || '#ffd700';
  }
}

// ----------------------------------------------------------------------------
// 10. MULTI-MODE CAMERA CONTROLLER & IMPACT SHAKE (Sprint 9)
// ----------------------------------------------------------------------------
const cameraCurrentPos = new THREE.Vector3(0, 4, -8);
const cameraLookTarget = new THREE.Vector3(0, 1, 0);

let cameraMode = 'CHASE'; // 'CHASE' | 'HOOD' | 'SPECTATE'
const camHudLabel = document.getElementById('cam-hud-label');
const btnCameraView = document.getElementById('btn-camera-view');
const podiumCamBtn = document.getElementById('btn-change-camera-podium');

function cycleCameraMode() {
  if (cameraMode === 'CHASE') {
    cameraMode = 'HOOD';
  } else if (cameraMode === 'HOOD') {
    cameraMode = 'SPECTATE';
  } else {
    cameraMode = 'CHASE';
  }
  if (camHudLabel) camHudLabel.textContent = cameraMode;
}

if (btnCameraView) {
  btnCameraView.addEventListener('click', (e) => {
    e.preventDefault();
    cycleCameraMode();
  });
}
if (podiumCamBtn) {
  podiumCamBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cycleCameraMode();
  });
}
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyC') {
    cycleCameraMode();
  }
});

let cameraShakeTrauma = 0;
let cameraShakeTimer = 0;
export function addCameraTrauma(amount) {
  cameraShakeTrauma = Math.min(1.0, cameraShakeTrauma + amount);
}

function updateChaseCamera(dt) {
  const forwardX = Math.sin(vehicle.heading);
  const forwardZ = Math.cos(vehicle.heading);

  let desiredCamX, desiredCamY, desiredCamZ;
  let desiredLookX, desiredLookY, desiredLookZ;

  if (cameraMode === 'HOOD') {
    desiredCamX = vehicle.position.x + forwardX * 0.4;
    desiredCamZ = vehicle.position.z + forwardZ * 0.4;
    desiredCamY = vehicle.position.y + 1.35;
    desiredLookX = vehicle.position.x + forwardX * 12.0;
    desiredLookZ = vehicle.position.z + forwardZ * 12.0;
    desiredLookY = vehicle.position.y + 1.1;
  } else if (cameraMode === 'SPECTATE') {
    desiredCamX = vehicle.position.x - forwardX * 14.0;
    desiredCamZ = vehicle.position.z - forwardZ * 14.0;
    desiredCamY = vehicle.position.y + 7.5;
    desiredLookX = vehicle.position.x + forwardX * 2.0;
    desiredLookZ = vehicle.position.z + forwardZ * 2.0;
    desiredLookY = vehicle.position.y + 1.2;
  } else {
    const speedRatio = Math.min(Math.abs(vehicle.speed) / vehicle.boostMaxSpeed, 1.0);
    const followDistance = 6.4 + speedRatio * 3.4;
    const followHeight = 3.0 + speedRatio * 0.9;
    desiredCamX = vehicle.position.x - forwardX * followDistance;
    desiredCamZ = vehicle.position.z - forwardZ * followDistance;
    desiredCamY = vehicle.position.y + followHeight;
    desiredLookX = vehicle.position.x + forwardX * 1.8;
    desiredLookZ = vehicle.position.z + forwardZ * 1.8;
    desiredLookY = vehicle.position.y + 1.25;
  }

  const camLerp = 1.0 - Math.exp(-7.0 * dt);
  cameraCurrentPos.lerp(new THREE.Vector3(desiredCamX, desiredCamY, desiredCamZ), camLerp);
  camera.position.copy(cameraCurrentPos);

  // Subtle High-Frequency Camera Shake on Speed Bumps / Wall Hits / AI Collisions
  if (cameraShakeTrauma > 0.001) {
    cameraShakeTimer += dt * 38.0;
    const shakeIntensity = cameraShakeTrauma * cameraShakeTrauma;
    const shakeOffsetX = Math.sin(cameraShakeTimer * 1.4) * 0.28 * shakeIntensity;
    const shakeOffsetY = Math.cos(cameraShakeTimer * 1.8) * 0.22 * shakeIntensity;
    const shakeOffsetZ = Math.sin(cameraShakeTimer * 0.95) * 0.20 * shakeIntensity;
    camera.position.add(new THREE.Vector3(shakeOffsetX, shakeOffsetY, shakeOffsetZ));
    cameraShakeTrauma = Math.max(0, cameraShakeTrauma - dt * 3.0); // ~300ms decay
  }

  const lookLerp = 1.0 - Math.exp(-9.0 * dt);
  cameraLookTarget.lerp(new THREE.Vector3(desiredLookX, desiredLookY, desiredLookZ), lookLerp);
  camera.lookAt(cameraLookTarget);

  const targetFOV = vehicle.isBoosting ? boostFOV : defaultFOV;
  if (Math.abs(camera.fov - targetFOV) > 0.1) {
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 8.0 * dt);
    camera.updateProjectionMatrix();
  }

  sunTarget.position.set(vehicle.position.x, 0, vehicle.position.z);
  sunLight.position.set(vehicle.position.x + 50, 65, vehicle.position.z + 45);
}

// ----------------------------------------------------------------------------
// 11. VEHICLE-TO-VEHICLE BUMPER COLLISIONS
// ----------------------------------------------------------------------------
function checkVehicleCollisions() {
  const rivals = rivalsManager.rivals;
  const minDist = 2.2;

  for (let i = 0; i < rivals.length; i++) {
    const r = rivals[i];
    const dx = vehicle.position.x - r.position.x;
    const dz = vehicle.position.z - r.position.z;
    const distSq = dx * dx + dz * dz;

    if (distSq < minDist * minDist && distSq > 0.001) {
      const contactPos = new THREE.Vector3(
        (vehicle.position.x + r.position.x) * 0.5,
        0.35,
        (vehicle.position.z + r.position.z) * 0.5
      );
      const forwardDir = new THREE.Vector3(Math.sin(vehicle.heading), 0, Math.cos(vehicle.heading));
      sparkSystem.emitSpark(contactPos, forwardDir);
      addCameraTrauma(0.35);

      // Trigger AI voice dialogue on bump
      voiceSystem.triggerDialogue(r.name, 'collision', r.mesh);
    }
  }
}

// ----------------------------------------------------------------------------
// 12. MAIN ANIMATION & GAME LOOP
// ----------------------------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);

  // Check Respawn Trigger
  if (controls.consumeReset()) {
    respawnAtLastCheckpoint();
  }

  // Animate drifting sky clouds
  environment.updateClouds(dt);

  // -----------------------------------------------------------
  // A. ARCADE COUNTDOWN STATE (3... 2... 1... CHALO!)
  // -----------------------------------------------------------
  if (raceState.mode === 'COUNTDOWN') {
    raceState.countdownTimer -= dt;

    if (raceState.countdownTimer > 2.6) {
      if (raceState.countdownStep !== 3) {
        raceState.countdownStep = 3;
        countdownTextEl.textContent = '3';
        countdownTextEl.className = 'countdown-text';
        audio.playCountdownBeep(false);
      }
    } else if (raceState.countdownTimer > 1.6) {
      if (raceState.countdownStep !== 2) {
        raceState.countdownStep = 2;
        countdownTextEl.textContent = '2';
        countdownTextEl.className = 'countdown-text';
        audio.playCountdownBeep(false);
      }
    } else if (raceState.countdownTimer > 0.6) {
      if (raceState.countdownStep !== 1) {
        raceState.countdownStep = 1;
        countdownTextEl.textContent = '1';
        countdownTextEl.className = 'countdown-text';
        audio.playCountdownBeep(false);
      }
    } else {
      if (raceState.countdownStep !== 0) {
        raceState.countdownStep = 0;
        countdownTextEl.textContent = 'CHALO!';
        countdownTextEl.className = 'countdown-text go';
        audio.playCountdownBeep(true);
      }
    }

    if (raceState.countdownTimer <= 0) {
      raceState.mode = 'RACING';
      raceState.raceStartTime = performance.now();
      raceState.lapStartTime = performance.now();

      setTimeout(() => {
        if (countdownOverlayEl) countdownOverlayEl.classList.add('hidden');
      }, 600);
    }
  }

  // -----------------------------------------------------------
  // B. STEERING & FRONT FORK
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
  // C. GARAM CHAI NITRO BOOST MECHANIC
  // -----------------------------------------------------------
  const wantsBoost =
    raceState.mode === 'RACING' &&
    controls.state.boost &&
    vehicle.boostMeter > 3.0 &&
    vehicle.speed > 0.5;

  if (wantsBoost) {
    if (!vehicle.isBoosting) {
      audio.playBoostIgnition();
    }
    vehicle.isBoosting = true;
    vehicle.maxSpeed = vehicle.boostMaxSpeed;
    vehicle.boostMeter = Math.max(0, vehicle.boostMeter - vehicle.boostDrainRate * dt);
  } else {
    vehicle.isBoosting = false;
    vehicle.maxSpeed = vehicle.baseMaxSpeed;
  }

  // -----------------------------------------------------------
  // D. ACCELERATION, BRAKING & REV ENGINE
  // -----------------------------------------------------------
  const isGas = controls.state.gas || vehicle.isBoosting;
  const isBrake = controls.state.brake;

  if (raceState.mode === 'COUNTDOWN' || raceState.mode === 'DIFFICULTY_SELECT') {
    vehicle.speed = 0; // Locked at grid
  } else if (raceState.mode === 'RACING') {
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
      if (vehicle.speed > 0) {
        vehicle.speed -= vehicle.naturalFriction * dt;
        if (vehicle.speed < 0) vehicle.speed = 0;
      } else if (vehicle.speed < 0) {
        vehicle.speed += vehicle.naturalFriction * dt;
        if (vehicle.speed > 0) vehicle.speed = 0;
      }
    }
  }

  // -----------------------------------------------------------
  // E. DRIFT MECHANICS & BOOST CHARGING
  // -----------------------------------------------------------
  const wantsDrift = controls.state.drift && Math.abs(vehicle.speed) > 4.0;
  vehicle.isDrifting = wantsDrift;

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
  // F. LATERAL SLIP & POSITION INTEGRATION
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

  vehicle.position.x += (forwardX * vehicle.speed + rightX * vehicle.lateralSlip) * dt;
  vehicle.position.z += (forwardZ * vehicle.speed + rightZ * vehicle.lateralSlip) * dt;

  // Vertical suspension launch and gravity bounce (Speed Breakers)
  if (vehicle.position.y > 0 || vehicle.verticalVelocity > 0) {
    vehicle.verticalVelocity -= 22.0 * dt;
    vehicle.position.y += vehicle.verticalVelocity * dt;
    if (vehicle.position.y <= 0) {
      vehicle.position.y = 0;
      vehicle.verticalVelocity = 0;
    }
  }

  // -----------------------------------------------------------
  // G. TRACK BOUNDARY & BARRIER COLLISION (Smooth Wall-Sliding)
  // -----------------------------------------------------------
  const boundaryCheck = track.checkBoundaryCollision(vehicle.position);
  if (boundaryCheck.collided) {
    // 1. Clamp position smoothly to trackHalfWidth - 1.2
    vehicle.position.copy(boundaryCheck.clampedPos);

    // 2. Align heading smoothly toward track tangent (wall-sliding effect)
    const forwardDot =
      Math.sin(vehicle.heading) * boundaryCheck.tangent.x +
      Math.cos(vehicle.heading) * boundaryCheck.tangent.z;
    const targetYaw = forwardDot >= 0 ? boundaryCheck.tangentYaw : boundaryCheck.tangentYaw + Math.PI;

    let angleDiff = targetYaw - vehicle.heading;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    vehicle.heading += angleDiff * 5.0 * dt;

    // 3. Slide along the barrier with minor speed penalty (speed *= 0.985)
    vehicle.speed *= 0.985;

    // 4. Strict audio cooldown timer (350ms) to eliminate 60Hz machine-gun stutter
    const now = performance.now();
    if (now - lastBarrierHitTime > 350) {
      audio.playBarrierHitSound();
      lastBarrierHitTime = now;
      addCameraTrauma(0.40);
    }
  }

  rickshaw.group.position.copy(vehicle.position);
  rickshaw.group.rotation.y = vehicle.heading;

  // -----------------------------------------------------------
  // H. AI RIVALS UPDATE & VEHICLE BUMPER COLLISIONS
  // -----------------------------------------------------------
  rivalsManager.updateRivals(
    dt,
    vehicle.position,
    raceState.playerTotalProgress,
    audio,
    raceState.mode === 'RACING',
    camera,
    vehicle
  );
  checkVehicleCollisions();

  // -----------------------------------------------------------
  // I. LIVE RACE POSITION TRACKING (1st to 4th)
  // -----------------------------------------------------------
  const closestTrackPt = track.getClosestTrackPoint(vehicle.position);
  let playerLapT = closestTrackPt.t;
  if (raceState.currentLap === 1 && playerLapT > 0.85) {
    playerLapT -= 1.0;
  }
  raceState.playerTotalProgress = (raceState.currentLap - 1) * 1.0 + playerLapT;

  const raceStandings = [
    { name: 'Player', progress: raceState.playerTotalProgress, isPlayer: true },
    ...rivalsManager.rivals.map((r) => ({ name: r.name, progress: r.totalProgress, isPlayer: false })),
  ].sort((a, b) => b.progress - a.progress);

  const newPlayerPos = raceStandings.findIndex((s) => s.isPlayer) + 1;

  if (raceState.mode === 'RACING' && typeof lastOvertakeCheckPos !== 'undefined' && lastOvertakeCheckPos !== newPlayerPos) {
    if (newPlayerPos < lastOvertakeCheckPos) {
      // Player overtook someone!
      const passed = raceStandings[newPlayerPos]; // Standing right behind player now
      if (passed && !passed.isPlayer) {
        const rivalObj = rivalsManager.rivals.find((r) => r.name === passed.name);
        if (rivalObj) {
          voiceSystem.triggerDialogue(rivalObj.name, 'overtaken', rivalObj.mesh);
        }
      }
    } else if (newPlayerPos > lastOvertakeCheckPos) {
      // Rival overtook player!
      const passer = raceStandings[newPlayerPos - 2]; // Standing right ahead of player now
      if (passer && !passer.isPlayer) {
        const rivalObj = rivalsManager.rivals.find((r) => r.name === passer.name);
        if (rivalObj) {
          voiceSystem.triggerDialogue(rivalObj.name, 'overtake', rivalObj.mesh);
        }
      }
    }
  }
  lastOvertakeCheckPos = newPlayerPos;
  raceState.playerPosition = newPlayerPos;

  // -----------------------------------------------------------
  // J. 3-WHEELER TILT & SUSPENSION DYNAMICS
  // -----------------------------------------------------------
  const rollIntensity = vehicle.isDrifting ? 0.34 : 0.24;
  const targetRoll =
    -(vehicle.steerAngle / vehicle.maxSteerAngle) *
    (speedMagnitude / vehicle.baseMaxSpeed) *
    rollIntensity;
  vehicle.bodyRoll = THREE.MathUtils.lerp(vehicle.bodyRoll, targetRoll, 8.0 * dt);

  let targetPitch = 0;
  if (isBrake && vehicle.speed > 1.0) {
    targetPitch = 0.09;
  } else if (vehicle.isBoosting) {
    targetPitch = -0.07;
  } else if (isGas && vehicle.speed < vehicle.maxSpeed * 0.8) {
    targetPitch = -0.04;
  }

  const bumpWobble = speedMagnitude > 2.0 ? Math.sin(clock.getElapsedTime() * 20.0) * 0.009 : 0;
  vehicle.bodyPitch = THREE.MathUtils.lerp(vehicle.bodyPitch, targetPitch + bumpWobble, 7.0 * dt);

  rickshaw.tiltGroup.rotation.z = vehicle.bodyRoll;
  rickshaw.tiltGroup.rotation.x = vehicle.bodyPitch;

  // -----------------------------------------------------------
  // K. WHEEL ROTATION & TIRE PARTICLES
  // -----------------------------------------------------------
  const wheelRadius = 0.32;
  const wheelSpinDelta = (vehicle.speed / wheelRadius) * dt;
  rickshaw.frontWheel.rotation.x += wheelSpinDelta;
  rickshaw.rearLeftWheel.rotation.x += wheelSpinDelta;
  rickshaw.rearRightWheel.rotation.x += wheelSpinDelta;

  const forwardVec = new THREE.Vector3(forwardX, 0, forwardZ);

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

  // Billowy Tire Smoke during Drifts & Hard Braking (Sprint 9)
  const isHardBraking = (isBrake || controls.state.brake) && speedMagnitude > 3.5;
  if (vehicle.isDrifting || isHardBraking) {
    const smokeLeft = new THREE.Vector3(-0.66, 0.06, -0.65)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicle.heading)
      .add(vehicle.position);
    const smokeRight = new THREE.Vector3(0.66, 0.06, -0.65)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicle.heading)
      .add(vehicle.position);
    tireSmokeSystem.emitSmoke(smokeLeft, forwardVec, vehicle.speed);
    tireSmokeSystem.emitSmoke(smokeRight, forwardVec, vehicle.speed);
  }

  if (vehicle.isBoosting) {
    const exhaustWorldPos = new THREE.Vector3(-0.45, 0.26, -1.45)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicle.heading)
      .add(vehicle.position);

    nitroFlameSystem.emitFlame(exhaustWorldPos, forwardVec);
  }

  sparkSystem.update(dt, camera);
  nitroFlameSystem.update(dt, camera);
  tireSmokeSystem.update(dt, camera);

  // -----------------------------------------------------------
  // L. INDIAN STREET HAZARDS & ROAD OBSTACLES (Sprint 9)
  // -----------------------------------------------------------
  obstacles.update(dt, vehicle, audio, addCameraTrauma);

  // -----------------------------------------------------------
  // M. DYNAMIC DUSK LIGHTING TRANSITION ACROSS LAPS (Sprint 9)
  // -----------------------------------------------------------
  const duskFactor = Math.min(1.0, Math.max(0.0, raceState.playerTotalProgress / raceState.totalLaps));
  environment.setDuskProgress(duskFactor);

  // Lerp Directional Sunlight from golden-hour white to sunset crimson/amber
  const daySunCol = new THREE.Color(0xfffdf5);
  const duskSunCol = new THREE.Color(0xff6e30);
  sunLight.color.copy(daySunCol).lerp(duskSunCol, duskFactor);
  sunLight.intensity = 2.0 - duskFactor * 1.05;

  // Lerp Hemisphere sky & ground bounce to moody twilight
  const dayHemiSky = new THREE.Color(0x87ceeb);
  const duskHemiSky = new THREE.Color(0x282048);
  const dayHemiGnd = new THREE.Color(0xd4a373);
  const duskHemiGnd = new THREE.Color(0x402b1f);
  hemiLight.color.copy(dayHemiSky).lerp(duskHemiSky, duskFactor);
  hemiLight.groundColor.copy(dayHemiGnd).lerp(duskHemiGnd, duskFactor);

  // Atmospheric Fog transition to twilight purple haze
  const dayFogCol = new THREE.Color(0xf0c294);
  const duskFogCol = new THREE.Color(0x281938);
  scene.fog.color.copy(dayFogCol).lerp(duskFogCol, duskFactor);
  scene.fog.density = 0.0016 + duskFactor * 0.0006;

  // Boost headlight beam intensity at dusk
  headlightBeam.intensity = 2.8 + duskFactor * 1.8;

  // -----------------------------------------------------------
  // N. CONE HAZARDS & FLYING COLLISION PHYSICS
  // -----------------------------------------------------------
  track.trackCones.forEach((cone) => {
    const dist = vehicle.position.distanceTo(cone.mesh.position);
    const hitRadius = 1.4;

    if (dist < hitRadius && !cone.isAirborne) {
      cone.isAirborne = true;
      const now = performance.now();
      if (now - lastConeSoundTime > 250) {
        audio.playConeHitSound();
        lastConeSoundTime = now;
      }

      const bumpDir = cone.mesh.position.clone().sub(vehicle.position).normalize();
      const flingSpeed = 10.0 + speedMagnitude * 0.4;

      cone.velocity.set(
        bumpDir.x * flingSpeed,
        12.0 + Math.random() * 4.0,
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
  // M. CHECKPOINTS, ENGINE AUDIO & HUD
  // -----------------------------------------------------------
  updateCheckpoints();

  const isEngineRevving = isGas || raceState.mode === 'COUNTDOWN' && isGas;
  audio.updateEngine(vehicle.speed, vehicle.maxSpeed, isEngineRevving);

  updateChaseCamera(dt);
  updateHUD();

  voiceSystem.update();

  renderer.render(scene, camera);
}

// Start Game Loop (Waits for player to select difficulty)
animate();

// ----------------------------------------------------------------------------
// 13. WINDOW RESIZE HANDLER
// ----------------------------------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
