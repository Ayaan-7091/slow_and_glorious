import * as THREE from 'three';

/**
 * ============================================================================
 * INDIAN STREET HAZARDS & ROAD OBSTACLES (Sprint 9)
 * ============================================================================
 * 
 * Features:
 *  1. Friendly Low-Poly Stray Street Cow (Zebu / Bos indicus):
 *     - Resting peacefully at the roadside shoulder (t ≈ 0.35, offset -4.4m)
 *     - Distinctive dorsal hump, curved horns, and festive marigold garland
 *     - Idle chewing animation; perks head up and wiggles ears when horn is blown!
 *  2. Yellow & Black Painted Speed-Breakers (Speed Bumps):
 *     - Positioned at t = 0.22 and t = 0.68 across the full road width
 *     - Diagonal chevron hazard warning texture
 *     - Causes violent vertical suspension launch, pitch recoil, and camera shake
 *       when traversed at high speed.
 */

/**
 * Procedural Yellow & Black Hazard Chevron Texture for Speed Bumps
 */
function createSpeedBreakerTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1c1b18';
  ctx.fillRect(0, 0, 512, 128);

  // High-visibility safety yellow diagonal chevron bands
  ctx.fillStyle = '#ffcc00';
  const bandWidth = 36;
  const spacing = 72;
  for (let x = -100; x < 650; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + bandWidth, 0);
    ctx.lineTo(x + bandWidth + 50, 128);
    ctx.lineTo(x + 50, 128);
    ctx.closePath();
    ctx.fill();
  }

  // Weathering grit and tire dirt marks
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 128;
    const rw = 2 + Math.random() * 6;
    const rh = 1 + Math.random() * 3;
    ctx.fillRect(rx, ry, rw, rh);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(4, 1);
  return tex;
}

/**
 * Roadside Warning Sign Texture for Speed Breaker
 */
function createWarningSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Yellow diamond background
  ctx.fillStyle = '#ffc300';
  ctx.beginPath();
  ctx.moveTo(128, 8);
  ctx.lineTo(248, 128);
  ctx.lineTo(128, 248);
  ctx.lineTo(8, 128);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 10;
  ctx.stroke();

  // Speed bump double-hump icon in black
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(88, 138, 26, Math.PI, 0, false);
  ctx.arc(168, 138, 26, Math.PI, 0, false);
  ctx.lineTo(205, 148);
  ctx.lineTo(51, 148);
  ctx.closePath();
  ctx.fill();

  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPEED BUMP', 128, 195);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('गति नियंत्रक', 128, 222);

  return new THREE.CanvasTexture(canvas);
}

export function createObstacles(scene, trackCurve, trackWidth = 14.0) {
  const obstaclesGroup = new THREE.Group();
  obstaclesGroup.name = 'Indian_Street_Hazards';

  // ==========================================================================
  // 1. SPEED-BREAKERS (SPEED BUMPS)
  // ==========================================================================
  const bumpTexture = createSpeedBreakerTexture();
  const warningSignTex = createWarningSignTexture();

  const bumpMat = new THREE.MeshStandardMaterial({
    map: bumpTexture,
    roughness: 0.85,
    metalness: 0.1,
  });

  const signMat = new THREE.MeshBasicMaterial({
    map: warningSignTex,
    side: THREE.DoubleSide,
  });
  const postMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.7,
    roughness: 0.4,
  });

  const speedBumps = [];
  const bumpLocations = [0.22, 0.68]; // Two strategic locations along the circuit

  bumpLocations.forEach((tVal, bIdx) => {
    const pt = trackCurve.getPointAt(tVal);
    pt.y = 0.08;
    const tan = trackCurve.getTangentAt(tVal).normalize();
    const normal = new THREE.Vector3(-tan.z, 0, tan.x);
    const yaw = Math.atan2(tan.x, tan.z);

    const bumpGroup = new THREE.Group();
    bumpGroup.position.copy(pt);
    bumpGroup.rotation.y = yaw;

    // Arched bump hump spanning the road
    // Width = trackWidth + 0.4, Length along track = 2.4m, Height = 0.22m
    const bumpGeo = new THREE.BoxGeometry(trackWidth + 0.4, 0.22, 2.2);
    const bumpMesh = new THREE.Mesh(bumpGeo, bumpMat);
    bumpMesh.position.y = 0.06;
    bumpMesh.rotation.y = Math.PI / 2; // Orient across the track width
    bumpMesh.castShadow = true;
    bumpMesh.receiveShadow = true;
    bumpGroup.add(bumpMesh);

    // Roadside Warning Sign on sidewalk (curb edge)
    const signGroup = new THREE.Group();
    signGroup.position.set(trackWidth / 2 + 1.8, 0, 0);

    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8);
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.y = 1.4;
    signGroup.add(post);

    const diamondGeo = new THREE.PlaneGeometry(1.3, 1.3);
    const sign = new THREE.Mesh(diamondGeo, signMat);
    sign.position.set(0, 2.5, 0);
    sign.rotation.y = Math.PI / 2;
    signGroup.add(sign);

    bumpGroup.add(signGroup);
    obstaclesGroup.add(bumpGroup);

    speedBumps.push({
      t: tVal,
      position: pt,
      lastHitTime: -10,
    });
  });

  // ==========================================================================
  // 2. FRIENDLY LOW-POLY STRAY STREET COW (Zebu)
  // ==========================================================================
  const cowGroup = new THREE.Group();
  cowGroup.name = 'Stray_Street_Cow';

  const cowT = 0.35;
  const cowPt = trackCurve.getPointAt(cowT);
  const cowTan = trackCurve.getTangentAt(cowT).normalize();
  const cowNormal = new THREE.Vector3(-cowTan.z, 0, cowTan.x);
  const cowYaw = Math.atan2(cowTan.x, cowTan.z);

  // Position cow comfortably at roadside shoulder (offset -4.4m from center)
  const cowOffset = -4.4;
  cowGroup.position.set(
    cowPt.x + cowNormal.x * cowOffset,
    0.05,
    cowPt.z + cowNormal.z * cowOffset
  );
  // Cow rests facing diagonally across the road
  cowGroup.rotation.y = cowYaw + 0.45;

  // Materials
  const cowWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf5eee6,
    roughness: 0.88,
    metalness: 0.05,
    flatShading: true,
  });
  const cowSpotMat = new THREE.MeshStandardMaterial({
    color: 0xc8b8a8,
    roughness: 0.88,
    metalness: 0.05,
    flatShading: true,
  });
  const cowSnoutMat = new THREE.MeshStandardMaterial({
    color: 0xe6a8b2,
    roughness: 0.9,
    metalness: 0.0,
  });
  const hornMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.5,
    metalness: 0.3,
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const garlandMat = new THREE.MeshStandardMaterial({
    color: 0xff7700,
    roughness: 0.7,
  });
  const bellMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    metalness: 0.85,
    roughness: 0.2,
  });

  // A. Main Body / Torso (Resting / sitting pose)
  const bodyGeo = new THREE.BoxGeometry(1.3, 0.95, 2.2);
  const body = new THREE.Mesh(bodyGeo, cowWhiteMat);
  body.position.set(0, 0.55, 0);
  body.castShadow = true;
  cowGroup.add(body);

  // Distinctive Desi Zebu Hump over shoulders
  const humpGeo = new THREE.ConeGeometry(0.38, 0.55, 8);
  const hump = new THREE.Mesh(humpGeo, cowSpotMat);
  hump.rotation.x = -0.2;
  hump.position.set(0, 1.25, 0.45);
  hump.castShadow = true;
  cowGroup.add(hump);

  // Flank spots
  const spotGeo = new THREE.BoxGeometry(1.32, 0.5, 0.9);
  const spot = new THREE.Mesh(spotGeo, cowSpotMat);
  spot.position.set(0, 0.6, -0.3);
  cowGroup.add(spot);

  // Folded Legs (Resting tucked under belly)
  const legGeo = new THREE.BoxGeometry(0.35, 0.28, 0.9);
  for (let lx of [-0.55, 0.55]) {
    for (let lz of [-0.65, 0.65]) {
      const leg = new THREE.Mesh(legGeo, cowWhiteMat);
      leg.position.set(lx, 0.16, lz);
      cowGroup.add(leg);
    }
  }

  // B. Neck & Interactive Head Group
  const neckHeadGroup = new THREE.Group();
  neckHeadGroup.position.set(0, 0.85, 0.95);

  // Neck
  const neckGeo = new THREE.BoxGeometry(0.65, 0.7, 0.75);
  const neck = new THREE.Mesh(neckGeo, cowWhiteMat);
  neck.position.set(0, 0.2, 0.2);
  neck.rotation.x = -0.3;
  neckHeadGroup.add(neck);

  // Festive Marigold Garland (Genda Phool) around neck
  for (let g = 0; g < 8; g++) {
    const angle = (g / 8) * Math.PI * 2;
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), garlandMat);
    flower.position.set(
      Math.cos(angle) * 0.42,
      0.18 + Math.sin(angle) * 0.35,
      0.25 + Math.sin(angle) * 0.1
    );
    neckHeadGroup.add(flower);
  }
  // Tiny brass bell at bottom of garland
  const bell = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 8), bellMat);
  bell.position.set(0, -0.18, 0.38);
  bell.rotation.x = Math.PI;
  neckHeadGroup.add(bell);

  // Head
  const headGeo = new THREE.BoxGeometry(0.68, 0.68, 0.95);
  const head = new THREE.Mesh(headGeo, cowWhiteMat);
  head.position.set(0, 0.42, 0.65);
  head.castShadow = true;
  neckHeadGroup.add(head);

  // Snout / Muzzle
  const snoutGeo = new THREE.BoxGeometry(0.58, 0.42, 0.45);
  const snout = new THREE.Mesh(snoutGeo, cowSnoutMat);
  snout.position.set(0, 0.3, 1.15);
  neckHeadGroup.add(snout);

  // Nostrils
  const nostrilGeo = new THREE.SphereGeometry(0.04, 6, 6);
  for (let nx of [-0.14, 0.14]) {
    const nostril = new THREE.Mesh(nostrilGeo, eyeMat);
    nostril.position.set(nx, 0.35, 1.38);
    neckHeadGroup.add(nostril);
  }

  // Kind Dark Eyes
  const eyeGeo = new THREE.SphereGeometry(0.065, 8, 8);
  for (let ex of [-0.36, 0.36]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(ex, 0.52, 0.78);
    neckHeadGroup.add(eye);
  }

  // Drooping Ears
  const earGeo = new THREE.BoxGeometry(0.35, 0.1, 0.18);
  const leftEar = new THREE.Mesh(earGeo, cowWhiteMat);
  leftEar.position.set(-0.48, 0.55, 0.45);
  leftEar.rotation.z = -0.35;
  const rightEar = new THREE.Mesh(earGeo, cowWhiteMat);
  rightEar.position.set(0.48, 0.55, 0.45);
  rightEar.rotation.z = 0.35;
  neckHeadGroup.add(leftEar, rightEar);

  // Curved Dark Horns
  const hornGeo = new THREE.ConeGeometry(0.08, 0.45, 8);
  const leftHorn = new THREE.Mesh(hornGeo, hornMat);
  leftHorn.position.set(-0.28, 0.82, 0.45);
  leftHorn.rotation.set(-0.25, 0, -0.45);

  const rightHorn = new THREE.Mesh(hornGeo, hornMat);
  rightHorn.position.set(0.28, 0.82, 0.45);
  rightHorn.rotation.set(-0.25, 0, 0.45);
  neckHeadGroup.add(leftHorn, rightHorn);

  cowGroup.add(neckHeadGroup);

  // Tail curled along flank
  const tailGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.85, 6);
  const tail = new THREE.Mesh(tailGeo, cowWhiteMat);
  tail.position.set(0.45, 0.35, -1.05);
  tail.rotation.set(0.6, 0, 0.8);
  cowGroup.add(tail);

  obstaclesGroup.add(cowGroup);
  scene.add(obstaclesGroup);

  // Cow Animation & Horn State
  let hornReactionTimer = 0;
  let chewPhase = 0;

  function reactToHorn() {
    hornReactionTimer = 2.8; // 2.8 seconds of lively comic reaction
  }

  function update(dt, vehicle, audio, addCameraTrauma) {
    chewPhase += dt * 3.5;

    // 1. COW ANIMATION
    if (hornReactionTimer > 0) {
      hornReactionTimer -= dt;
      // Alert, startled head perk and quizzical ear wiggle
      const perk = Math.sin(hornReactionTimer * 14.0) * 0.16;
      neckHeadGroup.rotation.y = Math.sin(hornReactionTimer * 12.0) * 0.28;
      neckHeadGroup.rotation.x = -0.15 + Math.sin(hornReactionTimer * 8.0) * 0.1;
      leftEar.rotation.z = -0.35 + perk * 2.5;
      rightEar.rotation.z = 0.35 - perk * 2.5;
      tail.rotation.z = 0.8 + Math.sin(hornReactionTimer * 16.0) * 0.4;
    } else {
      // Peaceful idle chewing motion
      neckHeadGroup.rotation.y = Math.sin(chewPhase * 0.6) * 0.06;
      neckHeadGroup.rotation.x = Math.sin(chewPhase) * 0.04;
      snout.rotation.z = Math.sin(chewPhase * 1.8) * 0.05;
      leftEar.rotation.z = -0.35 + Math.sin(chewPhase * 0.7) * 0.05;
      rightEar.rotation.z = 0.35 - Math.sin(chewPhase * 0.7) * 0.05;
      tail.rotation.z = 0.8 + Math.sin(chewPhase * 0.4) * 0.12;
    }

    // Check if player is near cow and honking, or bumps cow
    const distToCow = vehicle.position.distanceTo(cowGroup.position);
    if (distToCow < 3.2) {
      // Soft nudge boundary
      if (distToCow < 1.8) {
        reactToHorn();
        if (addCameraTrauma) addCameraTrauma(0.2);
      }
    }

    // 2. SPEED BUMP IMPACT COLLISION PHYSICS
    const now = performance.now();
    speedBumps.forEach((bump) => {
      const dist = vehicle.position.distanceTo(bump.position);
      // Crossing speed bump bounding zone
      if (dist < 2.0 && (now - bump.lastHitTime > 750)) {
        bump.lastHitTime = now;
        const speed = Math.abs(vehicle.speed);

        // If crossing faster than slow crawl (12 km/h / 3.3 m/s)
        if (speed > 3.3) {
          // Bouncy vertical suspension launch!
          const bounceForce = Math.min(5.6, 1.8 + speed * 0.18);
          vehicle.verticalVelocity = bounceForce;

          // Aggressive forward suspension pitch recoil
          vehicle.bodyPitch = -0.26;

          // Audio: heavy suspension thump
          if (audio) {
            audio.playBarrierHitSound();
          }

          // Camera impact trauma shake
          if (addCameraTrauma) {
            addCameraTrauma(0.5);
          }

          // Reckless high-speed penalty (> 40 km/h)
          if (speed > 11.0) {
            vehicle.speed *= 0.82;
          }
        }
      }
    });
  }

  return {
    obstaclesGroup,
    reactToHorn,
    update,
  };
}

