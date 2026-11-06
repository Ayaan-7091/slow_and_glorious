import * as THREE from 'three';
import { createRickshaw } from './createRickshaw.js';
import { NitroFlameSystem } from './particles.js';

/**
 * ============================================================================
 * AI RIVAL AUTO-RICKSHAWS SYSTEM (Pure Parametric Curve-Space Movement)
 * ============================================================================
 * 
 * Fixes for Tilt, Slant & Collisions:
 *  1. Zero Slant / Crab-Walking:
 *     rival.instance.group.rotation.y is ALWAYS strictly aligned with the track
 *     tangent (tangentYaw). The vehicle body drives 100% straight down the road.
 *     Only the front fork / handlebar turns when steering.
 *  2. Natural, Subtle Lean (No Extreme Tilt):
 *     bodyRoll is computed from true curvature kappa = dyaw / ds and capped
 *     to max +/- 0.06 radians (~3.4 degrees). On straights it stays upright.
 *  3. Dedicated 3-Lane Dispersal:
 *     - Raju: Left lane (-2.8m)
 *     - Munna: Center lane (0.0m)
 *     - Babloo: Right lane (+2.8m)
 *     All competitors start in separate non-overlapping lanes and race side-by-side
 *     without crossing or crashing into each other.
 *  4. Soft Lateral Repulsion:
 *     If vehicles ever touch, a gentle lateral spring pushes their laneOffset
 *     apart smoothly without any jitter or stopping.
 */

export function createRivals(scene, trackCurve, trackWidth = 14.0, track = null) {
  const rivalsGroup = new THREE.Group();
  rivalsGroup.name = 'AI_Rivals_Group';

  const aiFlameSystem = new NitroFlameSystem(scene, 40);
  const trackTotalLength = trackCurve.getLength();
  const trackHalfWidth = trackWidth / 2;
  const maxLaneOffset = trackHalfWidth * 0.65; // [-4.55m, +4.55m] strictly on road

  let currentDifficulty = 'MEDIUM';
  let lastCollisionThudTime = 0;

  const difficultyTuning = {
    EASY: {
      speedScale: 0.85,
      accel: 13.0,
      boostChance: 0.08,
      rubberBandMax: 1.0,
    },
    MEDIUM: {
      speedScale: 1.02,
      accel: 16.5,
      boostChance: 0.22,
      rubberBandMax: 1.12,
    },
    HARD: {
      speedScale: 1.15,
      accel: 22.0,
      boostChance: 0.45,
      rubberBandMax: 1.25,
    },
  };

  // Helper to create a floating billboard name tag pill
  function createNameTagSprite(name, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(18, 14, 22, 0.88)';
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 48, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.arc(36, 32, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 58, 33);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.8, 0.45, 1);
    sprite.position.set(0, 2.45, 0);
    return sprite;
  }

  // 3 AI Competitors with dedicated, non-overlapping starting lanes:
  // - Raju: Front Row Left (-2.8m, longitudinal 0.0)
  // - (Player): Front Row Right (+2.4m, longitudinal 0.0)
  // - Munna: Row 2 Center (0.0m, longitudinal -8.0)
  // - Babloo: Row 2 Far Right (+2.8m, longitudinal -8.0)
  const rivalsConfig = [
    {
      id: 'rival_1',
      name: 'Raju',
      bodyColor: 0x1db954, // Green & Yellow
      trimColor: 0xffcc00,
      canopyColor: 0x1c1e21,
      tagColor: '#1db954',
      baseSpeed: 24.8, // m/s (~89 km/h)
      homeLane: -2.8,  // Left lane
      gridLateral: -2.8,
      gridLongitudinal: 0.0,
    },
    {
      id: 'rival_2',
      name: 'Munna',
      bodyColor: 0x00c4ff, // Electric Cyan & Black
      trimColor: 0x111111,
      canopyColor: 0x0a192f,
      tagColor: '#00c4ff',
      baseSpeed: 24.2, // m/s (~87 km/h)
      homeLane: 0.0,   // Center lane
      gridLateral: 0.0,
      gridLongitudinal: -8.0,
    },
    {
      id: 'rival_3',
      name: 'Babloo',
      bodyColor: 0xff2a85, // Vibrant Pink & Gold
      trimColor: 0xffd500,
      canopyColor: 0x181818,
      tagColor: '#ff2a85',
      baseSpeed: 23.5, // m/s (~85 km/h)
      homeLane: 2.8,   // Right lane
      gridLateral: 2.8,
      gridLongitudinal: -8.0,
    },
  ];

  const rivals = [];

  rivalsConfig.forEach((cfg) => {
    const instance = createRickshaw({
      name: cfg.name,
      bodyColor: cfg.bodyColor,
      trimColor: cfg.trimColor,
      canopyColor: cfg.canopyColor,
    });

    const nameTag = createNameTagSprite(cfg.name, cfg.tagColor);
    instance.group.add(nameTag);

    // Initial curve-space coordinates
    const initialT = (1.0 + cfg.gridLongitudinal / trackTotalLength) % 1.0;
    const initialLane = cfg.gridLateral;
    const initialProgress = initialT > 0.85 ? (initialT - 1.0) : initialT;

    // Direct world position from curve
    const centerPt = trackCurve.getPointAt(initialT);
    centerPt.y = 0;
    const tan = trackCurve.getTangentAt(initialT).normalize();
    tan.y = 0;
    tan.normalize();
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const startYaw = Math.atan2(tan.x, tan.z);

    const initialPos = centerPt.clone().addScaledVector(right, initialLane);
    instance.group.position.copy(initialPos);
    instance.group.rotation.y = startYaw;

    rivalsGroup.add(instance.group);

    rivals.push({
      ...cfg,
      instance: instance,
      position: initialPos.clone(),
      heading: startYaw,
      speed: 0,
      acceleration: 16.5,
      bodyRoll: 0,
      bodyPitch: 0,

      // PURE CURVE-SPACE STATE
      t: initialT,
      initialT: initialT,
      laneOffset: initialLane,
      initialLaneOffset: initialLane,
      targetLaneOffset: initialLane,
      laneTimer: 2.0 + Math.random() * 3.0,

      // Track progress
      completedLaps: 0,
      hasReachedHalfway: false,
      totalProgress: initialProgress,

      // Nitro boost
      isBoosting: false,
      boostTimer: 2.0 + Math.random() * 4.0,

      // Honk cooldown
      honkTimer: 3.0 + Math.random() * 6.0,
    });
  });

  scene.add(rivalsGroup);

  function setDifficulty(diff) {
    if (difficultyTuning[diff]) {
      currentDifficulty = diff;
      const tuning = difficultyTuning[diff];
      rivals.forEach((r) => {
        r.acceleration = tuning.accel;
      });
    }
  }

  /**
   * Main AI Update Loop using PURE PARAMETRIC CURVE-SPACE MOVEMENT
   */
  function updateRivals(dt, playerPos, playerProgress, audio, raceActive, camera, playerVehicle = null) {
    const tuning = difficultyTuning[currentDifficulty];

    rivals.forEach((rival, rivalIdx) => {
      // ----------------------------------------------------------------------
      // 1. LOCKED AT GRID BEFORE RACE START
      // ----------------------------------------------------------------------
      if (!raceActive) {
        rival.speed = 0;
        const centerPt = trackCurve.getPointAt(rival.t);
        centerPt.y = 0;
        const tan = trackCurve.getTangentAt(rival.t).normalize();
        tan.y = 0;
        tan.normalize();
        const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
        rival.position.copy(centerPt).addScaledVector(right, rival.laneOffset);
        rival.heading = Math.atan2(tan.x, tan.z);

        rival.instance.group.position.copy(rival.position);
        rival.instance.group.rotation.y = rival.heading;
        rival.instance.tiltGroup.rotation.z = 0;
        rival.instance.frontForkGroup.rotation.y = 0;
        return;
      }

      // ----------------------------------------------------------------------
      // 2. NITRO BOOST LOGIC
      // ----------------------------------------------------------------------
      rival.boostTimer -= dt;
      if (rival.boostTimer <= 0) {
        if (!rival.isBoosting) {
          if (Math.random() < tuning.boostChance) {
            rival.isBoosting = true;
            rival.boostTimer = 2.2 + Math.random() * 1.5;
          } else {
            rival.boostTimer = 3.5 + Math.random() * 3.0;
          }
        } else {
          rival.isBoosting = false;
          rival.boostTimer = 5.0 + Math.random() * 4.0;
        }
      }

      // ----------------------------------------------------------------------
      // 3. TARGET SPEED, DIFFICULTY & RUBBER-BANDING
      // ----------------------------------------------------------------------
      let targetSpeed = rival.baseSpeed * tuning.speedScale;
      if (rival.isBoosting) {
        targetSpeed += 10.5;
      }

      const progressDiff = playerProgress - rival.totalProgress;
      if (progressDiff > 0.02 && tuning.rubberBandMax > 1.0) {
        const catchUpFactor = THREE.MathUtils.clamp(1.0 + progressDiff * 1.2, 1.0, tuning.rubberBandMax);
        targetSpeed *= catchUpFactor;
      }

      if (rival.speed < targetSpeed) {
        rival.speed += rival.acceleration * dt;
        if (rival.speed > targetSpeed) rival.speed = targetSpeed;
      } else {
        rival.speed -= 16.0 * dt;
        if (rival.speed < targetSpeed) rival.speed = targetSpeed;
      }

      // ----------------------------------------------------------------------
      // 4. ADVANCE ALONG TRACK CURVE (ai.t)
      // ----------------------------------------------------------------------
      const prevT = rival.t;
      rival.t = (rival.t + (rival.speed / trackTotalLength) * dt) % 1.0;

      // Lap completion detection: requires passing through halfway (t > 0.45)
      // to avoid triggering lap completion at the start grid
      if (rival.t > 0.4 && rival.t < 0.6) {
        rival.hasReachedHalfway = true;
      }
      if (prevT > 0.85 && rival.t < 0.15 && rival.hasReachedHalfway) {
        rival.completedLaps++;
        rival.hasReachedHalfway = false;
      }

      // If on Lap 1 and still behind the start line, progress is negative
      const lapT = (rival.completedLaps === 0 && rival.t > 0.85) ? (rival.t - 1.0) : rival.t;
      rival.totalProgress = rival.completedLaps * 1.0 + lapT;

      // ----------------------------------------------------------------------
      // 5. STABLE LANE LOGIC (Centered around dedicated home lane)
      // ----------------------------------------------------------------------
      rival.laneTimer -= dt;
      if (rival.laneTimer <= 0) {
        rival.laneTimer = 2.5 + Math.random() * 2.5;
        // Subtle natural drift around their dedicated home lane (+/- 0.4m)
        const laneVariance = (Math.random() - 0.5) * 0.8;
        rival.targetLaneOffset = rival.homeLane + laneVariance;
      }

      // Steer smoothly around nearby traffic cones
      if (track && track.trackCones) {
        for (let c = 0; c < track.trackCones.length; c++) {
          const cone = track.trackCones[c];
          if (!cone.isAirborne) {
            const distToCone = rival.position.distanceTo(cone.mesh.position);
            if (distToCone < 10.0) {
              const toCone = cone.mesh.position.clone().sub(rival.position);
              const tanNow = trackCurve.getTangentAt(rival.t).normalize();
              if (toCone.dot(tanNow) > 0) {
                const rightNow = new THREE.Vector3(-tanNow.z, 0, tanNow.x).normalize();
                const coneLat = toCone.dot(rightNow);
                if (Math.abs(coneLat) < 1.8) {
                  // Bias away from cone
                  rival.targetLaneOffset = rival.homeLane + (coneLat > 0 ? -1.4 : 1.4);
                }
              }
            }
          }
        }
      }

      // Steer smoothly around player if close ahead in the same lane
      const distToPlayer = rival.position.distanceTo(playerPos);
      if (distToPlayer < 12.0) {
        const toPlayer = playerPos.clone().sub(rival.position);
        const tanNow = trackCurve.getTangentAt(rival.t).normalize();
        if (toPlayer.dot(tanNow) > 0) {
          const rightNow = new THREE.Vector3(-tanNow.z, 0, tanNow.x).normalize();
          const playerLat = toPlayer.dot(rightNow);
          if (Math.abs(playerLat) < 2.0) {
            rival.targetLaneOffset = rival.homeLane + (playerLat > 0 ? -1.6 : 1.6);
          }
        }
      }

      // Smoothly lerp toward target lane offset
      const prevLane = rival.laneOffset;
      rival.laneOffset = THREE.MathUtils.lerp(rival.laneOffset, rival.targetLaneOffset, 2.2 * dt);
      rival.laneOffset = THREE.MathUtils.clamp(rival.laneOffset, -maxLaneOffset, maxLaneOffset);
      const laneChangeVelocity = (rival.laneOffset - prevLane) / Math.max(dt, 0.001);

      // ----------------------------------------------------------------------
      // 6. COMPUTE WORLD POSITION & ORIENTATION (ZERO SLANT)
      // ----------------------------------------------------------------------
      const centerPt = trackCurve.getPointAt(rival.t);
      centerPt.y = 0;
      const tangent = trackCurve.getTangentAt(rival.t).normalize();
      tangent.y = 0;
      tangent.normalize();
      const right = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      // World position: centerline + lateral lane offset
      rival.position.copy(centerPt).addScaledVector(right, rival.laneOffset);
      rival.instance.group.position.copy(rival.position);

      // HEADING IS STRICTLY ALIGNED WITH THE ROAD TANGENT (0 SLANT!)
      // The vehicle body ALWAYS drives 100% straight down the road.
      const tangentYaw = Math.atan2(tangent.x, tangent.z);
      rival.heading = tangentYaw;
      rival.instance.group.rotation.y = tangentYaw;

      // Front wheel steering visual: only the front fork turns to show steering!
      const steerVisual = THREE.MathUtils.clamp(
        (laneChangeVelocity / Math.max(rival.speed, 5.0)) * 0.9,
        -0.35,
        0.35
      );
      rival.instance.frontForkGroup.rotation.y = steerVisual;

      // ----------------------------------------------------------------------
      // 7. SUBTLE, REALISTIC BODY ROLL (NO EXTREME TILT)
      // ----------------------------------------------------------------------
      // Measure true curvature kappa = dyaw / ds
      const deltaT = 0.01;
      const aheadTan = trackCurve.getTangentAt((rival.t + deltaT) % 1.0).normalize();
      const yaw1 = tangentYaw;
      const yaw2 = Math.atan2(aheadTan.x, aheadTan.z);
      let dYaw = yaw2 - yaw1;
      while (dYaw > Math.PI) dYaw -= Math.PI * 2;
      while (dYaw < -Math.PI) dYaw += Math.PI * 2;

      const ds = deltaT * trackTotalLength;
      const kappa = dYaw / Math.max(ds, 1.0);
      const speedRatio = Math.min(rival.speed / 25.0, 1.2);

      // Capped to a subtle +/- 0.06 rad (~3.4 deg) lean on turns, 0 on straights
      const targetRoll = THREE.MathUtils.clamp(-kappa * 8.0 * speedRatio, -0.06, 0.06);
      rival.bodyRoll = THREE.MathUtils.lerp(rival.bodyRoll, targetRoll, 8.0 * dt);
      rival.instance.tiltGroup.rotation.z = rival.bodyRoll;

      // Wheel rotation
      const wheelSpin = (rival.speed / 0.32) * dt;
      rival.instance.frontWheel.rotation.x += wheelSpin;
      rival.instance.rearLeftWheel.rotation.x += wheelSpin;
      rival.instance.rearRightWheel.rotation.x += wheelSpin;

      // ----------------------------------------------------------------------
      // 8. NITRO EXHAUST FLAME PARTICLES
      // ----------------------------------------------------------------------
      if (rival.isBoosting) {
        const exhaustPos = new THREE.Vector3(-0.45, 0.26, -1.45)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), rival.heading)
          .add(rival.position);
        const forwardVec = new THREE.Vector3(Math.sin(rival.heading), 0, Math.cos(rival.heading));
        aiFlameSystem.emitFlame(exhaustPos, forwardVec);
      }

      // ----------------------------------------------------------------------
      // 9. PLAYER-TO-AI LATERAL COLLISION RESOLUTION
      // ----------------------------------------------------------------------
      if (distToPlayer < 2.2) {
        const toPlayer = playerPos.clone().sub(rival.position);
        toPlayer.y = 0;
        const latSide = toPlayer.dot(right);
        const pushAmount = 3.2 * dt;

        if (latSide >= 0) {
          // Player is on right of AI: push AI left, player right
          rival.laneOffset = THREE.MathUtils.clamp(rival.laneOffset - pushAmount, -maxLaneOffset, maxLaneOffset);
          if (playerVehicle) {
            playerVehicle.position.addScaledVector(right, pushAmount * 1.2);
            playerVehicle.speed *= 0.985;
          }
        } else {
          // Player is on left of AI: push AI right, player left
          rival.laneOffset = THREE.MathUtils.clamp(rival.laneOffset + pushAmount, -maxLaneOffset, maxLaneOffset);
          if (playerVehicle) {
            playerVehicle.position.addScaledVector(right, -pushAmount * 1.2);
            playerVehicle.speed *= 0.985;
          }
        }
        rival.speed *= 0.985;

        const now = performance.now();
        if (now - lastCollisionThudTime > 400) {
          if (audio && audio.playBumperThud) {
            audio.playBumperThud();
          }
          lastCollisionThudTime = now;
        }
      }

      // ----------------------------------------------------------------------
      // 10. AI-TO-AI MUTUAL SOFT LATERAL REPULSION (NO JITTER / BUNCHING)
      // ----------------------------------------------------------------------
      for (let j = rivalIdx + 1; j < rivals.length; j++) {
        const other = rivals[j];
        const dx = rival.position.x - other.position.x;
        const dz = rival.position.z - other.position.z;
        const distSq = dx * dx + dz * dz;
        const minSpacing = 2.2;

        if (distSq < minSpacing * minSpacing && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const overlap = (minSpacing - dist) * 0.5;
          const push = Math.min(overlap, 2.0 * dt);

          if (rival.laneOffset < other.laneOffset) {
            rival.laneOffset = THREE.MathUtils.clamp(rival.laneOffset - push, -maxLaneOffset, maxLaneOffset);
            other.laneOffset = THREE.MathUtils.clamp(other.laneOffset + push, -maxLaneOffset, maxLaneOffset);
          } else {
            rival.laneOffset = THREE.MathUtils.clamp(rival.laneOffset + push, -maxLaneOffset, maxLaneOffset);
            other.laneOffset = THREE.MathUtils.clamp(other.laneOffset - push, -maxLaneOffset, maxLaneOffset);
          }
        }
      }

      // ----------------------------------------------------------------------
      // 11. PROXIMITY HORN HONKING
      // ----------------------------------------------------------------------
      rival.honkTimer -= dt;
      if (distToPlayer < 8.0 && rival.honkTimer <= 0) {
        rival.honkTimer = 5.0 + Math.random() * 8.0;
        if (audio && Math.random() < 0.35) {
          audio.playHorn();
        }
      }
    });

    aiFlameSystem.update(dt, camera);
  }

  /**
   * Resets all AI rivals back to their starting grid slots
   */
  function resetRivals() {
    rivals.forEach((rival) => {
      rival.t = rival.initialT;
      rival.laneOffset = rival.initialLaneOffset;
      rival.targetLaneOffset = rival.initialLaneOffset;
      rival.speed = 0;
      rival.completedLaps = 0;
      rival.hasReachedHalfway = false;
      rival.totalProgress = rival.initialT > 0.85 ? (rival.initialT - 1.0) : rival.initialT;
      rival.bodyRoll = 0;
      rival.bodyPitch = 0;
      rival.isBoosting = false;

      const centerPt = trackCurve.getPointAt(rival.t);
      centerPt.y = 0;
      const tan = trackCurve.getTangentAt(rival.t).normalize();
      tan.y = 0;
      tan.normalize();
      const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      rival.position.copy(centerPt).addScaledVector(right, rival.laneOffset);
      rival.heading = Math.atan2(tan.x, tan.z);

      rival.instance.group.position.copy(rival.position);
      rival.instance.group.rotation.set(0, rival.heading, 0);
      rival.instance.tiltGroup.rotation.set(0, 0, 0);
      rival.instance.frontForkGroup.rotation.y = 0;
    });
  }

  return {
    rivalsGroup,
    rivals,
    updateRivals,
    resetRivals,
    setDifficulty,
    getDifficulty: () => currentDifficulty,
  };
}
