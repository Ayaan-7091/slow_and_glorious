import * as THREE from 'three';

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

  // Engine cooling louvers/slits texture effect on rear
  const louverGeo = new THREE.BoxGeometry(0.8, 0.04, 0.02);
  for (let i = 0; i < 4; i++) {
    const louver = new THREE.Mesh(louverGeo, darkMetalMat);
    louver.position.set(0, 0.52 + i * 0.08, -1.39);
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

  // Return the complete assembled rickshaw plus handles for game loop animation
  return {
    group: rickshawGroup,
    tiltGroup: tiltGroup,
    frontForkGroup: frontForkGroup,
    frontWheel: frontWheel,
    rearLeftWheel: rearLeftWheel,
    rearRightWheel: rearRightWheel,
    blobShadow: blobShadow,
    exhaustPipe: exhaustPipe,
  };
}

