import * as THREE from 'three';

/**
 * ============================================================================
 * PROCEDURAL GRIMY STREET TEXTURES & INDIAN BAZAAR WALL GRAPHICS
 * ============================================================================
 * 
 * Generates procedural canvas textures for:
 *  1. Weathered Asphalt Road with aggregate noise, oil stains, cracks & tar patches.
 *  2. 6 Distinct Indian Building Facade Plasters with monsoon dampness, shutters & AC units.
 *  3. Humorous Hindi/English Wall Slogans, Shopboards & Retro Bollywood Posters.
 *  4. Iconic "HORN OK PLEASE" & "बुरी नज़र वाले तेरा मुँह काला" Rickshaw Plates.
 */

// ----------------------------------------------------------------------------
// 1. WEATHERED ASPHALT ROAD TEXTURE
// ----------------------------------------------------------------------------
export function createAsphaltRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base dark tarmac
  ctx.fillStyle = '#252730';
  ctx.fillRect(0, 0, 512, 512);

  // Surface aggregate noise (fine gravel speckles)
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Dark weathered tar repair patches (rectangular municipal pothole fixes)
  ctx.fillStyle = 'rgba(18, 19, 24, 0.7)';
  ctx.fillRect(40, 60, 110, 80);
  ctx.fillRect(320, 240, 140, 95);
  ctx.fillRect(180, 410, 90, 65);

  // Dark oily drips and exhaust grime concentrated in driving lanes
  const oilStains = [
    { x: 170, y: 120, r: 45 },
    { x: 340, y: 190, r: 55 },
    { x: 190, y: 310, r: 60 },
    { x: 330, y: 440, r: 50 },
    { x: 256, y: 260, r: 35 },
  ];

  oilStains.forEach((stain) => {
    const grad = ctx.createRadialGradient(stain.x, stain.y, 4, stain.x, stain.y, stain.r);
    grad.addColorStop(0, 'rgba(10, 10, 14, 0.75)');
    grad.addColorStop(0.5, 'rgba(16, 17, 22, 0.45)');
    grad.addColorStop(1, 'rgba(37, 39, 48, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(stain.x, stain.y, stain.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Subtle asphalt hairline cracks
  ctx.strokeStyle = 'rgba(12, 13, 16, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 30);
  ctx.lineTo(110, 75);
  ctx.lineTo(135, 95);
  ctx.lineTo(160, 140);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(380, 350);
  ctx.lineTo(410, 390);
  ctx.lineTo(395, 440);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 40);
  texture.anisotropy = 4;
  return texture;
}

// ----------------------------------------------------------------------------
// 2. WEATHERED INDIAN BUILDING FACADE TEXTURES
// ----------------------------------------------------------------------------
const facadePalettes = [
  { name: 'Terracotta', base: '#b85434', dark: '#80321c', trim: '#5c2212' },
  { name: 'Mustard', base: '#d49b28', dark: '#9c6c13', trim: '#614006' },
  { name: 'LimeGreen', base: '#5a9e6b', dark: '#376b43', trim: '#1e4026' },
  { name: 'Concrete', base: '#8f8b85', dark: '#635f59', trim: '#3d3a36' },
  { name: 'DustyRose', base: '#c76b82', dark: '#8c4153', trim: '#52202c' },
  { name: 'Indigo', base: '#3b4d7a', dark: '#223054', trim: '#131d36' },
];

export function createBuildingFacadeTexture(styleIdx = 0) {
  const p = facadePalettes[styleIdx % facadePalettes.length];
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base weathered stucco plaster
  ctx.fillStyle = p.base;
  ctx.fillRect(0, 0, 512, 512);

  // Surface stucco noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 32;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Monsoon dampness water gradient rising up from the bottom ground edge
  const dampGrad = ctx.createLinearGradient(0, 512, 0, 360);
  dampGrad.addColorStop(0, 'rgba(28, 22, 18, 0.85)');
  dampGrad.addColorStop(0.5, 'rgba(42, 33, 26, 0.45)');
  dampGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = dampGrad;
  ctx.fillRect(0, 360, 512, 152);

  // Vertical dark rain stains running down from the cornice/roof
  ctx.fillStyle = 'rgba(20, 16, 14, 0.22)';
  for (let x = 30; x < 500; x += 45 + Math.random() * 30) {
    const w = 6 + Math.random() * 12;
    const h = 80 + Math.random() * 160;
    ctx.fillRect(x, 0, w, h);
  }

  // Peeling paint patches exposing rough inner brick/cement
  ctx.fillStyle = p.dark;
  ctx.fillRect(60, 180, 55, 45);
  ctx.fillRect(380, 220, 70, 50);
  ctx.fillRect(200, 320, 65, 35);

  // Draw simulated brick lines inside the peeled patch
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  for (let by = 185; by < 225; by += 10) {
    ctx.beginPath();
    ctx.moveTo(60, by);
    ctx.lineTo(115, by);
    ctx.stroke();
  }

  // Metal Rolled-Up Shop Shutter on bottom floor (ribbed corrugated texture)
  ctx.fillStyle = '#444a52';
  ctx.fillRect(70, 370, 372, 142);
  ctx.strokeStyle = '#2b3036';
  ctx.lineWidth = 2;
  ctx.strokeRect(70, 370, 372, 142);

  // Horizontal shutter ribs
  ctx.strokeStyle = '#5d646e';
  ctx.lineWidth = 2;
  for (let sy = 376; sy < 508; sy += 8) {
    ctx.beginPath();
    ctx.moveTo(72, sy);
    ctx.lineTo(440, sy);
    ctx.stroke();
  }

  // Weathered Shutter Padlock & Handle
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(248, 488, 16, 16);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 2;
  ctx.strokeRect(248, 488, 16, 16);

  // Weathered Window Grids with traditional Indian iron grill bars
  function drawWindow(wx, wy, ww, wh) {
    ctx.fillStyle = '#181b20';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.strokeStyle = '#d4c7b8';
    ctx.lineWidth = 4;
    ctx.strokeRect(wx, wy, ww, wh);

    // Cross grills
    ctx.strokeStyle = '#3e444f';
    ctx.lineWidth = 2;
    for (let gx = wx + 12; gx < wx + ww; gx += 12) {
      ctx.beginPath();
      ctx.moveTo(gx, wy);
      ctx.lineTo(gx, wy + wh);
      ctx.stroke();
    }
  }

  drawWindow(60, 60, 110, 95);
  drawWindow(340, 60, 110, 95);

  // Wall-mounted weathered AC compressor box with fan grille
  const acX = 200;
  const acY = 110;
  ctx.fillStyle = '#dcd6cd';
  ctx.fillRect(acX, acY, 112, 70);
  ctx.strokeStyle = '#8c8479';
  ctx.lineWidth = 3;
  ctx.strokeRect(acX, acY, 112, 70);

  // AC circular fan vent
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.arc(acX + 40, acY + 35, 24, 0, Math.PI * 2);
  ctx.fill();

  // Rust drip under the AC unit
  ctx.fillStyle = 'rgba(160, 60, 20, 0.4)';
  ctx.fillRect(acX + 20, acY + 70, 60, 45);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

// ----------------------------------------------------------------------------
// 3. FUNNY HINDI & HINGLISH WALL STENCILS & BILLBOARDS
// ----------------------------------------------------------------------------
/**
 * Authentic "यहाँ पेशाब करना सख्त मना है (Fine ₹500)" boundary wall stencil
 */
export function createPissingFineStencilTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  // Weathered boundary wall background
  ctx.fillStyle = '#ded5c5';
  ctx.fillRect(0, 0, 512, 160);

  // Yellow warning box with distressed red border
  ctx.fillStyle = '#ffe066';
  ctx.fillRect(16, 16, 480, 128);
  ctx.strokeStyle = '#d90429';
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, 480, 128);

  // Red stencil text
  ctx.fillStyle = '#d90429';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('यहाँ पेशाब करना सख्त मना है!', 256, 52);

  ctx.fillStyle = '#111111';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('DO NOT URINATE HERE • FINE ₹500', 256, 92);

  ctx.font = '16px sans-serif';
  ctx.fillText('पकड़े जाने पर गधे पर घुमाया जाएगा 🫏', 256, 122);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Authentic "HORN OK PLEASE" & "बुरी नज़र वाले तेरा मुँह काला" Rickshaw rear plate
 */
export function createHornOkPleaseTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Vibrant yellow auto tailgate background
  ctx.fillStyle = '#ffb703';
  ctx.fillRect(0, 0, 384, 128);

  // Ornate decorative border
  ctx.strokeStyle = '#d00000';
  ctx.lineWidth = 5;
  ctx.strokeRect(8, 8, 368, 112);

  // "HORN OK PLEASE" in vibrant pop-art lettering
  ctx.fillStyle = '#03045e';
  ctx.font = '900 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HORN  OK  PLEASE', 192, 42);

  // Classic Demon Face / Slogan: "बुरी नज़र वाले तेरा मुँह काला"
  ctx.fillStyle = '#d00000';
  ctx.font = 'bold 21px sans-serif';
  ctx.fillText('👹 बुरी नज़र वाले तेरा मुँह काला 🌶️', 192, 85);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Authentic Indian Bazaar Shop Signboards
 */
export const DesiShopSignLibrary = [
  {
    title: 'पप्पू हेयर सैलून',
    sub: 'PAPPU HAIR SALON ✂️ दाढ़ी, कटिंग & चम्पी',
    bg: '#1864ab',
    border: '#ffe066',
    text: '#ffffff',
  },
  {
    title: 'शर्मा जी की स्पेशल चाय',
    sub: 'SHARMA CHAI TAPRI ☕ कड़क कुल्हड़ चाय & समोसा',
    bg: '#d9480f',
    border: '#ffd43b',
    text: '#ffffff',
  },
  {
    title: 'राजू डेंटिंग पेंटिंग & ऑटो वर्क्स',
    sub: 'RAJU AUTO WORKS 🔧 24/7 पंचर & स्पेयर पार्ट्स',
    bg: '#087f5b',
    border: '#fcc419',
    text: '#ffffff',
  },
  {
    title: 'बंटी भेल & पानी पूरी सेंटर',
    sub: 'BUNTY CHAT BHANDAR 🌶️ तीखी गोलगप्पे & चाट',
    bg: '#c92a2a',
    border: '#ffe066',
    text: '#ffffff',
  },
  {
    title: 'शाही मिष्ठान्न भंडार',
    sub: 'ROYAL SWEETS 🪔 शुद्ध देसी घी जलेबी & रसगुल्ला',
    bg: '#f08c00',
    border: '#212529',
    text: '#212529',
  },
  {
    title: 'खान पान ढाबा',
    sub: 'HIGHWAY DHABA 🍲 तंदूरी रोटी & दाल मखनी',
    bg: '#5c7cfa',
    border: '#ffd43b',
    text: '#ffffff',
  },
];

export function createDesiShopSignTexture(idx = 0) {
  const item = DesiShopSignLibrary[idx % DesiShopSignLibrary.length];
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 110;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = item.bg;
  ctx.fillRect(0, 0, 440, 110);

  ctx.strokeStyle = item.border;
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 428, 98);

  ctx.fillStyle = item.text;
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(item.title, 220, 14);

  ctx.font = 'bold 19px sans-serif';
  ctx.fillText(item.sub, 220, 62);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Colorful Retro Bollywood Movie Posters pasted on brick walls
 */
const bollywoodPosters = [
  {
    title: 'शोले',
    sub: 'SHOLAY • कितने आदमी थे?!',
    tag: 'SUPER HIT 1975 🎬',
    bg: '#c92a2a',
    accent: '#ffe066',
  },
  {
    title: 'डॉन',
    sub: 'DON • डॉन को पकड़ना नामुमकिन है!',
    tag: 'ACTION BLOCKBUSTER 🕶️',
    bg: '#1864ab',
    accent: '#69db7c',
  },
  {
    title: 'दिलवाले',
    sub: 'DDLJ • बड़े-बड़े देशों में...',
    tag: 'ROMANTIC SUPERHIT 🌹',
    bg: '#e64980',
    accent: '#ffe066',
  },
];

export function createRetroBollywoodPosterTexture(idx = 0) {
  const p = bollywoodPosters[idx % bollywoodPosters.length];
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');

  // Poster background
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, 240, 340);

  // Distressed aged paper border
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 224, 324);

  // Header tag
  ctx.fillStyle = p.accent;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(p.tag, 120, 36);

  // Giant hand-painted movie title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 54px sans-serif';
  ctx.fillText(p.title, 120, 110);

  // Dramatic decorative graphic box
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(20, 150, 200, 100);

  // Movie hero icon
  ctx.font = '50px sans-serif';
  ctx.fillText('🤠🔫', 120, 215);

  // Iconic dialogue subtitle
  ctx.fillStyle = p.accent;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(p.sub, 120, 280);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('HOUSEFULL ALL SHOWS', 120, 310);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ----------------------------------------------------------------------------
// 6. URBAN CONCRETE & COURTYARD GROUND BASE TEXTURE
// ----------------------------------------------------------------------------
export function createUrbanGroundTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dark urban concrete base
  ctx.fillStyle = '#42454e';
  ctx.fillRect(0, 0, 512, 512);

  // Surface aggregate speckling
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 24;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Concrete pavement slab grid lines
  ctx.strokeStyle = '#32343b';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Interlocking red/ochre paver tiles section (compound / plaza courtyard)
  ctx.fillStyle = '#5c3d35';
  ctx.fillRect(64, 64, 192, 192);
  ctx.strokeStyle = '#422a24';
  ctx.lineWidth = 1.5;
  for (let px = 64; px <= 256; px += 24) {
    ctx.beginPath();
    ctx.moveTo(px, 64);
    ctx.lineTo(px, 256);
    ctx.stroke();
  }
  for (let py = 64; py <= 256; py += 16) {
    ctx.beginPath();
    ctx.moveTo(64, py);
    ctx.lineTo(256, py);
    ctx.stroke();
  }

  // Lush green urban park grass patch with foliage variation
  ctx.fillStyle = '#2d6a4f';
  ctx.fillRect(320, 256, 160, 192);
  ctx.fillStyle = '#40916c';
  ctx.fillRect(336, 272, 128, 160);
  ctx.fillStyle = '#52b788';
  for (let g = 0; g < 40; g++) {
    const gx = 330 + Math.random() * 140;
    const gy = 265 + Math.random() * 170;
    ctx.fillRect(gx, gy, 4, 4);
  }

  // Dark asphalt alleyway / driveway strip
  ctx.fillStyle = '#282a30';
  ctx.fillRect(0, 384, 256, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(50, 50);
  tex.anisotropy = 4;
  return tex;
}

// ----------------------------------------------------------------------------
// 7. CORRUGATED BLUE METRO-CONSTRUCTION SHEET TEXTURE
// ----------------------------------------------------------------------------
export function createCorrugatedBlueSheetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Vibrant metro barricade blue
  ctx.fillStyle = '#0077b6';
  ctx.fillRect(0, 0, 256, 128);

  // Vertical corrugation flutes (alternating highlight & shadow)
  const fluteWidth = 16;
  for (let x = 0; x < 256; x += fluteWidth) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(x, 0, fluteWidth / 2, 128);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fillRect(x + fluteWidth / 2, 0, fluteWidth / 2, 128);
  }

  // Bottom hazard yellow & black diagonal stripes
  ctx.fillStyle = '#ffb703';
  ctx.fillRect(0, 104, 256, 24);
  ctx.fillStyle = '#111111';
  for (let x = -24; x < 280; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 128);
    ctx.lineTo(x + 16, 104);
    ctx.lineTo(x + 32, 104);
    ctx.lineTo(x + 16, 128);
    ctx.closePath();
    ctx.fill();
  }

  // Official municipal slogan
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🚧 METRO WORK IN PROGRESS 🚧', 128, 45);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('असुविधा के लिए खेद है • GO SLOW', 128, 72);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// ----------------------------------------------------------------------------
// 8. LARGE ROADSIDE HOARDING BILLBOARDS
// ----------------------------------------------------------------------------
const hoardingAds = [
  {
    title: '5G ULTRA SPEED 📶',
    sub: 'DESH KA SABSE TEZ NETWORK!',
    tag: 'UNLIMITED DATA ₹299',
    bg: '#d90429',
    accent: '#ffea00',
  },
  {
    title: 'ROYAL JEWELLERS 💎',
    sub: '100% HALLMARKED PURE GOLD',
    tag: 'SPECIAL FESTIVE OFFER 🪔',
    bg: '#3a0ca3',
    accent: '#ffd60a',
  },
  {
    title: 'GULMOHAR ENCLAVE 🏢',
    sub: 'LUXURY 2 & 3 BHK APARTMENTS',
    tag: 'POSSESSION IN 2026 🔑',
    bg: '#007200',
    accent: '#ffffff',
  },
  {
    title: 'CHAI KING ☕',
    sub: 'KADAK MASALA CHAI & SAMOSA',
    tag: 'HAR CHUSKI MEIN TAARANG!',
    bg: '#e85d04',
    accent: '#fff3bf',
  },
];

export function createBillboardHoardingTexture(idx = 0) {
  const ad = hoardingAds[idx % hoardingAds.length];
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = ad.bg;
  ctx.fillRect(0, 0, 512, 256);

  // Metallic frame border
  ctx.strokeStyle = ad.accent;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 496, 240);

  // Promotional tag pill
  ctx.fillStyle = ad.accent;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(ad.tag, 256, 48);

  // Giant headline
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px sans-serif';
  ctx.fillText(ad.title, 256, 120);

  // Subtitle
  ctx.fillStyle = ad.accent;
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(ad.sub, 256, 180);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('DIAL: 1800-DESI-RACE • T&C APPLY', 256, 224);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// ----------------------------------------------------------------------------
// 9. HIGH-CONTRAST EYE-LEVEL ROAD-FACING SHOP SIGNS & GRAFFITI STENCILS
// ----------------------------------------------------------------------------
export const VibrantRoadSignboards = [
  {
    title: 'राजू बारबर शॉप',
    sub: 'RAJU BARBER SHOP • VIP HAIRCUT ✂️',
    tag: 'A/C HAIR SALON & SHAVE',
    bg: '#0077b6',
    border: '#ffd60a',
    text: '#ffffff',
  },
  {
    title: 'शर्मा जी गरम चाय & समोसा',
    sub: 'SHARMA JI SPECIAL TEA ☕ & FRESH SNACKS',
    tag: '100% KADAK KULLHAD CHAI',
    bg: '#e85d04',
    border: '#fff3bf',
    text: '#ffffff',
  },
  {
    title: 'पप्पू डेंटिंग पेंटिंग ऑटो गैरेज',
    sub: 'PAPPU AUTO WORKS 🔧 ACCIDENT SPECIALIST',
    tag: 'TUK-TUK REPAIR & MODIFICATION',
    bg: '#d90429',
    border: '#ffe066',
    text: '#ffffff',
  },
  {
    title: 'ताज़ा सब्ज़ी मंडी',
    sub: 'FRESH VEGETABLES & FRUITS MARKET 🥦🍎',
    tag: 'DAILY FRESH FROM FARMS',
    bg: '#2b9348',
    border: '#ffd60a',
    text: '#ffffff',
  },
  {
    title: 'बंटी भेल और पानी पूरी सेंटर',
    sub: 'BUNTY BHEL & PANI PURI 🌶️ CHAT CORNER',
    tag: 'TEEKHA & MEETHA PANI PURI',
    bg: '#8338ec',
    border: '#ffd60a',
    text: '#ffffff',
  },
  {
    title: 'लक्ष्मी जनरल स्टोर',
    sub: 'LAXMI GENERAL STORE • COLD DRINKS 🥤',
    tag: 'ALL GROCERY & ICE CREAMS',
    bg: '#ffb703',
    border: '#03045e',
    text: '#03045e',
  },
];

export function createVibrantRoadSignTexture(idx = 0) {
  const item = VibrantRoadSignboards[idx % VibrantRoadSignboards.length];
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  // Vibrant high-contrast background
  ctx.fillStyle = item.bg;
  ctx.fillRect(0, 0, 512, 160);

  // Bold glowing double border
  ctx.strokeStyle = item.border;
  ctx.lineWidth = 10;
  ctx.strokeRect(6, 6, 500, 148);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(14, 14, 484, 132);

  // Top header pill tag
  ctx.fillStyle = item.border;
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`★  ${item.tag}  ★`, 256, 36);

  // Primary giant Devanagari Hindi title
  ctx.fillStyle = item.text;
  ctx.font = '900 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 6;
  ctx.fillText(item.title, 256, 88);
  ctx.shadowBlur = 0;

  // Subtitle Hinglish translation
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = item.border;
  ctx.fillText(item.sub, 256, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export const RoadEyeLevelStencils = [
  { text: 'यहाँ थूकना सख्त मना है', sub: '(जुर्माना ₹500 • NO SPITTING)', color: '#d00000' },
  { text: 'यहाँ पेशाब करना मना है', sub: '(गधे के पूत यहाँ मत मूत)', color: '#d90429' },
  { text: '👹 बुरी नज़र वाले तेरा मुँह काला', sub: 'HORN OK PLEASE 🌶️', color: '#ff5400' },
];

export function createRoadEyeLevelStencilTexture(idx = 0) {
  const item = RoadEyeLevelStencils[idx % RoadEyeLevelStencils.length];
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');

  // Aged off-white whitewash plaque
  ctx.fillStyle = 'rgba(250, 246, 238, 0.94)';
  ctx.fillRect(0, 0, 440, 140);

  // Stenciled spray-paint rough border
  ctx.strokeStyle = item.color;
  ctx.lineWidth = 7;
  ctx.strokeRect(8, 8, 424, 124);

  // Bold Devanagari stencil
  ctx.fillStyle = item.color;
  ctx.font = '900 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(item.text, 220, 56);

  ctx.fillStyle = '#111111';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(item.sub, 220, 104);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

// ----------------------------------------------------------------------------
// 10. TEXTURED SKYSCRAPER FACADE WITH LIT WINDOWS & EMISSIVE GLOW
// ----------------------------------------------------------------------------
export function createSkyscraperFacadeTextures() {
  const width = 512;
  const height = 512;

  // 1. Diffuse Albedo Canvas
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d');

  // 2. Emissive Glow Canvas (Windows glow in darkness/afternoon)
  const emissCanvas = document.createElement('canvas');
  emissCanvas.width = width;
  emissCanvas.height = height;
  const emissCtx = emissCanvas.getContext('2d');

  // Base dark architectural glass & concrete spandrel bands
  diffCtx.fillStyle = '#222730';
  diffCtx.fillRect(0, 0, width, height);

  emissCtx.fillStyle = '#000000'; // Black everywhere except lit windows
  emissCtx.fillRect(0, 0, width, height);

  const numFloors = 16;
  const floorHeight = height / numFloors;
  const numColumns = 16;
  const colWidth = width / numColumns;

  // Window lit color palette (warm yellow, cozy amber, soft orange, cool office white)
  const windowGlowColors = ['#ffea00', '#ffd166', '#ffb703', '#fca311', '#e0fbfc', '#ffffff'];

  for (let f = 0; f < numFloors; f++) {
    const y = f * floorHeight;

    // Concrete floor slab divider
    diffCtx.fillStyle = '#1a1c22';
    diffCtx.fillRect(0, y, width, 4);

    for (let c = 0; c < numColumns; c++) {
      const x = c * colWidth;
      const wx = x + 4;
      const wy = y + 7;
      const ww = colWidth - 8;
      const wh = floorHeight - 11;

      // 68% of windows are lit with diverse warm/white illumination
      const isLit = (Math.sin(f * 13 + c * 29) + 1.0) * 0.5 > 0.32;

      if (isLit) {
        const glowColor = windowGlowColors[(f * 7 + c * 11) % windowGlowColors.length];

        // Diffuse
        diffCtx.fillStyle = glowColor;
        diffCtx.fillRect(wx, wy, ww, wh);

        // Window mullion frames
        diffCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        diffCtx.lineWidth = 1;
        diffCtx.strokeRect(wx, wy, ww, wh);

        // Emissive Map
        emissCtx.fillStyle = glowColor;
        emissCtx.fillRect(wx, wy, ww, wh);
      } else {
        // Dark unlit office / apartment window
        diffCtx.fillStyle = '#14171d';
        diffCtx.fillRect(wx, wy, ww, wh);
      }
    }
  }

  const diffTex = new THREE.CanvasTexture(diffCanvas);
  diffTex.wrapS = THREE.RepeatWrapping;
  diffTex.wrapT = THREE.RepeatWrapping;
  diffTex.repeat.set(2, 6);
  diffTex.anisotropy = 4;

  const emissTex = new THREE.CanvasTexture(emissCanvas);
  emissTex.wrapS = THREE.RepeatWrapping;
  emissTex.wrapT = THREE.RepeatWrapping;
  emissTex.repeat.set(2, 6);
  emissTex.anisotropy = 4;

  return { map: diffTex, emissiveMap: emissTex };
}


