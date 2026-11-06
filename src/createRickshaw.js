import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createHornOkPleaseTexture } from './createStreetTextures.js';

export function createRickshaw(options = {}) {
  // Configurable livery colors with iconic auto defaults
  const bodyColor = options.bodyColor !== undefined ? options.bodyColor : 0xf5b000;
  const trimColor = options.trimColor !== undefined ? options.trimColor : 0x0c6833;
  const canopyColor = options.canopyColor !== undefined ? options.canopyColor : 0x1c1e21;

  // Root group placed at ground origin
  const rickshawGroup = new THREE.Group();
  rickshawGroup.name = options.name ? `AutoRickshaw_${options.name}` : 'AutoRickshaw_Root';

  // Tilt group: Tilts (lean on Z) during sharp turns and pitches (on X) during acceleration/braking
  const tiltGroup = new THREE.Group();
  tiltGroup.name = 'AutoRickshaw_TiltBody';
  rickshawGroup.add(tiltGroup);

  // -------------------------------------------------------------
  // SHARED MATERIALS
  // -------------------------------------------------------------
  const bodyYellowMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.35,
    metalness: 0.1,
  });

  const trimGreenMat = new THREE.MeshStandardMaterial({
    color: trimColor,
    roughness: 0.4,
    metalness: 0.05,
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e21,
    roughness: 0.6,
    metalness: 0.4,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe8ebee,
    roughness: 0.15,
    metalness: 0.9,
  });

  const canopyMat = new THREE.MeshStandardMaterial({
    color: canopyColor,
    roughness: 0.7,
    metalness: 0.05,
  });

  const rubberTireMat = new THREE.MeshStandardMaterial({
    color: 0x181818,
    roughness: 0.85,
    metalness: 0.05,
  });
  const chaiRubberTireMat = new THREE.MeshStandardMaterial({
    color: 0x55301f,
    roughness: 0.88,
    metalness: 0.02,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xb0b5bc,
    roughness: 0.3,
    metalness: 0.8,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xa4d8f0,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.55,
  });

  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffea9f,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xdd1111,
    emissive: 0xcc0000,
    emissiveIntensity: 0.8,
    roughness: 0.3,
  });

  const turnSignalMat = new THREE.MeshStandardMaterial({
    color: 0xff8c00,
    emissive: 0xff7700,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // UNIBODY REFINEMENT — keep the original part layout, but use tighter
  // outer radii and deeper hidden overlaps at the yellow/green joins.
  // This removes the visible rounded-box gaps without changing the silhouette.
  // The original green lower trim remains a deliberate colour break.
  // -------------------------------------------------------------
  function createSoftBoxGeometry(width, height, depth, radius = 0.035) {
    const safeRadius = Math.min(radius, height * 0.44, width * 0.44, depth * 0.44);
    const geometry = new RoundedBoxGeometry(width, height, depth, 5, safeRadius);
    geometry.computeVertexNormals();
    return geometry;
  }

  // -------------------------------------------------------------
  // 1. CHASSIS & LOWER CABIN
  // -------------------------------------------------------------
  // Main floorboard
  const floorGeo = new THREE.BoxGeometry(1.36, 0.08, 2.3);
  const floorMesh = new THREE.Mesh(floorGeo, darkMetalMat);
  floorMesh.position.set(0, 0.32, -0.05);
  floorMesh.castShadow = true;
  floorMesh.receiveShadow = true;
  tiltGroup.add(floorMesh);

  // Rear passenger base (green lower trim)
  const rearLowerGeo = createSoftBoxGeometry(1.36, 0.40, 1.3, 0.045);
  const rearLowerMesh = new THREE.Mesh(rearLowerGeo, trimGreenMat);
  rearLowerMesh.position.set(0, 0.56, -0.55);
  rearLowerMesh.castShadow = true;
  rearLowerMesh.receiveShadow = true;
  tiltGroup.add(rearLowerMesh);

  // Rear cabin yellow body sides / back panel
  const rearUpperGeo = createSoftBoxGeometry(1.36, 0.52, 1.26, 0.035);
  const rearUpperMesh = new THREE.Mesh(rearUpperGeo, bodyYellowMat);
  rearUpperMesh.position.set(0, 0.83, -0.55);
  rearUpperMesh.castShadow = true;
  tiltGroup.add(rearUpperMesh);

  // Rear passenger seat opening cutout illusion:
  // Add a dark inner passenger compartment box so it looks hollowed out
  const passengerInnerGeo = new THREE.BoxGeometry(1.22, 0.65, 0.95);
  const passengerInnerMat = new THREE.MeshStandardMaterial({
    color: 0x151618,
    roughness: 0.9,
  });
  const passengerInner = new THREE.Mesh(passengerInnerGeo, passengerInnerMat);
  passengerInner.position.set(0, 0.98, -0.42);
  tiltGroup.add(passengerInner);

  // Passenger seat bench (leather brown/black)
  const seatGeo = new THREE.BoxGeometry(1.18, 0.16, 0.5);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x2c2622, roughness: 0.8 });
  const passengerSeat = new THREE.Mesh(seatGeo, seatMat);
  passengerSeat.position.set(0, 0.68, -0.6);
  tiltGroup.add(passengerSeat);

  // Passenger seat backrest
  const backrestGeo = new THREE.BoxGeometry(1.18, 0.42, 0.12);
  const passengerBackrest = new THREE.Mesh(backrestGeo, seatMat);
  passengerBackrest.position.set(0, 0.95, -0.84);
  tiltGroup.add(passengerBackrest);

  // Driver seat bench in the front center
  const driverSeatGeo = new THREE.BoxGeometry(0.58, 0.2, 0.42);
  const driverSeat = new THREE.Mesh(driverSeatGeo, seatMat);
  driverSeat.position.set(0, 0.52, 0.24);
  driverSeat.castShadow = true;
  tiltGroup.add(driverSeat);

  // Rear Engine Box / Trunk lid at the very back
  const engineBoxGeo = createSoftBoxGeometry(1.26, 0.45, 0.32, 0.035);
  const engineBox = new THREE.Mesh(engineBoxGeo, bodyYellowMat);
  engineBox.position.set(0, 0.6, -1.22);
  engineBox.castShadow = true;
  tiltGroup.add(engineBox);

  // Iconic "HORN OK PLEASE" & "बुरी नज़र वाले तेरा मुँह काला" Tailgate Plate
  const hornPlateTex = createHornOkPleaseTexture();
  const hornPlateMat = new THREE.MeshStandardMaterial({
    map: hornPlateTex,
    roughness: 0.4,
    metalness: 0.1,
  });
  const hornPlateGeo = new THREE.PlaneGeometry(0.72, 0.22);
  const hornPlate = new THREE.Mesh(hornPlateGeo, hornPlateMat);
  hornPlate.position.set(0, 0.64, -1.385);
  hornPlate.rotation.y = Math.PI; // Face rearwards towards chase camera
  tiltGroup.add(hornPlate);

  // Engine cooling louvers/slits beneath the plate
  const louverGeo = new THREE.BoxGeometry(0.68, 0.03, 0.02);
  for (let i = 0; i < 2; i++) {
    const louver = new THREE.Mesh(louverGeo, darkMetalMat);
    louver.position.set(0, 0.44 + i * 0.06, -1.39);
    tiltGroup.add(louver);
  }

  // Tail lights
  const tailLightGeo = new THREE.BoxGeometry(0.2, 0.09, 0.04);
  const leftTailLight = new THREE.Mesh(tailLightGeo, tailLightMat);
  leftTailLight.position.set(-0.48, 0.62, -1.39);
  const rightTailLight = new THREE.Mesh(tailLightGeo, tailLightMat);
  rightTailLight.position.set(0.48, 0.62, -1.39);
  tiltGroup.add(leftTailLight, rightTailLight);

  // Rear bumper bar
  const rearBumperGeo = new THREE.BoxGeometry(1.38, 0.08, 0.08);
  const rearBumper = new THREE.Mesh(rearBumperGeo, darkMetalMat);
  rearBumper.position.set(0, 0.3, -1.36);
  tiltGroup.add(rearBumper);

  // Chrome exhaust pipe at rear left (emits nitro flames!)
  const exhaustGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.36, 10);
  const exhaustPipe = new THREE.Mesh(exhaustGeo, chromeMat);
  exhaustPipe.rotation.x = Math.PI / 2;
  exhaustPipe.position.set(-0.45, 0.26, -1.38);
  tiltGroup.add(exhaustPipe);

  // -------------------------------------------------------------
  // 2. FRONT NOSE / COWL (Tapered front profile)
  // -------------------------------------------------------------
  // Lower front cowl (green)
  const frontLowerGeo = createSoftBoxGeometry(0.96, 0.40, 0.72, 0.045);
  const frontLower = new THREE.Mesh(frontLowerGeo, trimGreenMat);
  frontLower.position.set(0, 0.56, 0.66);
  frontLower.castShadow = true;
  tiltGroup.add(frontLower);

  // Front yellow nose apron
  const frontUpperGeo = createSoftBoxGeometry(0.9, 0.56, 0.58, 0.035);
  const frontUpper = new THREE.Mesh(frontUpperGeo, bodyYellowMat);
  frontUpper.position.set(0, 0.83, 0.68);
  frontUpper.castShadow = true;
  tiltGroup.add(frontUpper);

  // Angled nose hood sloping down towards the front wheel
  const noseSlopeGeo = createSoftBoxGeometry(0.82, 0.35, 0.42, 0.035);
  const noseSlope = new THREE.Mesh(noseSlopeGeo, bodyYellowMat);
  noseSlope.position.set(0, 0.8, 0.98);
  noseSlope.rotation.x = -Math.PI / 6;
  noseSlope.castShadow = true;
  tiltGroup.add(noseSlope);

  // Front bumper bar
  const frontBumperGeo = new THREE.BoxGeometry(0.94, 0.07, 0.07);
  const frontBumper = new THREE.Mesh(frontBumperGeo, darkMetalMat);
  frontBumper.position.set(0, 0.3, 1.15);
  tiltGroup.add(frontBumper);

  // -------------------------------------------------------------
  // 3. CANOPY ROOF & SLENDER SUPPORT PILLARS
  // -------------------------------------------------------------
  // Roof group
  const roofGroup = new THREE.Group();

  // 4 Main corner pillars connecting chassis to roof
  const pillarGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.85, 8);

  // Rear left pillar
  const pillarRL = new THREE.Mesh(pillarGeo, darkMetalMat);
  pillarRL.position.set(-0.64, 1.34, -1.1);
  // Rear right pillar
  const pillarRR = new THREE.Mesh(pillarGeo, darkMetalMat);
  pillarRR.position.set(0.64, 1.34, -1.1);
  // Mid left pillar
  const pillarML = new THREE.Mesh(pillarGeo, darkMetalMat);
  pillarML.position.set(-0.64, 1.34, 0.05);
  // Mid right pillar
  const pillarMR = new THREE.Mesh(pillarGeo, darkMetalMat);
  pillarMR.position.set(0.64, 1.34, 0.05);
  // Front windshield left pillar (slanted back slightly)
  const pillarFL = new THREE.Mesh(pillarGeo, darkMetalMat);
  pillarFL.position.set(-0.46, 1.35, 0.82);
  pillarFL.rotation.x = -0.22;
  // Front windshield right pillar
  const pillarFR = new THREE.Mesh(pillarGeo, darkMetalMat);
  pillarFR.position.set(0.46, 1.35, 0.82);
  pillarFR.rotation.x = -0.22;

  roofGroup.add(pillarRL, pillarRR, pillarML, pillarMR, pillarFL, pillarFR);

  // The iconic curved canopy top:
  // Composed of a central main canopy slab and a curved front visor
  const canopyMainGeo = createSoftBoxGeometry(1.38, 0.14, 2.3, 0.035);
  const canopyMain = new THREE.Mesh(canopyMainGeo, canopyMat);
  canopyMain.position.set(0, 1.76, -0.15);
  canopyMain.castShadow = true;
  roofGroup.add(canopyMain);

  // Rounded crown over the canopy roof for that classic soft tuk-tuk top
  const canopyCrownGeo = new THREE.CylinderGeometry(0.68, 0.72, 2.2, 16, 1, false, 0, Math.PI);
  const canopyCrown = new THREE.Mesh(canopyCrownGeo, canopyMat);
  canopyCrown.rotation.z = Math.PI / 2;
  canopyCrown.rotation.y = Math.PI / 2;
  canopyCrown.position.set(0, 1.78, -0.15);
  canopyCrown.scale.set(0.24, 1.0, 0.98);
  roofGroup.add(canopyCrown);

  // Front canopy sun visor sloping down over windshield
  const visorGeo = new THREE.BoxGeometry(1.08, 0.08, 0.35);
  const visor = new THREE.Mesh(visorGeo, canopyMat);
  visor.position.set(0, 1.7, 0.94);
  visor.rotation.x = 0.28;
  roofGroup.add(visor);

  // -------------------------------------------------------------
  // 3B. ROOF LUGGAGE RACK & VINTAGE TRUNKS (Sprint 10)
  // -------------------------------------------------------------
  const roofRackGroup = new THREE.Group();
  roofRackGroup.position.set(0, 1.84, -0.15);

  const rackRailMat = darkMetalMat;
  const rackLegGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.12, 6);
  for (let rx of [-0.52, 0.52]) {
    for (let rz of [-0.65, 0.65]) {
      const leg = new THREE.Mesh(rackLegGeo, rackRailMat);
      leg.position.set(rx, 0.06, rz);
      roofRackGroup.add(leg);
    }
  }

  // Outer rectangular perimeter rails
  const railLongGeo = new THREE.BoxGeometry(0.03, 0.03, 1.34);
  const railLeft = new THREE.Mesh(railLongGeo, rackRailMat);
  railLeft.position.set(-0.52, 0.12, 0);
  const railRight = new THREE.Mesh(railLongGeo, rackRailMat);
  railRight.position.set(0.52, 0.12, 0);

  const railShortGeo = new THREE.BoxGeometry(1.07, 0.03, 0.03);
  const railFront = new THREE.Mesh(railShortGeo, rackRailMat);
  railFront.position.set(0, 0.12, 0.67);
  const railBack = new THREE.Mesh(railShortGeo, rackRailMat);
  railBack.position.set(0, 0.12, -0.67);

  roofRackGroup.add(railLeft, railRight, railFront, railBack);

  // Slatted floor bars
  for (let bz of [-0.4, -0.15, 0.15, 0.4]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.018, 0.024), rackRailMat);
    bar.position.set(0, 0.03, bz);
    roofRackGroup.add(bar);
  }

  // Vintage Luggage & Strapped Cargo
  const suitcase1Geo = new THREE.BoxGeometry(0.46, 0.22, 0.68);
  const suitcase1Mat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
  const suitcase1 = new THREE.Mesh(suitcase1Geo, suitcase1Mat);
  suitcase1.position.set(-0.22, 0.14, -0.1);
  suitcase1.rotation.y = 0.08;

  const suitcase2Geo = new THREE.BoxGeometry(0.42, 0.19, 0.58);
  const suitcase2Mat = new THREE.MeshStandardMaterial({ color: 0x1d3557, roughness: 0.6 });
  const suitcase2 = new THREE.Mesh(suitcase2Geo, suitcase2Mat);
  suitcase2.position.set(0.24, 0.13, 0.05);
  suitcase2.rotation.y = -0.06;

  // Bungee tie-down straps
  const strapGeo = new THREE.BoxGeometry(1.05, 0.015, 0.03);
  const strapMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const strap1 = new THREE.Mesh(strapGeo, strapMat);
  strap1.position.set(0, 0.25, -0.12);
  const strap2 = new THREE.Mesh(strapGeo, strapMat);
  strap2.position.set(0, 0.24, 0.15);

  roofRackGroup.add(suitcase1, suitcase2, strap1, strap2);
  roofRackGroup.visible = false; // Toggled via customization
  roofGroup.add(roofRackGroup);

  tiltGroup.add(roofGroup);

  // -------------------------------------------------------------
  // 4. FRONT WINDSHIELD & CABIN DETAILS
  // -------------------------------------------------------------
  // Semi-transparent blue glass windshield
  const windshieldGeo = new THREE.PlaneGeometry(0.92, 0.54);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  windshield.position.set(0, 1.36, 0.83);
  windshield.rotation.x = -0.22;
  tiltGroup.add(windshield);

  // Windshield black rubber border frame
  const frameGeo = new THREE.BoxGeometry(0.94, 0.56, 0.03);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.9, wireframe: true });
  const windshieldFrame = new THREE.Mesh(frameGeo, frameMat);
  windshieldFrame.position.copy(windshield.position);
  windshieldFrame.rotation.copy(windshield.rotation);
  tiltGroup.add(windshieldFrame);

  // Single windshield wiper (classic rickshaw touch!)
  const wiperArmGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6);
  const wiperBlade = new THREE.Mesh(wiperArmGeo, darkMetalMat);
  wiperBlade.position.set(0.05, 1.34, 0.85);
  wiperBlade.rotation.x = -0.22;
  wiperBlade.rotation.z = 0.38;
  tiltGroup.add(wiperBlade);

  // -------------------------------------------------------------
  // 4B. INTERIOR BLING: MARIGOLD GARLAND & DASHBOARD BOBBLEHEAD (Sprint 10)
  // -------------------------------------------------------------
  // Windshield Hanging Marigold Flower Garland (Genda Phool)
  const windshieldGarlandGroup = new THREE.Group();
  windshieldGarlandGroup.position.set(0, 1.58, 0.78);
  const marigoldOrangeMat = new THREE.MeshStandardMaterial({ color: 0xff7700, roughness: 0.8 });
  const marigoldYellowMat = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.8 });
  const flowerGeo = new THREE.SphereGeometry(0.038, 6, 6);

  const numFlowers = 9;
  for (let i = 0; i < numFlowers; i++) {
    const frac = i / (numFlowers - 1);
    const fx = (frac - 0.5) * 0.78;
    const sag = Math.sin(frac * Math.PI) * -0.07;
    const fMat = i % 2 === 0 ? marigoldOrangeMat : marigoldYellowMat;
    const flower = new THREE.Mesh(flowerGeo, fMat);
    flower.position.set(fx, sag, -frac * 0.04);
    windshieldGarlandGroup.add(flower);
  }
  tiltGroup.add(windshieldGarlandGroup);

  // Dashboard Smiling Mascot Bobblehead on steering console
  const bobbleheadGroup = new THREE.Group();
  bobbleheadGroup.position.set(0.22, 1.05, 0.58);

  // Base stand
  const standGeo = new THREE.CylinderGeometry(0.038, 0.044, 0.02, 10);
  const goldBrassMat = new THREE.MeshStandardMaterial({ color: 0xffd000, metalness: 0.85, roughness: 0.25 });
  const stand = new THREE.Mesh(standGeo, goldBrassMat);
  bobbleheadGroup.add(stand);

  // Spring neck
  const springGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6);
  const springMesh = new THREE.Mesh(springGeo, darkMetalMat);
  springMesh.position.y = 0.03;
  bobbleheadGroup.add(springMesh);

  // Nodding bobblehead mesh
  const bobbleHeadMesh = new THREE.Group();
  bobbleHeadMesh.position.y = 0.06;

  const headGeo = new THREE.SphereGeometry(0.045, 10, 10);
  const mascotHead = new THREE.Mesh(headGeo, goldBrassMat);
  bobbleHeadMesh.add(mascotHead);

  // Cute cool sunglasses on bobblehead
  const shadesGeo = new THREE.BoxGeometry(0.065, 0.016, 0.015);
  const shadesMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const shades = new THREE.Mesh(shadesGeo, shadesMat);
  shades.position.set(0, 0.008, 0.042);
  bobbleHeadMesh.add(shades);

  bobbleheadGroup.add(bobbleHeadMesh);
  tiltGroup.add(bobbleheadGroup);

  // -------------------------------------------------------------
  // 5. INTERIOR HANDLEBARS & CONTROLS
  // -------------------------------------------------------------
  // Steering column coming up from the floor
  const columnGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.65, 8);
  const steeringColumn = new THREE.Mesh(columnGeo, darkMetalMat);
  steeringColumn.position.set(0, 0.72, 0.58);
  steeringColumn.rotation.x = -0.25;
  tiltGroup.add(steeringColumn);

  // Handlebar crossbar (horizontal)
  const barGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.52, 8);
  const handlebar = new THREE.Mesh(barGeo, darkMetalMat);
  handlebar.position.set(0, 0.98, 0.52);
  handlebar.rotation.z = Math.PI / 2;
  tiltGroup.add(handlebar);

  // Left & right rubber handlebar grips
  const gripGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.12, 8);
  const leftGrip = new THREE.Mesh(gripGeo, rubberTireMat);
  leftGrip.position.set(-0.24, 0.98, 0.52);
  leftGrip.rotation.z = Math.PI / 2;
  const rightGrip = new THREE.Mesh(gripGeo, rubberTireMat);
  rightGrip.position.set(0.24, 0.98, 0.52);
  rightGrip.rotation.z = Math.PI / 2;
  tiltGroup.add(leftGrip, rightGrip);

  // Fare Meter box on the right of the handlebar (beloved Indian auto detail)
  const meterGeo = new THREE.BoxGeometry(0.1, 0.12, 0.07);
  const meterBox = new THREE.Mesh(meterGeo, darkMetalMat);
  meterBox.position.set(0.25, 0.84, 0.62);
  const meterScreenGeo = new THREE.PlaneGeometry(0.07, 0.05);
  const meterScreenMat = new THREE.MeshBasicMaterial({ color: 0x33dd55 });
  const meterScreen = new THREE.Mesh(meterScreenGeo, meterScreenMat);
  meterScreen.position.set(0.25, 0.85, 0.656);
  tiltGroup.add(meterBox, meterScreen);

  // Side view mirrors
  const mirrorStemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6);
  const mirrorHeadGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12);

  // Left Mirror
  const mirrorStemL = new THREE.Mesh(mirrorStemGeo, darkMetalMat);
  mirrorStemL.position.set(-0.54, 1.25, 0.82);
  mirrorStemL.rotation.z = 0.5;
  const mirrorHeadL = new THREE.Mesh(mirrorHeadGeo, chromeMat);
  mirrorHeadL.position.set(-0.64, 1.34, 0.82);
  mirrorHeadL.rotation.x = Math.PI / 2;
    tiltGroup.add(mirrorStemL, mirrorHeadL);

  // Right Mirror
  const mirrorStemR = new THREE.Mesh(mirrorStemGeo, darkMetalMat);
  mirrorStemR.position.set(0.54, 1.25, 0.82);
  mirrorStemR.rotation.z = -0.5;
  const mirrorHeadR = new THREE.Mesh(mirrorHeadGeo, chromeMat);
  mirrorHeadR.position.set(0.64, 1.34, 0.82);
  mirrorHeadR.rotation.x = Math.PI / 2;
  tiltGroup.add(mirrorStemR, mirrorHeadR);

  // -------------------------------------------------------------
  // 6. FRONT FORK & STEERING ASSEMBLY (PIVOTS ON Y-AXIS)
  // -------------------------------------------------------------
  // This group rotates left/right when the player steers!
  const frontForkGroup = new THREE.Group();
  frontForkGroup.name = 'FrontFork_Steering';
  frontForkGroup.position.set(0, 0.32, 1.05); // Pivot point at front wheel center
  tiltGroup.add(frontForkGroup);

  // Front fork twin metal struts
  const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
  const strutLeft = new THREE.Mesh(strutGeo, chromeMat);
  strutLeft.position.set(-0.12, 0.16, 0);
  const strutRight = new THREE.Mesh(strutGeo, chromeMat);
  strutRight.position.set(0.12, 0.16, 0);
  frontForkGroup.add(strutLeft, strutRight);

  // Front curved mudguard over the wheel
  const mudguardGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.22, 16, 1, false, 0, Math.PI * 0.7);
  const mudguard = new THREE.Mesh(mudguardGeo, trimGreenMat);
  mudguard.rotation.z = Math.PI / 2;
  mudguard.rotation.y = Math.PI;
  mudguard.position.set(0, 0.06, 0);
  mudguard.castShadow = true;
  frontForkGroup.add(mudguard);

  // Single Central Front Headlight mounted on front fork
  const headlightHousingGeo = new THREE.CylinderGeometry(0.13, 0.1, 0.14, 16);
  const headlightHousing = new THREE.Mesh(headlightHousingGeo, chromeMat);
  headlightHousing.rotation.x = Math.PI / 2;
  headlightHousing.position.set(0, 0.38, 0.12);
  frontForkGroup.add(headlightHousing);

  const headlightLensGeo = new THREE.CircleGeometry(0.11, 16);
  const headlightLens = new THREE.Mesh(headlightLensGeo, headlightMat);
  headlightLens.position.set(0, 0.38, 0.191);
  frontForkGroup.add(headlightLens);

  // Small Front Turn Indicator Lights
  const blinkerGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12);
  const leftBlinker = new THREE.Mesh(blinkerGeo, turnSignalMat);
  leftBlinker.rotation.z = Math.PI / 2;
  leftBlinker.position.set(-0.25, 0.34, 0.08);
  const rightBlinker = new THREE.Mesh(blinkerGeo, turnSignalMat);
  rightBlinker.rotation.z = Math.PI / 2;
  rightBlinker.position.set(0.25, 0.34, 0.08);
  frontForkGroup.add(leftBlinker, rightBlinker);

  // Helper function to create a detailed wheel (tire rubber + rim hub + lug nuts)
  function createWheelMesh(radius = 0.3, width = 0.18) {
    const wheelGroup = new THREE.Group();

    // Rubber outer tire (Cylinder with axis aligned along X)
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 18);
    const tire = new THREE.Mesh(tireGeo, rubberTireMat);
    tire.name = 'OuterRubberTire';
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Inner rim
    const rimGeo = new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, width * 1.02, 16);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    // Center axle hubcap
    const hubGeo = new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, width * 1.08, 12);
    const hub = new THREE.Mesh(hubGeo, chromeMat);
    hub.rotation.z = Math.PI / 2;
    wheelGroup.add(hub);

    // Small spoke details so wheel rotation is easily visible to the player!
    const spokeGeo = new THREE.BoxGeometry(width * 1.04, radius * 0.95, 0.04);
    const spoke1 = new THREE.Mesh(spokeGeo, darkMetalMat);
    const spoke2 = new THREE.Mesh(spokeGeo, darkMetalMat);
    spoke2.rotation.x = Math.PI / 2;
    wheelGroup.add(spoke1, spoke2);

    return wheelGroup;
  }

  // Front Wheel: attached to the steering front fork
  const frontWheel = createWheelMesh(0.3, 0.16);
  frontWheel.position.set(0, 0, 0); // Positioned inside the fork pivot
  frontForkGroup.add(frontWheel);

  // -------------------------------------------------------------
  // 7. REAR WHEELS (LEFT & RIGHT)
  // -------------------------------------------------------------
  // Both wheels are positioned at the rear axle under the passenger cabin
  const rearLeftWheel = createWheelMesh(0.32, 0.18);
  rearLeftWheel.position.set(-0.66, 0.32, -0.65);
  tiltGroup.add(rearLeftWheel);

  const rearRightWheel = createWheelMesh(0.32, 0.18);
  rearRightWheel.position.set(0.66, 0.32, -0.65);
  tiltGroup.add(rearRightWheel);

  // Rear wheel arch fenders
  const rearFenderGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 16, 1, false, 0, Math.PI);
  const leftFender = new THREE.Mesh(rearFenderGeo, darkMetalMat);
  leftFender.rotation.z = Math.PI / 2;
  leftFender.rotation.y = Math.PI;
  leftFender.position.set(-0.66, 0.36, -0.65);
  const rightFender = leftFender.clone();
  rightFender.position.set(0.66, 0.36, -0.65);
  tiltGroup.add(leftFender, rightFender);

  // -------------------------------------------------------------
  // 8. GROUND BLOB SHADOW MESH
  // -------------------------------------------------------------
  // A dark oval mesh pinned directly underneath the rickshaw at y = 0.02
  // gives great visual grounding without needing heavy dynamic shadow maps
  const blobShadowCanvas = document.createElement('canvas');
  blobShadowCanvas.width = 128;
  blobShadowCanvas.height = 128;
  const ctx = blobShadowCanvas.getContext('2d');

  // Radial gradient: dark center decaying to transparent edge
  const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
  gradient.addColorStop(0, 'rgba(10, 10, 15, 0.7)');
  gradient.addColorStop(0.5, 'rgba(10, 10, 15, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const shadowTexture = new THREE.CanvasTexture(blobShadowCanvas);
  const shadowGeo = new THREE.PlaneGeometry(1.8, 3.2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false, // Prevents z-fighting with the ground plane
  });
  const blobShadow = new THREE.Mesh(shadowGeo, shadowMat);
  blobShadow.rotation.x = -Math.PI / 2;
  blobShadow.position.set(0, 0.02, 0);
  // Add directly to rickshaw root group so it translates and turns with the vehicle
  rickshawGroup.add(blobShadow);

  // -------------------------------------------------------------
  // 9. DISTINCTIVE PHYSICAL ARCHETYPE BODY KITS (Sprint 10)
  // -------------------------------------------------------------
  // 1. CLASSIC MUMBAI KIT
  const classicKitGroup = new THREE.Group();
  tiltGroup.add(classicKitGroup);

  // 2. CNG VARIANT — livery change plus a compact rear-mounted cylinder
  const cngKitGroup = new THREE.Group();
  const cngTankMat = new THREE.MeshStandardMaterial({
    color: 0x0b6335, metalness: 0.58, roughness: 0.38
  });
  const cngTank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.145, 0.145, 0.92, 24),
    cngTankMat
  );
  cngTank.rotation.z = Math.PI / 2;
  cngTank.position.set(0, 0.88, -1.34);
  cngTank.castShadow = true;
  // Rounded end caps make the tank read as a finished cylinder, not a pipe.
  const tankCapGeo = new THREE.SphereGeometry(0.145, 16, 12);
  const tankCapL = new THREE.Mesh(tankCapGeo, cngTankMat);
  tankCapL.position.set(-0.46, 0.88, -1.34);
  const tankCapR = new THREE.Mesh(tankCapGeo, cngTankMat);
  tankCapR.position.set(0.46, 0.88, -1.34);
  // Two understated retaining bands and a small yellow valve.
  const tankBandMat = new THREE.MeshStandardMaterial({ color: 0x9da4a6, metalness: 0.78, roughness: 0.3 });
  const tankBandGeo = new THREE.CylinderGeometry(0.151, 0.151, 0.035, 20);
  const tankBandA = new THREE.Mesh(tankBandGeo, tankBandMat);
  tankBandA.rotation.z = Math.PI / 2;
  tankBandA.position.set(-0.25, 0.88, -1.34);
  const tankBandB = tankBandA.clone();
  tankBandB.position.x = 0.25;
  tankBandB.position.y = 0.88;
  const cngValve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.09, 12),
    new THREE.MeshStandardMaterial({ color: 0xffc928, metalness: 0.35, roughness: 0.4 })
  );
  cngValve.position.set(0.43, 1.04, -1.34);
  cngKitGroup.add(cngTank, tankCapL, tankCapR, tankBandA, tankBandB, cngValve);
  tiltGroup.add(cngKitGroup);

  // 3. SPORT KIT — compact spoiler, side pipes, flared arches and racing accents
  const sportKitGroup = new THREE.Group();
  // Dual chrome side-pipe exhausts with heat shield perforations
  const sideExhaustGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.25, 12);
  const sideExhaustL = new THREE.Mesh(sideExhaustGeo, chromeMat);
  sideExhaustL.rotation.x = Math.PI / 2;
  sideExhaustL.position.set(-0.72, 0.22, -0.2);
  const sideExhaustR = new THREE.Mesh(sideExhaustGeo, chromeMat);
  sideExhaustR.rotation.x = Math.PI / 2;
  sideExhaustR.position.set(0.72, 0.22, -0.2);
  // Aerodynamic rear roof wing / racing spoiler
  const spoilerWingGeo = new THREE.BoxGeometry(1.42, 0.04, 0.32);
  const spoilerMat = new THREE.MeshStandardMaterial({ color: 0x080a10, metalness: 0.8, roughness: 0.2 });
  const spoilerWing = new THREE.Mesh(spoilerWingGeo, spoilerMat);
  spoilerWing.position.set(0, 1.96, -1.2);
  spoilerWing.rotation.x = -0.12;
  // Spoiler struts
  const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.08), darkMetalMat);
  strutL.position.set(-0.48, 1.86, -1.18);
  const strutR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.08), darkMetalMat);
  strutR.position.set(0.48, 1.86, -1.18);
  // Aerodynamic end plates
  const endPlateGeo = new THREE.BoxGeometry(0.03, 0.16, 0.34);
  const endPlateL = new THREE.Mesh(endPlateGeo, new THREE.MeshStandardMaterial({ color: 0xff5a1f, metalness: 0.55, roughness: 0.3 }));
  endPlateL.position.set(-0.71, 1.96, -1.2);
  const endPlateR = new THREE.Mesh(endPlateGeo, new THREE.MeshStandardMaterial({ color: 0xff5a1f, metalness: 0.55, roughness: 0.3 }));
  endPlateR.position.set(0.71, 1.96, -1.2);
  // Muscular flared wide rear wheel arches
  const flareGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 16, 1, false, 0, Math.PI);
  const flareL = new THREE.Mesh(flareGeo, darkMetalMat);
  flareL.rotation.z = Math.PI / 2;
  flareL.rotation.y = Math.PI;
  flareL.position.set(-0.74, 0.36, -0.65);
  const flareR = flareL.clone();
  flareR.position.set(0.74, 0.36, -0.65);
  // Slim warm-red side stripes add a sporting identity without changing the body shell.
  const sportStripeMat = new THREE.MeshStandardMaterial({ color: 0xff5a1f, metalness: 0.25, roughness: 0.42 });
  const sportStripeGeo = new RoundedBoxGeometry(0.018, 0.045, 0.92, 3, 0.008);
  const sportStripeL = new THREE.Mesh(sportStripeGeo, sportStripeMat);
  sportStripeL.position.set(-0.691, 0.83, -0.34);
  const sportStripeR = sportStripeL.clone();
  sportStripeR.position.x = 0.691;
  sportKitGroup.add(sideExhaustL, sideExhaustR, spoilerWing, strutL, strutR, endPlateL, endPlateR, flareL, flareR, sportStripeL, sportStripeR);
  tiltGroup.add(sportKitGroup);


  // SPORT UPGRADE — twin front lamps, four rear lamps, nitro bottle and diffuser bumper.
  const sportFrontLights = new THREE.Group();
  const sportLampHousingMat = new THREE.MeshStandardMaterial({ color: 0x101318, metalness: 0.78, roughness: 0.24 });
  const sportLampRingMat = new THREE.MeshStandardMaterial({ color: 0xc3cbd0, metalness: 0.88, roughness: 0.18 });
  const sportLampLensMat = new THREE.MeshStandardMaterial({
    color: 0xfff4e8, emissive: 0xff8a42, emissiveIntensity: 1.45,
    metalness: 0.08, roughness: 0.2
  });
  for (const x of [-0.235, 0.235]) {
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.112, 0.08, 24), sportLampHousingMat);
    housing.rotation.x = Math.PI / 2;
    housing.position.set(x, 0.40, 0.225);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.012, 8, 24), sportLampRingMat);
    ring.position.set(x, 0.40, 0.272);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.078, 24), sportLampLensMat);
    lens.position.set(x, 0.40, 0.276);
    sportFrontLights.add(housing, ring, lens);
  }
  frontForkGroup.add(sportFrontLights);

  // Four circular red tail lamps: two on each side.
  const sportTailLampMat = new THREE.MeshStandardMaterial({
    color: 0xff2737, emissive: 0xb60017, emissiveIntensity: 1.25,
    metalness: 0.12, roughness: 0.22
  });
  const sportTailRingMat = new THREE.MeshStandardMaterial({ color: 0x9da7ae, metalness: 0.86, roughness: 0.2 });
  for (const x of [-0.49, 0.49]) {
    for (const y of [0.55, 0.72]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.067, 0.013, 8, 22), sportTailRingMat);
      ring.position.set(x, y, -1.388);
      ring.rotation.y = Math.PI;
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.054, 22), sportTailLampMat);
      lens.position.set(x, y, -1.407);
      lens.rotation.y = Math.PI;
      sportKitGroup.add(ring, lens);
    }
  }

  // Nitro cylinder mounted above the rear plate.
  const nitroTankMat = new THREE.MeshStandardMaterial({ color: 0x20262d, metalness: 0.72, roughness: 0.28 });
  const nitroAccentMat = new THREE.MeshStandardMaterial({ color: 0xff5a1f, metalness: 0.58, roughness: 0.25 });
  const nitroTank = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.92, 24), nitroTankMat);
  nitroTank.rotation.z = Math.PI / 2;
  nitroTank.position.set(0, 0.90, -1.34);
  const nitroCapGeo = new THREE.SphereGeometry(0.145, 16, 12);
  const nitroCapL = new THREE.Mesh(nitroCapGeo, nitroTankMat);
  nitroCapL.position.set(-0.46, 0.90, -1.34);
  const nitroCapR = new THREE.Mesh(nitroCapGeo, nitroTankMat);
  nitroCapR.position.set(0.46, 0.90, -1.34);
  const nitroBandGeo = new THREE.CylinderGeometry(0.151, 0.151, 0.035, 20);
  const nitroBandL = new THREE.Mesh(nitroBandGeo, nitroAccentMat);
  nitroBandL.rotation.z = Math.PI / 2;
  nitroBandL.position.set(-0.25, 0.90, -1.34);
  const nitroBandR = nitroBandL.clone();
  nitroBandR.position.x = 0.25;
  const nitroValve = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.09, 12), nitroAccentMat);
  nitroValve.position.set(0.43, 1.06, -1.34);

  const nitroLabelCanvas = document.createElement('canvas');
  nitroLabelCanvas.width = 256; nitroLabelCanvas.height = 96;
  const nitroLabelCtx = nitroLabelCanvas.getContext('2d');
  nitroLabelCtx.fillStyle = '#ff5a1f';
  nitroLabelCtx.font = 'bold 52px Arial';
  nitroLabelCtx.textAlign = 'center';
  nitroLabelCtx.textBaseline = 'middle';
  nitroLabelCtx.fillText('NITRO', 128, 48);
  const nitroLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.15),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(nitroLabelCanvas), transparent: true, side: THREE.DoubleSide })
  );
  nitroLabel.rotation.y = Math.PI / 2;
  nitroLabel.position.set(0.151, 0.90, -1.34);

  // Sportier rear diffuser bumper.
  const sportBumperMat = new THREE.MeshStandardMaterial({ color: 0x101318, metalness: 0.68, roughness: 0.3 });
  const sportBumper = new THREE.Mesh(new RoundedBoxGeometry(1.48, 0.14, 0.18, 5, 0.035), sportBumperMat);
  sportBumper.position.set(0, 0.30, -1.43);
  const sportBumperAccent = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.035, 0.025, 4, 0.01), nitroAccentMat);
  sportBumperAccent.position.set(0, 0.30, -1.535);
  sportKitGroup.add(
    nitroTank, nitroCapL, nitroCapR, nitroBandL, nitroBandR,
    nitroValve, nitroLabel, sportBumper, sportBumperAccent
  );

  // 4. ROYAL VINTAGE KIT (Maharaja Heritage Victoria)
  const vintageKitGroup = new THREE.Group();
  // Antique brass carriage lanterns (coach lamps) on windshield pillars
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.88, roughness: 0.25 });
  const lanternLensMat = new THREE.MeshBasicMaterial({ color: 0xffdd66 });
  function createCoachLantern(x) {
    const lantern = new THREE.Group();
    lantern.position.set(x, 1.34, 0.84);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.12), brassMat);
    const lensF = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.14), lanternLensMat);
    lensF.position.set(0, 0, 0.061);
    const roofCone = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.09, 4), brassMat);
    roofCone.position.y = 0.13;
    roofCone.rotation.y = Math.PI / 4;
    lantern.add(box, lensF, roofCone);
    return lantern;
  }
  const lanternL = createCoachLantern(-0.54);
  const lanternR = createCoachLantern(0.54);
  // Retro chrome vertical-barred radiator grille on front nose
  const grilleGroup = new THREE.Group();
  grilleGroup.position.set(0, 0.78, 1.14);
  grilleGroup.rotation.x = -Math.PI / 6;
  const grilleFrame = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.04), chromeMat);
  grilleGroup.add(grilleFrame);
  for (let gx = -0.16; gx <= 0.16; gx += 0.05) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.24, 0.05), chromeMat);
    slat.position.x = gx;
    grilleGroup.add(slat);
  }
  // Sweeping curved Victorian carriage mudguards over rear wheels
  const retroMudguardGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.26, 20, 1, false, 0, Math.PI * 1.05);
  const retroFenderL = new THREE.Mesh(retroMudguardGeo, brassMat);
  retroFenderL.rotation.z = Math.PI / 2;
  retroFenderL.rotation.y = Math.PI;
  retroFenderL.position.set(-0.66, 0.36, -0.65);
  const retroFenderR = retroFenderL.clone();
  retroFenderR.position.set(0.66, 0.36, -0.65);
  // Fine brass waistline rails and rear corner details for a distinct heritage finish.
  const vintageRailGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.94, 8);
  const vintageRailL = new THREE.Mesh(vintageRailGeo, brassMat);
  vintageRailL.rotation.x = Math.PI / 2;
  vintageRailL.position.set(-0.69, 0.98, -0.48);
  const vintageRailR = vintageRailL.clone();
  vintageRailR.position.x = 0.69;
  vintageKitGroup.add(lanternL, lanternR, grilleGroup, retroFenderL, retroFenderR, vintageRailL, vintageRailR);

  // Vintage rear signature: twin round red lamps with slim chrome bezels.
  const vintageTailLampMat = new THREE.MeshStandardMaterial({
    color: 0xb91520, emissive: 0x4a0308, emissiveIntensity: 0.45,
    metalness: 0.12, roughness: 0.28
  });
  const vintageLampRingMat = new THREE.MeshStandardMaterial({
    color: 0xd7c6a0, metalness: 0.78, roughness: 0.24
  });
  for (const x of [-0.48, 0.48]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.075, 0.014, 8, 24), vintageLampRingMat
    );
    ring.position.set(x, 0.62, -1.386);
    ring.rotation.y = Math.PI;
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.064, 24), vintageTailLampMat
    );
    lens.position.set(x, 0.62, -1.405);
    lens.rotation.y = Math.PI;
    vintageKitGroup.add(ring, lens);
  }
  tiltGroup.add(vintageKitGroup);



  // 6. EXPLORER KIT — utility/adventure styling while preserving the base chassis.
  const explorerKitGroup = new THREE.Group();
  const explorerMetalMat = new THREE.MeshStandardMaterial({
    color: 0x202b2a, metalness: 0.62, roughness: 0.38
  });
  const explorerAmberMat = new THREE.MeshStandardMaterial({
    color: 0xffb12b, emissive: 0x6b3100, emissiveIntensity: 0.8,
    metalness: 0.12, roughness: 0.25
  });
  // Slim roof basket: side rails and three cross slats.
  for (const x of [-0.48, 0.48]) {
    const rail = new THREE.Mesh(
      new RoundedBoxGeometry(0.045, 0.045, 1.55, 4, 0.012), explorerMetalMat
    );
    rail.position.set(x, 1.91, -0.05);
    explorerKitGroup.add(rail);
  }
  for (const z of [-0.72, -0.05, 0.62]) {
    const slat = new THREE.Mesh(
      new RoundedBoxGeometry(1.02, 0.035, 0.045, 4, 0.01), explorerMetalMat
    );
    slat.position.set(0, 1.91, z);
    explorerKitGroup.add(slat);
  }
  // Pair of compact amber auxiliary lamps flanking the standard round headlight.
  for (const x of [-0.28, 0.28]) {
    const pod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.07, 16), explorerMetalMat
    );
    pod.rotation.x = Math.PI / 2;
    pod.position.set(x, 0.34, 0.205);
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.05, 16), explorerAmberMat
    );
    lens.position.set(x, 0.34, 0.246);
    explorerKitGroup.add(pod, lens);
  }
  // Rear utility can and protective side rails.
  const utilityCan = new THREE.Mesh(
    new RoundedBoxGeometry(0.24, 0.38, 0.12, 5, 0.025),
    new THREE.MeshStandardMaterial({ color: 0xc18a42, metalness: 0.38, roughness: 0.55 })
  );
  utilityCan.position.set(0.57, 0.78, -1.25);
  explorerKitGroup.add(utilityCan);
  for (const x of [-0.71, 0.71]) {
    const sideRail = new THREE.Mesh(
      new RoundedBoxGeometry(0.035, 0.045, 0.92, 4, 0.01), explorerMetalMat
    );
    sideRail.position.set(x, 0.57, -0.15);
    explorerKitGroup.add(sideRail);
  }
  tiltGroup.add(explorerKitGroup);

  // 5. EV KIT — clean monochrome body, signature light bars and side EV marks.
  const evKitGroup = new THREE.Group();
  const evLightMat = new THREE.MeshStandardMaterial({
    color: 0xeafaff, emissive: 0x8fe8ff, emissiveIntensity: 2.2,
    metalness: 0.18, roughness: 0.2
  });
  const evRedLightMat = new THREE.MeshStandardMaterial({
    color: 0xff263f, emissive: 0xff102b, emissiveIntensity: 1.8,
    metalness: 0.12, roughness: 0.22
  });
  const evDarkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x080b10, metalness: 0.55, roughness: 0.32
  });

  // Rectangular front LED bar mounted to the steering fork.
  const evFrontHousing = new THREE.Mesh(
    new RoundedBoxGeometry(0.62, 0.115, 0.075, 5, 0.035), evDarkTrimMat
  );
  evFrontHousing.position.set(0, 0.38, 0.205);
  const evFrontLens = new THREE.Mesh(
    new RoundedBoxGeometry(0.55, 0.052, 0.018, 5, 0.022), evLightMat
  );
  evFrontLens.position.set(0, 0.38, 0.25);
  frontForkGroup.add(evFrontHousing, evFrontLens);

  // Continuous rear red LED bar replacing the two conventional tail lamps.
  const evRearHousing = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 0.115, 0.055, 5, 0.03), evDarkTrimMat
  );
  evRearHousing.position.set(0, 0.69, -1.415);
  const evRearLens = new THREE.Mesh(
    new RoundedBoxGeometry(0.84, 0.055, 0.018, 5, 0.02), evRedLightMat
  );
  evRearLens.position.set(0, 0.69, -1.45);
  evKitGroup.add(evRearHousing, evRearLens);

  // Slim black lower sill accents.
  const evSillGeo = new RoundedBoxGeometry(0.035, 0.075, 1.22, 4, 0.014);
  const evSillL = new THREE.Mesh(evSillGeo, evDarkTrimMat);
  evSillL.position.set(-0.704, 0.43, -0.18);
  const evSillR = evSillL.clone();
  evSillR.position.x = 0.704;
  evKitGroup.add(evSillL, evSillR);

  // Flush side badges with EV lettering on both sides.
  function makeEVBadgeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 128);
    ctx.fillStyle = '#111820';
    ctx.beginPath(); ctx.roundRect(12, 18, 232, 92, 18); ctx.fill();
        ctx.fillStyle = '#f5fbff';
    ctx.font = 'bold 76px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('EV', 128, 66);
    return new THREE.CanvasTexture(canvas);
  }
  const evBadgeMat = new THREE.MeshBasicMaterial({
    map: makeEVBadgeTexture(), transparent: true, side: THREE.DoubleSide
  });
  const evBadgeGeo = new THREE.PlaneGeometry(0.34, 0.17);
  const evBadgeL = new THREE.Mesh(evBadgeGeo, evBadgeMat);
  evBadgeL.rotation.y = -Math.PI / 2;
  evBadgeL.position.set(-0.711, 0.84, -0.35);
  const evBadgeR = new THREE.Mesh(evBadgeGeo, evBadgeMat);
  evBadgeR.rotation.y = Math.PI / 2;
  evBadgeR.position.set(0.711, 0.84, -0.35);
  evKitGroup.add(evBadgeL, evBadgeR);

  // Small dark aero eyebrow above the front lamp bar.
  const evNoseAccent = new THREE.Mesh(
    new RoundedBoxGeometry(0.72, 0.035, 0.10, 4, 0.012), evDarkTrimMat
  );
  evNoseAccent.position.set(0, 0.49, 1.05);
  evKitGroup.add(evNoseAccent);
  tiltGroup.add(evKitGroup);


  // 7. RES KIT — open-roof street racer with V-light, flame graphics and quad pipes.
  const resKitGroup = new THREE.Group();

  const resDarkMat = new THREE.MeshStandardMaterial({
    color: 0x111318, metalness: 0.68, roughness: 0.3
  });
  const resChromeMat = new THREE.MeshStandardMaterial({
    color: 0xbfc8d0, metalness: 0.88, roughness: 0.2
  });
  const resVLightMat = new THREE.MeshStandardMaterial({
    color: 0xeafaff, emissive: 0x5bdcff, emissiveIntensity: 2.4,
    metalness: 0.12, roughness: 0.18
  });
  const resTailMat = new THREE.MeshStandardMaterial({
    color: 0xff2738, emissive: 0xc90018, emissiveIntensity: 1.7,
    metalness: 0.1, roughness: 0.22
  });


  // Filled triangular front LED (not an outlined V).
  const resTriangleBacking = new THREE.Mesh(
    new RoundedBoxGeometry(0.64, 0.28, 0.055, 5, 0.035), resDarkMat
  );
  resTriangleBacking.position.set(0, 0.39, 0.19);
  const resTriangleShape = new THREE.Shape();
  resTriangleShape.moveTo(-0.235, 0.105);
  resTriangleShape.lineTo(0.235, 0.105);
  resTriangleShape.lineTo(0, -0.115);
  resTriangleShape.closePath();
  const resTriangleLens = new THREE.Mesh(
    new THREE.ShapeGeometry(resTriangleShape), resVLightMat
  );
  resTriangleLens.position.set(0, 0.39, 0.226);
  frontForkGroup.add(resTriangleBacking, resTriangleLens);

  // Four round rear lamps: two stacked on each side.
  for (const x of [-0.48, 0.48]) {
    for (const y of [0.56, 0.72]) {
      const bezel = new THREE.Mesh(
        new THREE.TorusGeometry(0.061, 0.012, 8, 20), resChromeMat
      );
      bezel.position.set(x, y, -1.388);
      bezel.rotation.y = Math.PI;
      const lens = new THREE.Mesh(
        new THREE.CircleGeometry(0.051, 20), resTailMat
      );
      lens.position.set(x, y, -1.407);
      lens.rotation.y = Math.PI;
      resKitGroup.add(bezel, lens);
    }
  }

  // Quad exhaust outlets, arranged as two pairs at the rear.
  const resExhaustGroup = new THREE.Group();
  const resPipeGeo = new THREE.CylinderGeometry(0.045, 0.052, 0.25, 12);
  for (const x of [-0.34, -0.12, 0.12, 0.34]) {
    const pipe = new THREE.Mesh(resPipeGeo, resChromeMat);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(x, 0.27, -1.49);
    const darkTip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.031, 0.034, 0.012, 12),
      new THREE.MeshStandardMaterial({ color: 0x17191d, metalness: 0.25, roughness: 0.55 })
    );
    darkTip.rotation.x = Math.PI / 2;
    darkTip.position.set(x, 0.27, -1.62);
    resExhaustGroup.add(pipe, darkTip);
  }
  resKitGroup.add(resExhaustGroup);

  // Flame decals on both side panels, drawn as crisp transparent graphics.
  function makeResFlameTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 192;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const drawFlame = (mirror = false) => {
      ctx.save();
      if (mirror) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
      const grad = ctx.createLinearGradient(0, 20, 0, 170);
      grad.addColorStop(0, '#fff36b');
      grad.addColorStop(0.38, '#ff9b22');
      grad.addColorStop(1, '#e52619');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(24, 104);
      ctx.bezierCurveTo(110, 88, 125, 22, 210, 36);
      ctx.bezierCurveTo(176, 72, 184, 96, 266, 78);
      ctx.bezierCurveTo(342, 60, 366, 12, 482, 24);
      ctx.bezierCurveTo(412, 70, 430, 104, 492, 126);
      ctx.bezierCurveTo(372, 112, 354, 168, 250, 145);
      ctx.bezierCurveTo(154, 126, 112, 164, 24, 104);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawFlame(false);
    return new THREE.CanvasTexture(canvas);
  }
  const resFlameMat = new THREE.MeshBasicMaterial({
    map: makeResFlameTexture(), transparent: true, side: THREE.DoubleSide,
    depthWrite: false
  });
  const resFlameGeo = new THREE.PlaneGeometry(0.88, 0.32);
  const resFlameL = new THREE.Mesh(resFlameGeo, resFlameMat);
  resFlameL.rotation.y = -Math.PI / 2;
  resFlameL.position.set(-0.716, 0.73, -0.22);
  const resFlameR = new THREE.Mesh(resFlameGeo, resFlameMat);
  resFlameR.rotation.y = Math.PI / 2;
  resFlameR.position.set(0.716, 0.73, -0.22);
  resKitGroup.add(resFlameL, resFlameR);

  // Sporty rear diffuser and side blades.
  const resDiffuser = new THREE.Mesh(
    new RoundedBoxGeometry(1.12, 0.10, 0.22, 5, 0.025), resDarkMat
  );
  resDiffuser.position.set(0, 0.25, -1.38);
  resKitGroup.add(resDiffuser);
  for (const x of [-0.70, 0.70]) {
    const blade = new THREE.Mesh(
      new RoundedBoxGeometry(0.045, 0.06, 0.88, 4, 0.012), resDarkMat
    );
    blade.position.set(x, 0.39, -0.18);
    resKitGroup.add(blade);
  }
  tiltGroup.add(resKitGroup);


  // 8. RAPTOR KIT — aggressive street-performance build with exposed turbo engine.
  const raptorKitGroup = new THREE.Group();
  const raptorBlackMat = new THREE.MeshStandardMaterial({
    color: 0x101216, metalness: 0.68, roughness: 0.28
  });
  const raptorMetalMat = new THREE.MeshStandardMaterial({
    color: 0x9ca8b2, metalness: 0.9, roughness: 0.2
  });
  const raptorRedMat = new THREE.MeshStandardMaterial({
    color: 0xff3b20, emissive: 0x6b1000, emissiveIntensity: 0.55,
    metalness: 0.22, roughness: 0.3
  });
  const raptorGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffe8d5, emissive: 0xff4b18, emissiveIntensity: 1.9,
    metalness: 0.12, roughness: 0.2
  });

  // Raised engine head protruding above the rear engine deck.
  const raptorEngineBlock = new THREE.Mesh(
    new RoundedBoxGeometry(0.72, 0.34, 0.48, 5, 0.055), raptorBlackMat
  );
  raptorEngineBlock.position.set(0, 0.94, -1.12);
  raptorKitGroup.add(raptorEngineBlock);

  // Red cylinder-head covers and metallic cooling fins.
  for (const x of [-0.22, 0.22]) {
    const headCover = new THREE.Mesh(
      new RoundedBoxGeometry(0.22, 0.16, 0.34, 4, 0.025), raptorRedMat
    );
    headCover.position.set(x, 1.17, -1.12);
    raptorKitGroup.add(headCover);
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(
        new RoundedBoxGeometry(0.245, 0.018, 0.30, 3, 0.006), raptorMetalMat
      );
      fin.position.set(x, 1.08 + i * 0.035, -1.12);
      raptorKitGroup.add(fin);
    }
  }

  // Prominent top-mounted air intake / velocity stack.
  const intakeBase = new THREE.Mesh(
    new RoundedBoxGeometry(0.42, 0.09, 0.30, 4, 0.025), raptorMetalMat
  );
  intakeBase.position.set(0, 1.31, -1.12);
  const intakeNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.13, 0.25, 16), raptorBlackMat
  );
  intakeNeck.position.set(0, 1.47, -1.12);
  const intakeMouth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.11, 0.075, 20), raptorMetalMat
  );
  intakeMouth.position.set(0, 1.62, -1.12);
  const intakeOpening = new THREE.Mesh(
    new THREE.CircleGeometry(0.125, 20),
    new THREE.MeshStandardMaterial({ color: 0x090b0e, metalness: 0.2, roughness: 0.8 })
  );
  intakeOpening.position.set(0, 1.66, -1.12);
  raptorKitGroup.add(intakeBase, intakeNeck, intakeMouth, intakeOpening);

  // Visible turbo compressor housing on the right rear quarter.
  const turboRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.145, 0.038, 12, 28), raptorMetalMat
  );
  turboRing.position.set(0.43, 1.04, -1.12);
  turboRing.rotation.y = Math.PI / 2;
  const turboHub = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 16, 12), raptorRedMat
  );
  turboHub.position.set(0.43, 1.04, -1.12);
  const turboPipe = new THREE.Mesh(
    new THREE.TorusGeometry(0.105, 0.025, 8, 20, Math.PI * 1.35), raptorMetalMat
  );
  turboPipe.position.set(0.43, 1.04, -0.91);
  turboPipe.rotation.x = Math.PI / 2;
  raptorKitGroup.add(turboRing, turboHub, turboPipe);

  // Two short exhaust headers visible beside the engine.
  for (const x of [-0.39, 0.39]) {
    const header = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.026, 8, 18, Math.PI * 1.25), raptorMetalMat
    );
    header.position.set(x, 0.87, -0.88);
    header.rotation.y = Math.PI / 2;
    raptorKitGroup.add(header);
  }


  // Raptor-only twin circular headlights, attached to the steering fork.
  const raptorFrontLights = new THREE.Group();
  const raptorLampHousingMat = new THREE.MeshStandardMaterial({
    color: 0x101419, metalness: 0.72, roughness: 0.26
  });
  const raptorLampRingMat = new THREE.MeshStandardMaterial({
    color: 0x91a28d, metalness: 0.82, roughness: 0.2
  });
  const raptorLampLensMat = new THREE.MeshStandardMaterial({
    color: 0xf5fff0, emissive: 0xb8ff9a, emissiveIntensity: 1.6,
    metalness: 0.08, roughness: 0.18
  });
  for (const x of [-0.205, 0.205]) {
    const housing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.105, 0.115, 0.075, 24), raptorLampHousingMat
    );
    housing.rotation.x = Math.PI / 2;
    housing.position.set(x, 0.40, 0.235);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.092, 0.012, 8, 24), raptorLampRingMat
    );
    ring.position.set(x, 0.40, 0.278);
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.079, 24), raptorLampLensMat
    );
    lens.position.set(x, 0.40, 0.281);
    raptorFrontLights.add(housing, ring, lens);
  }
  frontForkGroup.add(raptorFrontLights);

  // Rear triple-slit red lamps on both corners.
  const raptorRearLampMat = new THREE.MeshStandardMaterial({
    color: 0xff2638, emissive: 0xb80019, emissiveIntensity: 1.8,
    metalness: 0.08, roughness: 0.22
  });
  for (const x of [-0.48, 0.48]) {
    for (let i = 0; i < 3; i++) {
      const slit = new THREE.Mesh(
        new RoundedBoxGeometry(0.19, 0.035, 0.018, 4, 0.012), raptorRearLampMat
      );
      slit.position.set(x, 0.56 + i * 0.065, -1.397);
      raptorKitGroup.add(slit);
    }
  }

  // Side air vents and a subtle performance stripe.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const vent = new THREE.Mesh(
        new RoundedBoxGeometry(0.018, 0.025, 0.22, 3, 0.006), raptorMetalMat
      );
      vent.position.set(side * 0.716, 0.83, -0.56 + i * 0.075);
      raptorKitGroup.add(vent);
    }
    const stripe = new THREE.Mesh(
      new RoundedBoxGeometry(0.018, 0.045, 0.92, 3, 0.008), raptorRedMat
    );
    stripe.position.set(side * 0.719, 0.49, -0.15);
    raptorKitGroup.add(stripe);
  }


  // Raptor claw-scratch graphics on both side panels.
  function makeRaptorScratchTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 192;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 192);
    const scratchGrad = ctx.createLinearGradient(0, 0, 0, 192);
    scratchGrad.addColorStop(0, 'rgba(211,238,177,0.96)');
    scratchGrad.addColorStop(1, 'rgba(102,157,91,0.82)');
    ctx.strokeStyle = scratchGrad;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 22;
    for (let i = 0; i < 3; i++) {
      const x = 95 + i * 126;
      ctx.beginPath();
      ctx.moveTo(x + 36, 18);
      ctx.bezierCurveTo(x + 16, 65, x + 8, 112, x - 38, 174);
      ctx.stroke();
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x + 27, 30);
      ctx.lineTo(x + 8, 70);
      ctx.stroke();
      ctx.lineWidth = 22;
    }
    return new THREE.CanvasTexture(canvas);
  }
  const raptorScratchMat = new THREE.MeshBasicMaterial({
    map: makeRaptorScratchTexture(), transparent: true,
    side: THREE.DoubleSide, depthWrite: false
  });
  const raptorScratchGeo = new THREE.PlaneGeometry(0.76, 0.30);
  const raptorScratchL = new THREE.Mesh(raptorScratchGeo, raptorScratchMat);
  raptorScratchL.rotation.y = -Math.PI / 2;
  raptorScratchL.position.set(-0.721, 0.86, -0.48);
  const raptorScratchR = new THREE.Mesh(raptorScratchGeo, raptorScratchMat);
  raptorScratchR.rotation.y = Math.PI / 2;
  raptorScratchR.position.set(0.721, 0.86, -0.48);
  raptorKitGroup.add(raptorScratchL, raptorScratchR);

  // Rear aero spoiler above the engine assembly.
  const raptorSpoiler = new THREE.Mesh(
    new RoundedBoxGeometry(1.12, 0.065, 0.20, 5, 0.025), raptorBlackMat
  );
  raptorSpoiler.position.set(0, 1.46, -1.33);
  for (const x of [-0.39, 0.39]) {
    const support = new THREE.Mesh(
      new RoundedBoxGeometry(0.045, 0.52, 0.055, 4, 0.012), raptorMetalMat
    );
    support.position.set(x, 1.18, -1.33);
    raptorKitGroup.add(support);
  }
  raptorKitGroup.add(raptorSpoiler);

  tiltGroup.add(raptorKitGroup);


  // Side wordmarks for selected variants. Each pair is isolated inside its own kit group.
  function addSideWordmark(targetGroup, label, color = '#f7f5ec', outline = '#172027') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.font = '900 76px Arial, sans-serif';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 10;
    ctx.strokeText(label, 256, 66);
    ctx.fillStyle = color;
    ctx.fillText(label, 256, 66);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map: texture, transparent: true, side: THREE.DoubleSide,
      depthWrite: false, toneMapped: false
    });
    const geometry = new THREE.PlaneGeometry(0.72, 0.18);
    const left = new THREE.Mesh(geometry, material);
    left.rotation.y = -Math.PI / 2;
    left.position.set(-0.684, 0.78, -0.18);
    const right = new THREE.Mesh(geometry, material);
    right.rotation.y = Math.PI / 2;
    right.position.set(0.684, 0.78, -0.18);
    targetGroup.add(left, right);
  }

  addSideWordmark(classicKitGroup, 'CLASSIC', '#fff3c5', '#6b3d00');
  addSideWordmark(cngKitGroup, 'CNG', '#f4ffe9', '#064b2a');
  addSideWordmark(vintageKitGroup, 'ROYAL', '#f7e5bd', '#6a040f');
  addSideWordmark(explorerKitGroup, 'EXPLORER', '#f7edcf', '#324b37');
  addSideWordmark(resKitGroup, 'RIZ', '#ffffff', '#b92722');
  addSideWordmark(raptorKitGroup, 'RAPTOR', '#d8f0c6', '#123d2b');

  // Res rear spoiler: compact high-mounted wing with two supports.
  const resSpoilerMat = new THREE.MeshStandardMaterial({
    color: 0x111318, metalness: 0.72, roughness: 0.26
  });
  const resSpoilerAccentMat = new THREE.MeshStandardMaterial({
    color: 0xd52b25, metalness: 0.42, roughness: 0.3
  });
  const resSpoiler = new THREE.Mesh(
    new RoundedBoxGeometry(1.08, 0.065, 0.22, 5, 0.025), resSpoilerMat
  );
  resSpoiler.position.set(0, 1.31, -1.28);
  resSpoiler.rotation.x = -0.10;
  for (const x of [-0.38, 0.38]) {
    const support = new THREE.Mesh(
      new RoundedBoxGeometry(0.045, 0.46, 0.055, 4, 0.012), resChromeMat
    );
    support.position.set(x, 1.08, -1.28);
    resKitGroup.add(support);
  }
  const resSpoilerAccent = new THREE.Mesh(
    new RoundedBoxGeometry(0.34, 0.018, 0.018, 3, 0.006), resSpoilerAccentMat
  );
  resSpoilerAccent.position.set(0, 1.31, -1.395);
  resKitGroup.add(resSpoiler, resSpoilerAccent);


  // 9. POLICE KIT — black-and-white patrol rickshaw with roof beacons and bullbars.
  const policeKitGroup = new THREE.Group();
  const policeBlackMat = new THREE.MeshStandardMaterial({
    color: 0x11151b, metalness: 0.62, roughness: 0.32
  });
  const policeChromeMat = new THREE.MeshStandardMaterial({
    color: 0xb8c2ca, metalness: 0.88, roughness: 0.22
  });
  const policeRedMat = new THREE.MeshStandardMaterial({
    color: 0xff1828, emissive: 0xc90018, emissiveIntensity: 1.8,
    metalness: 0.12, roughness: 0.2
  });
  const policeBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1688ff, emissive: 0x075dff, emissiveIntensity: 1.9,
    metalness: 0.12, roughness: 0.2
  });


  // Rectangular police lightbar with distinct red and blue illuminated halves.
  const policeSirenBase = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 0.075, 0.24, 5, 0.025), policeBlackMat
  );
  policeSirenBase.position.set(0, 1.91, 0.12);

  const policeRedBeacon = new THREE.Mesh(
    new RoundedBoxGeometry(0.43, 0.15, 0.205, 5, 0.035), policeRedMat
  );
  policeRedBeacon.position.set(-0.225, 2.015, 0.12);

  const policeBlueBeacon = new THREE.Mesh(
    new RoundedBoxGeometry(0.43, 0.15, 0.205, 5, 0.035), policeBlueMat
  );
  policeBlueBeacon.position.set(0.225, 2.015, 0.12);

  // Thin pale centre divider and reflective front lenses.
  const policeLightDivider = new THREE.Mesh(
    new RoundedBoxGeometry(0.025, 0.115, 0.212, 3, 0.008), policeChromeMat
  );
  policeLightDivider.position.set(0, 2.018, 0.12);

  policeKitGroup.add(
    policeSirenBase, policeRedBeacon, policeBlueBeacon, policeLightDivider
  );

  // Front bullbar: upper cross rail, lower rail and protective vertical hoops.
  const policeFrontBar = new THREE.Mesh(
    new RoundedBoxGeometry(1.12, 0.075, 0.075, 5, 0.02), policeBlackMat
  );
  policeFrontBar.position.set(0, 0.28, 1.22);
  const policeFrontUpper = new THREE.Mesh(
    new RoundedBoxGeometry(0.98, 0.06, 0.07, 5, 0.018), policeChromeMat
  );
  policeFrontUpper.position.set(0, 0.57, 1.12);
  policeKitGroup.add(policeFrontBar, policeFrontUpper);
  for (const x of [-0.47, 0.47]) {
    const hoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.025, 8, 24, Math.PI), policeBlackMat
    );
    hoop.position.set(x, 0.43, 1.18);
    hoop.rotation.z = Math.PI;
    policeKitGroup.add(hoop);
    const upright = new THREE.Mesh(
      new RoundedBoxGeometry(0.055, 0.28, 0.06, 4, 0.015), policeBlackMat
    );
    upright.position.set(x, 0.43, 1.20);
    policeKitGroup.add(upright);
  }

  // Rear bullbar protects the rear panel and sits below the tail lamps.
  const policeRearBar = new THREE.Mesh(
    new RoundedBoxGeometry(1.20, 0.075, 0.09, 5, 0.02), policeBlackMat
  );
  policeRearBar.position.set(0, 0.31, -1.48);
    const policeRearUpper = new THREE.Mesh(
    new RoundedBoxGeometry(1.02, 0.055, 0.07, 5, 0.015), policeChromeMat
  );
  policeRearUpper.position.set(0, 0.55, -1.43);
  policeKitGroup.add(policeRearBar, policeRearUpper);
  for (const x of [-0.49, 0.49]) {
    const rearGuard = new THREE.Mesh(
      new RoundedBoxGeometry(0.055, 0.27, 0.07, 4, 0.015), policeBlackMat
    );
    rearGuard.position.set(x, 0.43, -1.45);
    policeKitGroup.add(rearGuard);
  }

  // Small black-and-white front grille badge.
  const policeFrontBadge = new THREE.Mesh(
    new RoundedBoxGeometry(0.34, 0.12, 0.025, 4, 0.012),
    new THREE.MeshStandardMaterial({ color: 0xf4f5f6, metalness: 0.15, roughness: 0.45 })
  );
  policeFrontBadge.position.set(0, 0.70, 1.015);
  policeKitGroup.add(policeFrontBadge);

  tiltGroup.add(policeKitGroup);
  addSideWordmark(policeKitGroup, 'POLICE', '#ffffff', '#11151b');

  // Red-and-blue patrol stripes along both side panels, below the POLICE marking.
  const policeStripeRedMat = new THREE.MeshStandardMaterial({
    color: 0xd51f2a, metalness: 0.18, roughness: 0.48
  });
  const policeStripeBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1768c7, metalness: 0.18, roughness: 0.48
  });
  for (const side of [-1, 1]) {
    const redStripe = new THREE.Mesh(
      new RoundedBoxGeometry(0.018, 0.045, 0.88, 4, 0.012), policeStripeRedMat
    );
    redStripe.position.set(side * 0.688, 0.58, -0.56);
    const blueStripe = new THREE.Mesh(
      new RoundedBoxGeometry(0.018, 0.045, 0.88, 4, 0.012), policeStripeBlueMat
    );
    blueStripe.position.set(side * 0.689, 0.515, -0.56);
    policeKitGroup.add(redStripe, blueStripe);
  }



  // 10. CHAIWALA — legendary Indian cutting-chai special edition.
  const chaiwalaKitGroup = new THREE.Group();
  const chaiDarkMat = new THREE.MeshStandardMaterial({
    color: 0x3a1e12, metalness: 0.42, roughness: 0.38
  });
  const chaiCreamMat = new THREE.MeshStandardMaterial({
    color: 0xf2d6a2, metalness: 0.12, roughness: 0.52
  });
  const chaiGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4e8d1, transparent: true, opacity: 0.34,
    roughness: 0.12, metalness: 0.0, transmission: 0.18, thickness: 0.04
  });
  const chaiTeaMat = new THREE.MeshStandardMaterial({
    color: 0xb85a18, emissive: 0x6a2508, emissiveIntensity: 0.32,
    roughness: 0.3, metalness: 0.05
  });
  const chaiGoldMat = new THREE.MeshStandardMaterial({
    color: 0xd49a43, metalness: 0.68, roughness: 0.26
  });

  // Tea-coloured side pinstripes, kept within the side body panel.
  for (const side of [-1, 1]) {
    const stripe = new THREE.Mesh(
      new RoundedBoxGeometry(0.018, 0.035, 0.96, 4, 0.01), chaiGoldMat
    );
    stripe.position.set(side * 0.689, 0.53, -0.54);
    chaiwalaKitGroup.add(stripe);

    // Iconic small Indian cutting-chai glass, one on each side.
    const glassProfile = [
      new THREE.Vector2(0.052, 0.00),
      new THREE.Vector2(0.058, 0.018),
      new THREE.Vector2(0.070, 0.16),
      new THREE.Vector2(0.078, 0.19),
      new THREE.Vector2(0.071, 0.20)
    ];
    const glass = new THREE.Mesh(
      new THREE.LatheGeometry(glassProfile, 24), chaiGlassMat
    );
    glass.position.set(side * 0.704, 0.60, 0.12);
    chaiwalaKitGroup.add(glass);

    const teaProfile = [
      new THREE.Vector2(0.048, 0.018),
      new THREE.Vector2(0.055, 0.025),
      new THREE.Vector2(0.064, 0.125)
    ];
    const tea = new THREE.Mesh(
      new THREE.LatheGeometry(teaProfile, 24), chaiTeaMat
    );
    tea.position.set(side * 0.706, 0.60, 0.12);
    chaiwalaKitGroup.add(tea);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.074, 0.008, 8, 24), chaiGoldMat
    );
    rim.position.set(side * 0.706, 0.795, 0.12);
    chaiwalaKitGroup.add(rim);
  }

  // CHAIWALA side branding, paired with the cutting-chai glass on both flanks.
  tiltGroup.add(chaiwalaKitGroup);

  // Compact CHAIWALA lettering positioned directly on the painted side panel.
  const chaiBrandCanvas = document.createElement('canvas');
  chaiBrandCanvas.width = 1024;
  chaiBrandCanvas.height = 160;
  const chaiBrandCtx = chaiBrandCanvas.getContext('2d');
  chaiBrandCtx.clearRect(0, 0, 1024, 160);
  chaiBrandCtx.textAlign = 'center';
  chaiBrandCtx.textBaseline = 'middle';
  chaiBrandCtx.font = '900 112px Arial, sans-serif';
  chaiBrandCtx.lineJoin = 'round';
  chaiBrandCtx.lineWidth = 10;
  chaiBrandCtx.strokeStyle = '#4a2413';
  chaiBrandCtx.strokeText('CHAIWALA', 512, 82);
  chaiBrandCtx.fillStyle = '#f7e4bd';
  chaiBrandCtx.fillText('CHAIWALA', 512, 82);
  const chaiBrandMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(chaiBrandCanvas), transparent: true,
    side: THREE.DoubleSide, depthWrite: false, toneMapped: false
  });
  const chaiBrandGeo = new THREE.PlaneGeometry(0.94, 0.135);
  const chaiBrandLeft = new THREE.Mesh(chaiBrandGeo, chaiBrandMat);
  chaiBrandLeft.rotation.y = -Math.PI / 2;
  chaiBrandLeft.position.set(-0.689, 0.955, -0.34);
  const chaiBrandRight = new THREE.Mesh(chaiBrandGeo, chaiBrandMat);
  chaiBrandRight.rotation.y = Math.PI / 2;
  chaiBrandRight.position.set(0.689, 0.955, -0.34);
  chaiwalaKitGroup.add(chaiBrandLeft, chaiBrandRight);



  // Chaiwala rear signature: a large handle-free Indian cutting-chai glass stencil.
  const chaiStencilCreamMat = new THREE.MeshStandardMaterial({
    color: 0xf2d6a2, metalness: 0.30, roughness: 0.36,
    side: THREE.DoubleSide, emissive: 0x3c1b0b, emissiveIntensity: 0.12
  });
  const chaiStencilTeaMat = new THREE.MeshStandardMaterial({
    color: 0xb85a18, metalness: 0.08, roughness: 0.3,
    side: THREE.DoubleSide, emissive: 0x6a2508, emissiveIntensity: 0.35
  });
  const chaiStencilDarkMat = new THREE.MeshStandardMaterial({
    color: 0x4a2413, metalness: 0.22, roughness: 0.4,
    side: THREE.DoubleSide
  });

  // Straight-sided, slightly flared cutting-glass silhouette — no handle.
  const chaiGlassShape = new THREE.Shape();
  chaiGlassShape.moveTo(-0.31, 0.98);
  chaiGlassShape.lineTo(0.31, 0.98);
  chaiGlassShape.lineTo(0.235, 0.34);
  chaiGlassShape.quadraticCurveTo(0.22, 0.30, 0.17, 0.30);
  chaiGlassShape.lineTo(-0.17, 0.30);
  chaiGlassShape.quadraticCurveTo(-0.22, 0.30, -0.235, 0.34);
  chaiGlassShape.closePath();

  const chaiGlassStencil = new THREE.Mesh(
    new THREE.ShapeGeometry(chaiGlassShape), chaiStencilCreamMat
  );
  chaiGlassStencil.position.set(0, 0, -1.389);
  chaiwalaKitGroup.add(chaiGlassStencil);

  const chaiGlassOutlinePts = [
    new THREE.Vector3(-0.31, 0.98, -1.392),
    new THREE.Vector3(0.31, 0.98, -1.392),
    new THREE.Vector3(0.235, 0.34, -1.392),
    new THREE.Vector3(0.17, 0.30, -1.392),
    new THREE.Vector3(-0.17, 0.30, -1.392),
    new THREE.Vector3(-0.235, 0.34, -1.392),
    new THREE.Vector3(-0.31, 0.98, -1.392)
  ];
  const chaiGlassOutline = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(chaiGlassOutlinePts),
    new THREE.LineBasicMaterial({ color: 0x4a2413 })
  );
  chaiwalaKitGroup.add(chaiGlassOutline);

  // Amber tea visible inside the upper part of the glass.
  const chaiTeaShape = new THREE.Shape();
  chaiTeaShape.moveTo(-0.286, 0.86);
  chaiTeaShape.lineTo(0.286, 0.86);
  chaiTeaShape.lineTo(0.272, 0.73);
  chaiTeaShape.lineTo(-0.272, 0.73);
  chaiTeaShape.closePath();
  const chaiTeaFill = new THREE.Mesh(
    new THREE.ShapeGeometry(chaiTeaShape), chaiStencilTeaMat
  );
  chaiTeaFill.position.set(0, 0, -1.395);
  chaiwalaKitGroup.add(chaiTeaFill);

  const chaiGlassRim = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.035, 0.018), chaiStencilDarkMat
  );
  chaiGlassRim.position.set(0, 0.985, -1.398);
  chaiwalaKitGroup.add(chaiGlassRim);

  // Red 2D cutting-glass tail lamps, one at each rear corner.
  const chaiTailRedMat = new THREE.MeshStandardMaterial({
    color: 0xff2638, emissive: 0xd00018, emissiveIntensity: 1.6,
    metalness: 0.08, roughness: 0.22, side: THREE.DoubleSide
  });
  const chaiTailDarkMat = new THREE.MeshStandardMaterial({
    color: 0x4a2413, metalness: 0.32, roughness: 0.35,
    side: THREE.DoubleSide
  });
  for (const x of [-0.53, 0.53]) {
    const tailCupShape = new THREE.Shape();
    tailCupShape.moveTo(-0.075, 0.075);
    tailCupShape.lineTo(0.075, 0.075);
    tailCupShape.lineTo(0.052, -0.075);
    tailCupShape.lineTo(-0.052, -0.075);
    tailCupShape.closePath();
    const tailCup = new THREE.Mesh(
      new THREE.ShapeGeometry(tailCupShape), chaiTailRedMat
    );
    tailCup.position.set(x, 0.56, -1.401);
    chaiwalaKitGroup.add(tailCup);

    const tailRim = new THREE.Mesh(
      new THREE.BoxGeometry(0.17, 0.018, 0.012), chaiTailDarkMat
    );
    tailRim.position.set(x, 0.642, -1.404);
    chaiwalaKitGroup.add(tailRim);
  }

  // Front signature: two small cutting-chai glass decals and CHAI lettering between them.
  const chaiFrontCanvas = document.createElement('canvas');
  chaiFrontCanvas.width = 512;
  chaiFrontCanvas.height = 512;
  const chaiFrontCtx = chaiFrontCanvas.getContext('2d');
  chaiFrontCtx.clearRect(0, 0, 512, 512);
  chaiFrontCtx.lineJoin = 'round';
  chaiFrontCtx.lineWidth = 24;
  chaiFrontCtx.strokeStyle = '#4a2413';
  chaiFrontCtx.fillStyle = '#f2d6a2';
  chaiFrontCtx.beginPath();
  chaiFrontCtx.moveTo(142, 90);
  chaiFrontCtx.lineTo(370, 90);
  chaiFrontCtx.lineTo(335, 414);
  chaiFrontCtx.quadraticCurveTo(330, 438, 302, 438);
  chaiFrontCtx.lineTo(210, 438);
  chaiFrontCtx.quadraticCurveTo(182, 438, 177, 414);
  chaiFrontCtx.closePath();
  chaiFrontCtx.fill();
  chaiFrontCtx.stroke();
  chaiFrontCtx.fillStyle = '#b85a18';
  chaiFrontCtx.fillRect(163, 130, 186, 52);
  chaiFrontCtx.strokeStyle = '#4a2413';
  chaiFrontCtx.lineWidth = 12;
  chaiFrontCtx.beginPath();
  chaiFrontCtx.moveTo(145, 90);
  chaiFrontCtx.lineTo(367, 90);
  chaiFrontCtx.stroke();
  const chaiFrontCupTexture = new THREE.CanvasTexture(chaiFrontCanvas);
  const chaiFrontCupMat = new THREE.MeshBasicMaterial({
    map: chaiFrontCupTexture, transparent: true, side: THREE.DoubleSide,
    depthWrite: false, toneMapped: false
  });
  const chaiFrontCupGeo = new THREE.PlaneGeometry(0.15, 0.15);
  const chaiFrontCupLeft = new THREE.Mesh(chaiFrontCupGeo, chaiFrontCupMat);
  chaiFrontCupLeft.position.set(-0.245, 0.91, 1.174);
  chaiFrontCupLeft.rotation.x = -Math.PI / 6;
  const chaiFrontCupRight = new THREE.Mesh(chaiFrontCupGeo, chaiFrontCupMat);
  chaiFrontCupRight.position.set(0.245, 0.91, 1.174);
  chaiFrontCupRight.rotation.x = -Math.PI / 6;
  chaiwalaKitGroup.add(chaiFrontCupLeft, chaiFrontCupRight);

  const chaiFrontTextCanvas = document.createElement('canvas');
  chaiFrontTextCanvas.width = 512;
  chaiFrontTextCanvas.height = 160;
  const chaiFrontTextCtx = chaiFrontTextCanvas.getContext('2d');
  chaiFrontTextCtx.clearRect(0, 0, 512, 160);
  chaiFrontTextCtx.textAlign = 'center';
  chaiFrontTextCtx.textBaseline = 'middle';
  chaiFrontTextCtx.font = '900 116px Arial, sans-serif';
  chaiFrontTextCtx.lineJoin = 'round';
  chaiFrontTextCtx.lineWidth = 12;
  chaiFrontTextCtx.strokeStyle = '#4a2413';
  chaiFrontTextCtx.strokeText('CHAI', 256, 82);
  chaiFrontTextCtx.fillStyle = '#f7e4bd';
  chaiFrontTextCtx.fillText('CHAI', 256, 82);
  const chaiFrontTextMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(chaiFrontTextCanvas), transparent: true,
    side: THREE.DoubleSide, depthWrite: false, toneMapped: false
  });
  const chaiFrontText = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.10), chaiFrontTextMat
  );
  chaiFrontText.position.set(0, 0.91, 1.178);
  chaiFrontText.rotation.x = -Math.PI / 6;
  chaiwalaKitGroup.add(chaiFrontText);

  // Default archetype visibility
  classicKitGroup.visible = true;
  cngKitGroup.visible = false;
  sportKitGroup.visible = false;
  vintageKitGroup.visible = false;
  evKitGroup.visible = false;
  explorerKitGroup.visible = false;
  resKitGroup.visible = false;
  policeKitGroup.visible = false;
  chaiwalaKitGroup.visible = false;

  // Return the complete assembled rickshaw plus handles for game loop animation
  const ARCHETYPES = {
    CLASSIC_MUMBAI: {
      body: 0xf5b000,
      trim: 0x1a1a1a,
      canopy: 0x1c1e21,
      slogan: 'HORN_OK',
    },
    GREEN_CNG: {
      body: 0xf2c230,
      trim: 0x176b3a,
      canopy: 0x18231d,
      slogan: 'MERA_BHARAT',
    },
    SPORT: {
      body: 0x252a31,
      trim: 0xff5a1f,
      canopy: 0x101318,
      slogan: 'DEKH_MAGAR',
    },
    ROYAL_VINTAGE: {
      body: 0x6a040f,
      trim: 0xfaedcd,
      canopy: 0x800f2f,
      slogan: 'BURI_NAZAR',
    },
    EV: {
      body: 0xf2f4f5,
      trim: 0x111820,
      canopy: 0x080b10,
      slogan: 'ELECTRIC',
    },
    EXPLORER: {
      body: 0x176b67,
      trim: 0xc69a55,
      canopy: 0xc69a55,
      slogan: 'EXPLORE',
    },
    RES: {
      body: 0x25272d,
      trim: 0xd52b25,
      canopy: 0x101318,
      slogan: 'RES RACING',
    },
    RAPTOR: {
      body: 0x123d2b,
      trim: 0x8fbd78,
      canopy: 0x101b16,
      slogan: 'TURBO BEAST',
    },
    POLICE: {
      body: 0xf3f4f5,
      trim: 0x171b22,
      canopy: 0x11151b,
      slogan: 'POLICE',
    },
    CHAIWALA: {
      body: 0xd8a35d,
      trim: 0x4a2413,
      canopy: 0x6b351b,
      slogan: 'CHAIWALA',
    },
  };

  function setPaintColor(colorHex) {
    bodyYellowMat.color.set(colorHex);
  }

  function setColors(colors) {
    if (colors.body !== undefined) bodyYellowMat.color.set(colors.body);
    if (colors.trim !== undefined) trimGreenMat.color.set(colors.trim);
    if (colors.canopy !== undefined) canopyMat.color.set(colors.canopy);
  }

  function setArchetype(archetypeName) {
    // Backward compatibility for older game code that selected the former racer key.
    if (archetypeName === 'MIDNIGHT_NEON') archetypeName = 'SPORT';
    const arch = ARCHETYPES[archetypeName] || ARCHETYPES.CLASSIC_MUMBAI;
    setColors({ body: arch.body, trim: arch.trim, canopy: arch.canopy });
    if (arch.slogan) setRearSlogan(arch.slogan);

    // Toggle distinctive physical body kit components
    classicKitGroup.visible = (archetypeName === 'CLASSIC_MUMBAI');
    cngKitGroup.visible = (archetypeName === 'GREEN_CNG');
    sportKitGroup.visible = (archetypeName === 'SPORT');
    vintageKitGroup.visible = (archetypeName === 'ROYAL_VINTAGE');
    evKitGroup.visible = (archetypeName === 'EV');
    explorerKitGroup.visible = (archetypeName === 'EXPLORER');
    resKitGroup.visible = (archetypeName === 'RES');
    policeKitGroup.visible = (archetypeName === 'POLICE');
    chaiwalaKitGroup.visible = (archetypeName === 'CHAIWALA');
    // Chaiwala gets warm brown rubber; all other variants retain black tires.
    const selectedTireMat = archetypeName === 'CHAIWALA' ? chaiRubberTireMat : rubberTireMat;
    [frontWheel, rearLeftWheel, rearRightWheel].forEach((wheelGroup) => {
      wheelGroup.traverse((part) => {
        if (part.name === 'OuterRubberTire') part.material = selectedTireMat;
      });
    });
    rearBumper.visible = (archetypeName !== 'CHAIWALA');
    leftTailLight.visible = (archetypeName !== 'CHAIWALA');
    rightTailLight.visible = (archetypeName !== 'CHAIWALA');
    // EV and RES have their own front lighting; all other models keep the round lamp.
    evFrontHousing.visible = (archetypeName === 'EV');
    evFrontLens.visible = (archetypeName === 'EV');
    resTriangleBacking.visible = (archetypeName === 'RES');
    resTriangleLens.visible = (archetypeName === 'RES');
    headlightHousing.visible = !['EV', 'RES', 'SPORT'].includes(archetypeName);
    headlightLens.visible = !['EV', 'RES', 'SPORT'].includes(archetypeName);
    sportFrontLights.visible = (archetypeName === 'SPORT');
    raptorKitGroup.visible = (archetypeName === 'RAPTOR');
    raptorFrontLights.visible = (archetypeName === 'RAPTOR');
    // Vintage and Sport have their own circular rear lamps; EV and Res retain their signatures.
    leftTailLight.visible = !['EV', 'ROYAL_VINTAGE', 'RES', 'SPORT'].includes(archetypeName);
    rightTailLight.visible = !['EV', 'ROYAL_VINTAGE', 'RES', 'SPORT'].includes(archetypeName);
    // Chaiwala uses only its custom red cutting-glass tail lamps.
    if (archetypeName === 'CHAIWALA') {
      leftTailLight.visible = false;
      rightTailLight.visible = false;
    }
    roofGroup.visible = (archetypeName !== 'RES');
    roofRackGroup.visible = (archetypeName !== 'RES') && roofRackGroup.visible;
    exhaustPipe.visible = (archetypeName !== 'RES');

    // Sculpt canopy & roof silhouette based on archetype
    if (archetypeName === 'SPORT') {
      canopyMain.scale.set(1.035, 0.88, 1.0);
      canopyCrown.scale.set(0.18, 1.0, 0.98);
    } else if (archetypeName === 'EV') {
      canopyMain.scale.set(1.015, 0.94, 1.0);
      canopyCrown.scale.set(0.20, 1.0, 0.98);
    } else if (archetypeName === 'ROYAL_VINTAGE') {
      canopyMain.scale.set(1.0, 1.25, 1.02);
      canopyCrown.scale.set(0.32, 1.0, 1.0);
    } else if (archetypeName === 'EXPLORER') {
      canopyMain.scale.set(1.0, 1.0, 1.0);
      canopyCrown.scale.set(0.24, 1.0, 0.98);
    } else {
      canopyMain.scale.set(1.0, 1.0, 1.0);
      canopyCrown.scale.set(0.24, 1.0, 0.98);
    }
  }

  function setRoofRackVisible(visible) {
    roofRackGroup.visible = visible;
  }

  function setRearSlogan(sloganId) {
    const newTex = createHornOkPleaseTexture(sloganId);
    hornPlateMat.map = newTex;
    hornPlateMat.needsUpdate = true;
  }

  function setGarlandVisible(visible) {
    windshieldGarlandGroup.visible = visible;
  }

  function setBobbleheadVisible(visible) {
    bobbleheadGroup.visible = visible;
  }

  let blingTime = 0;
  function updateInteriorBling(dt, vehicle) {
    blingTime += dt;
    if (bobbleheadGroup.visible) {
      const steer = vehicle?.steerAngle || 0;
      const speedRatio = Math.min(1.0, Math.abs(vehicle?.speed || 0) / 25.0);
      const nod = Math.sin(blingTime * 16.0) * (0.05 + speedRatio * 0.16);
      bobbleHeadMesh.rotation.x = -nod;
      bobbleHeadMesh.rotation.z = -steer * 0.45 + Math.sin(blingTime * 10.0) * 0.04;
    }
    if (windshieldGarlandGroup.visible) {
      const steer = vehicle?.steerAngle || 0;
      windshieldGarlandGroup.rotation.z = THREE.MathUtils.lerp(
        windshieldGarlandGroup.rotation.z,
        -steer * 0.32,
        7.0 * dt
      );
    }
  }

  return {
    group: rickshawGroup,
    tiltGroup: tiltGroup,
    frontForkGroup: frontForkGroup,
    frontWheel: frontWheel,
    rearLeftWheel: rearLeftWheel,
    rearRightWheel: rearRightWheel,
    blobShadow: blobShadow,
    exhaustPipe: exhaustPipe,
    setPaintColor,
    setColors,
    setArchetype,
    setRearSlogan,
    setGarlandVisible,
    setBobbleheadVisible,
    setRoofRackVisible,
    updateInteriorBling,
  };
}