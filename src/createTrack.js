import * as THREE from 'three';

/**
 * ============================================================================
 * CLOSED-LOOP INDIAN STREET CIRCUIT & PROPS (Level 2 Sprint)
 * ============================================================================
 * 
 * Features:
 *  1. Smooth procedural asphalt track ribbon using THREE.CatmullRomCurve3
 *  2. Alternating Red & White arcade curbstones and outer guardrails
 *  3. Yellow dashed centerline
 *  4. Festive Start/Finish Arch + 4 Glowing Semi-Transparent Checkpoint Arches
 *  5. Stylized roadside Chai Stalls ("Tapri") with glowing warm lanterns
 *  6. Low-poly Palm Trees, Banyan Trees, and Vintage Streetlamps
 *  7. Track hazards (traffic cones) with dynamic launch-into-the-air physics
 *  8. Track boundary collision system that bounces vehicles off barriers
 */

export function createTrack(scene) {
  const trackGroup = new THREE.Group();
  trackGroup.name = 'ArcadeTrack_System';

  // --------------------------------------------------------------------------
  // 1. CLOSED-LOOP TRACK CURVE DEFINITION
  // --------------------------------------------------------------------------
  // 13 Control points defining a thrilling Indian street circuit:
  // - Main Straight (Start/Finish)
  // - Turn 1: High-speed sweeper right
  // - Turn 2: Sharp hairpin left (prime drift corner)
  // - Turn 3: S-Chicane
  // - Turn 4: Long sweeping curve past chai stalls
  // - Turn 5: Technical 90-degree corners back to home straight
  const trackControlPoints = [
    new THREE.Vector3(0, 0, -45),    // Start / Finish Line
    new THREE.Vector3(0, 0, 30),     // End of Main Straight
    new THREE.Vector3(30, 0, 75),    // Turn 1 Sweeper Entry
    new THREE.Vector3(75, 0, 85),    // Turn 1 Apex
    new THREE.Vector3(105, 0, 50),   // Turn 2 Hairpin Entry
    new THREE.Vector3(95, 0, 5),     // Turn 2 Hairpin Exit
    new THREE.Vector3(60, 0, -25),   // Turn 3 Chicane Left
    new THREE.Vector3(80, 0, -65),   // Turn 3 Chicane Right
    new THREE.Vector3(50, 0, -115),  // Turn 4 Sweeper Entry
    new THREE.Vector3(-15, 0, -125), // Turn 4 Long Sweeper Apex
    new THREE.Vector3(-70, 0, -85),  // Turn 5 Chicane Entry
    new THREE.Vector3(-60, 0, -30),  // Turn 5 Mid
    new THREE.Vector3(-30, 0, -20),  // Final Corner heading to Main Straight
  ];

  // CatmullRomCurve3 with closed = true forms a smooth, seamless loop
  const trackCurve = new THREE.CatmullRomCurve3(trackControlPoints, true);
  trackCurve.curveType = 'catmullrom';
  trackCurve.tension = 0.5;

  const trackWidth = 14.0; // 14 meters wide for generous arcade sliding
  const halfWidth = trackWidth / 2;
  const numSegments = 320; // High resolution for smooth curves

  // Sample points along the curve
  const curvePoints = [];
  const curveTangents = [];
  const curveNormals = [];

  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const pt = trackCurve.getPointAt(t % 1.0);
    const tan = trackCurve.getTangentAt(t % 1.0).normalize();
    // Normal in XZ plane (perpendicular to tangent)
    const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

    curvePoints.push(pt);
    curveTangents.push(tan);
    curveNormals.push(norm);
  }

  // --------------------------------------------------------------------------
  // 2. PROCEDURAL ROAD SURFACE RIBBON
  // --------------------------------------------------------------------------
  const roadPositions = [];
  const roadNormalsArr = [];
  const roadUvs = [];
  const roadIndices = [];

  const curbLPositions = [];
  const curbRPositions = [];
  const curbLIndices = [];
  const curbRIndices = [];
  const curbLColors = [];
  const curbRColors = [];

  const curbWidth = 1.0;

  for (let i = 0; i <= numSegments; i++) {
    const pt = curvePoints[i];
    const norm = curveNormals[i];

    // Left and right road vertices (raised slightly at y = 0.05 to avoid z-fighting)
    const roadY = 0.05;
    const leftPt = new THREE.Vector3(
      pt.x + norm.x * halfWidth,
      roadY,
      pt.z + norm.z * halfWidth
    );
    const rightPt = new THREE.Vector3(
      pt.x - norm.x * halfWidth,
      roadY,
      pt.z - norm.z * halfWidth
    );

    roadPositions.push(leftPt.x, leftPt.y, leftPt.z);
    roadPositions.push(rightPt.x, rightPt.y, rightPt.z);

    roadNormalsArr.push(0, 1, 0, 0, 1, 0);

    const uvV = i / 10.0; // Repeat texture
    roadUvs.push(0, uvV, 1, uvV);

    // Curbstones
    const curbY = 0.12; // Raised curb bevel
    const outerLeftCurb = new THREE.Vector3(
      pt.x + norm.x * (halfWidth + curbWidth),
      curbY,
      pt.z + norm.z * (halfWidth + curbWidth)
    );
    const outerRightCurb = new THREE.Vector3(
      pt.x - norm.x * (halfWidth + curbWidth),
      curbY,
      pt.z - norm.z * (halfWidth + curbWidth)
    );

    // Left curb
    curbLPositions.push(leftPt.x, roadY, leftPt.z);
    curbLPositions.push(outerLeftCurb.x, curbY, outerLeftCurb.z);

    // Right curb
    curbRPositions.push(rightPt.x, roadY, rightPt.z);
    curbRPositions.push(outerRightCurb.x, curbY, outerRightCurb.z);

    // Alternating Red & White curb colors every 4 segments
    const isRed = Math.floor(i / 4) % 2 === 0;
    const r = isRed ? 0.95 : 0.95;
    const g = isRed ? 0.12 : 0.95;
    const b = isRed ? 0.12 : 0.95;

    curbLColors.push(r, g, b, r, g, b);
    curbRColors.push(r, g, b, r, g, b);

    if (i < numSegments) {
      const idx = i * 2;
      // Road quads (two triangles)
      roadIndices.push(idx, idx + 1, idx + 2);
      roadIndices.push(idx + 1, idx + 3, idx + 2);

      // Left curb quads
      curbLIndices.push(idx, idx + 1, idx + 2);
      curbLIndices.push(idx + 1, idx + 3, idx + 2);

      // Right curb quads
      curbRIndices.push(idx, idx + 2, idx + 1);
      curbRIndices.push(idx + 1, idx + 2, idx + 3);
    }
  }

  // Asphalt Material
  const roadGeo = new THREE.BufferGeometry();
  roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
  roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormalsArr, 3));
  roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
  roadGeo.setIndex(roadIndices);

  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x1f2329,
    roughness: 0.85,
    metalness: 0.1,
  });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.receiveShadow = true;
  trackGroup.add(roadMesh);

  // Curbstone Meshes
  const curbMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.6,
  });

  const curbLGeo = new THREE.BufferGeometry();
  curbLGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbLPositions, 3));
  curbLGeo.setAttribute('color', new THREE.Float32BufferAttribute(curbLColors, 3));
  curbLGeo.setIndex(curbLIndices);
  curbLGeo.computeVertexNormals();
  const curbLMesh = new THREE.Mesh(curbLGeo, curbMat);
  curbLMesh.receiveShadow = true;
  trackGroup.add(curbLMesh);

  const curbRGeo = new THREE.BufferGeometry();
  curbRGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbRPositions, 3));
  curbRGeo.setAttribute('color', new THREE.Float32BufferAttribute(curbRColors, 3));
  curbRGeo.setIndex(curbRIndices);
  curbRGeo.computeVertexNormals();
  const curbRMesh = new THREE.Mesh(curbRGeo, curbMat);
  curbRMesh.receiveShadow = true;
  trackGroup.add(curbRMesh);

  // --------------------------------------------------------------------------
  // 3. YELLOW DASHED ROAD CENTERLINE
  // --------------------------------------------------------------------------
  const lineGeo = new THREE.BoxGeometry(0.24, 0.02, 1.8);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

  for (let i = 0; i < numSegments; i += 3) {
    const pt = curvePoints[i];
    const tan = curveTangents[i];
    const dash = new THREE.Mesh(lineGeo, lineMat);
    dash.position.set(pt.x, 0.065, pt.z);
    dash.rotation.y = Math.atan2(tan.x, tan.z);
    trackGroup.add(dash);
  }

  // --------------------------------------------------------------------------
  // 4. OUTER SAFETY BARRIERS (GUARDRAILS)
  // --------------------------------------------------------------------------
  // Stylized metal guardrail along track perimeter
  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x9099a2,
    roughness: 0.4,
    metalness: 0.8,
  });
  const barrierPostGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
  const barrierRailGeo = new THREE.BoxGeometry(0.12, 0.35, 3.2);

  for (let i = 0; i < numSegments; i += 4) {
    const pt = curvePoints[i];
    const norm = curveNormals[i];
    const tan = curveTangents[i];
    const yaw = Math.atan2(tan.x, tan.z);

    // Left barrier post & rail
    const bPosL = new THREE.Vector3(
      pt.x + norm.x * (halfWidth + curbWidth + 0.3),
      0.4,
      pt.z + norm.z * (halfWidth + curbWidth + 0.3)
    );
    const postL = new THREE.Mesh(barrierPostGeo, barrierMat);
    postL.position.set(bPosL.x, 0.4, bPosL.z);
    const railL = new THREE.Mesh(barrierRailGeo, barrierMat);
    railL.position.set(bPosL.x, 0.5, bPosL.z);
    railL.rotation.y = yaw;
    trackGroup.add(postL, railL);

    // Right barrier post & rail
    const bPosR = new THREE.Vector3(
      pt.x - norm.x * (halfWidth + curbWidth + 0.3),
      0.4,
      pt.z - norm.z * (halfWidth + curbWidth + 0.3)
    );
    const postR = new THREE.Mesh(barrierPostGeo, barrierMat);
    postR.position.set(bPosR.x, 0.4, bPosR.z);
    const railR = new THREE.Mesh(barrierRailGeo, barrierMat);
    railR.position.set(bPosR.x, 0.5, bPosR.z);
    railR.rotation.y = yaw;
    trackGroup.add(postR, railR);
  }

  // --------------------------------------------------------------------------
  // 5. CHECKPOINT ARCHES (START/FINISH + 4 GATES)
  // --------------------------------------------------------------------------
  // Checkpoint positions along normalized t:
  // Gate 0: 0.0 (Start/Finish)
  // Gate 1: 0.22 (Turn 1 exit)
  // Gate 2: 0.44 (Hairpin exit)
  // Gate 3: 0.68 (Long sweeper)
  // Gate 4: 0.88 (Final chicane entry)
  const checkpointTValues = [0.0, 0.22, 0.44, 0.68, 0.88];
  const checkpointGates = [];

  checkpointTValues.forEach((tVal, idx) => {
    const isStartFinish = idx === 0;
    const pt = trackCurve.getPointAt(tVal);
    const tan = trackCurve.getTangentAt(tVal).normalize();
    const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    const gateGroup = new THREE.Group();
    gateGroup.position.set(pt.x, 0, pt.z);
    gateGroup.rotation.y = yaw;

    const spanWidth = trackWidth + 2.4;
    const archHeight = 6.2;

    if (isStartFinish) {
      // 🏁 GRAND START / FINISH ARCH (Festive Indian Colors)
      // Checkered starting grid line on asphalt
      const checkGeo = new THREE.PlaneGeometry(trackWidth, 1.8);
      const checkCanvas = document.createElement('canvas');
      checkCanvas.width = 256;
      checkCanvas.height = 64;
      const cctx = checkCanvas.getContext('2d');
      for (let rx = 0; rx < 16; rx++) {
        for (let ry = 0; ry < 4; ry++) {
          cctx.fillStyle = (rx + ry) % 2 === 0 ? '#ffffff' : '#111111';
          cctx.fillRect(rx * 16, ry * 16, 16, 16);
        }
      }
      const checkTex = new THREE.CanvasTexture(checkCanvas);
      const checkMat = new THREE.MeshBasicMaterial({ map: checkTex, depthWrite: false });
      const checkMesh = new THREE.Mesh(checkGeo, checkMat);
      checkMesh.rotation.x = -Math.PI / 2;
      checkMesh.position.set(0, 0.062, 0);
      gateGroup.add(checkMesh);

      // Grand Pillars (Golden Indian Saffron & Royal Green)
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0xff9900, roughness: 0.3 });
      const pillarGeo = new THREE.BoxGeometry(1.2, archHeight, 1.2);

      const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
      leftPillar.position.set(-spanWidth / 2, archHeight / 2, 0);
      leftPillar.castShadow = true;

      const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
      rightPillar.position.set(spanWidth / 2, archHeight / 2, 0);
      rightPillar.castShadow = true;

      // Decorative pillar crown caps
      const crownGeo = new THREE.ConeGeometry(1.1, 1.4, 4);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6 });
      const crownL = new THREE.Mesh(crownGeo, crownMat);
      crownL.position.set(-spanWidth / 2, archHeight + 0.7, 0);
      crownL.rotation.y = Math.PI / 4;
      const crownR = new THREE.Mesh(crownGeo, crownMat);
      crownR.position.set(spanWidth / 2, archHeight + 0.7, 0);
      crownR.rotation.y = Math.PI / 4;

      // Top Crossbar Banner
      const bannerGeo = new THREE.BoxGeometry(spanWidth + 1.2, 1.5, 0.6);
      const bannerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.set(0, archHeight - 0.2, 0);

      // Glowing Sign Face
      const signGeo = new THREE.PlaneGeometry(spanWidth - 1.0, 1.0);
      const signMat = new THREE.MeshBasicMaterial({ color: 0xffc107 });
      const signFace = new THREE.Mesh(signGeo, signMat);
      signFace.position.set(0, archHeight - 0.2, 0.31);

      gateGroup.add(leftPillar, rightPillar, crownL, crownR, banner, signFace);
    } else {
      // ⚡ GLOWING NEON CHECKPOINT GATES (1, 2, 3, 4)
      const neonColor = 0x00f0ff; // Cyan neon
      const pillarGeo = new THREE.BoxGeometry(0.6, archHeight, 0.6);
      const neonMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.5,
      });

      const leftPillar = new THREE.Mesh(pillarGeo, neonMat);
      leftPillar.position.set(-spanWidth / 2, archHeight / 2, 0);
      const rightPillar = new THREE.Mesh(pillarGeo, neonMat);
      rightPillar.position.set(spanWidth / 2, archHeight / 2, 0);

      // Glowing crossbar
      const barGeo = new THREE.BoxGeometry(spanWidth + 0.6, 0.5, 0.5);
      const glowMat = new THREE.MeshStandardMaterial({
        color: neonColor,
        emissive: neonColor,
        emissiveIntensity: 0.85,
        roughness: 0.2,
      });
      const topBar = new THREE.Mesh(barGeo, glowMat);
      topBar.position.set(0, archHeight, 0);

      // Semi-transparent glowing checkpoint curtain
      const curtainGeo = new THREE.PlaneGeometry(spanWidth - 0.5, archHeight - 0.5);
      const curtainMat = new THREE.MeshBasicMaterial({
        color: neonColor,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const curtain = new THREE.Mesh(curtainGeo, curtainMat);
      curtain.position.set(0, archHeight / 2, 0);

      gateGroup.add(leftPillar, rightPillar, topBar, curtain);
    }

    trackGroup.add(gateGroup);

    checkpointGates.push({
      index: idx,
      isStartFinish,
      position: pt.clone(),
      heading: yaw,
      radius: spanWidth / 2,
      mesh: gateGroup,
    });
  });

  // --------------------------------------------------------------------------
  // 6. ROADSIDE PROPS: COLORFUL CHAI STALLS ("TAPRI")
  // --------------------------------------------------------------------------
  function createChaiStall(pos, rotationY) {
    const stall = new THREE.Group();
    stall.position.copy(pos);
    stall.rotation.y = rotationY;

    // Wooden stall kiosk base
    const kioskGeo = new THREE.BoxGeometry(4.2, 2.4, 2.8);
    const kioskMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.8 });
    const kiosk = new THREE.Mesh(kioskGeo, kioskMat);
    kiosk.position.y = 1.2;
    kiosk.castShadow = true;
    stall.add(kiosk);

    // Front counter opening
    const counterGeo = new THREE.BoxGeometry(3.6, 0.9, 0.8);
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.6 });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.set(0, 1.0, 1.4);
    stall.add(counter);

    // Slanted colorful tin roof (Red/Orange stripes)
    const roofGeo = new THREE.BoxGeometry(4.8, 0.15, 3.4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 2.6, 0.1);
    roof.rotation.x = 0.18;
    roof.castShadow = true;
    stall.add(roof);

    // Top Sign Banner: "GARAM CHAI & SNACKS"
    const signGeo = new THREE.BoxGeometry(3.4, 0.65, 0.1);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0xffd54f,
      emissive: 0xffb300,
      emissiveIntensity: 0.35,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.9, 1.4);
    stall.add(sign);

    // Golden Chai Samovar / Kettle
    const kettleGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.55, 12);
    const kettleMat = new THREE.MeshStandardMaterial({ color: 0xffc107, metalness: 0.8, roughness: 0.2 });
    const kettle = new THREE.Mesh(kettleGeo, kettleMat);
    kettle.position.set(-0.8, 1.7, 1.4);
    stall.add(kettle);

    // Warm glowing hanging lantern light
    const lanternLight = new THREE.PointLight(0xffaa44, 2.0, 16, 1.2);
    lanternLight.position.set(0, 2.3, 1.6);
    stall.add(lanternLight);

    const bulbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffdd88 })
    );
    bulbMesh.position.copy(lanternLight.position);
    stall.add(bulbMesh);

    // Wooden roadside benches
    const benchGeo = new THREE.BoxGeometry(2.4, 0.45, 0.6);
    const bench = new THREE.Mesh(benchGeo, kioskMat);
    bench.position.set(0, 0.25, 3.2);
    bench.castShadow = true;
    stall.add(bench);

    return stall;
  }

  // Place 2 prominent Chai Stalls at key track locations
  // Chai Stall 1: Near Turn 2 Hairpin exit
  const stall1Pos = new THREE.Vector3(108, 0, 12);
  const stall1 = createChaiStall(stall1Pos, -Math.PI / 2.3);
  trackGroup.add(stall1);

  // Chai Stall 2: Along Turn 4 Sweeper
  const stall2Pos = new THREE.Vector3(58, 0, -125);
  const stall2 = createChaiStall(stall2Pos, Math.PI / 1.5);
  trackGroup.add(stall2);

  // -------------------------------------------------------------
  // 7. ROADSIDE PROPS: PALM TREES, BANYAN TREES & STREETLAMPS
  // -------------------------------------------------------------
  // Helper to build a stylized Palm Tree
  function createPalmTree(x, z, scale = 1.0) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);

    // Segmented curved trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.28 - i * 0.03, 0.32 - i * 0.03, 1.4, 8), trunkMat);
      seg.position.set(i * 0.12, 0.7 + i * 1.3, 0);
      seg.rotation.z = -0.06;
      seg.castShadow = true;
      tree.add(seg);
    }

    // Green leafy fronds
    const frondGeo = new THREE.ConeGeometry(1.8, 1.2, 5);
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
    for (let f = 0; f < 6; f++) {
      const frond = new THREE.Mesh(frondGeo, frondMat);
      const angle = (f / 6) * Math.PI * 2;
      frond.position.set(0.6 + Math.cos(angle) * 1.4, 6.8, Math.sin(angle) * 1.4);
      frond.rotation.z = Math.PI / 3;
      frond.rotation.y = angle;
      frond.castShadow = true;
      tree.add(frond);
    }
    return tree;
  }

  // Helper to build a stylized Banyan / Peepal tree
  function createBanyanTree(x, z, scale = 1.0) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);

    const trunkGeo = new THREE.CylinderGeometry(0.8, 1.1, 4.0, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.0;
    trunk.castShadow = true;
    tree.add(trunk);

    // Fluffy foliage canopy spheres
    const leafGeo = new THREE.DodecahedronGeometry(2.4, 1);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.7 });
    
    const c1 = new THREE.Mesh(leafGeo, leafMat);
    c1.position.set(0, 5.0, 0);
    const c2 = new THREE.Mesh(leafGeo, leafMat);
    c2.position.set(1.5, 4.4, 1.0);
    c2.scale.setScalar(0.8);
    const c3 = new THREE.Mesh(leafGeo, leafMat);
    c3.position.set(-1.4, 4.6, -0.8);
    c3.scale.setScalar(0.85);

    c1.castShadow = true;
    c2.castShadow = true;
    c3.castShadow = true;
    tree.add(c1, c2, c3);
    return tree;
  }

  // Helper to build a Vintage Streetlamp
  function createStreetlamp(x, z, rotY = 0) {
    const lamp = new THREE.Group();
    lamp.position.set(x, 0, z);
    lamp.rotation.y = rotY;

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x263238, metalness: 0.8, roughness: 0.4 });
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 6.0, 8);
    const pole = new THREE.Mesh(poleGeo, metalMat);
    pole.position.y = 3.0;
    lamp.add(pole);

    // Curved arm
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 8);
    const arm = new THREE.Mesh(armGeo, metalMat);
    arm.position.set(0.6, 5.8, 0);
    arm.rotation.z = Math.PI / 3;
    lamp.add(arm);

    // Lantern housing
    const headGeo = new THREE.ConeGeometry(0.35, 0.5, 6);
    const head = new THREE.Mesh(headGeo, metalMat);
    head.position.set(1.2, 5.4, 0);
    lamp.add(head);

    // Warm amber glow
    const light = new THREE.PointLight(0xffb74d, 1.8, 18, 1.4);
    light.position.set(1.2, 5.1, 0);
    lamp.add(light);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffe082 }));
    bulb.position.copy(light.position);
    lamp.add(bulb);

    return lamp;
  }

  // Distribute trees and lamps along track perimeter
  const treeLocations = [
    { type: 'palm', x: -16, z: 15, scale: 1.1 },
    { type: 'banyan', x: -28, z: 45, scale: 1.0 },
    { type: 'palm', x: 20, z: 95, scale: 1.2 },
    { type: 'banyan', x: 80, z: 105, scale: 1.1 },
    { type: 'palm', x: 125, z: 70, scale: 0.95 },
    { type: 'banyan', x: 110, z: -20, scale: 1.3 },
    { type: 'palm', x: 92, z: -85, scale: 1.05 },
    { type: 'banyan', x: 35, z: -135, scale: 1.2 },
    { type: 'palm', x: -40, z: -135, scale: 1.15 },
    { type: 'banyan', x: -85, z: -65, scale: 1.0 },
    { type: 'palm', x: -75, z: -5, scale: 1.0 },
  ];

  treeLocations.forEach((tl) => {
    if (tl.type === 'palm') {
      trackGroup.add(createPalmTree(tl.x, tl.z, tl.scale));
    } else {
      trackGroup.add(createBanyanTree(tl.x, tl.z, tl.scale));
    }
  });

  const lampLocations = [
    { x: -10, z: -20, rot: 0 },
    { x: 10, z: 20, rot: Math.PI },
    { x: 45, z: 80, rot: -Math.PI / 4 },
    { x: 98, z: 45, rot: Math.PI / 2 },
    { x: 70, z: -35, rot: -Math.PI / 3 },
    { x: 40, z: -110, rot: 0 },
    { x: -55, z: -90, rot: Math.PI / 2 },
  ];

  lampLocations.forEach((l) => {
    trackGroup.add(createStreetlamp(l.x, l.z, l.rot));
  });

  // --------------------------------------------------------------------------
  // 8. TRAFFIC CONE HAZARDS (SCATTERED ON APEXES WITH DYNAMIC FLING PHYSICS)
  // --------------------------------------------------------------------------
  const coneGroup = new THREE.Group();
  const coneBaseGeo = new THREE.BoxGeometry(0.55, 0.05, 0.55);
  const coneBodyGeo = new THREE.CylinderGeometry(0.04, 0.24, 0.75, 14);
  const coneStripeGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.18, 14);

  const coneOrangeMat = new THREE.MeshStandardMaterial({ color: 0xff5500, roughness: 0.35 });
  const coneWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.2 });
  const coneBaseMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

  // 16 Strategic hazard cone placements across corner apexes and chicanes
  const conePlacements = [
    // Turn 1 Apex
    new THREE.Vector3(26, 0.05, 66),
    new THREE.Vector3(29, 0.05, 70),
    // Turn 2 Hairpin inside apex (invites drifting!)
    new THREE.Vector3(88, 0.05, 48),
    new THREE.Vector3(91, 0.05, 45),
    new THREE.Vector3(94, 0.05, 42),
    // Chicane S-curve
    new THREE.Vector3(62, 0.05, -28),
    new THREE.Vector3(76, 0.05, -62),
    // Sweeper Turn 4
    new THREE.Vector3(45, 0.05, -112),
    new THREE.Vector3(48, 0.05, -114),
    new THREE.Vector3(-12, 0.05, -121),
    new THREE.Vector3(-16, 0.05, -122),
    // Final Chicane
    new THREE.Vector3(-66, 0.05, -82),
    new THREE.Vector3(-56, 0.05, -34),
    new THREE.Vector3(-28, 0.05, -24),
  ];

  const trackCones = [];

  conePlacements.forEach((pos, idx) => {
    const singleCone = new THREE.Group();
    singleCone.name = `TrackCone_${idx}`;

    const base = new THREE.Mesh(coneBaseGeo, coneBaseMat);
    base.position.y = 0.025;
    base.castShadow = true;
    singleCone.add(base);

    const body = new THREE.Mesh(coneBodyGeo, coneOrangeMat);
    body.position.y = 0.4;
    body.castShadow = true;
    singleCone.add(body);

    const stripe = new THREE.Mesh(coneStripeGeo, coneWhiteMat);
    stripe.position.y = 0.38;
    stripe.castShadow = true;
    singleCone.add(stripe);

    singleCone.position.copy(pos);
    coneGroup.add(singleCone);

    trackCones.push({
      mesh: singleCone,
      basePos: pos.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Vector3(0, 0, 0),
      isAirborne: false,
      radius: 0.65,
    });
  });

  trackGroup.add(coneGroup);
  scene.add(trackGroup);

  // --------------------------------------------------------------------------
  // 9. COLLISION HELPERS & TRACK BOUNDARY LOGIC
  // --------------------------------------------------------------------------
  /**
   * Finds the closest point on the track spline to a given 3D position
   * Uses sample stepping for rapid real-time lookup
   */
  function getClosestTrackPoint(pos) {
    let closestDistSq = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < numSegments; i += 2) {
      const p = curvePoints[i];
      const dx = pos.x - p.x;
      const dz = pos.z - p.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closestIndex = i;
      }
    }

    return {
      point: curvePoints[closestIndex],
      tangent: curveTangents[closestIndex],
      normal: curveNormals[closestIndex],
      index: closestIndex,
      t: closestIndex / numSegments,
    };
  }

  /**
   * Checks vehicle against track boundaries and pushes back onto asphalt if hitting barrier
   * Returns collision event object if a hit occurred
   */
  function checkBoundaryCollision(vehiclePos) {
    const nearest = getClosestTrackPoint(vehiclePos);
    // Vector from track centerline to vehicle
    const diff = vehiclePos.clone().sub(nearest.point);
    diff.y = 0;

    // Dot product with track normal tells us lateral distance across track
    const lateralDist = diff.dot(nearest.normal);
    const maxAllowedDist = halfWidth - 0.7; // Vehicle boundary

    if (Math.abs(lateralDist) > maxAllowedDist) {
      // Hitting the boundary!
      const pushSign = Math.sign(lateralDist);
      const targetPos = nearest.point.clone().add(
        nearest.normal.clone().multiplyScalar(pushSign * (maxAllowedDist - 0.1))
      );

      return {
        collided: true,
        correctedPos: targetPos,
        pushNormal: nearest.normal.clone().multiplyScalar(-pushSign),
      };
    }

    return { collided: false };
  }

  /**
   * Updates cone physics (gravity, bouncing, and flying spin when struck)
   */
  function updateConesPhysics(dt) {
    const gravity = -26.0;

    trackCones.forEach((cone) => {
      if (!cone.isAirborne) return;

      // Integrate motion
      cone.velocity.y += gravity * dt;
      cone.mesh.position.x += cone.velocity.x * dt;
      cone.mesh.position.y += cone.velocity.y * dt;
      cone.mesh.position.z += cone.velocity.z * dt;

      // Integrate spin
      cone.mesh.rotation.x += cone.angularVelocity.x * dt;
      cone.mesh.rotation.y += cone.angularVelocity.y * dt;
      cone.mesh.rotation.z += cone.angularVelocity.z * dt;

      // Ground bounce
      if (cone.mesh.position.y <= 0.05) {
        cone.mesh.position.y = 0.05;
        cone.velocity.y *= -0.4; // Bounce damping
        cone.velocity.x *= 0.7;
        cone.velocity.z *= 0.7;
        cone.angularVelocity.multiplyScalar(0.7);

        // Once energy decays, settle on the ground
        if (Math.abs(cone.velocity.y) < 0.6 && Math.abs(cone.velocity.x) < 0.3) {
          cone.isAirborne = false;
          cone.velocity.set(0, 0, 0);
          cone.angularVelocity.set(0, 0, 0);
          cone.mesh.rotation.x = Math.PI / 2; // Lie knocked over on side
        }
      }
    });
  }

  return {
    trackCurve,
    trackWidth,
    checkpointGates,
    trackCones,
    getClosestTrackPoint,
    checkBoundaryCollision,
    updateConesPhysics,
  };
}

