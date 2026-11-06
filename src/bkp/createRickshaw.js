import * as THREE from 'three';
import { createHornOkPleaseTexture } from './createStreetTextures.js';

/**
 * createRickshaw
 * 
 * Procedurally builds a stylized, iconic Indian Auto-Rickshaw (Tuk-Tuk)
 * entirely out of Three.js primitives (Boxes, Cylinders, Spheres).
 * 
 * Hierarchy:
 *  rickshawGroup (Root - handles world position & yaw / heading)
 *   ├── blobShadow (Dark oval grounded beneath vehicle)
 *   └── tiltGroup (Tilts and pitches for 3-wheeler driving feel)
 *        ├── mainBody (Yellow cabin, rear engine bay, floorboard)
 *        ├── roofGroup (Slender black pillars & curved canopy)
 *        ├── windshield (Semi-transparent tinted glass)
 *        ├── interior (Driver & passenger benches, handlebar console)
 *        ├── frontForkGroup (Steers left/right with front wheel)
 *        │    ├── frontWheel (Spins forward/backward with speed)
 *        │    ├── mudguard & headlight
 *        ├── rearLeftWheel (Spins with speed)
 *        └── rearRightWheel (Spins with speed)
 * 
 * Returns an object containing the root group and references to animated parts.
 */
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
  const rearLowerGeo = new THREE.BoxGeometry(1.36, 0.36, 1.3);
  const rearLowerMesh = new THREE.Mesh(rearLowerGeo, trimGreenMat);
  rearLowerMesh.position.set(0, 0.54, -0.55);
  rearLowerMesh.castShadow = true;
  rearLowerMesh.receiveShadow = true;
  tiltGroup.add(rearLowerMesh);

  // Rear cabin yellow body sides / back panel
  const rearUpperGeo = new THREE.BoxGeometry(1.36, 0.42, 1.26);
  const rearUpperMesh = new THREE.Mesh(rearUpperGeo, bodyYellowMat);
  rearUpperMesh.position.set(0, 0.88, -0.55);
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
  const engineBoxGeo = new THREE.BoxGeometry(1.26, 0.45, 0.32);
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
  const frontLowerGeo = new THREE.BoxGeometry(0.96, 0.36, 0.72);
  const frontLower = new THREE.Mesh(frontLowerGeo, trimGreenMat);
  frontLower.position.set(0, 0.54, 0.66);
  frontLower.castShadow = true;
  tiltGroup.add(frontLower);

  // Front yellow nose apron
  const frontUpperGeo = new THREE.BoxGeometry(0.9, 0.46, 0.58);
  const frontUpper = new THREE.Mesh(frontUpperGeo, bodyYellowMat);
  frontUpper.position.set(0, 0.88, 0.68);
  frontUpper.castShadow = true;
  tiltGroup.add(frontUpper);

  // Angled nose hood sloping down towards the front wheel
  const noseSlopeGeo = new THREE.BoxGeometry(0.82, 0.35, 0.42);
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
  const canopyMainGeo = new THREE.BoxGeometry(1.38, 0.14, 2.3);
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

  // 2. GREEN CNG KIT (Delhi Eco-Rickshaw)
  const cngKitGroup = new THREE.Group();
  // Rear CNG high pressure green gas cylinder
  const cngTankMat = new THREE.MeshStandardMaterial({ color: 0x0c6833, metalness: 0.75, roughness: 0.35 });
  const cngTank = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.15, 16), cngTankMat);
  cngTank.rotation.z = Math.PI / 2;
  cngTank.position.set(0, 0.75, -1.05);
  // Yellow hazard valve cap
  const cngValve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 10), new THREE.MeshStandardMaterial({ color: 0xffcc00 }));
  cngValve.rotation.z = Math.PI / 2;
  cngValve.position.set(0.62, 0.75, -1.05);
  // Protective yellow tubular roll-cage around the CNG tank
  const cngCageMat = new THREE.MeshStandardMaterial({ color: 0xffb703, metalness: 0.5 });
  const cageBar1 = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.025, 0.025), cngCageMat);
  cageBar1.position.set(0, 0.9, -0.92);
  const cageBar2 = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.025, 0.025), cngCageMat);
  cageBar2.position.set(0, 0.6, -0.92);
  // Passenger side safety entry grab rails (Delhi regulation)
  const sideRailGeo = new THREE.BoxGeometry(0.025, 0.025, 0.85);
  const sideRailL = new THREE.Mesh(sideRailGeo, cngCageMat);
  sideRailL.position.set(-0.66, 0.88, -0.15);
  const sideRailR = new THREE.Mesh(sideRailGeo, cngCageMat);
  sideRailR.position.set(0.66, 0.88, -0.15);
  cngKitGroup.add(cngTank, cngValve, cageBar1, cageBar2, sideRailL, sideRailR);
  tiltGroup.add(cngKitGroup);

  // 3. MIDNIGHT NEON KIT (Street Hot-Rod / Racer)
  const neonKitGroup = new THREE.Group();
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
  const endPlateL = new THREE.Mesh(endPlateGeo, new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.6 }));
  endPlateL.position.set(-0.71, 1.96, -1.2);
  const endPlateR = new THREE.Mesh(endPlateGeo, new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.6 }));
  endPlateR.position.set(0.71, 1.96, -1.2);
  // Muscular flared wide rear wheel arches
  const flareGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 16, 1, false, 0, Math.PI);
  const flareL = new THREE.Mesh(flareGeo, darkMetalMat);
  flareL.rotation.z = Math.PI / 2;
  flareL.rotation.y = Math.PI;
  flareL.position.set(-0.74, 0.36, -0.65);
  const flareR = flareL.clone();
  flareR.position.set(0.74, 0.36, -0.65);
  neonKitGroup.add(sideExhaustL, sideExhaustR, spoilerWing, strutL, strutR, endPlateL, endPlateR, flareL, flareR);
  tiltGroup.add(neonKitGroup);

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
  vintageKitGroup.add(lanternL, lanternR, grilleGroup, retroFenderL, retroFenderR);
  tiltGroup.add(vintageKitGroup);

  // Default archetype visibility
  classicKitGroup.visible = true;
  cngKitGroup.visible = false;
  neonKitGroup.visible = false;
  vintageKitGroup.visible = false;

  // Return the complete assembled rickshaw plus handles for game loop animation
  const ARCHETYPES = {
    CLASSIC_MUMBAI: {
      body: 0xf5b000,
      trim: 0x1a1a1a,
      canopy: 0x1c1e21,
      slogan: 'HORN_OK',
    },
    GREEN_CNG: {
      body: 0x0c6833,
      trim: 0xffb703,
      canopy: 0x0e2417,
      slogan: 'MERA_BHARAT',
    },
    MIDNIGHT_NEON: {
      body: 0x121626,
      trim: 0x00f0ff,
      canopy: 0x080a10,
      slogan: 'DEKH_MAGAR',
    },
    ROYAL_VINTAGE: {
      body: 0x6a040f,
      trim: 0xfaedcd,
      canopy: 0x800f2f,
      slogan: 'BURI_NAZAR',
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
    const arch = ARCHETYPES[archetypeName] || ARCHETYPES.CLASSIC_MUMBAI;
    setColors({ body: arch.body, trim: arch.trim, canopy: arch.canopy });
    if (arch.slogan) setRearSlogan(arch.slogan);

    // Toggle distinctive physical body kit components
    classicKitGroup.visible = (archetypeName === 'CLASSIC_MUMBAI');
    cngKitGroup.visible = (archetypeName === 'GREEN_CNG');
    neonKitGroup.visible = (archetypeName === 'MIDNIGHT_NEON');
    vintageKitGroup.visible = (archetypeName === 'ROYAL_VINTAGE');

    // Sculpt canopy & roof silhouette based on archetype
    if (archetypeName === 'MIDNIGHT_NEON') {
      canopyMain.scale.set(1.04, 0.72, 1.0);
      canopyCrown.scale.set(0.14, 1.0, 0.98);
    } else if (archetypeName === 'ROYAL_VINTAGE') {
      canopyMain.scale.set(1.0, 1.25, 1.02);
      canopyCrown.scale.set(0.32, 1.0, 1.0);
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

