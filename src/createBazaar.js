import * as THREE from 'three';
import {
  createBuildingFacadeTexture,
  createDesiShopSignTexture,
  createPissingFineStencilTexture,
  createRetroBollywoodPosterTexture,
  createCorrugatedBlueSheetTexture,
  createBillboardHoardingTexture,
  createVibrantRoadSignTexture,
  createRoadEyeLevelStencilTexture,
} from './createStreetTextures.js';

/**
 * ============================================================================
 * 3-LAYER INDIAN CITY DEPTH, SOLID METRO OVERPASS & ROAD-FACING BAZAAR
 * ============================================================================
 * 
 * Features:
 *  1. Clean Matte Architectural Finishes:
 *      - Replaced harsh yellow window grids with natural daytime architectural
 *        finishes (weathered concrete gray, dusty beige, terracotta, slate blue)
 *        featuring unlit recessed windows and AC units.
 *  2. Solid Unbroken Concrete Metro Overpass:
 *      - Single, continuous concrete box girder viaduct with dual pillars rooted
 *        firmly on the sidewalk curb edges, zero floating boxes or gaps.
 *  3. Guaranteed Road-Facing Orientation:
 *      - Every building, signboard, stencil, and infill uses lookAt(roadCenter).
 *  4. Eye-Level Protruding 3D Signboards & Wall Stencils:
 *      - High-contrast 3D box signboards at y = 4.2m with bold Hindi + Hinglish.
 *      - Wall graffiti stencils at y = 1.8m (spitting fines, no urination, buri nazar).
 *  5. Sidewalk Curb-Edge Sabzi Thelas & Chai Tapris:
 *      - Placed directly along the curb (halfWidth + 1.8) with pyramids of
 *        vegetables, striped canopies, and warm lanterns.
 *  6. 360° Distant Metropolitan Skyline:
 *      - 56 perimeter skyscrapers and soft hazy hills hiding the horizon.
 */

export function createBazaar(scene, trackCurve, trackWidth = 14.0) {
  const bazaarGroup = new THREE.Group();
  bazaarGroup.name = 'Indian_Bazaar_Streetscape';

  const halfWidth = trackWidth / 2;
  const minClearanceDist = halfWidth + 3.8;

  // Sample 250 points along track curve to verify clearance
  const trackSamplePoints = [];
  const numCheckSamples = 250;
  for (let i = 0; i < numCheckSamples; i++) {
    const p = trackCurve.getPointAt(i / numCheckSamples);
    trackSamplePoints.push(new THREE.Vector3(p.x, 0, p.z));
  }

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
  // SHARED MATERIALS & TEXTURES
  // --------------------------------------------------------------------------
  const facadeTextures = [0, 1, 2, 3, 4, 5].map((i) => createBuildingFacadeTexture(i));
  const bollywoodPosterTextures = [0, 1, 2].map((i) => createRetroBollywoodPosterTexture(i));
  const blueMetroSheetTex = createCorrugatedBlueSheetTexture();
  const billboardTextures = [0, 1, 2, 3].map((i) => createBillboardHoardingTexture(i));

  // Clean, realistic matte architectural materials (no harsh yellow window textures)
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x7a808c,
    roughness: 0.92,
    metalness: 0.08,
  });

  const dustyBeigeMat = new THREE.MeshStandardMaterial({
    color: 0xbdb39c,
    roughness: 0.90,
  });

  const terracottaMat = new THREE.MeshStandardMaterial({
    color: 0x9c533e,
    roughness: 0.88,
  });

  const slateBlueMat = new THREE.MeshStandardMaterial({
    color: 0x546575,
    roughness: 0.92,
  });

  const warmCreamMat = new THREE.MeshStandardMaterial({
    color: 0xd6cbb8,
    roughness: 0.90,
  });

  const darkCharcoalMat = new THREE.MeshStandardMaterial({
    color: 0x3d434d,
    roughness: 0.85,
    metalness: 0.15,
  });

  const aptColorMaterials = [concreteMat, dustyBeigeMat, terracottaMat, slateBlueMat, warmCreamMat];

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x181c22,
    roughness: 0.35,
    metalness: 0.6,
  });

  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x3d271d,
    roughness: 0.85,
  });

  const metalTrussMat = new THREE.MeshStandardMaterial({
    color: 0x2b2d42,
    roughness: 0.6,
    metalness: 0.7,
  });

  const brickWallMat = new THREE.MeshStandardMaterial({
    color: 0x8b3a2b,
    roughness: 0.92,
  });

  const neemGreenMat = new THREE.MeshStandardMaterial({
    color: 0x2d6a4f,
    roughness: 0.85,
    flatShading: true,
  });

  const gulmoharOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xe76f51,
    roughness: 0.85,
    flatShading: true,
  });

  const trunkBrownMat = new THREE.MeshStandardMaterial({
    color: 0x4a3525,
    roughness: 0.95,
  });

  const waterTankBlackMat = new THREE.MeshStandardMaterial({
    color: 0x151618,
    roughness: 0.4,
    metalness: 0.2,
  });

  const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xffea88 });

  // --------------------------------------------------------------------------
  // 1. ROADSIDE SHOP-HOUSE GENERATOR WITH PROTRUDING EYE-LEVEL 3D SIGNBOARDS
  // --------------------------------------------------------------------------
  const buildingPalettes = [
    { name: 'Terracotta', trim: 0x873214 },
    { name: 'Warm Cream', trim: 0xd4a373 },
    { name: 'Mustard', trim: 0x9e5a1e },
    { name: 'Indigo', trim: 0x16213e },
    { name: 'Jaipur Rose', trim: 0xa83258 },
    { name: 'Mint Green', trim: 0x1b4332 },
  ];

  function createShopHouse(paletteIdx, heightStories = 2, signIdx = 0, width = 9.2) {
    const bldg = new THREE.Group();
    const p = buildingPalettes[paletteIdx % buildingPalettes.length];
    const facadeTex = facadeTextures[paletteIdx % facadeTextures.length];

    const wallMat = new THREE.MeshStandardMaterial({
      map: facadeTex,
      roughness: 0.88,
      metalness: 0.05,
    });
    const trimMat = new THREE.MeshStandardMaterial({ color: p.trim, roughness: 0.75 });

    const depth = 7.5;
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
    const parapetGeo = new THREE.BoxGeometry(width + 0.35, 0.45, depth + 0.35);
    const parapet = new THREE.Mesh(parapetGeo, trimMat);
    parapet.position.y = totalHeight + 0.22;
    bldg.add(parapet);

    // Black rooftop plastic water tank (Sintex style)
    const tankGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.4, 12);
    const tank = new THREE.Mesh(tankGeo, waterTankBlackMat);
    tank.position.set((Math.random() - 0.5) * (width * 0.5), totalHeight + 0.7, 0);
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

    // Upper Story Windows, Balconies & AC Units
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

      if (s === 1) {
        const acGeo = new THREE.BoxGeometry(0.7, 0.45, 0.35);
        const acMesh = new THREE.Mesh(acGeo, concreteMat);
        acMesh.position.set(width * 0.38, storyY + 1.3, depth / 2 + 0.2);
        bldg.add(acMesh);
      }
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

    // ------------------------------------------------------------------------
    // PROTRUDING 3D ROAD-FACING EYE-LEVEL SIGNBOARD (y = 4.2m)
    // ------------------------------------------------------------------------
    const signBoardWidth = width * 0.84;
    const signBoardHeight = 1.45;
    const signBoardDepth = 0.38;

    const signBoxGeo = new THREE.BoxGeometry(signBoardWidth, signBoardHeight, signBoardDepth);
    const signBoxMat = new THREE.MeshStandardMaterial({ color: 0x1c1e21, roughness: 0.5 });
    const signBox = new THREE.Mesh(signBoxGeo, signBoxMat);
    signBox.position.set(0, 4.2, depth / 2 + 0.22);
    bldg.add(signBox);

    const signFaceGeo = new THREE.PlaneGeometry(signBoardWidth - 0.1, signBoardHeight - 0.1);
    const signFaceTex = createVibrantRoadSignTexture(signIdx);
    const signFaceMat = new THREE.MeshBasicMaterial({ map: signFaceTex });
    const signFace = new THREE.Mesh(signFaceGeo, signFaceMat);
    signFace.position.set(0, 0, signBoardDepth / 2 + 0.01);
    signBox.add(signFace);

    // Overhead brass lamps
    for (let lx of [-signBoardWidth * 0.32, signBoardWidth * 0.32]) {
      const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 6);
      const arm = new THREE.Mesh(armGeo, metalTrussMat);
      arm.position.set(lx, signBoardHeight / 2 + 0.15, signBoardDepth / 2 + 0.12);
      arm.rotation.x = Math.PI / 4;
      signBox.add(arm);

      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), lampGlowMat);
      lamp.position.set(lx, signBoardHeight / 2 + 0.3, signBoardDepth / 2 + 0.25);
      signBox.add(lamp);
    }

    // ------------------------------------------------------------------------
    // ROAD-FACING WALL STENCIL PLAQUE AT LOWER EYE LEVEL (y = 1.8m)
    // ------------------------------------------------------------------------
    const stencilTex = createRoadEyeLevelStencilTexture(paletteIdx);
    const stencilPlaqueGeo = new THREE.BoxGeometry(3.6, 1.25, 0.12);
    const stencilPlaqueMat = new THREE.MeshBasicMaterial({ map: stencilTex });
    const stencilPlaque = new THREE.Mesh(stencilPlaqueGeo, stencilPlaqueMat);
    stencilPlaque.position.set(width * 0.26, 1.8, depth / 2 + 0.08);
    bldg.add(stencilPlaque);

    // Retro Bollywood Movie Poster on the other side
    const posterTex = bollywoodPosterTextures[paletteIdx % bollywoodPosterTextures.length];
    const posterGeo = new THREE.BoxGeometry(1.6, 2.2, 0.08);
    const posterMat = new THREE.MeshBasicMaterial({ map: posterTex });
    const posterMesh = new THREE.Mesh(posterGeo, posterMat);
    posterMesh.position.set(-width * 0.28, 2.3, depth / 2 + 0.08);
    bldg.add(posterMesh);

    return bldg;
  }

  // --------------------------------------------------------------------------
  // 2. INFILL GAP FILLER GENERATOR (Walls, Metro Sheets, Billboards, Trees)
  // --------------------------------------------------------------------------
  function createInfillGap(type, width = 7.5) {
    const infill = new THREE.Group();

    if (type === 0) {
      // Brick boundary compound wall with stencils & posters
      const wallGeo = new THREE.BoxGeometry(width, 2.5, 0.3);
      const wall = new THREE.Mesh(wallGeo, brickWallMat);
      wall.position.y = 1.25;
      infill.add(wall);

      const pillarGeo = new THREE.BoxGeometry(0.5, 2.7, 0.5);
      const p1 = new THREE.Mesh(pillarGeo, brickWallMat);
      p1.position.set(-width / 2, 1.35, 0);
      const p2 = new THREE.Mesh(pillarGeo, brickWallMat);
      p2.position.set(width / 2, 1.35, 0);
      infill.add(p1, p2);

      const posterMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 2.2),
        new THREE.MeshBasicMaterial({ map: bollywoodPosterTextures[0] })
      );
      posterMesh.position.set(0, 1.3, 0.16);
      infill.add(posterMesh);
    } else if (type === 1) {
      // Corrugated blue metal metro-construction barricade sheet
      const sheetGeo = new THREE.PlaneGeometry(width, 2.8);
      const sheetMat = new THREE.MeshStandardMaterial({
        map: blueMetroSheetTex,
        roughness: 0.5,
        metalness: 0.2,
      });
      const sheet = new THREE.Mesh(sheetGeo, sheetMat);
      sheet.position.y = 1.4;
      infill.add(sheet);

      // Rear support kick-legs
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6);
      const leg1 = new THREE.Mesh(legGeo, metalTrussMat);
      leg1.position.set(-width * 0.35, 1.2, -0.6);
      leg1.rotation.x = -0.4;
      const leg2 = new THREE.Mesh(legGeo, metalTrussMat);
      leg2.position.set(width * 0.35, 1.2, -0.6);
      leg2.rotation.x = -0.4;
      infill.add(leg1, leg2);
    } else if (type === 2) {
      // Large commercial hoarding billboard on iron truss frame
      const frameHeight = 5.5;
      const boardWidth = width * 1.15;
      const boardHeight = 3.8;

      const legGeo = new THREE.BoxGeometry(0.2, frameHeight + boardHeight, 0.2);
      const legL = new THREE.Mesh(legGeo, metalTrussMat);
      legL.position.set(-boardWidth * 0.4, (frameHeight + boardHeight) / 2, 0);
      const legR = new THREE.Mesh(legGeo, metalTrussMat);
      legR.position.set(boardWidth * 0.4, (frameHeight + boardHeight) / 2, 0);
      infill.add(legL, legR);

      const boardGeo = new THREE.PlaneGeometry(boardWidth, boardHeight);
      const boardTex = billboardTextures[Math.floor(Math.random() * billboardTextures.length)];
      const boardMat = new THREE.MeshBasicMaterial({ map: boardTex });
      const boardMesh = new THREE.Mesh(boardGeo, boardMat);
      boardMesh.position.set(0, frameHeight + boardHeight * 0.5, 0.12);
      infill.add(boardMesh);
    } else {
      // Dense clusters of leafy green Neem or blooming Gulmohar trees
      const isGulmohar = Math.random() > 0.45;
      const leafMat = isGulmohar ? gulmoharOrangeMat : neemGreenMat;

      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 4.0, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkBrownMat);
      trunk.position.y = 2.0;
      infill.add(trunk);

      const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 1), leafMat);
      f1.position.set(0, 4.5, 0);
      const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0, 1), leafMat);
      f2.position.set(-1.1, 3.8, 0.8);
      const f3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9, 1), leafMat);
      f3.position.set(1.2, 4.0, -0.6);
      infill.add(f1, f2, f3);
    }

    return infill;
  }

  // --------------------------------------------------------------------------
  // 3. MIDGROUND HIGH-RISE APARTMENTS (Clean Matte Architectural Finish)
  // --------------------------------------------------------------------------
  function createMidgroundApartment(colorIdx, stories = 5, width = 16.0) {
    const apt = new THREE.Group();
    const storyH = 3.8;
    const totalH = stories * storyH;
    const depth = 12.0;

    const baseMat = aptColorMaterials[colorIdx % aptColorMaterials.length];

    // Clean matte architectural facade (weathered concrete / dusty beige / terracotta)
    const aptMesh = new THREE.Mesh(new THREE.BoxGeometry(width, totalH, depth), baseMat);
    aptMesh.position.y = totalH / 2;
    aptMesh.castShadow = true;
    aptMesh.receiveShadow = true;
    apt.add(aptMesh);

    // Parapet roof rim
    const roofRim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 0.6, depth + 0.4), concreteMat);
    roofRim.position.y = totalH + 0.3;
    apt.add(roofRim);

    // Rooftop staircase room & water tanks
    const stairRoom = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.6, 4.2), concreteMat);
    stairRoom.position.set(-width * 0.25, totalH + 1.3, 0);
    apt.add(stairRoom);

    for (let t = 0; t < 2; t++) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.8, 12), waterTankBlackMat);
      tank.position.set(width * 0.2 + t * 2.5, totalH + 0.9, 0);
      apt.add(tank);
    }

    // Realistic unlit recessed windows & balconies
    const numCols = Math.floor(width / 3.2);
    for (let s = 0; s < stories; s++) {
      const sy = s * storyH + 1.9;
      for (let col = 0; col < numCols; col++) {
        const cx = -width * 0.38 + col * (width * 0.76 / (numCols - 1 || 1));

        // Subtle dark recessed window
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 0.1), windowMat);
        win.position.set(cx, sy, depth / 2 + 0.05);
        apt.add(win);

        // Balconies with railings
        if (col % 2 === 0 && s > 0) {
          const bal = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 1.0), concreteMat);
          bal.position.set(cx, sy - 0.75, depth / 2 + 0.5);
          const rail = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.05), metalTrussMat);
          rail.position.set(cx, sy - 0.38, depth / 2 + 1.0);
          apt.add(bal, rail);
        }

        // AC compressor unit
        if (col % 3 === 1 && s > 0) {
          const ac = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.48, 0.35), concreteMat);
          ac.position.set(cx + 0.8, sy - 0.4, depth / 2 + 0.22);
          apt.add(ac);
        }
      }
    }

    return apt;
  }

  // --------------------------------------------------------------------------
  // 4. SOLID UNBROKEN CONCRETE METRO OVERPASS VIADUCT
  // --------------------------------------------------------------------------
  function createSolidMetroOverpass(bridgeT = 0.08) {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.name = 'Solid_Metro_Overpass';

    const pt = trackCurve.getPointAt(bridgeT);
    pt.y = 0;
    const tan = trackCurve.getTangentAt(bridgeT).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    bridgeGroup.position.copy(pt);
    bridgeGroup.rotation.y = yaw;

    const halfW = trackWidth / 2; // 7.0m
    const spanLength = 48.0;     // Continuous span crossing road & sidewalks
    const viaductWidth = 7.5;    // Dual-track width
    const viaductThickness = 1.6;
    const clearHeight = 8.8;     // High vertical clearance over race road

    // 1. SOLID UNBROKEN CONCRETE BOX GIRDER DECK (Zero floating gaps!)
    const deckGeo = new THREE.BoxGeometry(spanLength, viaductThickness, viaductWidth);
    const deck = new THREE.Mesh(deckGeo, concreteMat);
    deck.position.set(0, clearHeight + viaductThickness / 2, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // 2. CONTINUOUS FULL-LENGTH SIDE CRASH PARAPETS
    const parapetGeo = new THREE.BoxGeometry(spanLength, 1.1, 0.4);
    const parapetL = new THREE.Mesh(parapetGeo, concreteMat);
    parapetL.position.set(0, clearHeight + viaductThickness + 0.55, viaductWidth / 2 - 0.2);
    const parapetR = new THREE.Mesh(parapetGeo, concreteMat);
    parapetR.position.set(0, clearHeight + viaductThickness + 0.55, -viaductWidth / 2 + 0.2);
    bridgeGroup.add(parapetL, parapetR);

    // 3. SOLID CONCRETE PILLARS FIRMLY ROOTED ON SIDEWALK CURB EDGES
    const pillarGeo = new THREE.CylinderGeometry(1.25, 1.45, clearHeight, 16);
    const capGeo = new THREE.BoxGeometry(3.4, 1.2, viaductWidth + 0.4);

    for (let side of [-1, 1]) {
      const px = side * (halfW + 2.2); // Firmly rooted on sidewalk curb
      const pillar = new THREE.Mesh(pillarGeo, concreteMat);
      pillar.position.set(px, clearHeight / 2, 0);
      pillar.castShadow = true;
      bridgeGroup.add(pillar);

      // Flared hammerhead cap beam
      const cap = new THREE.Mesh(capGeo, concreteMat);
      cap.position.set(px, clearHeight - 0.6, 0);
      bridgeGroup.add(cap);
    }

    // 4. ROAD-FACING OVERPASS HIGHWAY / METRO SIGN
    const signBoardGeo = new THREE.PlaneGeometry(16.0, 1.3);
    const signBoardCanvas = document.createElement('canvas');
    signBoardCanvas.width = 512;
    signBoardCanvas.height = 64;
    const sctx = signBoardCanvas.getContext('2d');
    sctx.fillStyle = '#0077b6';
    sctx.fillRect(0, 0, 512, 64);
    sctx.strokeStyle = '#ffd60a';
    sctx.lineWidth = 4;
    sctx.strokeRect(4, 4, 504, 56);
    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 24px sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('★ DELHI METRO RAIL • LINE 3 (YELLOW LINE) ★', 256, 32);
    sctx.font = 'bold 15px sans-serif';
    sctx.fillText('SPEED LIMIT 80 KM/H • CLEARANCE 8.8M', 256, 52);

    const signBoardTex = new THREE.CanvasTexture(signBoardCanvas);
    const signBoardMat = new THREE.MeshBasicMaterial({ map: signBoardTex });
    const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
    signBoard.position.set(0, clearHeight + viaductThickness / 2, -viaductWidth / 2 - 0.05);
    bridgeGroup.add(signBoard);

    // 5. METRO TRACKS & TRAIN ON DECK
    const railGeo = new THREE.BoxGeometry(spanLength, 0.15, 0.12);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });
    for (let rz of [-2.0, -1.2, 1.2, 2.0]) {
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(0, clearHeight + viaductThickness + 0.08, rz);
      bridgeGroup.add(rail);
    }

    const trainMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.7 });
    const metroStripeMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.4 });
    const trainCoach = new THREE.Mesh(new THREE.BoxGeometry(24.0, 2.8, 2.8), trainMat);
    trainCoach.position.set(-6.0, clearHeight + viaductThickness + 1.5, 1.6);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(24.05, 0.4, 2.85), metroStripeMat);
    stripe.position.set(-6.0, clearHeight + viaductThickness + 1.2, 1.6);
    bridgeGroup.add(trainCoach, stripe);

    return bridgeGroup;
  }

  // --------------------------------------------------------------------------
  // 5. LAYER 3: 360° DISTANT METROPOLITAN SKYLINE (Clean Matte Cityscape)
  // --------------------------------------------------------------------------
  function createDistantSkylineRing() {
    const skylineGroup = new THREE.Group();
    const numTowers = 56;
    const ringRadius = 310.0;

    const towerGeo = new THREE.BoxGeometry(1, 1, 1);
    const beaconGeo = new THREE.SphereGeometry(0.8, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });

    const skylinePalettes = [concreteMat, dustyBeigeMat, terracottaMat, slateBlueMat, darkCharcoalMat];

    for (let i = 0; i < numTowers; i++) {
      const angle = (i / numTowers) * Math.PI * 2;
      const r = ringRadius + (Math.sin(i * 3) * 35.0);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      const tWidth = 16.0 + (i % 5) * 4.0;
      const tDepth = 14.0 + ((i + 2) % 4) * 3.5;
      const tHeight = 45.0 + ((i * 7) % 55) + 20.0; // 65m to 120m tall

      // Clean matte architectural tower finish (no harsh yellow window textures)
      const mat = skylinePalettes[i % skylinePalettes.length];
      const tower = new THREE.Mesh(towerGeo, mat);
      tower.scale.set(tWidth, tHeight, tDepth);
      tower.position.set(x, tHeight / 2, z);
      tower.rotation.y = angle + Math.PI / 2;
      skylineGroup.add(tower);

      // Rooftop elevator penthouse / spire
      if (tHeight > 75.0) {
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(x, tHeight + 1.2, z);
        skylineGroup.add(beacon);

        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 9.0, 6), metalTrussMat);
        spire.position.set(x, tHeight + 4.5, z);
        skylineGroup.add(spire);
      }
    }

    // Soft rolling green/slate hills in the far background
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x3e5249,
      roughness: 0.95,
      flatShading: true,
    });
    for (let h = 0; h < 14; h++) {
      const hAngle = (h / 14) * Math.PI * 2;
      const hr = ringRadius + 95.0;
      const hx = Math.cos(hAngle) * hr;
      const hz = Math.sin(hAngle) * hr;
      const hill = new THREE.Mesh(new THREE.ConeGeometry(80.0, 50.0, 7), hillMat);
      hill.position.set(hx, 18.0, hz);
      skylineGroup.add(hill);
    }

    bazaarGroup.add(skylineGroup);
  }

  // --------------------------------------------------------------------------
  // 6. SIDEWALK CURB-EDGE SABZI THELAS & CHAI TAPRIS (AT halfWidth + 1.8)
  // --------------------------------------------------------------------------
  function createCurbSideSabziThela(pos, lookTarget) {
    const thela = new THREE.Group();
    thela.position.set(pos.x, 0.08, pos.z);
    thela.lookAt(lookTarget.x, 0.08, lookTarget.z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f1917, roughness: 0.8 });

    // Wooden cart bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 1.4), woodMat);
    bed.position.y = 0.82;
    bed.castShadow = true;
    thela.add(bed);

    // 4 Wooden legs
    const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    for (let lx of [-0.95, 0.95]) {
      for (let lz of [-0.55, 0.55]) {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(lx, 0.4, lz);
        thela.add(leg);
      }
    }

    // 2 Large spoked side wheels
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 14);
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.rotation.z = Math.PI / 2;
    w1.position.set(-1.15, 0.45, 0);
    const w2 = new THREE.Mesh(wheelGeo, wheelMat);
    w2.rotation.z = Math.PI / 2;
    w2.position.set(1.15, 0.45, 0);
    thela.add(w1, w2);

    // Striped Sun Canopy Umbrella
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), metalTrussMat);
    pole.position.set(0, 1.8, 0);
    pole.rotation.z = 0.12;
    thela.add(pole);

    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.6 });
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 12), canopyMat);
    canopy.position.set(0.12, 2.8, 0);
    thela.add(canopy);

    // Pyramids of fresh Sabzi
    const cabbageMat = new THREE.MeshStandardMaterial({ color: 0x38b000, roughness: 0.5 });
    const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.4 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf77f00, roughness: 0.35 });
    const produceGeo = new THREE.SphereGeometry(0.14, 8, 8);

    for (let x = -0.7; x <= -0.2; x += 0.24) {
      for (let z = -0.4; z <= 0.4; z += 0.24) {
        const s = new THREE.Mesh(produceGeo, cabbageMat);
        s.position.set(x, 0.98, z);
        thela.add(s);
      }
    }

    for (let x = -0.1; x <= 0.35; x += 0.22) {
      for (let z = -0.4; z <= 0.4; z += 0.22) {
        const s = new THREE.Mesh(produceGeo, tomatoMat);
        s.position.set(x, 0.98, z);
        thela.add(s);
      }
    }

    for (let x = 0.45; x <= 0.8; x += 0.22) {
      for (let z = -0.4; z <= 0.4; z += 0.22) {
        const s = new THREE.Mesh(produceGeo, orangeMat);
        s.position.set(x, 0.98, z);
        thela.add(s);
      }
    }

    return thela;
  }

  function createCurbSideChaiTapri(pos, lookTarget) {
    const tapri = new THREE.Group();
    tapri.position.set(pos.x, 0.08, pos.z);
    tapri.lookAt(lookTarget.x, 0.08, lookTarget.z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 });
    const blueTarpMat = new THREE.MeshStandardMaterial({ color: 0x0077b6, roughness: 0.5 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.8, roughness: 0.2 });

    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.2), woodMat);
    counter.position.y = 0.45;
    tapri.add(counter);

    for (let px of [-1.1, 1.1]) {
      for (let pz of [-0.55, 0.55]) {
        const bamboo = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), woodMat);
        bamboo.position.set(px, 1.2, pz);
        tapri.add(bamboo);
      }
    }

    const tarpRoof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 1.6), blueTarpMat);
    tarpRoof.position.set(0, 2.35, 0);
    tarpRoof.rotation.x = 0.1;
    tapri.add(tarpRoof);

    const kettleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.7, 12), brassMat);
    kettleBody.position.set(0.6, 1.25, 0.1);
    tapri.add(kettleBody);

    const kettleSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.35, 8), brassMat);
    kettleSpout.position.set(0.6, 1.5, 0.35);
    kettleSpout.rotation.x = Math.PI / 4;
    tapri.add(kettleSpout);

    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), lampGlowMat);
    lantern.position.set(0, 2.15, 0.3);
    tapri.add(lantern);

    return tapri;
  }

  // --------------------------------------------------------------------------
  // 7. BUILD CONTINUOUS ROADSIDE CORRIDOR WITH GUARANTEED ROAD-FACING DIRECTION
  // --------------------------------------------------------------------------
  const numSteps = 80;
  const lateralOffset = halfWidth + 6.2;

  for (let i = 0; i < numSteps; i++) {
    const t = (i / numSteps) % 1.0;
    const pt = trackCurve.getPointAt(t);
    pt.y = 0;
    const tan = trackCurve.getTangentAt(t);
    tan.y = 0;
    tan.normalize();
    const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

    // --- LEFT SIDE: Roadside Shop + Gap Infill ---
    const posL = pt.clone().addScaledVector(norm, lateralOffset);
    if (isSafeDistance(posL.x, posL.z, minClearanceDist + 1.0)) {
      const storiesL = 2 + (i % 3);
      const bldgL = createShopHouse(i, storiesL, i, 9.2);
      bldgL.position.copy(posL);
      bldgL.lookAt(pt.x, bldgL.position.y, pt.z);
      bazaarGroup.add(bldgL);
    } else {
      const infillL = createInfillGap(i % 4, 7.5);
      infillL.position.copy(posL);
      infillL.lookAt(pt.x, infillL.position.y, pt.z);
      bazaarGroup.add(infillL);
    }

    // --- RIGHT SIDE: Roadside Shop + Gap Infill ---
    const posR = pt.clone().addScaledVector(norm, -lateralOffset);
    if (isSafeDistance(posR.x, posR.z, minClearanceDist + 1.0)) {
      const storiesR = 2 + ((i + 1) % 3);
      const bldgR = createShopHouse(i + 3, storiesR, i + 3, 9.2);
      bldgR.position.copy(posR);
      bldgR.lookAt(pt.x, bldgR.position.y, pt.z);
      bazaarGroup.add(bldgR);
    } else {
      const infillR = createInfillGap((i + 2) % 4, 7.5);
      infillR.position.copy(posR);
      infillR.lookAt(pt.x, infillR.position.y, pt.z);
      bazaarGroup.add(infillR);
    }

    // --- LAYER 2: MIDGROUND APARTMENTS (Clean Matte Architectural Finish) ---
    if (i % 2 === 0) {
      const aptOffsetOut = lateralOffset + 24.0 + (i % 3) * 6.0;
      const aptPosOut = pt.clone().addScaledVector(norm, aptOffsetOut);
      if (isSafeDistance(aptPosOut.x, aptPosOut.z, minClearanceDist + 5.0)) {
        const aptStories = 4 + (i % 4);
        const apt = createMidgroundApartment(i, aptStories, 16.0);
        apt.position.copy(aptPosOut);
        apt.lookAt(pt.x, apt.position.y, pt.z);
        bazaarGroup.add(apt);
      }

      const aptOffsetIn = -(lateralOffset + 26.0 + ((i + 1) % 3) * 6.0);
      const aptPosIn = pt.clone().addScaledVector(norm, aptOffsetIn);
      if (isSafeDistance(aptPosIn.x, aptPosIn.z, minClearanceDist + 5.0)) {
        const aptStories = 4 + ((i + 2) % 4);
        const aptIn = createMidgroundApartment(i + 2, aptStories, 16.0);
        aptIn.position.copy(aptPosIn);
        aptIn.lookAt(pt.x, aptIn.position.y, pt.z);
        bazaarGroup.add(aptIn);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 8. SIDEWALK CURB-EDGE PROPS: SABZI THELAS & CHAI TAPRIS (AT halfWidth + 1.8)
  // --------------------------------------------------------------------------
  const curbStepCount = 24;
  for (let k = 0; k < curbStepCount; k++) {
    const tCurb = (k / curbStepCount + 0.02) % 1.0;
    const ptCurb = trackCurve.getPointAt(tCurb);
    ptCurb.y = 0;
    const tanCurb = trackCurve.getTangentAt(tCurb);
    tanCurb.y = 0;
    tanCurb.normalize();
    const normCurb = new THREE.Vector3(-tanCurb.z, 0, tanCurb.x).normalize();

    const side = k % 2 === 0 ? 1 : -1;
    const curbPos = ptCurb.clone().addScaledVector(normCurb, side * (halfWidth + 1.8));

    if (k % 2 === 0) {
      const thela = createCurbSideSabziThela(curbPos, ptCurb);
      bazaarGroup.add(thela);
    } else {
      const tapri = createCurbSideChaiTapri(curbPos, ptCurb);
      bazaarGroup.add(tapri);
    }
  }

  // --------------------------------------------------------------------------
  // 9. SOLID UNBROKEN CONCRETE METRO OVERPASS BRIDGES (Zero Floating Artifacts)
  // --------------------------------------------------------------------------
  bazaarGroup.add(createSolidMetroOverpass(0.08)); // Over main straight
  bazaarGroup.add(createSolidMetroOverpass(0.54)); // Over back stretch

  // --------------------------------------------------------------------------
  // 10. 360° DISTANT METROPOLITAN SKYLINE (Clean Matte Cityscape)
  // --------------------------------------------------------------------------
  createDistantSkylineRing();

  // --------------------------------------------------------------------------
  // 11. OVERHEAD FESTIVE BUNTING
  // --------------------------------------------------------------------------
  const buntingTValues = [0.22, 0.42, 0.68, 0.88];
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

      const flag = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 0.45, 3),
        new THREE.MeshBasicMaterial({ color: flagColors[f % flagColors.length], side: THREE.DoubleSide })
      );
      flag.position.set(fx, fy - 0.22, 0);
      flag.rotation.z = Math.PI;
      buntingGroup.add(flag);
    }
    bazaarGroup.add(buntingGroup);
  });

  scene.add(bazaarGroup);
  return { bazaarGroup };
}
