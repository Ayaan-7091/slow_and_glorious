import * as THREE from 'three';
import { createRickshaw } from './createRickshaw.js';
import { createCones } from './createCones.js';
import { SparkParticleSystem } from './particles.js';
import { ControlsManager } from './controls.js';

/**
 * ============================================================================
 * 3D AUTO-RICKSHAW ARCADE PROTOTYPE (LEVEL 1)
 * Built with Three.js & Vite
 * ============================================================================
 * 
 * This file orchestrates the entire game:
 *  1. Scene, Sunset Lighting, Shadows, and Fog
 *  2. Ground Plane, Grid Helper, and Traffic Cones
 *  3. Procedural Auto-Rickshaw instance
 *  4. Drift Spark Particle System
 *  5. Unified Controls (Desktop Keyboard + Mobile Touch Overlay)
 *  6. Physics & Arcade Driving Loop with 3-Wheel Tilting
 *  7. Smooth Chase Camera with speed pull-back
 *  8. HUD (Speedometer, Drift Indicator, Controls)
 */

// ----------------------------------------------------------------------------
// 1. SCENE SETUP & SUNSET ATMOSPHERE
// ----------------------------------------------------------------------------
const container = document.getElementById('canvas-container');

// The Scene is the 3D container holding all lights, meshes, and cameras
const scene = new THREE.Scene();

// Warm sunset background color
const sunsetColor = 0xf58a4b;
scene.background = new THREE.Color(sunsetColor);

// Atmospheric distance fog: blends the horizon into the warm sunset sky
scene.fog = new THREE.FogExp2(sunsetColor, 0.012);

// Camera: Perspective camera simulates the human eye (FOV, aspect, near, far)
const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
// Initial camera position (will be dynamically driven by the chase camera)
camera.position.set(0, 5, -10);

// WebGL Renderer: draws the 3D scene onto the 2D canvas
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Crisp on high-DPI screens
renderer.shadowMap.enabled = true; // Enable shadow casting
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadow edges
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic color grading
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

// ----------------------------------------------------------------------------
// 2. LIGHTING (SUNSET GOLDEN HOUR)
// ----------------------------------------------------------------------------
// Hemisphere Light: Simulates ambient sky bounce (warm peach sky, deep earthy ground)
const hemiLight = new THREE.HemisphereLight(0xffdfba, 0x3d201c, 1.1);
scene.add(hemiLight);

// Directional Sunlight: Low-angled golden sunlight casting long, dramatic shadows
const sunLight = new THREE.DirectionalLight(0xffb066, 1.8);
sunLight.position.set(35, 30, 25);
sunLight.castShadow = true;

// Configure shadow resolution and frustum volume
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 120;
const d = 40;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0005; // Prevents shadow acne
scene.add(sunLight);

// Target object for sunlight to track near the player
const sunTarget = new THREE.Object3D();
scene.add(sunTarget);
sunLight.target = sunTarget;

// ----------------------------------------------------------------------------
// 3. GROUND PLANE & VISIBLE GRID HELPER
// ----------------------------------------------------------------------------
// Large asphalt ground plane
const groundGeo = new THREE.PlaneGeometry(350, 350);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x22262c, // Dark asphalt
  roughness: 0.9,
  metalness: 0.1,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2; // Lie flat horizontally on the XZ plane
ground.receiveShadow = true;
scene.add(ground);

// Visible Grid Helper: Helps gauge speed, motion direction, and drift lines
// Primary grid lines in sunset orange (0xff8c42), secondary in subtle slate (0x3c434f)
const gridHelper = new THREE.GridHelper(350, 175, 0xff8c42, 0x363d47);
gridHelper.position.y = 0.01; // Slightly above ground to avoid z-fighting
scene.add(gridHelper);

// ----------------------------------------------------------------------------
// 4. TRAFFIC CONES (20 OBSTACLES)
// ----------------------------------------------------------------------------
const { conesGroup, coneDataList } = createCones(scene);

// ----------------------------------------------------------------------------
// 5. PROCEDURAL AUTO-RICKSHAW
// ----------------------------------------------------------------------------
const rickshaw = createRickshaw();
scene.add(rickshaw.group);

// Forward spotlight cone originating from the rickshaw's headlight
const headlightBeam = new THREE.SpotLight(0xfff1cf, 2.5, 30, Math.PI / 6, 0.4, 1.2);
headlightBeam.position.set(0, 0.45, 1.2);
rickshaw.frontForkGroup.add(headlightBeam);

const headlightTarget = new THREE.Object3D();
headlightTarget.position.set(0, 0.1, 8.0);
rickshaw.frontForkGroup.add(headlightTarget);
headlightBeam.target = headlightTarget;

// ----------------------------------------------------------------------------
// 6. SPARK PARTICLE SYSTEM (DRIFTING EFFECTS)
// ----------------------------------------------------------------------------
const sparkSystem = new SparkParticleSystem(scene, 80);

// ----------------------------------------------------------------------------
// 7. INPUT CONTROLS (PC KEYBOARD + MOBILE TOUCH BUTTONS)
// ----------------------------------------------------------------------------
const controls = new ControlsManager();

// ----------------------------------------------------------------------------
// 8. VEHICLE PHYSICS STATE & TUNING PARAMETERS
// ----------------------------------------------------------------------------
const vehicle = {
  // World Transform
  position: new THREE.Vector3(0, 0, 0),
  heading: 0, // Yaw angle in radians around the vertical Y axis (facing +Z at 0)
  
  // Velocities
  speed: 0, // Linear forward/reverse speed in units/sec
  maxSpeed: 25.0, // Top forward speed
  maxReverseSpeed: -8.0, // Top reverse speed
  acceleration: 16.0, // Rate of speed increase on Gas
  brakingDecel: 24.0, // Rate of speed decrease on Brake
  naturalFriction: 6.5, // Rolling resistance when coasting

  // Steering & Drift
  steerAngle: 0, // Current angle of front fork / handlebars
  maxSteerAngle: 0.65, // ~37 degrees max lock
  steerResponsiveness: 6.0, // How fast the wheel turns toward input direction
  turnRate: 2.1, // Turning angular velocity
  
  // Drift Mechanics
  isDrifting: false,
  driftYawRateMultiplier: 1.7, // Sharp turning rate while drifting
  lateralSlip: 0, // Sideways sliding velocity

  // Dynamic 3-Wheeler Tilt (Chassis Lean & Pitch)
  bodyRoll: 0, // Z-axis tilt: rickshaw body leans outward on sharp turns
  bodyPitch: 0, // X-axis pitch: nose dives under braking, lifts on acceleration
};

// Reset rickshaw position to center
function resetRickshaw() {
  vehicle.position.set(0, 0, 0);
  vehicle.heading = 0;
  vehicle.speed = 0;
  vehicle.steerAngle = 0;
  vehicle.lateralSlip = 0;
  vehicle.bodyRoll = 0;
  vehicle.bodyPitch = 0;
  rickshaw.group.position.set(0, 0, 0);
  rickshaw.group.rotation.set(0, 0, 0);
  rickshaw.tiltGroup.rotation.set(0, 0, 0);
  rickshaw.frontForkGroup.rotation.y = 0;

  // Reset cone positions
  coneDataList.forEach((c) => {
    c.mesh.position.copy(c.basePos);
    c.mesh.rotation.set(0, 0, 0);
    c.tiltVel.set(0, 0, 0);
    c.isHit = false;
  });
}

// ----------------------------------------------------------------------------
// 9. CHASE CAMERA CONTROLLER
// ----------------------------------------------------------------------------
// Camera state variables
const cameraCurrentPos = new THREE.Vector3(0, 4, -8);
const cameraLookTarget = new THREE.Vector3(0, 1, 0);

function updateChaseCamera(dt) {
  // Speed fraction (0.0 at rest to 1.0 at max speed)
  const speedRatio = Math.min(Math.abs(vehicle.speed) / vehicle.maxSpeed, 1.0);

  // Dynamic distance: camera pulls back further at higher speeds to give speed sensation
  const baseDistance = 6.4;
  const speedPullback = speedRatio * 2.8;
  const followDistance = baseDistance + speedPullback;

  const baseHeight = 3.0;
  const speedHeight = speedRatio * 0.7;
  const followHeight = baseHeight + speedHeight;

  // Direction vehicle is facing
  const forwardX = Math.sin(vehicle.heading);
  const forwardZ = Math.cos(vehicle.heading);

  // Ideal camera position: placed behind the vehicle along its heading vector
  const desiredCamX = vehicle.position.x - forwardX * followDistance;
  const desiredCamZ = vehicle.position.z - forwardZ * followDistance;
  const desiredCamY = vehicle.position.y + followHeight;

  // Smoothly interpolate (lerp) current camera position toward desired position
  // Using exponential decay makes it frame-rate independent!
  const camLerpFactor = 1.0 - Math.exp(-6.0 * dt);
  cameraCurrentPos.lerp(
    new THREE.Vector3(desiredCamX, desiredCamY, desiredCamZ),
    camLerpFactor
  );
  camera.position.copy(cameraCurrentPos);

  // Point camera at the rickshaw with a slight forward and upward look offset
  const desiredLookX = vehicle.position.x + forwardX * 1.5;
  const desiredLookZ = vehicle.position.z + forwardZ * 1.5;
  const desiredLookY = vehicle.position.y + 1.25;

  const lookLerpFactor = 1.0 - Math.exp(-9.0 * dt);
  cameraLookTarget.lerp(
    new THREE.Vector3(desiredLookX, desiredLookY, desiredLookZ),
    lookLerpFactor
  );
  camera.lookAt(cameraLookTarget);

  // Move sunlight target along with vehicle to keep crisp shadows around player
  sunTarget.position.set(vehicle.position.x, 0, vehicle.position.z);
  sunLight.position.set(
    vehicle.position.x + 35,
    30,
    vehicle.position.z + 25
  );
}

// ----------------------------------------------------------------------------
// 10. HUD & UI REFERENCES
// ----------------------------------------------------------------------------
const speedValueEl = document.getElementById('speed-value');
const driftBadgeEl = document.getElementById('drift-badge');
const gearValueEl = document.getElementById('gear-value');

function updateHUD() {
  if (speedValueEl) {
    // Convert units/sec to friendly km/h readout
    const kmh = Math.round(Math.abs(vehicle.speed) * 3.6);
    speedValueEl.textContent = kmh;
  }

  if (driftBadgeEl) {
    if (vehicle.isDrifting) {
      driftBadgeEl.classList.add('active');
    } else {
      driftBadgeEl.classList.remove('active');
    }
  }

  if (gearValueEl) {
    if (vehicle.isDrifting) {
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
}

// ----------------------------------------------------------------------------
// 11. MAIN ANIMATION & GAME LOOP
// ----------------------------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  // Delta time: time in seconds since previous frame (capped to avoid physics explosions on lag spikes)
  const dt = Math.min(clock.getDelta(), 0.05);

  // Check reset request
  if (controls.consumeReset()) {
    resetRickshaw();
  }

  // -----------------------------------------------------------
  // A. INPUT PROCESSING & STEERING
  // -----------------------------------------------------------
  let targetSteer = 0;
  if (controls.state.left) targetSteer += 1;
  if (controls.state.right) targetSteer -= 1;

  // Smooth front fork steering
  const steerSpeed = vehicle.steerResponsiveness * dt;
  vehicle.steerAngle = THREE.MathUtils.lerp(
    vehicle.steerAngle,
    targetSteer * vehicle.maxSteerAngle,
    steerSpeed
  );

  // Turn front fork & handlebars visually
  rickshaw.frontForkGroup.rotation.y = vehicle.steerAngle;

  // -----------------------------------------------------------
  // B. ACCELERATION, BRAKING & NATURAL FRICTION
  // -----------------------------------------------------------
  const isGas = controls.state.gas;
  const isBrake = controls.state.brake;

  if (isGas) {
    // Accelerate forward
    vehicle.speed += vehicle.acceleration * dt;
    if (vehicle.speed > vehicle.maxSpeed) vehicle.speed = vehicle.maxSpeed;
  } else if (isBrake) {
    if (vehicle.speed > 0.5) {
      // Actively brake down to a stop
      vehicle.speed -= vehicle.brakingDecel * dt;
      if (vehicle.speed < 0) vehicle.speed = 0;
    } else {
      // Once stopped, reverse backwards
      vehicle.speed -= vehicle.acceleration * 0.65 * dt;
      if (vehicle.speed < vehicle.maxReverseSpeed) vehicle.speed = vehicle.maxReverseSpeed;
    }
  } else {
    // Natural friction / rolling resistance decelerates the vehicle to rest
    if (vehicle.speed > 0) {
      vehicle.speed -= vehicle.naturalFriction * dt;
      if (vehicle.speed < 0) vehicle.speed = 0;
    } else if (vehicle.speed < 0) {
      vehicle.speed += vehicle.naturalFriction * dt;
      if (vehicle.speed > 0) vehicle.speed = 0;
    }
  }

  // -----------------------------------------------------------
  // C. DRIFT MECHANICS & YAW ROTATION
  // -----------------------------------------------------------
  // Drifting is active when pressing Space/Drift button while having forward speed
  const wantsDrift = controls.state.drift && Math.abs(vehicle.speed) > 4.0;
  vehicle.isDrifting = wantsDrift;

  // Steering only turns the vehicle when moving!
  const speedNormalized = vehicle.speed / vehicle.maxSpeed;
  const speedMagnitude = Math.abs(vehicle.speed);

  if (speedMagnitude > 0.1) {
    // Steering direction inverts naturally when reversing
    const turnDirection = Math.sign(vehicle.speed);
    
    // Higher turn rate when drifting allows whipping the tail around corners!
    const driftMultiplier = vehicle.isDrifting ? vehicle.driftYawRateMultiplier : 1.0;

    // Angular yaw velocity
    const yawDelta =
      vehicle.steerAngle *
      vehicle.turnRate *
      turnDirection *
      driftMultiplier *
      dt;

    vehicle.heading += yawDelta;
  }

  // -----------------------------------------------------------
  // D. DRIFT LATERAL SLIP & POSITION INTEGRATION
  // -----------------------------------------------------------
  // Direction the rickshaw chassis is pointing
  const forwardX = Math.sin(vehicle.heading);
  const forwardZ = Math.cos(vehicle.heading);

  // Perpendicular right vector (for lateral sliding)
  const rightX = Math.cos(vehicle.heading);
  const rightZ = -Math.sin(vehicle.heading);

  // Lateral drift slip: drifting reduces tire lateral grip, causing sideways slide
  if (vehicle.isDrifting && Math.abs(vehicle.steerAngle) > 0.15) {
    // Slip velocity builds up opposite to steer direction
    const slipTarget = -Math.sign(vehicle.steerAngle) * (speedMagnitude * 0.45);
    vehicle.lateralSlip = THREE.MathUtils.lerp(vehicle.lateralSlip, slipTarget, 5.0 * dt);
  } else {
    // Tires grip asphalt firmly, damping sideways slip quickly
    vehicle.lateralSlip = THREE.MathUtils.lerp(vehicle.lateralSlip, 0, 10.0 * dt);
  }

  // Integrate position in world space
  vehicle.position.x += (forwardX * vehicle.speed + rightX * vehicle.lateralSlip) * dt;
  vehicle.position.z += (forwardZ * vehicle.speed + rightZ * vehicle.lateralSlip) * dt;

  // Update root group transform
  rickshaw.group.position.copy(vehicle.position);
  rickshaw.group.rotation.y = vehicle.heading;

  // -----------------------------------------------------------
  // E. 3-WHEEL TILT & LIVELY SUSPENSION DYNAMICS
  // -----------------------------------------------------------
  // 1. Body Roll (Z-axis tilt):
  // Real Indian auto-rickshaws have a high center of gravity and 3-wheel tripod footprint.
  // When cornering hard at speed, the vehicle noticeably leans outward due to centrifugal force!
  const rollIntensity = vehicle.isDrifting ? 0.32 : 0.22;
  const targetRoll = - (vehicle.steerAngle / vehicle.maxSteerAngle) * (speedMagnitude / vehicle.maxSpeed) * rollIntensity;
  vehicle.bodyRoll = THREE.MathUtils.lerp(vehicle.bodyRoll, targetRoll, 8.0 * dt);

  // 2. Body Pitch (X-axis tilt):
  // Nose dives forward when braking hard, and squats back slightly during acceleration
  let targetPitch = 0;
  if (isBrake && vehicle.speed > 1.0) {
    targetPitch = 0.08; // Nose dives
  } else if (isGas && vehicle.speed < vehicle.maxSpeed * 0.8) {
    targetPitch = -0.04; // Nose lifts
  }

  // Road vibration wobble when traveling at speed
  const bumpWobble = speedMagnitude > 2.0 ? Math.sin(clock.getElapsedTime() * 18.0) * 0.008 : 0;
  vehicle.bodyPitch = THREE.MathUtils.lerp(vehicle.bodyPitch, targetPitch + bumpWobble, 7.0 * dt);

  // Apply tilt to the rickshaw's body group
  rickshaw.tiltGroup.rotation.z = vehicle.bodyRoll;
  rickshaw.tiltGroup.rotation.x = vehicle.bodyPitch;

  // -----------------------------------------------------------
  // F. WHEEL VISUAL ROTATION (SPIN WITH SPEED)
  // -----------------------------------------------------------
  // Wheel radius ~0.32m -> angular speed = linear speed / radius
  const wheelRadius = 0.32;
  const wheelSpinDelta = (vehicle.speed / wheelRadius) * dt;

  rickshaw.frontWheel.rotation.x += wheelSpinDelta;
  rickshaw.rearLeftWheel.rotation.x += wheelSpinDelta;
  rickshaw.rearRightWheel.rotation.x += wheelSpinDelta;

  // -----------------------------------------------------------
  // G. DRIFT SPARK EMISSION
  // -----------------------------------------------------------
  // Emit fiery yellow/orange sparks from the rear wheels when drifting or turning aggressively
  if (vehicle.isDrifting || (speedMagnitude > 14.0 && Math.abs(vehicle.steerAngle) > 0.4)) {
    // World positions of rear wheels
    const forwardVec = new THREE.Vector3(forwardX, 0, forwardZ);
    
    // Left wheel contact point
    const leftWheelPos = new THREE.Vector3(-0.66, 0.05, -0.65)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicle.heading)
      .add(vehicle.position);

    // Right wheel contact point
    const rightWheelPos = new THREE.Vector3(0.66, 0.05, -0.65)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicle.heading)
      .add(vehicle.position);

    // Emit 1-2 sparks per frame for crisp visual density
    sparkSystem.emitSpark(leftWheelPos, forwardVec);
    sparkSystem.emitSpark(rightWheelPos, forwardVec);
  }

  // Update spark particles
  sparkSystem.update(dt, camera);

  // -----------------------------------------------------------
  // H. TRAFFIC CONE NUDGES & ARCADE BOUNCE
  // -----------------------------------------------------------
  coneDataList.forEach((cone) => {
    // Distance from rickshaw center to cone
    const distSq = vehicle.position.distanceToSquared(cone.mesh.position);
    const hitRadius = 1.35; // Rickshaw boundary + cone base radius

    if (distSq < hitRadius * hitRadius) {
      // Collision detected! Nudge cone outward
      const nudgeDir = cone.mesh.position.clone().sub(vehicle.position).normalize();
      
      // Bump cone slightly along nudge direction
      cone.mesh.position.addScaledVector(nudgeDir, 0.06);

      // Give cone a fun arcade tilt velocity
      cone.tiltVel.x += (Math.random() - 0.5) * 8.0;
      cone.tiltVel.z += (Math.random() - 0.5) * 8.0;
      cone.isHit = true;
    }

    // Cone spring physics if nudged
    if (cone.isHit) {
      cone.mesh.rotation.x += cone.tiltVel.x * dt;
      cone.mesh.rotation.z += cone.tiltVel.z * dt;

      // Spring back to upright with damping
      cone.tiltVel.x -= cone.mesh.rotation.x * 25.0 * dt;
      cone.tiltVel.z -= cone.mesh.rotation.z * 25.0 * dt;
      cone.tiltVel.multiplyScalar(0.92);
    }
  });

  // -----------------------------------------------------------
  // I. CHASE CAMERA & HUD
  // -----------------------------------------------------------
  updateChaseCamera(dt);
  updateHUD();

  // Render final frame
  renderer.render(scene, camera);
}

// Start game loop once DOM is ready
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

