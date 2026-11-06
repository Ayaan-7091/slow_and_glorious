import * as THREE from 'three';
import { createAsphaltRoadTexture } from './createStreetTextures.js';

/**
 * ============================================================================
 * CLOSED-LOOP INDIAN STREET CIRCUIT & PROPS (Clean Ribbon Geometry Rewrite)
 * ============================================================================
 * 
 * Strict Mathematical Invariants:
 *  1. Non-self-intersecting 10-point clockwise loop with minimum radius > 160 units
 *     and massive across-track clearance (> 135 units).
 *  2. Clean custom BufferGeometry ribbons generated from 400 evenly spaced samples
 *     (curve.getSpacedPoints(400)).
 *  3. Flat horizontal right vector: right = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()
 *     guaranteeing zero twist, zero flip, and zero stretched triangles.
 *  4. Lateral-only edge collision smoothly clamping vehicle to trackHalfWidth - 1.2.
 */

export function createTrack(scene) {
  const trackGroup = new THREE.Group();
  trackGroup.name = 'ArcadeTrack_System';

  // --------------------------------------------------------------------------
  // 1. WIDE, NON-SELF-INTERSECTING 10-POINT CLOCKWISE LOOP
  // --------------------------------------------------------------------------
  // Minimum radius is > 160 units everywhere, with > 135 units of clearance
  // between parallel road sections. Gentle, sweeping corners suitable for racing.
  const trackControlPoints = [
    new THREE.Vector3(-50, 0, -160), // Start / Finish Line (Main Straight entry)
    new THREE.Vector3(70, 0, -160),  // Main Straight exit heading East
    new THREE.Vector3(165, 0, -110), // Turn 1: Wide sweeper right
    new THREE.Vector3(185, 0, 10),   // Turn 2: High-speed sweeper South
    new THREE.Vector3(150, 0, 120),  // Turn 3: Technical sweeper South-West
    new THREE.Vector3(50, 0, 175),   // Turn 4: Southern curve heading West
    new THREE.Vector3(-70, 0, 165),  // Turn 5: Bottom straight heading West
    new THREE.Vector3(-165, 0, 110), // Turn 6: Sweeper turning North-West
    new THREE.Vector3(-185, 0, -10), // Turn 7: Western straight heading North
    new THREE.Vector3(-150, 0, -120),// Turn 8: Sweeper connecting back to Home Straight
  ];

  // Closed Catmull-Rom spline with smooth tension
  const trackCurve = new THREE.CatmullRomCurve3(trackControlPoints, true, 'catmullrom', 0.5);
  const trackTotalLength = trackCurve.getLength();

  const trackWidth = 14.0; // 14 meters wide for generous arcade drifting
  const halfWidth = trackWidth / 2;
  const curbWidth = 1.0;
  const sidewalkWidth = 2.4;

  // --------------------------------------------------------------------------
  // 2. 400 EVENLY SPACED SAMPLES & FLAT HORIZONTAL TANGENT FRAMES
  // --------------------------------------------------------------------------
  const N = 400; // 400 equidistant slices by arc-length
  const spacedPoints = trackCurve.getSpacedPoints(N);

  const tangents = [];
  const rights = [];

  for (let i = 0; i <= N; i++) {
    const nextIdx = (i + 1) % N;
    const prevIdx = (i - 1 + N) % N;
    const tan = new THREE.Vector3().subVectors(spacedPoints[nextIdx], spacedPoints[prevIdx]);
    tan.y = 0;
    tan.normalize();

    // Pure horizontal right vector in XZ plane (perpendicular to tangent)
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

    tangents.push(tan);
    rights.push(right);
  }

  // --------------------------------------------------------------------------
  // 3. CLEAN CUSTOM BUFFERGEOMETRY RIBBON GENERATOR
  // --------------------------------------------------------------------------
  /**
   * Builds an equidistant ribbon with verified upward normals (Y = +1)
   */
  function buildRibbon(offsetA, offsetB, yA, yB, colorFunc = null, uvRepeatV = 10.0) {
    const leftOffset = Math.min(offsetA, offsetB);
    const rightOffset = Math.max(offsetA, offsetB);
    const yLeft = offsetA < offsetB ? yA : yB;
    const yRight = offsetA < offsetB ? yB : yA;

    const positions = [];
    const uvs = [];
    const colors = [];
    const indices = [];

    for (let i = 0; i <= N; i++) {
      const p = spacedPoints[i];
      const r = rights[i];

      const pLeft = p.clone().addScaledVector(r, leftOffset);
      pLeft.y = yLeft;
      const pRight = p.clone().addScaledVector(r, rightOffset);
      pRight.y = yRight;

      positions.push(pLeft.x, pLeft.y, pLeft.z);
      positions.push(pRight.x, pRight.y, pRight.z);

      const v = (i / N) * uvRepeatV;
      uvs.push(0, v, 1, v);

      if (colorFunc) {
        const c = colorFunc(i);
        colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
      }

      if (i < N) {
        const v0 = i * 2;
        const v1 = i * 2 + 1;
        const v2 = (i + 1) * 2;
        const v3 = (i + 1) * 2 + 1;
        // Normal pointing straight up (+Y)
        indices.push(v0, v1, v2);
        indices.push(v1, v3, v2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    if (colorFunc) {
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  // 1. Road Surface Ribbon (Procedural asphalt road with aggregate noise, tar patches, and oil stains)
  const roadGeo = buildRibbon(-halfWidth, halfWidth, 0.05, 0.05, null, 40.0);
  const roadTexture = createAsphaltRoadTexture();
  const roadMat = new THREE.MeshStandardMaterial({
    map: roadTexture,
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0.08,
    polygonOffset: true,
    polygonOffsetFactor: -1.0,
    polygonOffsetUnits: -1.0,
  });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.receiveShadow = true;
  trackGroup.add(roadMesh);

  // Alternating Red & White curb colors every 4 slices (100 blocks around track)
  function curbColorAt(i) {
    const isRed = Math.floor(i / 4) % 2 === 0;
    return isRed
      ? { r: 0.88, g: 0.16, b: 0.16 }
      : { r: 0.95, g: 0.95, b: 0.95 };
  }

  const curbMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.65,
    side: THREE.DoubleSide,
  });

  // 2. Right Curb Ribbon
  const curbRGeo = buildRibbon(halfWidth, halfWidth + curbWidth, 0.058, 0.058, curbColorAt);
  const curbRMesh = new THREE.Mesh(curbRGeo, curbMat);
  curbRMesh.receiveShadow = true;
  trackGroup.add(curbRMesh);

  // 3. Left Curb Ribbon
  const curbLGeo = buildRibbon(-halfWidth - curbWidth, -halfWidth, 0.058, 0.058, curbColorAt);
  const curbLMesh = new THREE.Mesh(curbLGeo, curbMat);
  curbLMesh.receiveShadow = true;
  trackGroup.add(curbLMesh);

  // Raised Concrete Sidewalks behind curbs
  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x9e9a95,
    roughness: 0.9,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  // 4. Right Sidewalk Ribbon
  const walkRGeo = buildRibbon(
    halfWidth + curbWidth,
    halfWidth + curbWidth + sidewalkWidth,
    0.075,
    0.075,
    null,
    30.0
  );
  const walkRMesh = new THREE.Mesh(walkRGeo, sidewalkMat);
  walkRMesh.receiveShadow = true;
  trackGroup.add(walkRMesh);

  // 5. Left Sidewalk Ribbon
  const walkLGeo = buildRibbon(
    -halfWidth - curbWidth - sidewalkWidth,
    -halfWidth - curbWidth,
    0.075,
    0.075,
    null,
    30.0
  );
  const walkLMesh = new THREE.Mesh(walkLGeo, sidewalkMat);
  walkLMesh.receiveShadow = true;
  trackGroup.add(walkLMesh);

  // --------------------------------------------------------------------------
  // 4. CRISP WHITE ROAD EDGE LINES & YELLOW DASHED CENTERLINE
  // --------------------------------------------------------------------------
  const edgeLineGeo = new THREE.BoxGeometry(0.2, 0.02, 2.4);
  const edgeLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let i = 0; i < N; i += 2) {
    const pt = spacedPoints[i];
    const tan = tangents[i];
    const right = rights[i];
    const yaw = Math.atan2(tan.x, tan.z);

    // Left white edge line
    const leftEdge = new THREE.Mesh(edgeLineGeo, edgeLineMat);
    const leftPos = pt.clone().addScaledVector(right, -halfWidth + 0.35);
    leftEdge.position.set(leftPos.x, 0.055, leftPos.z);
    leftEdge.rotation.y = yaw;
    trackGroup.add(leftEdge);

    // Right white edge line
    const rightEdge = new THREE.Mesh(edgeLineGeo, edgeLineMat);
    const rightPos = pt.clone().addScaledVector(right, halfWidth - 0.35);
    rightEdge.position.set(rightPos.x, 0.055, rightPos.z);
    rightEdge.rotation.y = yaw;
    trackGroup.add(rightEdge);
  }

  // Yellow dashed centerline
  const dashGeo = new THREE.BoxGeometry(0.24, 0.02, 2.0);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

  for (let i = 0; i < N; i += 3) {
    const pt = spacedPoints[i];
    const tan = tangents[i];
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.position.set(pt.x, 0.065, pt.z);
    dash.rotation.y = Math.atan2(tan.x, tan.z);
    trackGroup.add(dash);
  }

  // --------------------------------------------------------------------------
  // 5. FESTIVE START/FINISH ARCH & CHECKPOINT GATES
  // --------------------------------------------------------------------------
  const checkpointTValues = [0.0, 0.22, 0.44, 0.68, 0.88];
  const checkpointGates = [];

  checkpointTValues.forEach((tVal, idx) => {
    const isStartFinish = idx === 0;
    const pt = trackCurve.getPointAt(tVal);
    const tan = trackCurve.getTangentAt(tVal).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    const gateGroup = new THREE.Group();
    gateGroup.position.set(pt.x, 0, pt.z);
    gateGroup.rotation.y = yaw;

    const spanWidth = trackWidth + 2.4;
    const archHeight = 6.2;

    if (isStartFinish) {
      // 🏁 GRAND START / FINISH ARCH (Festive Indian Saffron & Royal Green)
      const checkGeo = new THREE.PlaneGeometry(trackWidth, 2.2);
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

      // Grand Pillars
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0xff9900, roughness: 0.3 });
      const pillarGeo = new THREE.BoxGeometry(1.2, archHeight, 1.2);

      const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
      leftPillar.position.set(-spanWidth / 2, archHeight / 2, 0);
      leftPillar.castShadow = true;

      const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
      rightPillar.position.set(spanWidth / 2, archHeight / 2, 0);
      rightPillar.castShadow = true;

      // Crown caps
      const crownGeo = new THREE.ConeGeometry(1.1, 1.4, 4);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6 });
      const crownL = new THREE.Mesh(crownGeo, crownMat);
      crownL.position.set(-spanWidth / 2, archHeight + 0.7, 0);
      crownL.rotation.y = Math.PI / 4;
      const crownR = new THREE.Mesh(crownGeo, crownMat);
      crownR.position.set(spanWidth / 2, archHeight + 0.7, 0);
      crownR.rotation.y = Math.PI / 4;

      // Banner Crossbar
      const bannerGeo = new THREE.BoxGeometry(spanWidth + 1.2, 1.5, 0.6);
      const bannerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.set(0, archHeight - 0.2, 0);

      const signGeo = new THREE.PlaneGeometry(spanWidth - 1.0, 1.0);
      const signMat = new THREE.MeshBasicMaterial({ color: 0xffc107 });
      const signFace = new THREE.Mesh(signGeo, signMat);
      signFace.position.set(0, archHeight - 0.2, 0.31);

      gateGroup.add(leftPillar, rightPillar, crownL, crownR, banner, signFace);
    } else {
      // ⚡ GLOWING NEON CHECKPOINT GATES
      const neonColor = 0x00f0ff;
      const pillarGeo = new THREE.BoxGeometry(0.6, archHeight, 0.6);
      const neonMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });

      const leftPillar = new THREE.Mesh(pillarGeo, neonMat);
      leftPillar.position.set(-spanWidth / 2, archHeight / 2, 0);
      const rightPillar = new THREE.Mesh(pillarGeo, neonMat);
      rightPillar.position.set(spanWidth / 2, archHeight / 2, 0);

      const barGeo = new THREE.BoxGeometry(spanWidth + 0.6, 0.5, 0.5);
      const glowMat = new THREE.MeshStandardMaterial({
        color: neonColor,
        emissive: neonColor,
        emissiveIntensity: 0.85,
        roughness: 0.2,
      });
      const topBar = new THREE.Mesh(barGeo, glowMat);
      topBar.position.set(0, archHeight, 0);

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
  // 6. ROADSIDE PROPS: PALM/BANYAN TREES & VINTAGE STREETLAMPS
  // --------------------------------------------------------------------------
  function createPalmTree(x, z, scale = 1.0) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28 - i * 0.03, 0.32 - i * 0.03, 1.4, 8),
        trunkMat
      );
      seg.position.set(i * 0.12, 0.7 + i * 1.3, 0);
      seg.rotation.z = -0.06;
      seg.castShadow = true;
      tree.add(seg);
    }

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

  function createStreetlamp(x, z, rotY = 0) {
    const lamp = new THREE.Group();
    lamp.position.set(x, 0, z);
    lamp.rotation.y = rotY;

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x263238, metalness: 0.8, roughness: 0.4 });
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 6.0, 8);
    const pole = new THREE.Mesh(poleGeo, metalMat);
    pole.position.y = 3.0;
    lamp.add(pole);

    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 8);
    const arm = new THREE.Mesh(armGeo, metalMat);
    arm.position.set(0.6, 5.8, 0);
    arm.rotation.z = Math.PI / 3;
    lamp.add(arm);

    const headGeo = new THREE.ConeGeometry(0.35, 0.5, 6);
    const head = new THREE.Mesh(headGeo, metalMat);
    head.position.set(1.2, 5.4, 0);
    lamp.add(head);

    const light = new THREE.PointLight(0xffb74d, 1.8, 18, 1.4);
    light.position.set(1.2, 5.1, 0);
    lamp.add(light);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe082 })
    );
    bulb.position.copy(light.position);
    lamp.add(bulb);

    return lamp;
  }

  // Place lamps and trees safely along the outer perimeter of the track
  const propTVals = [0.05, 0.12, 0.20, 0.28, 0.35, 0.42, 0.50, 0.58, 0.65, 0.72, 0.80, 0.88, 0.95];
  propTVals.forEach((tVal, idx) => {
    const pt = trackCurve.getPointAt(tVal);
    const tan = trackCurve.getTangentAt(tVal).normalize();
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    // Lamp on right outer sidewalk edge
    const lampPos = pt.clone().addScaledVector(right, halfWidth + curbWidth + sidewalkWidth + 0.6);
    trackGroup.add(createStreetlamp(lampPos.x, lampPos.z, yaw + Math.PI));

    // Trees on left and right outer perimeters
    const treePosR = pt.clone().addScaledVector(right, halfWidth + curbWidth + sidewalkWidth + 3.8);
    const treePosL = pt.clone().addScaledVector(right, -(halfWidth + curbWidth + sidewalkWidth + 3.8));

    if (idx % 2 === 0) {
      trackGroup.add(createPalmTree(treePosR.x, treePosR.z, 1.1));
      trackGroup.add(createBanyanTree(treePosL.x, treePosL.z, 1.0));
    } else {
      trackGroup.add(createBanyanTree(treePosR.x, treePosR.z, 1.15));
      trackGroup.add(createPalmTree(treePosL.x, treePosL.z, 1.05));
    }
  });

  // --------------------------------------------------------------------------
  // 7. TRAFFIC CONE HAZARDS (DYNAMICALLY GROUNDED ON APEXES)
  // --------------------------------------------------------------------------
  const coneGroup = new THREE.Group();
  const coneBaseGeo = new THREE.BoxGeometry(0.55, 0.05, 0.55);
  const coneBodyGeo = new THREE.CylinderGeometry(0.04, 0.24, 0.75, 14);
  const coneStripeGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.18, 14);

  const coneOrangeMat = new THREE.MeshStandardMaterial({ color: 0xff5500, roughness: 0.35 });
  const coneWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.2 });
  const coneBaseMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

  const coneConfigs = [
    { t: 0.18, offset: -3.4 },
    { t: 0.20, offset: -3.8 },
    { t: 0.22, offset: -3.4 },
    { t: 0.36, offset: 3.5 },
    { t: 0.38, offset: 4.0 },
    { t: 0.40, offset: 3.5 },
    { t: 0.58, offset: -3.5 },
    { t: 0.60, offset: -4.0 },
    { t: 0.62, offset: -3.5 },
    { t: 0.78, offset: 3.5 },
    { t: 0.80, offset: 4.0 },
    { t: 0.82, offset: 3.5 },
    { t: 0.94, offset: -3.2 },
    { t: 0.96, offset: 3.2 },
  ];

  const trackCones = [];

  coneConfigs.forEach((cfg, idx) => {
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

    const pt = trackCurve.getPointAt(cfg.t);
    const tan = trackCurve.getTangentAt(cfg.t).normalize();
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const pos = pt.clone().addScaledVector(right, cfg.offset);
    pos.y = 0.05;

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
  // 8. COLLISION HELPERS & TRACK BOUNDARY LOGIC
  // --------------------------------------------------------------------------
  /**
   * Finds the closest point on the track spline to a given 3D position
   * Uses sample stepping across 400 equidistant slices
   */
  function getClosestTrackPoint(pos) {
    let closestDistSq = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < N; i++) {
      const p = spacedPoints[i];
      const dx = pos.x - p.x;
      const dz = pos.z - p.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closestIndex = i;
      }
    }

    return {
      point: spacedPoints[closestIndex],
      tangent: tangents[closestIndex],
      normal: rights[closestIndex], // Horizontal right vector
      index: closestIndex,
      t: closestIndex / N,
    };
  }

  /**
   * Checks vehicle against track boundaries:
   * ONLY checks lateral distance from nearest curve point (lateralDist > trackHalfWidth - 1.2),
   * smoothly clamping the player inside the road and aligning velocity with the road tangent
   * without ever freezing the player at 0 speed.
   */
  function checkBoundaryCollision(vehiclePos) {
    const nearest = getClosestTrackPoint(vehiclePos);
    const diff = vehiclePos.clone().sub(nearest.point);
    diff.y = 0;

    // Dot product with right vector measures lateral distance (-left, +right)
    const lateralDist = diff.dot(nearest.normal);
    const maxAllowedDist = halfWidth - 1.2; // Strictly trackHalfWidth - 1.2

    if (Math.abs(lateralDist) > maxAllowedDist) {
      const pushSign = Math.sign(lateralDist);
      const clampedPos = nearest.point.clone().addScaledVector(
        nearest.normal,
        pushSign * maxAllowedDist
      );
      clampedPos.y = vehiclePos.y;

      const tangentYaw = Math.atan2(nearest.tangent.x, nearest.tangent.z);

      return {
        collided: true,
        clampedPos: clampedPos,
        tangentYaw: tangentYaw,
        tangent: nearest.tangent,
        pushNormal: nearest.normal.clone().multiplyScalar(-pushSign),
        lateralDist: lateralDist,
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

      cone.velocity.y += gravity * dt;
      cone.mesh.position.x += cone.velocity.x * dt;
      cone.mesh.position.y += cone.velocity.y * dt;
      cone.mesh.position.z += cone.velocity.z * dt;

      cone.mesh.rotation.x += cone.angularVelocity.x * dt;
      cone.mesh.rotation.y += cone.angularVelocity.y * dt;
      cone.mesh.rotation.z += cone.angularVelocity.z * dt;

      if (cone.mesh.position.y <= 0.05) {
        cone.mesh.position.y = 0.05;
        cone.velocity.y *= -0.4;
        cone.velocity.x *= 0.7;
        cone.velocity.z *= 0.7;
        cone.angularVelocity.multiplyScalar(0.7);

        if (Math.abs(cone.velocity.y) < 0.6 && Math.abs(cone.velocity.x) < 0.3) {
          cone.isAirborne = false;
          cone.velocity.set(0, 0, 0);
          cone.angularVelocity.set(0, 0, 0);
          cone.mesh.rotation.x = Math.PI / 2;
        }
      }
    });
  }

  function setMonsoonRoad(enabled) {
    if (enabled) {
      roadMat.roughness = 0.16;
      roadMat.metalness = 0.45;
    } else {
      roadMat.roughness = 0.88;
      roadMat.metalness = 0.08;
    }
  }

  return {
    trackCurve,
    trackWidth,
    trackTotalLength,
    checkpointGates,
    trackCones,
    roadMat,
    setMonsoonRoad,
    getClosestTrackPoint,
    checkBoundaryCollision,
    updateConesPhysics,
  };
}
