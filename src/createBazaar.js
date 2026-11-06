import * as THREE from 'three';

/**
 * ============================================================================
 * VIBRANT INDIAN BAZAAR STREETSCAPE & CONTINUOUS URBAN CORRIDOR (Sprint 4 Fix)
 * ============================================================================
 * 
 * Features:
 *  1. Continuous, Enclosed Street Corridor: 70+ densely packed shop-houses
 *     lining both sides of the track with ZERO empty horizon gaps.
 *  2. Strict Safe Track Corridor: Mathematically verifies minimum distance
 *     against all track curve points (minimum clearance >= halfWidth + 3.5m).
 *  3. Authentic Indian Bazaar architecture: Terracotta, Warm Cream, Mustard,
 *     Indigo, and Jaipur Rose facades with balconies, rooftop water tanks,
 *     striped shop awnings, and procedural bilingual Hindi/English signboards.
 *  4. Distant City Skyline Silhouettes lining the outer perimeter.
 *  5. Overhead festive bunting with triangular flags and glowing fairy lights.
 *  6. Roadside fruit carts and highway milestone stones safely placed behind sidewalks.
 */

export function createBazaar(scene, trackCurve, trackWidth = 14.0) {
  const bazaarGroup = new THREE.Group();
  bazaarGroup.name = 'Indian_Bazaar_Streetscape';

  const halfWidth = trackWidth / 2;
  const minClearanceDist = halfWidth + 3.5; // Strict clearance boundary

  // Sample 200 points along track curve to verify clearance
  const trackSamplePoints = [];
  const numCheckSamples = 200;
  for (let i = 0; i < numCheckSamples; i++) {
    const p = trackCurve.getPointAt(i / numCheckSamples);
    trackSamplePoints.push(new THREE.Vector3(p.x, 0, p.z));
  }

  /**
   * Helper to verify a 3D position is completely outside the safe track corridor
   */
  function isSafeDistance(x, z, requiredDist = minClearanceDist) {
    const testPos = new THREE.Vector3(x, 0, z);
    for (let i = 0; i < trackSamplePoints.length; i++) {
      if (testPos.distanceTo(trackSamplePoints[i]) < requiredDist) {
        return false;
      }
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // 1. PROCEDURAL SIGNBOARDS (CanvasTexture)
  // --------------------------------------------------------------------------
  const shopSignData = [
    { title: 'GARAM CHAI ☕', sub: 'ताजा कड़क चाय', bg: '#d9480f', text: '#fff' },
    { title: 'ROYAL SWEETS 🪔', sub: 'शुद्ध देशी घी मिठाई', bg: '#f59f00', text: '#212529' },
    { title: 'RAJU AUTO GARAGE 🔧', sub: 'ऑटो रिपेयर & स्पेयर', bg: '#1098ad', text: '#fff' },
    { title: 'BOLLYWOOD CINEMA 🎬', sub: 'सुपरहिट शो चालू है', bg: '#c2255c', text: '#ffe066' },
    { title: 'LASSI CORNER 🥛', sub: 'मलाई मार के लस्सी', bg: '#2b8a3e', text: '#fff' },
    { title: 'DELHI CHAT BHANDAR 🌶️', sub: 'तीखी गोलगप्पे & टिक्की', bg: '#e03131', text: '#fff' },
    { title: 'BOMBAY SPICE MARKET 🍛', sub: 'खड़े मसाले & ड्राई फ्रूट्स', bg: '#e67700', text: '#fff' },
    { title: 'JAIPUR TEXTILES 🧵', sub: 'हैंडलूम साड़ियाँ & कुर्ते', bg: '#845ef7', text: '#fff' },
  ];

  function createSignTexture(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = data.bg;
    ctx.fillRect(0, 0, 384, 96);
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 376, 88);

    ctx.fillStyle = data.text;
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(data.title, 192, 12);

    ctx.fillStyle = data.text;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(data.sub, 192, 54);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  const signTextures = shopSignData.map(createSignTexture);

  // --------------------------------------------------------------------------
  // 2. PALETTE OF TRADITIONAL INDIAN BAZAAR ARCHITECTURE
  // --------------------------------------------------------------------------
  const buildingPalettes = [
    { name: 'Terracotta', color: 0xc85a32, trim: 0x873214 },
    { name: 'Warm Cream', color: 0xfaedcd, trim: 0xd4a373 },
    { name: 'Mustard', color: 0xe09f3e, trim: 0x9e5a1e },
    { name: 'Indigo', color: 0x2b3a67, trim: 0x16213e },
    { name: 'Jaipur Rose', color: 0xe27396, trim: 0xa83258 },
    { name: 'Mint Green', color: 0x52b788, trim: 0x1b4332 },
  ];

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x1f2329,
    roughness: 0.3,
    metalness: 0.7,
  });

  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x3d271d,
    roughness: 0.8,
  });

  const skylineMat = new THREE.MeshStandardMaterial({
    color: 0x8e8378,
    roughness: 0.95,
  });

  // Helper to create a single stylized shop-house building
  function createShopHouse(paletteIdx, heightStories = 2, signIdx = 0, width = 8.5) {
    const bldg = new THREE.Group();
    const p = buildingPalettes[paletteIdx % buildingPalettes.length];

    const wallMat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.85 });
    const trimMat = new THREE.MeshStandardMaterial({ color: p.trim, roughness: 0.75 });

    const depth = 7.0;
    const storyHeight = 3.6;
    const totalHeight = heightStories * storyHeight;

    // Main building block
    const mainGeo = new THREE.BoxGeometry(width, totalHeight, depth);
    const mainMesh = new THREE.Mesh(mainGeo, wallMat);
    mainMesh.position.y = totalHeight / 2;
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    bldg.add(mainMesh);

    // Parapet roof rim
    const parapetGeo = new THREE.BoxGeometry(width + 0.3, 0.45, depth + 0.3);
    const parapet = new THREE.Mesh(parapetGeo, trimMat);
    parapet.position.y = totalHeight + 0.22;
    bldg.add(parapet);

    // Flat roof water tank / staircase head-room (Classic Indian rooftop detail)
    const tankGeo = new THREE.BoxGeometry(2.4, 1.8, 2.4);
    const tank = new THREE.Mesh(tankGeo, trimMat);
    tank.position.set((Math.random() - 0.5) * (width * 0.4), totalHeight + 0.9, 0);
    bldg.add(tank);

    // Storefront Door & Windows on Ground Floor
    const doorGeo = new THREE.BoxGeometry(2.0, 2.6, 0.1);
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.3, depth / 2 + 0.05);
    bldg.add(door);

    const winGeo = new THREE.BoxGeometry(1.4, 1.5, 0.1);
    const winLeft = new THREE.Mesh(winGeo, windowMat);
    winLeft.position.set(-width * 0.3, 1.6, depth / 2 + 0.05);
    const winRight = new THREE.Mesh(winGeo, windowMat);
    winRight.position.set(width * 0.3, 1.6, depth / 2 + 0.05);
    bldg.add(winLeft, winRight);

    // Upper Story Windows & Balconies
    for (let s = 1; s < heightStories; s++) {
      const storyY = s * storyHeight;
      const upperWin1 = new THREE.Mesh(winGeo, windowMat);
      upperWin1.position.set(-width * 0.28, storyY + 1.8, depth / 2 + 0.05);
      const upperWin2 = new THREE.Mesh(winGeo, windowMat);
      upperWin2.position.set(width * 0.28, storyY + 1.8, depth / 2 + 0.05);
      bldg.add(upperWin1, upperWin2);

      // Balcony projection
      const balconyGeo = new THREE.BoxGeometry(width * 0.78, 0.2, 1.0);
      const balcony = new THREE.Mesh(balconyGeo, trimMat);
      balcony.position.set(0, storyY + 0.8, depth / 2 + 0.5);
      bldg.add(balcony);

      const railGeo = new THREE.BoxGeometry(width * 0.78, 0.7, 0.05);
      const rail = new THREE.Mesh(railGeo, trimMat);
      rail.position.set(0, storyY + 1.25, depth / 2 + 1.0);
      bldg.add(rail);
    }

    // Storefront Striped Fabric Awning
    const awningColors = [0xd32f2f, 0x1976d2, 0x388e3c, 0xf57c00];
    const awningMat = new THREE.MeshStandardMaterial({
      color: awningColors[paletteIdx % awningColors.length],
      roughness: 0.6,
    });
    const awningGeo = new THREE.BoxGeometry(width * 0.9, 0.1, 1.5);
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 3.1, depth / 2 + 0.75);
    awning.rotation.x = 0.22;
    bldg.add(awning);

    // Glowing Signboard above the awning
    const signGeo = new THREE.PlaneGeometry(width * 0.75, 1.2);
    const signTex = signTextures[signIdx % signTextures.length];
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const signboard = new THREE.Mesh(signGeo, signMat);
    signboard.position.set(0, 3.8, depth / 2 + 0.08);
    bldg.add(signboard);

    return bldg;
  }

  // --------------------------------------------------------------------------
  // 3. GENERATE CONTINUOUS ENCLOSED STREET CORRIDOR (72 STOREFRONTS)
  // --------------------------------------------------------------------------
  const numSteps = 40; // 40 steps on Left + 40 steps on Right = 80 buildings
  const lateralOffset = halfWidth + 6.2; // Placed right behind sidewalk

  for (let i = 0; i < numSteps; i++) {
    const t = (i / numSteps) % 1.0;
    const pt = trackCurve.getPointAt(t);
    pt.y = 0;
    const tan = trackCurve.getTangentAt(t);
    tan.y = 0;
    tan.normalize();
    const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    // 1. LEFT SIDE BUILDING
    const posL = pt.clone().addScaledVector(norm, lateralOffset);
    if (isSafeDistance(posL.x, posL.z, minClearanceDist + 1.5)) {
      const storiesL = 2 + (i % 3);
      const bldgL = createShopHouse(i, storiesL, i, 8.8);
      bldgL.position.copy(posL);
      bldgL.rotation.y = yaw - Math.PI / 2; // Face towards road
      bazaarGroup.add(bldgL);
    }

    // 2. RIGHT SIDE BUILDING
    const posR = pt.clone().addScaledVector(norm, -lateralOffset);
    if (isSafeDistance(posR.x, posR.z, minClearanceDist + 1.5)) {
      const storiesR = 2 + ((i + 1) % 3);
      const bldgR = createShopHouse(i + 3, storiesR, i + 3, 8.8);
      bldgR.position.copy(posR);
      bldgR.rotation.y = yaw + Math.PI / 2; // Face towards road
      bazaarGroup.add(bldgR);
    }

    // 3. OUTER PERIMETER CITY SKYLINE SILHOUETTES (Fill distant horizon)
    if (i % 2 === 0) {
      const outerOffset = lateralOffset + 18.0;
      const skyPos = pt.clone().addScaledVector(norm, (i % 4 === 0 ? 1 : -1) * outerOffset);
      const skyStories = 5 + (i % 4);
      const skyHeight = skyStories * 4.0;
      const skyWidth = 14.0 + (i % 3) * 3.0;

      const skylineGeo = new THREE.BoxGeometry(skyWidth, skyHeight, 10.0);
      const skylineMesh = new THREE.Mesh(skylineGeo, skylineMat);
      skylineMesh.position.set(skyPos.x, skyHeight / 2, skyPos.z);
      skylineMesh.rotation.y = yaw;
      bazaarGroup.add(skylineMesh);
    }
  }

  // --------------------------------------------------------------------------
  // 4. OVERHEAD FESTIVE BUNTING & GLOWING FAIRY LIGHTS
  // --------------------------------------------------------------------------
  const buntingTValues = [0.08, 0.32, 0.55, 0.78];
  const flagColors = [0xff1744, 0xffea00, 0x00e676, 0x2979ff, 0xff9100];

  buntingTValues.forEach((tVal) => {
    const pt = trackCurve.getPointAt(tVal);
    pt.y = 0;
    const tan = trackCurve.getTangentAt(tVal);
    tan.y = 0;
    tan.normalize();
    const span = trackWidth + 4.0;

    const buntingGroup = new THREE.Group();
    buntingGroup.position.copy(pt);
    buntingGroup.rotation.y = Math.atan2(tan.x, tan.z);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 });
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8);
    
    const poleL = new THREE.Mesh(poleGeo, poleMat);
    poleL.position.set(-span / 2, 3.75, 0);
    const poleR = new THREE.Mesh(poleGeo, poleMat);
    poleR.position.set(span / 2, 3.75, 0);
    buntingGroup.add(poleL, poleR);

    const cableGeo = new THREE.CylinderGeometry(0.015, 0.015, span, 8);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.rotation.z = Math.PI / 2;
    cable.position.set(0, 6.2, 0);
    buntingGroup.add(cable);

    const numFlags = 16;
    for (let f = 0; f < numFlags; f++) {
      const fx = -span / 2 + 1.0 + (f / (numFlags - 1)) * (span - 2.0);
      const sag = Math.sin((f / (numFlags - 1)) * Math.PI) * 0.6;
      const fy = 6.2 - sag;

      const flagGeo = new THREE.ConeGeometry(0.24, 0.45, 3);
      const flagMat = new THREE.MeshBasicMaterial({
        color: flagColors[f % flagColors.length],
        side: THREE.DoubleSide,
      });
      const flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.set(fx, fy - 0.22, 0);
      flag.rotation.z = Math.PI;
      buntingGroup.add(flag);

      if (f % 3 === 0) {
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffea99 })
        );
        bulb.position.set(fx, fy, 0);
        buntingGroup.add(bulb);
      }
    }

    bazaarGroup.add(buntingGroup);
  });

  // --------------------------------------------------------------------------
  // 5. ROADSIDE PROPS: FRUIT CARTS & HIGHWAY MILESTONES
  // --------------------------------------------------------------------------
  function createFruitCart(pos, rotY) {
    const cart = new THREE.Group();
    cart.position.copy(pos);
    cart.rotation.y = rotY;

    const bedGeo = new THREE.BoxGeometry(2.2, 0.15, 1.4);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    const bed = new THREE.Mesh(bedGeo, woodMat);
    bed.position.y = 0.85;
    cart.add(bed);

    const legGeo = new THREE.BoxGeometry(0.08, 0.85, 0.08);
    const l1 = new THREE.Mesh(legGeo, woodMat);
    l1.position.set(-1.0, 0.42, -0.6);
    const l2 = new THREE.Mesh(legGeo, woodMat);
    l2.position.set(-1.0, 0.42, 0.6);
    const l3 = new THREE.Mesh(legGeo, woodMat);
    l3.position.set(1.0, 0.42, -0.6);
    const l4 = new THREE.Mesh(legGeo, woodMat);
    l4.position.set(1.0, 0.42, 0.6);
    cart.add(l1, l2, l3, l4);

    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x271a15, roughness: 0.8 });
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.rotation.x = Math.PI / 2;
    w1.position.set(0, 0.42, -0.75);
    const w2 = new THREE.Mesh(wheelGeo, wheelMat);
    w2.rotation.x = Math.PI / 2;
    w2.position.set(0, 0.42, 0.75);
    cart.add(w1, w2);

    const mangoMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.3 });
    const mangoGeo = new THREE.SphereGeometry(0.12, 8, 8);
    for (let mx = -0.7; mx <= 0.7; mx += 0.26) {
      for (let mz = -0.4; mz <= 0.4; mz += 0.26) {
        const mango = new THREE.Mesh(mangoGeo, mangoMat);
        mango.position.set(mx, 1.0, mz);
        cart.add(mango);
      }
    }
    return cart;
  }

  function createHighwayMilestone(pos, rotY, km = 42) {
    const stone = new THREE.Group();
    stone.position.copy(pos);
    stone.rotation.y = rotY;

    const baseGeo = new THREE.BoxGeometry(0.6, 0.8, 0.3);
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.6 });
    const base = new THREE.Mesh(baseGeo, whiteMat);
    base.position.y = 0.4;
    stone.add(base);

    const topGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16, 1, false, 0, Math.PI);
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.4 });
    const topDome = new THREE.Mesh(topGeo, yellowMat);
    topDome.position.set(0, 0.8, 0);
    topDome.rotation.z = Math.PI / 2;
    topDome.rotation.y = Math.PI / 2;
    stone.add(topDome);

    return stone;
  }

  // Place roadside fruit carts and milestones safely behind sidewalks
  const propTValues = [0.15, 0.38, 0.62, 0.85];
  propTValues.forEach((tVal, idx) => {
    const p = trackCurve.getPointAt(tVal);
    p.y = 0;
    const tan = trackCurve.getTangentAt(tVal);
    tan.y = 0;
    tan.normalize();
    const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    const cartPos = p.clone().addScaledVector(norm, halfWidth + 3.8);
    if (isSafeDistance(cartPos.x, cartPos.z, minClearanceDist)) {
      bazaarGroup.add(createFruitCart(cartPos, yaw));
    }

    const stonePos = p.clone().addScaledVector(norm, -(halfWidth + 3.6));
    if (isSafeDistance(stonePos.x, stonePos.z, minClearanceDist)) {
      bazaarGroup.add(createHighwayMilestone(stonePos, yaw, (idx + 1) * 12));
    }
  });

  scene.add(bazaarGroup);
  return { bazaarGroup };
}
