import * as THREE from 'three';
import { createRickshaw } from './createRickshaw.js';

/**
 * ============================================================================
 * 3D AUTHENTIC INDIAN AUTO-RICKSHAW WORKSHOP & CUSTOMIZATION (Sprint 10)
 * ============================================================================
 * 
 * Features:
 *  1. Authentic Indian Mistri Garage Environment:
 *     - Stained weathered workshop concrete floor with oil slicks, tool scratches & drains
 *     - Distressed Indian red brick walls with peeling lime wash, grease smudges & Hindi signboards
 *     - Hand-painted Hindi signboard: "॥ श्री गणेशाय नमः ॥ राजू ऑटो रिपेयर & वेल्डिंग वर्क्स"
 *     - Wall-mounted Lord Ganesha Pooja Mandir with warm glowing diya
 *     - Indian mechanic clutter: Stacked MRF auto tires, Servo & Castrol 55-gallon oil drums,
 *       wooden mechanic workbench with heavy steel vice, tools, oxy-acetylene welding rig,
 *       spare rickshaw leaf springs (kamani), spare wheels & green CNG cylinder
 *     - Industrial steel trusses & hanging vintage tin-shade pendant lamps with warm tungsten light
 *  2. Heavy-Duty Industrial Diamond-Plate Turntable:
 *     - Steel diamond-plate platform with weathered bolted rim and grease rings
 *     - Smooth 360° mouse & touch drag rotation with pitch clamping
 *     - Mouse wheel / touch pinch zoom (3.8m to 8.0m)
 *     - Gentle idle spin when not actively dragging
 *  3. Distinctive Body Type Models:
 *     - Classic Mumbai, Delhi Green CNG, Midnight Neon Street Racer, Royal Vintage
 */

export const GARAGE_CENTER = new THREE.Vector3(500, 40, 500);

/**
 * Stained Greasy Indian Workshop Concrete Floor Texture
 */
function createWorkshopFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Weathered gray concrete base
  ctx.fillStyle = '#3a3733';
  ctx.fillRect(0, 0, 512, 512);

  // Concrete speckling noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 28;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);

  // Concrete expansion joint lines
  ctx.strokeStyle = '#23201d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 256);
  ctx.lineTo(512, 256);
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.stroke();

  // Spilled black engine oil pools and grease stains
  function drawOilSpill(x, y, r1, r2, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.25) {
      const r = r1 + Math.sin(a * 4 + x) * (r2 - r1) * 0.45;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  drawOilSpill(180, 190, 50, 75, 'rgba(16, 14, 12, 0.75)');
  drawOilSpill(340, 310, 40, 60, 'rgba(18, 15, 12, 0.7)');
  drawOilSpill(130, 360, 25, 42, 'rgba(22, 18, 14, 0.6)');
  drawOilSpill(380, 140, 30, 48, 'rgba(14, 12, 10, 0.65)');

  // Black tire drag skid tracks
  ctx.strokeStyle = 'rgba(20, 18, 16, 0.45)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(40, 100);
  ctx.quadraticCurveTo(240, 180, 480, 220);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(60, 380);
  ctx.quadraticCurveTo(280, 330, 490, 420);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

/**
 * Distressed Indian Brick Wall Texture with Peeling Whitewash & Grease
 */
function createWorkshopBrickWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Red clay Indian brick base
  ctx.fillStyle = '#6e2f26';
  ctx.fillRect(0, 0, 512, 512);

  const rowHeight = 24;
  const brickWidth = 56;
  const numRows = Math.ceil(512 / rowHeight);

  // Draw brick course
  for (let r = 0; r < numRows; r++) {
    const y = r * rowHeight;
    const isShifted = r % 2 === 1;
    const xOffset = isShifted ? -brickWidth / 2 : 0;

    for (let x = xOffset; x < 512 + brickWidth; x += brickWidth) {
      const shadeNoise = (Math.sin(r * 11 + x * 7) + 1) * 0.5;
      const rVal = Math.floor(100 + shadeNoise * 40);
      const gVal = Math.floor(40 + shadeNoise * 20);
      const bVal = Math.floor(32 + shadeNoise * 16);
      ctx.fillStyle = `rgb(${rVal},${gVal},${bVal})`;
      ctx.fillRect(x + 2, y + 2, brickWidth - 4, rowHeight - 4);
    }

    // Mortar horizontal lines
    ctx.fillStyle = '#48403b';
    ctx.fillRect(0, y + rowHeight - 2, 512, 2);
  }

  // Peeling white/cream distemper lime wash patches
  ctx.fillStyle = 'rgba(224, 216, 202, 0.75)';
  ctx.beginPath();
  ctx.moveTo(40, 20);
  ctx.bezierCurveTo(180, 40, 220, 220, 110, 260);
  ctx.bezierCurveTo(40, 280, 20, 140, 40, 20);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(340, 100);
  ctx.bezierCurveTo(460, 80, 490, 320, 390, 380);
  ctx.bezierCurveTo(310, 400, 290, 200, 340, 100);
  ctx.fill();

  // Dark greasy handprints & grease splatters near bottom
  ctx.fillStyle = 'rgba(25, 20, 16, 0.55)';
  for (let g = 0; g < 18; g++) {
    const gx = 60 + (g * 24);
    const gy = 380 + (Math.sin(g * 3) * 40);
    ctx.fillRect(gx, gy, 18, 14);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

/**
 * Authentic Hand-Painted Hindi Workshop Signboard
 */
function createDesiWorkshopBoardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Weathered wooden background with golden border
  ctx.fillStyle = '#1e1410';
  ctx.fillRect(0, 0, 1024, 256);

  // Ornate double border
  ctx.strokeStyle = '#d4af37'; // Antique Gold
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 1004, 236);

  ctx.strokeStyle = '#ff9900'; // Saffron
  ctx.lineWidth = 4;
  ctx.strokeRect(22, 22, 980, 212);

  // Sacred Hindu Header
  ctx.fillStyle = '#ff3300';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('॥ श्री गणेशाय नमः ॥        ॐ        ॥ जय बजरंग बली ॥', 512, 48);

  // Main Workshop Name in Bold 3D Devanagari Lettering
  // 3D Shadow
  ctx.fillStyle = '#000000';
  ctx.font = '900 60px sans-serif';
  ctx.fillText('राजू ऑटो रिपेयर & वेल्डिंग वर्क्स', 516, 120);

  // Yellow Face with Red Outline
  ctx.fillStyle = '#ffd000';
  ctx.fillText('राजू ऑटो रिपेयर & वेल्डिंग वर्क्स', 512, 116);
  ctx.strokeStyle = '#d00000';
  ctx.lineWidth = 2;
  ctx.strokeText('राजू ऑटो रिपेयर & वेल्डिंग वर्क्स', 512, 116);

  // Bilingual Subtext & Slogan
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('RAJU AUTO GARAGE • 3D SPEED SHOP & CNG TUNING', 512, 162);

  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('बजाज, टीवीएस & पियाजियो स्पेशलिस्ट • डेंटिंग-पेंटिंग • 24x7 सर्विस', 512, 198);

  ctx.fillStyle = '#ffaa00';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('👹 बुरी नज़र वाले तेरा मुँह काला • HORN OK PLEASE 🌶️', 512, 230);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Diamond Plate Steel Turntable Texture
 */
function createDiamondPlateTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Dark oily steel plate base
  ctx.fillStyle = '#26282c';
  ctx.fillRect(0, 0, 256, 256);

  // Industrial diamond tread nubs
  ctx.fillStyle = '#444850';
  ctx.strokeStyle = '#1a1b1e';
  ctx.lineWidth = 1;

  for (let y = 8; y < 256; y += 32) {
    for (let x = 8; x < 256; x += 32) {
      // First diamond
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-6, -2, 12, 4);
      ctx.strokeRect(-6, -2, 12, 4);
      ctx.restore();

      // Second diamond
      ctx.save();
      ctx.translate(x + 16, y + 16);
      ctx.rotate(-Math.PI / 4);
      ctx.fillRect(-6, -2, 12, 4);
      ctx.strokeRect(-6, -2, 12, 4);
      ctx.restore();
    }
  }

  // Circular grease ring around center pivot
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

/**
 * Weathered Industrial Hazard Turntable Rim
 */
function createTurntableHazardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(0, 0, 512, 64);

  // Weathered ochre/yellow hazard diagonal stripes
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

  // Industrial rust & grime overlay
  ctx.fillStyle = 'rgba(30, 20, 10, 0.4)';
  ctx.fillRect(0, 52, 512, 12);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(8, 1);
  return tex;
}

/**
 * Lord Ganesha Pooja Shrine Frame Texture
 */
function createGaneshaPoojaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // Red vermilion background
  ctx.fillStyle = '#b7094c';
  ctx.fillRect(0, 0, 256, 320);

  // Ornate gold frame
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 242, 306);

  // Golden arch
  ctx.strokeStyle = '#ffb703';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 120, 80, Math.PI, 0);
  ctx.stroke();

  // Sacred Om & Swastika
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ॐ', 128, 130);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('॥ शुभ लाभ ॥', 128, 200);

  ctx.fillStyle = '#ffdd55';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('श्री गणेशाय नमः', 128, 235);

  // Diya oil lamp drawing at the bottom
  ctx.fillStyle = '#e76f51';
  ctx.beginPath();
  ctx.ellipse(128, 275, 26, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffea00';
  ctx.beginPath();
  ctx.arc(128, 265, 8, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function createGarage(scene) {
  const garageGroup = new THREE.Group();
  garageGroup.name = 'Indian_Garage_Showroom_Root';
  garageGroup.position.copy(GARAGE_CENTER);

  // --------------------------------------------------------------------------
  // 1. WORKSHOP ARCHITECTURE & GREASY FLOOR
  // --------------------------------------------------------------------------
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

  // Distressed Brick Walls (Back, Left, Right)
  const brickTex = createWorkshopBrickWallTexture();
  const wallMat = new THREE.MeshStandardMaterial({
    map: brickTex,
    roughness: 0.9,
    metalness: 0.05,
  });

  // Back Wall (28m wide x 9m tall)
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 9), wallMat);
  backWall.position.set(0, 4.5, -12);
  backWall.receiveShadow = true;
  garageGroup.add(backWall);

  // Left Wall
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 9), wallMat);
  leftWall.position.set(-14, 4.5, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  garageGroup.add(leftWall);

  // Right Wall
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 9), wallMat);
  rightWall.position.set(14, 4.5, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  garageGroup.add(rightWall);

  // Ceiling Corrugated Tin Roof with Steel Trusses
  const roofGeo = new THREE.PlaneGeometry(28, 24);
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x24272c,
    roughness: 0.95,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.rotation.x = Math.PI / 2;
  roof.position.set(0, 8.8, 0);
  garageGroup.add(roof);

  // Steel Roof Trusses across the bay
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x1b1e22, metalness: 0.8, roughness: 0.4 });
  for (let tz of [-8, -2, 4]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(28, 0.25, 0.25), trussMat);
    beam.position.set(0, 8.2, tz);
    garageGroup.add(beam);

    // Diagonal truss struts
    for (let tx = -11; tx <= 11; tx += 4) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), trussMat);
      strut.position.set(tx, 8.5, tz);
      strut.rotation.z = 0.5;
      garageGroup.add(strut);
    }
  }

  // Large Hand-Painted Workshop Board on Back Wall
  const boardTex = createDesiWorkshopBoardTexture();
  const boardMat = new THREE.MeshBasicMaterial({ map: boardTex });
  const workshopBoard = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 3.1), boardMat);
  workshopBoard.position.set(0, 6.4, -11.9);
  garageGroup.add(workshopBoard);

  // Corrugated Weathered Steel Roller Shutter on Back Wall (under signboard)
  const shutterGeo = new THREE.PlaneGeometry(11, 4.6);
  const shutterMat = new THREE.MeshStandardMaterial({
    color: 0x484f56,
    roughness: 0.6,
    metalness: 0.7,
  });
  const shutter = new THREE.Mesh(shutterGeo, shutterMat);
  shutter.position.set(0, 2.3, -11.92);
  garageGroup.add(shutter);

  // Horizontal shutter rib lines
  for (let sy = 0.3; sy < 4.5; sy += 0.28) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(11.1, 0.04, 0.03), trussMat);
    rib.position.set(0, sy, -11.89);
    garageGroup.add(rib);
  }

  // --------------------------------------------------------------------------
  // 2. WALL-MOUNTED GANESHA POOJA MANDIR & GLOWING DIYA
  // --------------------------------------------------------------------------
  const mandirGroup = new THREE.Group();
  mandirGroup.position.set(-6.8, 3.8, -11.85);

  // Carved wooden box frame
  const mandirBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 2.0, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x6f2208, roughness: 0.7 })
  );
  mandirGroup.add(mandirBox);

  // Framed picture of Ganesha
  const ganeshaTex = createGaneshaPoojaTexture();
  const ganeshaMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.5),
    new THREE.MeshBasicMaterial({ map: ganeshaTex })
  );
  ganeshaMesh.position.set(0, 0.05, 0.18);
  mandirGroup.add(ganeshaMesh);

  // Tiny brass oil diya on the mandir ledge
  const diyaMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.08, 0.06, 12),
    new THREE.MeshStandardMaterial({ color: 0xffb703, metalness: 0.85, roughness: 0.2 })
  );
  diyaMesh.position.set(0, -0.88, 0.22);
  mandirGroup.add(diyaMesh);

  // Glowing orange divine diya flame light
  const diyaLight = new THREE.PointLight(0xff6600, 1.8, 6.0, 1.5);
  diyaLight.position.set(0, -0.78, 0.28);
  mandirGroup.add(diyaLight);

  const flameGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffea00 })
  );
  flameGlow.position.copy(diyaLight.position);
  mandirGroup.add(flameGlow);

  garageGroup.add(mandirGroup);

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
  // 4. WARM TUNGSTEN WORKSHOP LIGHTING (No Cold Neon!)
  // --------------------------------------------------------------------------
  // Warm ambient fill reflecting off brick & concrete
  const ambientGarage = new THREE.AmbientLight(0xffecd1, 0.65);
  garageGroup.add(ambientGarage);

  // Main Overhead Spotlight (2800K Warm Tungsten)
  const keySpot = new THREE.SpotLight(0xffe2b0, 4.2, 28, Math.PI / 3.8, 0.4, 1.1);
  keySpot.position.set(0, 8.4, 1.5);
  keySpot.target.position.set(0, 0.8, 0);
  keySpot.castShadow = true;
  keySpot.shadow.mapSize.width = 1024;
  keySpot.shadow.mapSize.height = 1024;
  keySpot.shadow.bias = -0.0008;
  garageGroup.add(keySpot);
  garageGroup.add(keySpot.target);

  // Warm Golden Workbench Task Light (Left)
  const leftTaskLight = new THREE.PointLight(0xffa726, 2.0, 14, 1.4);
  leftTaskLight.position.set(-10.5, 5.2, 0);
  garageGroup.add(leftTaskLight);

  // Warm Saffron Welding Area Light (Right)
  const rightTaskLight = new THREE.PointLight(0xff9800, 1.8, 14, 1.4);
  rightTaskLight.position.set(10.5, 5.2, 0);
  garageGroup.add(rightTaskLight);

  // Overhead Vintage Tin-Shade Pendant Lamps suspended from ceiling
  const lampDomeGeo = new THREE.CylinderGeometry(0.48, 0.68, 0.38, 16);
  const lampDomeMat = new THREE.MeshStandardMaterial({ color: 0x16191d, metalness: 0.85, roughness: 0.3 });
  const twistedCordMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

  for (let lx of [-4.2, 0, 4.2]) {
    // Cord hanging from ceiling
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.4, 6), twistedCordMat);
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
  const hazardTex = createTurntableHazardTexture();
  const diamondTex = createDiamondPlateTexture();

  const turntableMat = [
    new THREE.MeshStandardMaterial({ map: hazardTex, roughness: 0.5, metalness: 0.6 }), // Side Hazard Rim
    new THREE.MeshStandardMaterial({ map: diamondTex, roughness: 0.45, metalness: 0.75 }), // Top Diamond Plate
    new THREE.MeshStandardMaterial({ color: 0x181818 }),
  ];
  const turntableMesh = new THREE.Mesh(turntableGeo, turntableMat);
  turntableMesh.receiveShadow = true;
  turntableGroup.add(turntableMesh);

  // Heavy steel riveted perimeter ring
  const rimBoltsGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8);
  const boltMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 });
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
  const savedConfig = JSON.parse(localStorage.getItem('tuktuk_garage_config') || '{}');
  const activeConfig = {
    archetype: savedConfig.archetype || 'CLASSIC_MUMBAI',
    paintColor: savedConfig.paintColor || '#f5b000',
    slogan: savedConfig.slogan || 'HORN_OK',
    garland: savedConfig.garland !== undefined ? savedConfig.garland : true,
    bobblehead: savedConfig.bobblehead !== undefined ? savedConfig.bobblehead : true,
    roofRack: savedConfig.roofRack !== undefined ? savedConfig.roofRack : false,
  };

  function applyConfigToRickshaw(target, config) {
    if (!target) return;
    if (target.setArchetype) target.setArchetype(config.archetype);
    if (target.setPaintColor) target.setPaintColor(config.paintColor);
    if (target.setRearSlogan) target.setRearSlogan(config.slogan);
    if (target.setGarlandVisible) target.setGarlandVisible(config.garland);
    if (target.setBobbleheadVisible) target.setBobbleheadVisible(config.bobblehead);
    if (target.setRoofRackVisible) target.setRoofRackVisible(config.roofRack);
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
    if (e.target && (e.target.closest('.garage-sidebar') || e.target.closest('button'))) return;
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
    cameraPitch = Math.max(0.04, Math.min(0.65, cameraPitch - deltaY * 0.005));
  }

  function onPointerUp() {
    isDragging = false;
  }

  function onWheel(e) {
    if (!garageGroup.visible) return;
    if (e.target && e.target.closest('.garage-sidebar')) return;
    cameraDistance = Math.max(3.8, Math.min(8.0, cameraDistance + e.deltaY * 0.004));
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
      const camY = GARAGE_CENTER.y + Math.sin(cameraPitch) * cameraDistance + 1.1;
      const horizDist = Math.cos(cameraPitch) * cameraDistance;
      const camX = GARAGE_CENTER.x + Math.sin(0) * horizDist;
      const camZ = GARAGE_CENTER.z + Math.cos(0) * horizDist + 0.4;

      camera.position.set(camX, camY, camZ);
      camera.lookAt(GARAGE_CENTER.x, GARAGE_CENTER.y + 1.15, GARAGE_CENTER.z);
    }

    if (previewRickshaw.updateInteriorBling) {
      previewRickshaw.updateInteriorBling(dt, { steerAngle: Math.sin(turntableYaw * 2) * 0.15, speed: 8 });
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
