
import * as THREE from 'three';
import { createRickshaw } from './createRickshaw.js';

/**
 * ============================================================================
 * 3D AUTHENTIC INDIAN AUTO-RICKSHAW WORKSHOP & CUSTOMIZATION (Sprint 10)
 * ============================================================================
 *
 * Features:
 *  1. Authentic Indian Mistri Garage Environment
 *  2. Improved concrete floor and brick wall textures
 *  3. Clean Raju Auto Garage signboard
 *  4. Custom showroom rickshaws and workshop props
 *  5. Plain grey industrial turntable
 *  6. Interactive 360° drag and zoom controls
 */

export const GARAGE_CENTER = new THREE.Vector3(500, 40, 500);

function createWorkshopFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#aeb4b5');
  grad.addColorStop(0.5, '#929a9d');
  grad.addColorStop(1, '#b7bcbd');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  for (let i = 0; i < 32000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const alpha = 0.018 + Math.random() * 0.035;
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(255,255,255,${alpha})`
      : `rgba(20,28,32,${alpha})`;
    const size = 0.5 + Math.random() * 1.8;
    ctx.fillRect(x, y, size, size);
  }

  ctx.strokeStyle = 'rgba(46,55,60,0.2)';
  ctx.lineWidth = 2;
  for (let n = 0; n <= 1024; n += 256) {
    ctx.beginPath();
    ctx.moveTo(n, 0);
    ctx.lineTo(n, 1024);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, n);
    ctx.lineTo(1024, n);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createWorkshopBrickWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#382e2a';
  ctx.fillRect(0, 0, 1024, 1024);

  const rowHeight = 38;
  const brickWidth = 92;
  for (let row = 0; row < Math.ceil(1024 / rowHeight); row++) {
    const y = row * rowHeight;
    const offset = row % 2 ? brickWidth / 2 : 0;

    for (let x = -brickWidth; x < 1024 + brickWidth; x += brickWidth) {
      const v = (Math.sin(row * 13.7 + x * 0.17) + 1) * 0.5;
      const red = Math.round(105 + v * 25);
      const green = Math.round(52 + v * 18);
      const blue = Math.round(42 + v * 13);

      ctx.fillStyle = `rgb(${red},${green},${blue})`;
      ctx.fillRect(x + 2 + offset, y + 2, brickWidth - 4, rowHeight - 4);
      ctx.fillStyle = 'rgba(255,210,170,0.08)';
      ctx.fillRect(x + 5 + offset, y + 4, brickWidth - 10, 3);
    }

    ctx.fillStyle = '#6b625c';
    ctx.fillRect(0, y + rowHeight - 3, 1024, 3);
  }

  const vignette = ctx.createLinearGradient(0, 0, 0, 1024);
  vignette.addColorStop(0, 'rgba(12,15,17,0.08)');
  vignette.addColorStop(0.62, 'rgba(12,15,17,0.02)');
  vignette.addColorStop(1, 'rgba(12,15,17,0.32)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1024, 1024);

  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    ctx.fillStyle = `rgba(20,16,14,${Math.random() * 0.09})`;
    ctx.fillRect(x, y, 2 + Math.random() * 5, 2 + Math.random() * 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 1.4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createDesiWorkshopBoardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 0, 256);
  bg.addColorStop(0, '#26323b');
  bg.addColorStop(1, '#141c23');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 256);

  ctx.fillStyle = '#d4a83c';
  ctx.fillRect(0, 0, 1024, 7);
  ctx.fillRect(0, 249, 1024, 7);
  ctx.strokeStyle = '#aab4bd';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 988, 220);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#f3c44e';
  ctx.font = '900 62px Arial';
  ctx.fillText('RAJU AUTO GARAGE', 512, 91);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f4f5f6';
  ctx.font = 'bold 27px Arial';
  ctx.fillText('REPAIR  •  RESTORATION  •  CUSTOM BUILDS', 512, 151);

  ctx.fillStyle = '#aeb9c3';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('MECHANICAL WORK  |  BODYWORK  |  ELECTRICAL', 512, 194);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createDiamondPlateTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#26282c';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#444850';
  ctx.strokeStyle = '#1a1b1e';
  ctx.lineWidth = 1;

  for (let y = 8; y < 256; y += 32) {
    for (let x = 8; x < 256; x += 32) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-6, -2, 12, 4);
      ctx.strokeRect(-6, -2, 12, 4);
      ctx.restore();

      ctx.save();
      ctx.translate(x + 16, y + 16);
      ctx.rotate(-Math.PI / 4);
      ctx.fillRect(-6, -2, 12, 4);
      ctx.strokeRect(-6, -2, 12, 4);
      ctx.restore();
    }
  }

  ctx.strokeStyle = 'rgba(15, 12, 10, 0.7)';
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(128, 128, 80, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function createTurntableHazardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = '#e6a100';

  const band = 32;
  for (let x = -64; x < 600; x += band * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + band, 0);
    ctx.lineTo(x + band + 26, 64);
    ctx.lineTo(x + 26, 64);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(30, 20, 10, 0.4)';
  ctx.fillRect(0, 52, 512, 12);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(8, 1);
  return tex;
}

export function createGarage(scene) {
  const garageGroup = new THREE.Group();
  garageGroup.name = 'Indian_Garage_Showroom_Root';
  garageGroup.position.copy(GARAGE_CENTER);

  // WORKSHOP FLOOR
  const floorGeo = new THREE.PlaneGeometry(28, 24);
  const floorTex = createWorkshopFloorTexture();
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.82,
    metalness: 0.12,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  garageGroup.add(floor);

  const brickTex = createWorkshopBrickWallTexture();
  const wallMat = new THREE.MeshStandardMaterial({
    map: brickTex,
    roughness: 0.9,
    metalness: 0.05,
  });

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 9), wallMat);
  backWall.position.set(0, 4.5, -12);
  backWall.receiveShadow = true;
  garageGroup.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 9), wallMat);
  leftWall.position.set(-14, 4.5, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  garageGroup.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 9), wallMat);
  rightWall.position.set(14, 4.5, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  garageGroup.add(rightWall);

  const roofGeo = new THREE.PlaneGeometry(28, 24);
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x24272c,
    roughness: 0.95,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.rotation.x = Math.PI / 2;
  roof.position.set(0, 8.8, 0);
  garageGroup.add(roof);

  const trussMat = new THREE.MeshStandardMaterial({
    color: 0x1b1e22,
    metalness: 0.8,
    roughness: 0.4
  });

  for (let tz of [-8, -2, 4]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(28, 0.25, 0.25), trussMat);
    beam.position.set(0, 8.2, tz);
    garageGroup.add(beam);

    for (let tx = -11; tx <= 11; tx += 4) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), trussMat);
      strut.position.set(tx, 8.5, tz);
      strut.rotation.z = 0.5;
      garageGroup.add(strut);
    }
  }

  const boardTex = createDesiWorkshopBoardTexture();
  const boardMat = new THREE.MeshBasicMaterial({ map: boardTex });
  const workshopBoard = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 2.65), boardMat);
  workshopBoard.position.set(0, 6.4, -11.9);
  garageGroup.add(workshopBoard);

  const shutterGeo = new THREE.PlaneGeometry(11, 4.6);
  const shutterMat = new THREE.MeshStandardMaterial({
    color: 0x484f56,
    roughness: 0.6,
    metalness: 0.7,
  });
  const shutter = new THREE.Mesh(shutterGeo, shutterMat);
  shutter.position.set(0, 2.3, -11.92);
  garageGroup.add(shutter);

  for (let sy = 0.3; sy < 4.5; sy += 0.28) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(11.1, 0.04, 0.03), trussMat);
    rib.position.set(0, sy, -11.89);
    garageGroup.add(rib);
  }

  // --------------------------------------------------------------------------
  // 3. DESI WORKSHOP CLUTTER: TIRES, OIL DRUMS, WORKBENCH & TOOLS
  // --------------------------------------------------------------------------
  const darkRubberMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.95 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x495057, metalness: 0.7, roughness: 0.4 });

  // Stack of 5 MRF Auto-Rickshaw Tires in the back-left corner
  function createTire() {
    const tire = new THREE.Group();
    const rubber = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.14, 12, 24), darkRubberMat);
    rubber.castShadow = true;
    const centerRim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.18, 16), rimMat);
    centerRim.rotation.x = Math.PI / 2;
    tire.add(rubber, centerRim);
    return tire;
  }

  const tireStack = new THREE.Group();
  tireStack.position.set(-10.5, 0, -9.5);
  for (let ti = 0; ti < 5; ti++) {
    const t = createTire();
    t.rotation.x = Math.PI / 2;
    t.position.set((ti % 2 === 0 ? 0.04 : -0.04), 0.14 + ti * 0.24, 0);
    tireStack.add(t);
  }

  // 2 Tires leaning against the stack
  const leanTire1 = createTire();
  leanTire1.position.set(0.65, 0.38, 0.3);
  leanTire1.rotation.y = 0.4;
  leanTire1.rotation.z = -0.3;
  tireStack.add(leanTire1);

  const leanTire2 = createTire();
  leanTire2.position.set(-0.6, 0.38, 0.35);
  leanTire2.rotation.y = -0.35;
  leanTire2.rotation.z = 0.28;
  tireStack.add(leanTire2);

  garageGroup.add(tireStack);

  // 55-Gallon Lubricant Grease Drums (Yellow Servo + Red/White Castrol + Blue Oil)
  function createDrum(color, stencilText = '') {
    const drum = new THREE.Group();
    const drumGeo = new THREE.CylinderGeometry(0.44, 0.44, 1.25, 20);
    const drumMat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.65 });
    const barrel = new THREE.Mesh(drumGeo, drumMat);
    barrel.position.y = 0.625;
    barrel.castShadow = true;
    drum.add(barrel);

    // Reinforcing chimes/ribs
    for (let ry of [0.35, 0.62, 0.9]) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(0.445, 0.02, 8, 24), drumMat);
      rib.rotation.x = Math.PI / 2;
      rib.position.y = ry;
      drum.add(rib);
    }
    return drum;
  }

  const drumYellowServo = createDrum(0xf7b731, 'SERVO');
  drumYellowServo.position.set(9.8, 0, -10.2);
  const drumRedCastrol = createDrum(0xd90429, 'CASTROL');
  drumRedCastrol.position.set(8.7, 0, -9.6);
  const drumBlue = createDrum(0x0077b6);
  drumBlue.position.set(9.9, 0, -8.9);

  garageGroup.add(drumYellowServo, drumRedCastrol, drumBlue);

  // Mechanic's Sturdy Wooden Workbench with Vice & Tools (Left Wall)
  const workbenchGroup = new THREE.Group();
  workbenchGroup.position.set(-12.8, 0, 0);

  const benchWoodMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.85 });

  // Heavy wooden tabletop
  const benchTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 4.2), benchWoodMat);
  benchTop.position.set(0.8, 1.05, 0);
  benchTop.castShadow = true;
  workbenchGroup.add(benchTop);

  // 4 Thick wooden legs
  for (let lx of [0.2, 1.4]) {
    for (let lz of [-1.8, 1.8]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.05, 0.12), benchWoodMat);
      leg.position.set(lx, 0.525, lz);
      workbenchGroup.add(leg);
    }
  }

  // Steel Bench Vice clamped on front edge
  const viceMat = new THREE.MeshStandardMaterial({ color: 0x2b303a, metalness: 0.85, roughness: 0.3 });
  const viceBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.3), viceMat);
  viceBase.position.set(1.4, 1.22, 1.2);
  const viceJaw = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.16, 0.38), viceMat);
  viceJaw.position.set(1.5, 1.35, 1.2);
  const viceHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), rimMat);
  viceHandle.position.set(1.6, 1.35, 1.2);
  workbenchGroup.add(viceBase, viceJaw, viceHandle);

  // Metal Toolbox with open lid
  const toolboxMat = new THREE.MeshStandardMaterial({ color: 0xd90429, metalness: 0.7, roughness: 0.4 });
  const toolbox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.22, 0.65), toolboxMat);
  toolbox.position.set(0.7, 1.22, -0.4);
  workbenchGroup.add(toolbox);

  // Vintage Brass Oil Can with long curved spout
  const oilCanMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
  const oilCanBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.24, 12), oilCanMat);
  oilCanBody.position.set(0.8, 1.24, 0.35);
  const oilCanSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 8), oilCanMat);
  oilCanSpout.rotation.z = -0.55;
  oilCanSpout.position.set(0.9, 1.44, 0.35);
  workbenchGroup.add(oilCanBody, oilCanSpout);

  garageGroup.add(workbenchGroup);

  // Oxy-Acetylene Gas Welding Cylinder Cart (Right Wall)
  const welderGroup = new THREE.Group();
  welderGroup.position.set(12.5, 0, 1.5);

  const cartFrameMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
  const greenOxygenMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.5, metalness: 0.6 });
  const maroonAcetyleneMat = new THREE.MeshStandardMaterial({ color: 0x6a040f, roughness: 0.5, metalness: 0.6 });

  // Tall Green Oxygen Tank
  const oxyTank = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 16), greenOxygenMat);
  oxyTank.position.set(-0.25, 0.85, 0);

  // Medium Maroon Acetylene Tank
  const acetTank = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.25, 16), maroonAcetyleneMat);
  acetTank.position.set(0.25, 0.68, 0);

  // Pressure gauges on tank regulators
  const gaugeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10);
  const gauge1 = new THREE.Mesh(gaugeGeo, oilCanMat);
  gauge1.rotation.x = Math.PI / 2;
  gauge1.position.set(-0.25, 1.72, 0.1);
  const gauge2 = new THREE.Mesh(gaugeGeo, oilCanMat);
  gauge2.rotation.x = Math.PI / 2;
  gauge2.position.set(0.25, 1.38, 0.1);

  // 2 Rubber cart wheels
  for (let wx of [-0.45, 0.45]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 14), darkRubberMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, 0.2, 0);
    welderGroup.add(w);
  }

  welderGroup.add(oxyTank, acetTank, gauge1, gauge2);
  garageGroup.add(welderGroup);

  // Spare Rickshaw Leaf Springs (Kamani) & Green CNG Tank on a wooden pallet
  const sparePartsGroup = new THREE.Group();
  sparePartsGroup.position.set(11.2, 0, -4.5);

  // Wooden Pallet
  const palletMat = new THREE.MeshStandardMaterial({ color: 0x8a6240, roughness: 0.9 });
  const palletTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.4), palletMat);
  palletTop.position.y = 0.12;
  sparePartsGroup.add(palletTop);

  // Spare Green CNG Cylinder with yellow hazard band
  const cngCylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 1.3, 16),
    new THREE.MeshStandardMaterial({ color: 0x0c6833, roughness: 0.4, metalness: 0.7 })
  );
  cngCylinder.rotation.z = Math.PI / 2;
  cngCylinder.position.set(0, 0.35, 0.2);
  sparePartsGroup.add(cngCylinder);

  // Bundle of curved steel leaf-springs (Kamani)
  const kamaniMat = new THREE.MeshStandardMaterial({ color: 0x1f2226, roughness: 0.5, metalness: 0.85 });
  for (let ki = 0; ki < 4; ki++) {
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.2 - ki * 0.15, 0.04, 0.12), kamaniMat);
    leaf.position.set(0, 0.22 + ki * 0.045, -0.3);
    sparePartsGroup.add(leaf);
  }

  garageGroup.add(sparePartsGroup);

  // --------------------------------------------------------------------------
  // 3B. CUSTOM SHOWROOM BUILDS, REPAIR WRECKS & MECHANIC DISPLAY SIGN
  // --------------------------------------------------------------------------

  // Compact wall tool board and hand tools.
  const toolBoard = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 1.65, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x202a33, roughness: 0.82 })
  );
  toolBoard.position.set(-7.6, 3.0, -11.78);
  garageGroup.add(toolBoard);

  const toolMetalMat = new THREE.MeshStandardMaterial({
    color: 0xb4bdc3, metalness: 0.72, roughness: 0.34
  });
  const toolHandleMats = [
    new THREE.MeshStandardMaterial({ color: 0xd08a31, roughness: 0.55 }),
    new THREE.MeshStandardMaterial({ color: 0x596b7a, roughness: 0.55 })
  ];

  for (let i = 0; i < 12; i++) {
    const tool = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.58 + (i % 3) * 0.12, 0.07),
      toolMetalMat
    );
    tool.position.set(-10.0 + (i % 6) * 0.96, 2.55 + Math.floor(i / 6) * 0.75, -11.66);
    tool.rotation.z = i % 2 ? -0.16 : 0.16;
    garageGroup.add(tool);

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.06, 0.08),
      toolHandleMats[i % 2]
    );
    handle.position.set(tool.position.x, tool.position.y - 0.25, -11.62);
    garageGroup.add(handle);
  }

  // Ground-mounted Raju Mechanics plaque beside its silver-blue display rickshaw.
  const mechanicsSignCanvas = document.createElement('canvas');
  mechanicsSignCanvas.width = 640;
  mechanicsSignCanvas.height = 150;
  const mechanicsSignCtx = mechanicsSignCanvas.getContext('2d');
  const mechanicsSignGradient = mechanicsSignCtx.createLinearGradient(0, 0, 640, 150);
  mechanicsSignGradient.addColorStop(0, '#152638');
  mechanicsSignGradient.addColorStop(1, '#244e70');
  mechanicsSignCtx.fillStyle = mechanicsSignGradient;
  mechanicsSignCtx.fillRect(0, 0, 640, 150);
  mechanicsSignCtx.strokeStyle = '#9fc8e5';
  mechanicsSignCtx.lineWidth = 5;
  mechanicsSignCtx.strokeRect(7, 7, 626, 136);
  mechanicsSignCtx.textAlign = 'center';
  mechanicsSignCtx.textBaseline = 'middle';
  mechanicsSignCtx.fillStyle = '#f4f7fa';
  mechanicsSignCtx.font = '900 36px Arial';
  mechanicsSignCtx.fillText('RAJU MECHANICS', 320, 58);
  mechanicsSignCtx.fillStyle = '#9fc8e5';
  mechanicsSignCtx.font = 'bold 21px Arial';
  mechanicsSignCtx.fillText('CUSTOM BUILD', 320, 101);

  const mechanicsSignTexture = new THREE.CanvasTexture(mechanicsSignCanvas);
  mechanicsSignTexture.colorSpace = THREE.SRGBColorSpace;
  const mechanicsSignFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.92, 0.54, 0.075),
    new THREE.MeshStandardMaterial({ color: 0x273b4d, metalness: 0.55, roughness: 0.42 })
  );
  mechanicsSignFrame.position.set(-9.35, 0.52, -1.15);
  mechanicsSignFrame.rotation.y = 0.18;
  garageGroup.add(mechanicsSignFrame);

  const mechanicsSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.82, 0.44),
    new THREE.MeshBasicMaterial({ map: mechanicsSignTexture })
  );
  mechanicsSign.position.set(-9.35, 0.52, -1.105);
  mechanicsSign.rotation.y = 0.18;
  garageGroup.add(mechanicsSign);

  // Display rickshaw props use the project's real createRickshaw module and its
  // existing archetype/color API. They are scenery only, not selectable player builds.
  function addDisplayRickshaw({ name, archetype, colors, position, rotation, scale = 0.82 }) {
    const display = createRickshaw({ name });
    display.setArchetype(archetype);
    if (display.setColors) display.setColors(colors);
    display.group.scale.setScalar(scale);
    display.group.position.set(position[0], position[1], position[2]);
    display.group.rotation.y = rotation;
    garageGroup.add(display.group);
    return display;
  }

  // Silver and blue Raju Mechanics custom build.
  const mechanicsRickshaw = addDisplayRickshaw({
    name: 'Raju_Mechanics_Display',
    archetype: 'SPORT',
    colors: { body: 0xb9c3cc, trim: 0x075da8, canopy: 0x142b43 },
    position: [-6.55, 0, -1.55],
    rotation: -0.34,
    scale: 0.88
  });

  // Deep racing red custom build with twin round auxiliary lamps.
  const crimsonDisplay = addDisplayRickshaw({
    name: 'Raju_Garage_Crimson_Twin',
    archetype: 'SPORT',
    colors: { body: 0x9e2631, trim: 0xd4d7dc, canopy: 0x262b31 },
    position: [-3.9, 0, -5.0],
    rotation: -0.18,
    scale: 0.76
  });

  // Rich teal utility custom build.
  const tealDisplay = addDisplayRickshaw({
    name: 'Raju_Garage_Teal_Utility',
    archetype: 'EXPLORER',
    colors: { body: 0x167b78, trim: 0x252d35, canopy: 0x172b32 },
    position: [-9.0, 0, 2.4],
    rotation: 0.38,
    scale: 0.74
  });

  // Extra front lamp accents distinguish the two custom display builds.
  const crimsonLampMat = new THREE.MeshStandardMaterial({
    color: 0xffc46b, emissive: 0xff9b35, emissiveIntensity: 0.45, roughness: 0.25
  });
  for (const x of [-0.27, 0.27]) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), crimsonLampMat);
    lamp.position.set(x, 0.77, 0.98);
    crimsonDisplay.group.add(lamp);
  }

  const tealLampMat = new THREE.MeshStandardMaterial({
    color: 0xbfe9ff, emissive: 0x70cfff, emissiveIntensity: 0.35, roughness: 0.25
  });
  const tealLamp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.10, 0.06), tealLampMat);
  tealLamp.position.set(0, 0.78, 0.98);
  tealDisplay.group.add(tealLamp);

  // Two worn repair-bay rickshaw shells, with missing panels and exposed frames.
  function addWreckedRickshaw(x, z, rotation, paint) {
    const wreck = new THREE.Group();
    wreck.position.set(x, 0, z);
    wreck.rotation.y = rotation;
    wreck.scale.setScalar(0.78);

    const bodyMat = new THREE.MeshStandardMaterial({ color: paint, roughness: 0.82, metalness: 0.12 });
    const rustMat = new THREE.MeshStandardMaterial({ color: 0x68422f, roughness: 0.94 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x171a1c, roughness: 0.92 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x6f8990, transparent: true, opacity: 0.25, roughness: 0.2
    });

    function part(geometry, material, px, py, pz, rx = 0, ry = 0, rz = 0) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(px, py, pz);
      mesh.rotation.set(rx, ry, rz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      wreck.add(mesh);
      return mesh;
    }

    part(new THREE.BoxGeometry(1.35, 0.48, 1.55), bodyMat, 0, 0.72, 0);
    part(new THREE.BoxGeometry(1.22, 0.08, 1.5), rustMat, 0, 1.03, -0.02);

    for (const side of [-0.58, 0.58]) {
      part(new THREE.CylinderGeometry(0.025, 0.035, 0.95, 8), rustMat, side, 1.55, -0.48, 0.12, 0, side * 0.16);
      part(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8), rustMat, side, 1.52, 0.45, -0.08, 0, side * 0.12);
    }

    part(new THREE.BoxGeometry(1.18, 0.10, 0.72), blackMat, 0, 2.02, -0.42, 0.05, 0, 0.08);
    part(new THREE.PlaneGeometry(1.0, 0.56), glassMat, 0, 1.47, 0.73, -0.12);
    part(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 6), rustMat, -0.42, 1.5, 0.75, 0, 0, 0.22);

    for (const [wx, wz] of [[-0.72, -0.42], [0.72, -0.42], [0, 0.88]]) {
      part(new THREE.TorusGeometry(0.27, 0.105, 8, 20), blackMat, wx, 0.32, wz, Math.PI / 2);
      part(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 12), toolMetalMat, wx, 0.32, wz, Math.PI / 2);
    }

    part(new THREE.BoxGeometry(0.58, 0.32, 0.055), bodyMat, 0.72, 0.58, 0.05, 0, 0, -0.18);
    part(new THREE.BoxGeometry(0.5, 0.06, 0.42), rustMat, -0.95, 0.12, 0.4, 0.1, 0.25, 0.18);

    garageGroup.add(wreck);
    return wreck;
  }

  addWreckedRickshaw(-5.6, -8.3, 0.22, 0x315e53);
  addWreckedRickshaw(7.2, -8.1, -0.28, 0x7a3028);

  // --------------------------------------------------------------------------
  // 4. WARM TUNGSTEN WORKSHOP LIGHTING (No Cold Neon!)
  // --------------------------------------------------------------------------
  // Warm ambient fill reflecting off brick & concrete
  const ambientGarage = new THREE.AmbientLight(0xffffff, 1.35);
  garageGroup.add(ambientGarage);

  // Main Overhead Spotlight
  const keySpot = new THREE.SpotLight(0xffffff, 7.0, 32, Math.PI / 3.4, 0.32, 1.0);
  keySpot.position.set(0, 8.4, 1.5);
  keySpot.target.position.set(0, 0.8, 0);
  keySpot.castShadow = true;
  keySpot.shadow.mapSize.width = 1024;
  keySpot.shadow.mapSize.height = 1024;
  keySpot.shadow.bias = -0.0008;
  garageGroup.add(keySpot);
  garageGroup.add(keySpot.target);

  // Warm Golden Workbench Task Light (Left)
  const leftTaskLight = new THREE.PointLight(0xfff0d6, 3.0, 17, 1.25);
  leftTaskLight.position.set(-10.5, 5.2, 0);
  garageGroup.add(leftTaskLight);

  // Workshop Area Light (Right)
  const rightTaskLight = new THREE.PointLight(0xe6f0ff, 2.8, 17, 1.25);
  rightTaskLight.position.set(10.5, 5.2, 0);
  garageGroup.add(rightTaskLight);

  // Overhead Vintage Tin-Shade Pendant Lamps suspended from ceiling
  const lampDomeGeo = new THREE.CylinderGeometry(0.48, 0.68, 0.38, 16);
  const lampDomeMat = new THREE.MeshStandardMaterial({
    color: 0x16191d,
    metalness: 0.85,
    roughness: 0.3
  });
  const twistedCordMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

  for (let lx of [-4.2, 0, 4.2]) {
    // Cord hanging from ceiling
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 1.4, 6),
      twistedCordMat
    );
    cord.position.set(lx, 7.8, 0);
    garageGroup.add(cord);

    // Dark green/black tin shade
    const shade = new THREE.Mesh(lampDomeGeo, lampDomeMat);
    shade.position.set(lx, 7.0, 0);
    garageGroup.add(shade);

    // Glowing warm bulb inside
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffea88 })
    );
    bulb.position.set(lx, 6.85, 0);
    garageGroup.add(bulb);
  }

  // --------------------------------------------------------------------------
  // 5. INDUSTRIAL STEEL DIAMOND-PLATE TURNTABLE
  // --------------------------------------------------------------------------
  const turntableGroup = new THREE.Group();
  turntableGroup.position.set(0, 0.06, 0);

  // Turntable Cylinder
  const turntableGeo = new THREE.CylinderGeometry(2.55, 2.6, 0.14, 40);

  // Plain neutral grey finish
  const turntableMat = [
    new THREE.MeshStandardMaterial({
      color: 0x777f84,
      roughness: 0.58,
      metalness: 0.42
    }),
    new THREE.MeshStandardMaterial({
      color: 0x9ba2a6,
      roughness: 0.52,
      metalness: 0.38
    }),
    new THREE.MeshStandardMaterial({
      color: 0x555d62,
      roughness: 0.62,
      metalness: 0.35
    }),
  ];

  const turntableMesh = new THREE.Mesh(turntableGeo, turntableMat);
  turntableMesh.receiveShadow = true;
  turntableGroup.add(turntableMesh);

  // Heavy steel riveted perimeter ring
  const rimBoltsGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8);
  const boltMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.9,
    roughness: 0.2
  });

  for (let bi = 0; bi < 24; bi++) {
    const bAngle = (bi / 24) * Math.PI * 2;
    const bx = Math.cos(bAngle) * 2.45;
    const bz = Math.sin(bAngle) * 2.45;

    const bolt = new THREE.Mesh(rimBoltsGeo, boltMat);
    bolt.position.set(bx, 0.075, bz);
    turntableGroup.add(bolt);
  }

  // --------------------------------------------------------------------------
  // 6. PREVIEW AUTO-RICKSHAW ON TURNTABLE
  // --------------------------------------------------------------------------
  const previewRickshaw = createRickshaw({
    name: 'Garage_Preview',
    bodyColor: 0xf5b000,
    trimColor: 0x1a1a1a,
    canopyColor: 0x1c1e21,
  });

  previewRickshaw.group.position.set(0, 0.07, 0);
  turntableGroup.add(previewRickshaw.group);

  garageGroup.add(turntableGroup);
  scene.add(garageGroup);

  // Garage is hidden initially until player clicks "ENTER GARAGE"
  garageGroup.visible = false;

  // --------------------------------------------------------------------------
  // 7. CONFIGURATION & STATE
  // --------------------------------------------------------------------------
  const savedConfig = JSON.parse(
    localStorage.getItem('tuktuk_garage_config') || '{}'
  );

  const activeConfig = {
    archetype: savedConfig.archetype || 'CLASSIC_MUMBAI',
    paintColor: savedConfig.paintColor || '#f5b000',
    slogan: savedConfig.slogan || 'HORN_OK',
    garland: savedConfig.garland !== undefined ? savedConfig.garland : true,
    bobblehead: false,
    roofRack: savedConfig.roofRack !== undefined ? savedConfig.roofRack : false,
  };

  function applyConfigToRickshaw(target, config) {
    if (!target) return;

    if (target.setArchetype) {
      target.setArchetype(config.archetype);
    }

    // Preset archetype owns its factory paint.
    // Saved custom paint is intentionally not applied.
    if (target.setRearSlogan) {
      target.setRearSlogan(config.slogan);
    }

    if (target.setGarlandVisible) {
      target.setGarlandVisible(config.garland);
    }

    if (target.setBobbleheadVisible) {
      target.setBobbleheadVisible(false);
    }

    if (target.setRoofRackVisible) {
      target.setRoofRackVisible(config.roofRack);
    }
  }

  // Apply initially to preview rickshaw
  applyConfigToRickshaw(previewRickshaw, activeConfig);

  // --------------------------------------------------------------------------
  // 8. INTERACTIVE 360° DRAG & ZOOM CONTROLS
  // --------------------------------------------------------------------------
  let isDragging = false;
  let prevPointerX = 0;
  let prevPointerY = 0;
  let turntableYaw = 0;
  let cameraPitch = 0.22;
  let cameraDistance = 5.6;

  function onPointerDown(e) {
    if (!garageGroup.visible) return;

    // Don't intercept if clicking on the UI sidebar
    if (
      e.target &&
      (e.target.closest('.garage-sidebar') || e.target.closest('button'))
    ) {
      return;
    }

    isDragging = true;
    prevPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    prevPointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
  }

  function onPointerMove(e) {
    if (!isDragging || !garageGroup.visible) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const deltaX = clientX - prevPointerX;
    const deltaY = clientY - prevPointerY;

    prevPointerX = clientX;
    prevPointerY = clientY;

    turntableYaw += deltaX * 0.009;
    cameraPitch = Math.max(
      0.04,
      Math.min(0.65, cameraPitch - deltaY * 0.005)
    );
  }

  function onPointerUp() {
    isDragging = false;
  }

  function onWheel(e) {
    if (!garageGroup.visible) return;
    if (e.target && e.target.closest('.garage-sidebar')) return;

    cameraDistance = Math.max(
      3.8,
      Math.min(8.0, cameraDistance + e.deltaY * 0.004)
    );
  }

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('wheel', onWheel, { passive: true });

  /**
   * Updates garage turntable rotation, camera position, and interior bling
   */
  function update(dt, camera) {
    if (!garageGroup.visible) return;

    // Idle turntable spin when not dragging
    if (!isDragging) {
      turntableYaw += dt * 0.35;
    }

    turntableGroup.rotation.y = turntableYaw;

    // Orbit camera around garage turntable center
    if (camera) {
      const camY =
        GARAGE_CENTER.y + Math.sin(cameraPitch) * cameraDistance + 1.1;

      const horizDist = Math.cos(cameraPitch) * cameraDistance;
      const camX = GARAGE_CENTER.x + Math.sin(0) * horizDist;
      const camZ = GARAGE_CENTER.z + Math.cos(0) * horizDist + 0.4;

      camera.position.set(camX, camY, camZ);
      camera.lookAt(
        GARAGE_CENTER.x,
        GARAGE_CENTER.y + 1.15,
        GARAGE_CENTER.z
      );
    }

    if (previewRickshaw.updateInteriorBling) {
      previewRickshaw.updateInteriorBling(dt, {
        steerAngle: Math.sin(turntableYaw * 2) * 0.15,
        speed: 8
      });
    }
  }

  function setVisible(visible) {
    garageGroup.visible = visible;
  }

  return {
    garageGroup,
    previewRickshaw,
    activeConfig,
    applyConfigToRickshaw,
    setVisible,
    update,
  };
}
