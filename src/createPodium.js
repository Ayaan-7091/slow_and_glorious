import * as THREE from 'three';

/**
 * ============================================================================
 * IN-WORLD 3D PODIUM MONUMENT & GRAND PRIX CELEBRATION (Sprint 11)
 * ============================================================================
 * 
 * Features:
 *  1. Detailed Multi-Tiered Concrete Podium:
 *     - Located in the grand celebratory plaza just off the finish line straight
 *     - 1st Place (Center / Tallest step): 1.6m high with glowing gold number '1'
 *     - 2nd Place (Left step): 1.1m high with silver number '2'
 *     - 3rd Place (Right step): 0.7m high with bronze number '3'
 *  2. Indian Festive Triumphal Arch & Truck-Art Banners:
 *     - "॥ विजयी भव ॥ DESI GRAND PRIX CHAMPION"
 *     - Festive triangular bunting & glowing fairy lights
 *     - Stage spotlights & uplights illuminating winning vehicles
 *  3. Teleportation of Actual 3D Rickshaws:
 *     - Preserves player custom livery, paint, slogan & bling
 *     - Preserves AI rival models, colors & name tags
 *  4. Floating 3D Billboard Name & Rank Badges above each vehicle
 *  5. Cinematic Camera Orbit around the celebration
 */

export function createPodium(scene, trackCurve, trackWidth = 14.0) {
  const podiumGroup = new THREE.Group();
  podiumGroup.name = 'InWorld_3D_Podium_System';

  // --------------------------------------------------------------------------
  // 1. POSITIONING NEAR THE START/FINISH ARCH
  // --------------------------------------------------------------------------
  // Sample curve point just past the finish line (t = 0.02)
  const tPodium = 0.025;
  const startPt = trackCurve.getPointAt(tPodium);
  startPt.y = 0;
  const startTan = trackCurve.getTangentAt(tPodium).normalize();
  startTan.y = 0;
  startTan.normalize();
  // Normal pointing into the inner infield plaza
  const startNorm = new THREE.Vector3(-startTan.z, 0, startTan.x).normalize();

  // Setback distance from track centerline (~20.5m total, 13.5m clear of curb)
  const PODIUM_SETBACK = trackWidth / 2 + 13.5;
  const podiumCenter = startPt.clone().addScaledVector(startNorm, PODIUM_SETBACK);

  // Facing angle: Podium faces back toward the track and celebration camera (-startNorm)
  const podiumYaw = Math.atan2(-startNorm.x, -startNorm.z);

  podiumGroup.position.copy(podiumCenter);
  podiumGroup.rotation.y = podiumYaw;

  // --------------------------------------------------------------------------
  // 2. TEXTURES: CONCRETE, EMBOSSED NUMBER PLAQUES & BANNERS
  // --------------------------------------------------------------------------
  function createPlaqueTexture(rankNum, title, accentColor, bgColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Rich dark plaque background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 256);

    // Ornate double border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 496, 240);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 476, 220);

    // Embossed number
    ctx.fillStyle = '#000000';
    ctx.font = '900 110px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(rankNum, 260, 134);

    ctx.fillStyle = accentColor;
    ctx.fillText(rankNum, 256, 130);

    // Title label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(title, 256, 188);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('॥ DESI GRAND PRIX ॥', 256, 222);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  function createChampionBannerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Deep Royal Maroon Background
    ctx.fillStyle = '#4a0e17';
    ctx.fillRect(0, 0, 1024, 256);

    // Gold & Saffron Truck-Art Borders
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 12;
    ctx.strokeRect(8, 8, 1008, 240);

    ctx.strokeStyle = '#ff9900';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 984, 216);

    // Sacred Devanagari Header
    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪔 ॥ विजयी भव • HORN OK PLEASE ॥ 🪔', 512, 54);

    // Main Championship Title
    ctx.fillStyle = '#000000';
    ctx.font = '900 58px sans-serif';
    ctx.fillText('DESI GRAND PRIX CHAMPION', 516, 128);

    ctx.fillStyle = '#ffd700';
    ctx.fillText('DESI GRAND PRIX CHAMPION', 512, 124);

    // Subtitle & Chevrons
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('🏆 1st • 2nd • 3rd PODIUM FINISHERS 🏆', 512, 178);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('★ BAZAAR STREET RACING CHAMPIONSHIP ★', 512, 218);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  // --------------------------------------------------------------------------
  // 3. BASE PLAZA PLATFORM
  // --------------------------------------------------------------------------
  const plazaGeo = new THREE.CylinderGeometry(9.6, 10.0, 0.28, 32);
  const plazaMat = new THREE.MeshStandardMaterial({
    color: 0x3d3a36,
    roughness: 0.88,
    metalness: 0.1,
  });
  const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
  plazaMesh.position.y = 0.14;
  plazaMesh.receiveShadow = true;
  podiumGroup.add(plazaMesh);

  // Plaza Perimeter Curb Chevron Ring
  const curbGeo = new THREE.CylinderGeometry(10.02, 10.02, 0.32, 32, 1, true);
  const curbMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.4, metalness: 0.6 });
  const curbRing = new THREE.Mesh(curbGeo, curbMat);
  curbRing.position.y = 0.16;
  podiumGroup.add(curbRing);

  // --------------------------------------------------------------------------
  // 4. THE 3 DISTINCT TIERED PODIUM STEPS
  // --------------------------------------------------------------------------
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x5a544c,
    roughness: 0.75,
    metalness: 0.15,
  });

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85 });
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xc8d1d3, roughness: 0.25, metalness: 0.85 });
  const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.3, metalness: 0.8 });

  // STEP 1 (Center / 1st Place - 1.6m Tall)
  const step1H = 1.6;
  const step1Group = new THREE.Group();
  step1Group.position.set(0, step1H / 2 + 0.28, 0);

  const step1Block = new THREE.Mesh(new THREE.BoxGeometry(3.6, step1H, 4.2), concreteMat);
  step1Block.castShadow = true;
  step1Block.receiveShadow = true;
  step1Group.add(step1Block);

  // Gold Trim on Step 1
  const step1Trim = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.08, 4.28), goldMat);
  step1Trim.position.y = step1H / 2 + 0.02;
  step1Group.add(step1Trim);

  // Step 1 Front Plaque (Gold 1)
  const p1Tex = createPlaqueTexture('1', '1st PLACE', '#ffd700', '#2a1a08');
  const p1Mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({ map: p1Tex }));
  p1Mesh.position.set(0, 0, 2.12);
  step1Group.add(p1Mesh);

  // Step 1 Top Gold Star Medallion
  const starMedallion = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 0.02, 16),
    goldMat
  );
  starMedallion.position.set(0, step1H / 2 + 0.05, 0);
  step1Group.add(starMedallion);

  podiumGroup.add(step1Group);

  // STEP 2 (Left / 2nd Place - 1.1m Tall)
  const step2H = 1.1;
  const step2Group = new THREE.Group();
  step2Group.position.set(-3.7, step2H / 2 + 0.28, 0);

  const step2Block = new THREE.Mesh(new THREE.BoxGeometry(3.1, step2H, 3.8), concreteMat);
  step2Block.castShadow = true;
  step2Block.receiveShadow = true;
  step2Group.add(step2Block);

  // Silver Trim on Step 2
  const step2Trim = new THREE.Mesh(new THREE.BoxGeometry(3.18, 0.08, 3.88), silverMat);
  step2Trim.position.y = step2H / 2 + 0.02;
  step2Group.add(step2Trim);

  // Step 2 Front Plaque (Silver 2)
  const p2Tex = createPlaqueTexture('2', '2nd PLACE', '#c8d1d3', '#161d24');
  const p2Mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.95), new THREE.MeshBasicMaterial({ map: p2Tex }));
  p2Mesh.position.set(0, 0, 1.92);
  step2Group.add(p2Mesh);

  podiumGroup.add(step2Group);

  // STEP 3 (Right / 3rd Place - 0.7m Tall)
  const step3H = 0.7;
  const step3Group = new THREE.Group();
  step3Group.position.set(3.7, step3H / 2 + 0.28, 0);

  const step3Block = new THREE.Mesh(new THREE.BoxGeometry(3.1, step3H, 3.8), concreteMat);
  step3Block.castShadow = true;
  step3Block.receiveShadow = true;
  step3Group.add(step3Block);

  // Bronze Trim on Step 3
  const step3Trim = new THREE.Mesh(new THREE.BoxGeometry(3.18, 0.08, 3.88), bronzeMat);
  step3Trim.position.y = step3H / 2 + 0.02;
  step3Group.add(step3Trim);

  // Step 3 Front Plaque (Bronze 3)
  const p3Tex = createPlaqueTexture('3', '3rd PLACE', '#cd7f32', '#26140e');
  const p3Mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.62), new THREE.MeshBasicMaterial({ map: p3Tex }));
  p3Mesh.position.set(0, 0, 1.92);
  step3Group.add(p3Mesh);

  podiumGroup.add(step3Group);

  // --------------------------------------------------------------------------
  // 5. TRIUMPHAL ARCH & FESTIVE TRUCK-ART BACKDROP
  // --------------------------------------------------------------------------
  const backdropGroup = new THREE.Group();
  backdropGroup.position.set(0, 0, -2.6);

  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x9e472a, roughness: 0.85 }); // Red Sandstone
  const pillarGeo = new THREE.BoxGeometry(0.9, 7.2, 0.9);

  const pillarL = new THREE.Mesh(pillarGeo, pillarMat);
  pillarL.position.set(-6.2, 3.6, 0);
  const pillarR = new THREE.Mesh(pillarGeo, pillarMat);
  pillarR.position.set(6.2, 3.6, 0);
  backdropGroup.add(pillarL, pillarR);

  // Pillar Decorative Gold Caps
  const capGeo = new THREE.BoxGeometry(1.2, 0.35, 1.2);
  const capL = new THREE.Mesh(capGeo, goldMat);
  capL.position.set(-6.2, 7.35, 0);
  const capR = new THREE.Mesh(capGeo, goldMat);
  capR.position.set(6.2, 7.35, 0);
  backdropGroup.add(capL, capR);

  // Curved Header Arch connecting the pillars
  const archSpan = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.6, 0.8), pillarMat);
  archSpan.position.set(0, 7.2, 0);
  backdropGroup.add(archSpan);

  // Large Grand Prix Champion Marquee Banner
  const bannerTex = createChampionBannerTexture();
  const bannerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(11.8, 2.8),
    new THREE.MeshBasicMaterial({ map: bannerTex })
  );
  bannerMesh.position.set(0, 5.5, 0.42);
  backdropGroup.add(bannerMesh);

  // Festive Colorful Bunting Triangles across the arch
  const flagColors = [0xff9900, 0xff0055, 0x00cc44, 0xffd700, 0x00d4ff];
  const numFlags = 18;
  for (let f = 0; f < numFlags; f++) {
    const fx = -5.6 + (f / (numFlags - 1)) * 11.2;
    const sag = Math.sin((f / (numFlags - 1)) * Math.PI) * 0.45;
    const fy = 6.8 - sag;

    const flag = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.42, 3),
      new THREE.MeshBasicMaterial({ color: flagColors[f % flagColors.length], side: THREE.DoubleSide })
    );
    flag.position.set(fx, fy - 0.21, 0.45);
    flag.rotation.z = Math.PI;
    backdropGroup.add(flag);

    // Glowing festoon bulb
    if (f % 2 === 0) {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffea88 })
      );
      bulb.position.set(fx, fy, 0.46);
      backdropGroup.add(bulb);
    }
  }

  podiumGroup.add(backdropGroup);

  // --------------------------------------------------------------------------
  // 6. STAGE UPLIGHTS & CELEBRATION SPOTLIGHTS (Brilliant Illumination)
  // --------------------------------------------------------------------------
  // Dedicated stage fill ambient light so the monument, banners & rickshaws pop
  const stageFill = new THREE.AmbientLight(0xfffaea, 1.5);
  podiumGroup.add(stageFill);

  // Dedicated overhead key directional light
  const stageKey = new THREE.DirectionalLight(0xfff8ee, 2.2);
  stageKey.position.set(0, 12, 9);
  stageKey.target.position.set(0, 1.6, 0);
  podiumGroup.add(stageKey);
  podiumGroup.add(stageKey.target);

  // Gold Uplight on 1st Step
  const spot1 = new THREE.SpotLight(0xffe066, 4.2, 18, Math.PI / 4, 0.35);
  spot1.position.set(0, 0.4, 3.4);
  spot1.target.position.set(0, step1H + 0.6, 0);
  podiumGroup.add(spot1);
  podiumGroup.add(spot1.target);

  // Silver-White Uplight on 2nd Step
  const spot2 = new THREE.SpotLight(0xddeeff, 3.0, 16, Math.PI / 4, 0.35);
  spot2.position.set(-3.7, 0.4, 3.2);
  spot2.target.position.set(-3.7, step2H + 0.5, 0);
  podiumGroup.add(spot2);
  podiumGroup.add(spot2.target);

  // Amber Uplight on 3rd Step
  const spot3 = new THREE.SpotLight(0xffaa33, 3.0, 16, Math.PI / 4, 0.35);
  spot3.position.set(3.7, 0.4, 3.2);
  spot3.target.position.set(3.7, step3H + 0.5, 0);
  podiumGroup.add(spot3);
  podiumGroup.add(spot3.target);

  // --------------------------------------------------------------------------
  // 7. FLOATING 3D BILLBOARD NAME & RANK BADGES
  // --------------------------------------------------------------------------
  function createBadgeSprite(rankLabel, initialName, badgeColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    function redraw(name) {
      ctx.clearRect(0, 0, 384, 96);

      // Pill Background
      ctx.fillStyle = 'rgba(18, 14, 20, 0.94)';
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(8, 8, 368, 80, 40);
      ctx.fill();
      ctx.stroke();

      // Rank circle
      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.arc(50, 48, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#111111';
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rankLabel, 50, 49);

      // Name Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(name.toUpperCase(), 92, 48);

      texture.needsUpdate = true;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.2, 0.8, 1);

    redraw(initialName);
    return { sprite, redraw };
  }

  const badge1 = createBadgeSprite('1st', 'CHAMPION', '#ffd700');
  badge1.sprite.position.set(0, step1H + 0.28 + 2.7, 0);
  podiumGroup.add(badge1.sprite);

  const badge2 = createBadgeSprite('2nd', 'RUNNER UP', '#c8d1d3');
  badge2.sprite.position.set(-3.7, step2H + 0.28 + 2.6, 0);
  podiumGroup.add(badge2.sprite);

  const badge3 = createBadgeSprite('3rd', '3rd PLACE', '#cd7f32');
  badge3.sprite.position.set(3.7, step3H + 0.28 + 2.5, 0);
  podiumGroup.add(badge3.sprite);

  scene.add(podiumGroup);

  // --------------------------------------------------------------------------
  // 8. FINISHER PLACEMENT & CINEMATIC ORBIT CONTROLLER
  // --------------------------------------------------------------------------
  let placedVehicles = [];
  let isPodiumActive = false;
  let initialCameraSnapped = false;
  let orbitAngle = 0;
  let orbitTimer = 0;

  // Local step anchor vectors (relative to podium center)
  const stepOffsets = [
    new THREE.Vector3(0, step1H + 0.28, 0),    // 1st place
    new THREE.Vector3(-3.7, step2H + 0.28, 0), // 2nd place
    new THREE.Vector3(3.7, step3H + 0.28, 0),  // 3rd place
  ];

  /**
   * Teleports the top finishers onto the 3D podium.
   * @param {Array} standings - Sorted array of finishers [{ name, isPlayer, group/mesh, ... }]
   */
  function placeFinishers(standings) {
    if (!standings || standings.length < 3) return;
    isPodiumActive = true;
    initialCameraSnapped = false;
    orbitAngle = 0;
    orbitTimer = 0;
    placedVehicles = [];

    // Update floating badges
    if (standings[0]) badge1.redraw(standings[0].name);
    if (standings[1]) badge2.redraw(standings[1].name);
    if (standings[2]) badge3.redraw(standings[2].name);

    // Place Top 3 on their respective steps
    for (let i = 0; i < 3; i++) {
      const racer = standings[i];
      if (!racer) continue;

      const targetGroup = racer.group || racer.mesh || (racer.instance && racer.instance.group);
      if (!targetGroup) continue;

      // Save original transform for restoration
      placedVehicles.push({
        group: targetGroup,
        originalPos: targetGroup.position.clone(),
        originalRotY: targetGroup.rotation.y,
        isPlayer: !!racer.isPlayer,
      });

      // Calculate world coordinate on podium step
      const localStep = stepOffsets[i].clone();
      const worldTarget = podiumGroup.localToWorld(localStep);

      targetGroup.position.copy(worldTarget);
      targetGroup.rotation.y = podiumYaw;
      targetGroup.visible = true;

      // Reset any body roll or fork tilt
      if (racer.tiltGroup) racer.tiltGroup.rotation.set(0, 0, 0);
      if (racer.frontForkGroup) racer.frontForkGroup.rotation.y = 0;
    }

    // If player didn't make top 3 (finished 4th), park them on the plaza apron facing podium!
    if (standings.length > 3 && standings[3].isPlayer) {
      const pRacer = standings[3];
      const pGroup = pRacer.group || (pRacer.instance && pRacer.instance.group);
      if (pGroup) {
        placedVehicles.push({
          group: pGroup,
          originalPos: pGroup.position.clone(),
          originalRotY: pGroup.rotation.y,
          isPlayer: true,
        });

        const apronPos = podiumGroup.localToWorld(new THREE.Vector3(0, 0.28, 4.8));
        pGroup.position.copy(apronPos);
        pGroup.rotation.y = podiumYaw + Math.PI; // Looking toward the podium
        pGroup.visible = true;
      }
    }
  }

  /**
   * Restores all vehicle positions back to their original race transforms.
   */
  function restoreFinishers() {
    isPodiumActive = false;
    initialCameraSnapped = false;
    placedVehicles.forEach((item) => {
      if (item.group) {
        item.group.position.copy(item.originalPos);
        item.group.rotation.y = item.originalRotY;
      }
    });
    placedVehicles = [];
  }

  /**
   * Smoothly animates a cinematic orbit shot framing the 3D podium and all 3 vehicles.
   */
  function updateCamera(dt, camera) {
    if (!isPodiumActive || !camera) return;

    orbitTimer += dt;
    // Slow, majestic cinematic sweep
    orbitAngle = Math.sin(orbitTimer * 0.28) * 0.32;

    const camDistance = 10.5;
    const camHeight = 3.2;

    // Orbit in local space in front of podium (z > 0)
    const localCamX = Math.sin(orbitAngle) * camDistance;
    const localCamZ = Math.cos(orbitAngle) * camDistance + 1.2;
    const localCamY = camHeight;

    const targetWorldCam = podiumGroup.localToWorld(new THREE.Vector3(localCamX, localCamY, localCamZ));
    const lookFocalPoint = podiumGroup.localToWorld(new THREE.Vector3(0, 1.6, 0));

    // Gentle float on badges
    badge1.sprite.position.y = step1H + 0.28 + 2.7 + Math.sin(orbitTimer * 2.2) * 0.06;
    badge2.sprite.position.y = step2H + 0.28 + 2.6 + Math.sin(orbitTimer * 2.2 + 0.8) * 0.06;
    badge3.sprite.position.y = step3H + 0.28 + 2.5 + Math.sin(orbitTimer * 2.2 + 1.6) * 0.06;

    if (!initialCameraSnapped) {
      camera.position.copy(targetWorldCam);
      camera.lookAt(lookFocalPoint);
      initialCameraSnapped = true;
    } else {
      camera.position.lerp(targetWorldCam, Math.min(1.0, dt * 5.0));
      camera.lookAt(lookFocalPoint);
    }
  }

  return {
    podiumGroup,
    podiumCenter,
    placeFinishers,
    restoreFinishers,
    updateCamera,
    isActive: () => isPodiumActive,
  };
}

