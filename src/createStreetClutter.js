import * as THREE from 'three';
import {
  createPissingFineStencilTexture,
  createRetroBollywoodPosterTexture,
  createDesiShopSignTexture,
} from './createStreetTextures.js';

/**
 * ============================================================================
 * DESI STREET CLUTTER & ROADSIDE PROPS SYSTEM (Sprint 5)
 * ============================================================================
 * 
 * Generates recognizable low-poly Indian street life lining the footpaths:
 *  1. Vegetable Thelas (Wooden Handcarts with piled sabzi & tilted parasols)
 *  2. Chai Tapris (Bamboo stalls with blue plastic tarps, samovars & warm bulbs)
 *  3. Urban Street Detail (Municipal dustbins, tire stacks, blue water drums,
 *     stray dogs, and holy cows resting peacefully on the sidewalk)
 *  4. Overhead Tangled Electric Wires strung between tilted concrete utility poles
 *     with festival marigold (genda phool) orange/yellow flower garlands.
 *  5. Funny Hindi wall stencils & vintage Bollywood posters pasted on walls.
 */

export function createStreetClutter(scene, trackCurve, trackWidth = 14.0) {
  const clutterGroup = new THREE.Group();
  clutterGroup.name = 'Desi_Street_Clutter';

  const halfWidth = trackWidth / 2;
  const sidewalkCenterOffset = halfWidth + 1.0 + 1.2; // 9.2m from track centerline (on sidewalk)

  // Shared reusable materials
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.85 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.7, metalness: 0.5 });
  const blueTarpMat = new THREE.MeshStandardMaterial({ color: 0x0077b6, roughness: 0.5 });
  const stripedTarpMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.6 });
  const drumBlueMat = new THREE.MeshStandardMaterial({ color: 0x00509d, roughness: 0.4 });
  const tireRubberMat = new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.9 });
  const dustbinGreenMat = new THREE.MeshStandardMaterial({ color: 0x2b8a3e, roughness: 0.6 });
  const concretePoleMat = new THREE.MeshStandardMaterial({ color: 0x7d8597, roughness: 0.95 });

  // --------------------------------------------------------------------------
  // 1. VEGETABLE THELA (WOODEN HANDCART WITH SABZI & FRUITS)
  // --------------------------------------------------------------------------
  function createVegetableThela(pos, yaw) {
    const thela = new THREE.Group();
    thela.position.set(pos.x, 0.075, pos.z);
    thela.rotation.y = yaw;

    // Wooden cart bed
    const bedGeo = new THREE.BoxGeometry(2.4, 0.12, 1.4);
    const bed = new THREE.Mesh(bedGeo, woodMat);
    bed.position.y = 0.82;
    bed.castShadow = true;
    thela.add(bed);

    // Bed raised wooden lip borders
    const lipLongGeo = new THREE.BoxGeometry(2.44, 0.15, 0.06);
    const lip1 = new THREE.Mesh(lipLongGeo, woodMat);
    lip1.position.set(0, 0.9, -0.68);
    const lip2 = new THREE.Mesh(lipLongGeo, woodMat);
    lip2.position.set(0, 0.9, 0.68);
    thela.add(lip1, lip2);

    // 4 Wooden legs
    const legGeo = new THREE.BoxGeometry(0.08, 0.82, 0.08);
    const l1 = new THREE.Mesh(legGeo, woodMat);
    l1.position.set(-1.05, 0.41, -0.58);
    const l2 = new THREE.Mesh(legGeo, woodMat);
    l2.position.set(-1.05, 0.41, 0.58);
    const l3 = new THREE.Mesh(legGeo, woodMat);
    l3.position.set(1.05, 0.41, -0.58);
    const l4 = new THREE.Mesh(legGeo, woodMat);
    l4.position.set(1.05, 0.41, 0.58);
    thela.add(l1, l2, l3, l4);

    // 4 Spoke wheels
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.08, 12);
    const w1 = new THREE.Mesh(wheelGeo, darkMetalMat);
    w1.rotation.x = Math.PI / 2;
    w1.position.set(-0.85, 0.42, -0.72);
    const w2 = new THREE.Mesh(wheelGeo, darkMetalMat);
    w2.rotation.x = Math.PI / 2;
    w2.position.set(-0.85, 0.42, 0.72);
    const w3 = new THREE.Mesh(wheelGeo, darkMetalMat);
    w3.rotation.x = Math.PI / 2;
    w3.position.set(0.85, 0.42, -0.72);
    const w4 = new THREE.Mesh(wheelGeo, darkMetalMat);
    w4.rotation.x = Math.PI / 2;
    w4.position.set(0.85, 0.42, 0.72);
    thela.add(w1, w2, w3, w4);

    // Tilted sunshade parasol umbrella
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8);
    const umbrellaPole = new THREE.Mesh(poleGeo, woodMat);
    umbrellaPole.position.set(0.7, 1.9, 0);
    umbrellaPole.rotation.z = -0.12;
    thela.add(umbrellaPole);

    const canopyGeo = new THREE.ConeGeometry(1.3, 0.6, 8);
    const umbrellaCanopy = new THREE.Mesh(canopyGeo, stripedTarpMat);
    umbrellaCanopy.position.set(0.85, 2.9, 0);
    umbrellaCanopy.rotation.z = -0.15;
    thela.add(umbrellaCanopy);

    // Colorful mounds of fruits and sabzi
    const fruitPiles = [
      { color: 0x2e7d32, x: -0.7, z: -0.3, label: 'Cabbages' }, // Green
      { color: 0xd90429, x: -0.7, z: 0.3, label: 'Tomatoes' },  // Red
      { color: 0xffb703, x: 0.0, z: -0.3, label: 'Mangoes' },  // Yellow
      { color: 0xf77f00, x: 0.0, z: 0.3, label: 'Carrots' },   // Orange
      { color: 0x70e000, x: 0.6, z: -0.2, label: 'Limes' },     // Bright Green
      { color: 0x9d4edd, x: 0.6, z: 0.3, label: 'Eggplants' }, // Purple
    ];

    fruitPiles.forEach((fp) => {
      const moundMat = new THREE.MeshStandardMaterial({ color: fp.color, roughness: 0.6 });
      const moundGeo = new THREE.DodecahedronGeometry(0.24, 1);
      for (let mx = -0.15; mx <= 0.15; mx += 0.15) {
        for (let mz = -0.15; mz <= 0.15; mz += 0.15) {
          const sphere = new THREE.Mesh(moundGeo, moundMat);
          sphere.position.set(fp.x + mx, 0.98 + (Math.random() - 0.5) * 0.05, fp.z + mz);
          sphere.scale.set(0.6, 0.6, 0.6);
          thela.add(sphere);
        }
      }
    });

    return thela;
  }

  // --------------------------------------------------------------------------
  // 2. CHAI TAPRI (ROADSIDE STALL WITH STEAMING SAMOVAR)
  // --------------------------------------------------------------------------
  function createChaiTapri(pos, yaw) {
    const tapri = new THREE.Group();
    tapri.position.set(pos.x, 0.075, pos.z);
    tapri.rotation.y = yaw;

    // Bamboo / wooden posts
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6);
    const p1 = new THREE.Mesh(postGeo, woodMat);
    p1.position.set(-1.4, 1.3, -1.0);
    const p2 = new THREE.Mesh(postGeo, woodMat);
    p2.position.set(-1.4, 1.3, 1.0);
    const p3 = new THREE.Mesh(postGeo, woodMat);
    p3.position.set(1.4, 1.3, -1.0);
    const p4 = new THREE.Mesh(postGeo, woodMat);
    p4.position.set(1.4, 1.3, 1.0);
    tapri.add(p1, p2, p3, p4);

    // Blue plastic tarpaulin awning slanting downward
    const tarpGeo = new THREE.BoxGeometry(3.2, 0.06, 2.4);
    const tarp = new THREE.Mesh(tarpGeo, blueTarpMat);
    tarp.position.set(0, 2.5, 0);
    tarp.rotation.x = 0.12;
    tapri.add(tarp);

    // Wooden serving counter kiosk table
    const counterGeo = new THREE.BoxGeometry(2.4, 0.9, 0.9);
    const counter = new THREE.Mesh(counterGeo, woodMat);
    counter.position.set(0, 0.45, 0.1);
    counter.castShadow = true;
    tapri.add(counter);

    // Traditional brass chai samovar kettle
    const kettleGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.6, 12);
    const kettleMat = new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.8, roughness: 0.25 });
    const kettle = new THREE.Mesh(kettleGeo, kettleMat);
    kettle.position.set(-0.6, 1.2, 0.1);
    tapri.add(kettle);

    // Gas stove cylinder underneath
    const cylinderGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.65, 10);
    const lpgMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.4 });
    const cylinder = new THREE.Mesh(cylinderGeo, lpgMat);
    cylinder.position.set(-0.8, 0.35, -0.6);
    tapri.add(cylinder);

    // Glass tea glasses in wire caddy
    const caddyGeo = new THREE.BoxGeometry(0.45, 0.1, 0.3);
    const caddy = new THREE.Mesh(caddyGeo, darkMetalMat);
    caddy.position.set(0.4, 0.95, 0.1);
    tapri.add(caddy);

    // Hanging warm incandescent bulb with point light
    const hangingBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffdd88 })
    );
    hangingBulb.position.set(0, 2.2, 0.2);
    tapri.add(hangingBulb);

    const warmLight = new THREE.PointLight(0xffa200, 1.8, 12, 1.5);
    warmLight.position.set(0, 2.1, 0.2);
    tapri.add(warmLight);

    // Wooden customer bench outside
    const benchGeo = new THREE.BoxGeometry(2.2, 0.38, 0.45);
    const bench = new THREE.Mesh(benchGeo, woodMat);
    bench.position.set(0, 0.2, 1.15);
    tapri.add(bench);

    return tapri;
  }

  // --------------------------------------------------------------------------
  // 3. URBAN STREET DETAILS: DUSTBINS, TIRES, WATER DRUMS, DOGS & SACRED COWS
  // --------------------------------------------------------------------------
  function createMunicipalDustbin(pos, yaw) {
    const binGroup = new THREE.Group();
    binGroup.position.set(pos.x, 0.075, pos.z);
    binGroup.rotation.y = yaw;

    // Green municipal garbage bin
    const binGeo = new THREE.CylinderGeometry(0.4, 0.34, 0.85, 12);
    const bin = new THREE.Mesh(binGeo, dustbinGreenMat);
    bin.position.y = 0.43;
    bin.castShadow = true;
    binGroup.add(bin);

    // Overflowing garbage cardboard and paper scraps
    const scrapGeo = new THREE.BoxGeometry(0.24, 0.18, 0.18);
    const scrapMat = new THREE.MeshStandardMaterial({ color: 0xded5c5, roughness: 0.9 });
    for (let s = 0; s < 4; s++) {
      const scrap = new THREE.Mesh(scrapGeo, scrapMat);
      scrap.position.set(
        (Math.random() - 0.5) * 0.45,
        0.88 + Math.random() * 0.15,
        (Math.random() - 0.5) * 0.45
      );
      scrap.rotation.set(Math.random(), Math.random(), Math.random());
      binGroup.add(scrap);
    }
    return binGroup;
  }

  function createTireStack(pos, yaw) {
    const stack = new THREE.Group();
    stack.position.set(pos.x, 0.075, pos.z);
    stack.rotation.y = yaw;

    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 12);
    for (let t = 0; t < 3; t++) {
      const tire = new THREE.Mesh(tireGeo, tireRubberMat);
      tire.position.set((t % 2) * 0.05, 0.11 + t * 0.22, 0);
      tire.castShadow = true;
      stack.add(tire);
    }
    return stack;
  }

  function createPlasticWaterDrum(pos) {
    const drum = new THREE.Group();
    drum.position.set(pos.x, 0.075, pos.z);

    const bodyGeo = new THREE.CylinderGeometry(0.38, 0.36, 0.95, 14);
    const body = new THREE.Mesh(bodyGeo, drumBlueMat);
    body.position.y = 0.48;
    body.castShadow = true;
    drum.add(body);

    const lidGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 14);
    const lid = new THREE.Mesh(lidGeo, darkMetalMat);
    lid.position.y = 0.96;
    drum.add(lid);
    return drum;
  }

  /**
   * Low-poly resting Indian stray dog (peacefully sleeping on sidewalk)
   */
  function createStrayStreetDog(pos, yaw) {
    const dog = new THREE.Group();
    dog.position.set(pos.x, 0.075, pos.z);
    dog.rotation.y = yaw;

    const furMat = new THREE.MeshStandardMaterial({ color: 0xb5651d, roughness: 0.9 }); // Desi brown

    // Curled up sleeping body
    const bodyGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.position.set(0, 0.16, 0);
    body.scale.set(1.4, 0.8, 1.0);
    dog.add(body);

    // Sleeping head
    const headGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const head = new THREE.Mesh(headGeo, furMat);
    head.position.set(0.38, 0.14, 0.05);
    dog.add(head);

    // Curled tail
    const tailGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.3, 6);
    const tail = new THREE.Mesh(tailGeo, furMat);
    tail.position.set(-0.4, 0.12, -0.15);
    tail.rotation.z = Math.PI / 3;
    dog.add(tail);

    return dog;
  }

  /**
   * Iconic Indian Holy Cow / Zebu Bull resting safely on the wide sidewalk
   */
  function createSacredCow(pos, yaw) {
    const cow = new THREE.Group();
    cow.position.set(pos.x, 0.075, pos.z);
    cow.rotation.y = yaw;

    const hideMat = new THREE.MeshStandardMaterial({ color: 0xded8cc, roughness: 0.85 }); // Off-white
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });

    // Main resting body
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.65, 0.85);
    const body = new THREE.Mesh(bodyGeo, hideMat);
    body.position.set(0, 0.36, 0);
    body.castShadow = true;
    cow.add(body);

    // Iconic Zebu shoulder hump
    const humpGeo = new THREE.SphereGeometry(0.24, 8, 8);
    const hump = new THREE.Mesh(humpGeo, hideMat);
    hump.position.set(0.42, 0.72, 0);
    hump.scale.set(1.0, 1.2, 0.8);
    cow.add(hump);

    // Head
    const headGeo = new THREE.BoxGeometry(0.48, 0.38, 0.36);
    const head = new THREE.Mesh(headGeo, hideMat);
    head.position.set(0.85, 0.62, 0);
    cow.add(head);

    // Horns
    const hornGeo = new THREE.ConeGeometry(0.06, 0.32, 6);
    const hornL = new THREE.Mesh(hornGeo, hornMat);
    hornL.position.set(0.82, 0.9, -0.16);
    hornL.rotation.z = -0.3;
    hornL.rotation.x = -0.3;
    const hornR = new THREE.Mesh(hornGeo, hornMat);
    hornR.position.set(0.82, 0.9, 0.16);
    hornR.rotation.z = -0.3;
    hornR.rotation.x = 0.3;
    cow.add(hornL, hornR);

    // Festive garland necklace around neck
    const garlandGeo = new THREE.TorusGeometry(0.24, 0.05, 6, 12);
    const garlandMat = new THREE.MeshBasicMaterial({ color: 0xff7b00 }); // Marigold orange
    const garland = new THREE.Mesh(garlandGeo, garlandMat);
    garland.position.set(0.68, 0.48, 0);
    garland.rotation.y = Math.PI / 2;
    cow.add(garland);

    return cow;
  }

  // --------------------------------------------------------------------------
  // 4. OVERHEAD TANGLED WIRES & UTILITY POLES
  // --------------------------------------------------------------------------
  const poleLocations = [];
  const poleCount = 20;

  for (let p = 0; p < poleCount; p++) {
    const tVal = p / poleCount;
    const pt = trackCurve.getPointAt(tVal);
    const tan = trackCurve.getTangentAt(tVal).normalize();
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const side = p % 2 === 0 ? 1 : -1;

    // Concrete utility pole right on the outer footpath edge
    const polePos = pt.clone().addScaledVector(right, side * (sidewalkCenterOffset + 0.9));
    const pole = new THREE.Group();
    pole.position.set(polePos.x, 0.075, polePos.z);

    // Slight realistic tilt
    pole.rotation.z = (Math.random() - 0.5) * 0.06;
    pole.rotation.x = (Math.random() - 0.5) * 0.06;

    // Tall rectangular concrete pole
    const pGeo = new THREE.BoxGeometry(0.24, 7.8, 0.24);
    const pMesh = new THREE.Mesh(pGeo, concretePoleMat);
    pMesh.position.y = 3.9;
    pMesh.castShadow = true;
    pole.add(pMesh);

    // Crossarm bracket
    const armGeo = new THREE.BoxGeometry(1.6, 0.12, 0.12);
    const arm = new THREE.Mesh(armGeo, darkMetalMat);
    arm.position.y = 7.1;
    pole.add(arm);

    // Porcelain insulator cups on crossarm
    const insGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.16, 6);
    const insMat = new THREE.MeshStandardMaterial({ color: 0x48cae4, roughness: 0.3 });
    const ins1 = new THREE.Mesh(insGeo, insMat);
    ins1.position.set(-0.65, 7.22, 0);
    const ins2 = new THREE.Mesh(insGeo, insMat);
    ins2.position.set(0.65, 7.22, 0);
    pole.add(ins1, ins2);

    clutterGroup.add(pole);

    poleLocations.push({
      topPos: new THREE.Vector3(polePos.x, 7.2, polePos.z),
      t: tVal,
    });
  }

  // Connect pole-to-pole with tangled catenary wire curves
  const cableMat = new THREE.LineBasicMaterial({ color: 0x111111, linewidth: 2 });
  for (let i = 0; i < poleLocations.length; i++) {
    const pA = poleLocations[i].topPos;
    const pB = poleLocations[(i + 1) % poleLocations.length].topPos;

    // Midpoint with catenary sag
    const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
    mid.y -= 1.1 + (i % 3) * 0.3; // Cable sag

    const cableCurve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
    const cableGeo = new THREE.BufferGeometry().setFromPoints(cableCurve.getPoints(12));
    const cableLine = new THREE.Line(cableGeo, cableMat);
    clutterGroup.add(cableLine);

    // Dangling orange marigold festival garland every 4th span
    if (i % 4 === 0) {
      const gendaGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const gendaMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
      for (let g = 0.3; g <= 0.7; g += 0.08) {
        const flowerPos = cableCurve.getPoint(g);
        const flower = new THREE.Mesh(gendaGeo, gendaMat);
        flower.position.copy(flowerPos);
        clutterGroup.add(flower);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 5. DISTRIBUTE PROPS ALONG THE FOOTPATHS
  // --------------------------------------------------------------------------
  // Strategic placement along the track loop
  const thelaSpans = [0.08, 0.32, 0.56, 0.81];
  thelaSpans.forEach((tVal, idx) => {
    const pt = trackCurve.getPointAt(tVal);
    const tan = trackCurve.getTangentAt(tVal).normalize();
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    const pos = pt.clone().addScaledVector(right, (idx % 2 === 0 ? 1 : -1) * sidewalkCenterOffset);
    clutterGroup.add(createVegetableThela(pos, yaw + (idx % 2 === 0 ? 0.2 : -0.2)));
  });

  const tapriSpans = [0.18, 0.44, 0.70, 0.92];
  tapriSpans.forEach((tVal, idx) => {
    const pt = trackCurve.getPointAt(tVal);
    const tan = trackCurve.getTangentAt(tVal).normalize();
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    const pos = pt.clone().addScaledVector(right, (idx % 2 === 0 ? -1 : 1) * (sidewalkCenterOffset + 0.4));
    clutterGroup.add(createChaiTapri(pos, yaw + (idx % 2 === 0 ? Math.PI : 0)));
  });

  const detailSpans = [0.12, 0.24, 0.38, 0.50, 0.64, 0.76, 0.86, 0.96];
  detailSpans.forEach((tVal, idx) => {
    const pt = trackCurve.getPointAt(tVal);
    const tan = trackCurve.getTangentAt(tVal).normalize();
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    const side = idx % 2 === 0 ? 1 : -1;
    const basePos = pt.clone().addScaledVector(right, side * sidewalkCenterOffset);

    if (idx % 4 === 0) {
      clutterGroup.add(createMunicipalDustbin(basePos, yaw));
    } else if (idx % 4 === 1) {
      clutterGroup.add(createTireStack(basePos, yaw));
      const drumPos = basePos.clone().addScaledVector(tan, 1.4);
      clutterGroup.add(createPlasticWaterDrum(drumPos));
    } else if (idx % 4 === 2) {
      clutterGroup.add(createSacredCow(basePos, yaw + Math.PI / 2));
    } else {
      clutterGroup.add(createStrayStreetDog(basePos, yaw));
    }
  });

  // --------------------------------------------------------------------------
  // 6. FUNNY HINDI WALL STENCILS & BOLLYWOOD POSTERS ALONG CORRIDORS
  // --------------------------------------------------------------------------
  const stencilSpans = [0.15, 0.35, 0.60, 0.85];
  const pissStencilTex = createPissingFineStencilTexture();
  const stencilMat = new THREE.MeshBasicMaterial({ map: pissStencilTex, transparent: true });
  const stencilGeo = new THREE.PlaneGeometry(3.6, 1.1);

  stencilSpans.forEach((tVal, idx) => {
    const pt = trackCurve.getPointAt(tVal);
    const tan = trackCurve.getTangentAt(tVal).normalize();
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    // Placed on low building walls along footpath
    const wallPos = pt.clone().addScaledVector(right, (idx % 2 === 0 ? 1 : -1) * (halfWidth + 3.8));
    const stencilMesh = new THREE.Mesh(stencilGeo, stencilMat);
    stencilMesh.position.set(wallPos.x, 1.2, wallPos.z);
    stencilMesh.rotation.y = yaw + (idx % 2 === 0 ? -Math.PI / 2 : Math.PI / 2);
    clutterGroup.add(stencilMesh);

    // Retro Bollywood poster pasted next to it
    const posterTex = createRetroBollywoodPosterTexture(idx);
    const posterMat = new THREE.MeshBasicMaterial({ map: posterTex });
    const posterGeo = new THREE.PlaneGeometry(1.4, 2.0);
    const posterMesh = new THREE.Mesh(posterGeo, posterMat);
    const posterPos = wallPos.clone().addScaledVector(tan, 2.4);
    posterMesh.position.set(posterPos.x, 1.8, posterPos.z);
    posterMesh.rotation.y = stencilMesh.rotation.y;
    clutterGroup.add(posterMesh);
  });

  // --------------------------------------------------------------------------
  // 6. SCATTERING FLOCKS OF DESI STREET PIGEONS (Sprint 10)
  // --------------------------------------------------------------------------
  const pigeonFlocks = [];
  const pigeonBodyMat = new THREE.MeshStandardMaterial({ color: 0x5a6578, roughness: 0.8, flatShading: true });
  const pigeonCollarMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.6 });
  const pigeonWingMat = new THREE.MeshStandardMaterial({ color: 0x7c8c9e, roughness: 0.8 });
  const pigeonBeakMat = new THREE.MeshStandardMaterial({ color: 0xff7b00, roughness: 0.5 });

  function createLowPolyPigeon() {
    const pigeon = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.12, 0.22);
    const body = new THREE.Mesh(bodyGeo, pigeonBodyMat);
    body.position.y = 0.08;
    body.castShadow = true;
    pigeon.add(body);

    // Iridescent Neck Collar
    const collarGeo = new THREE.BoxGeometry(0.09, 0.07, 0.09);
    const collar = new THREE.Mesh(collarGeo, pigeonCollarMat);
    collar.position.set(0, 0.13, 0.08);
    pigeon.add(collar);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.16, 0.1);
    const headGeo = new THREE.BoxGeometry(0.08, 0.08, 0.09);
    const headMesh = new THREE.Mesh(headGeo, pigeonBodyMat);
    headGroup.add(headMesh);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.02, 0.06, 4);
    const beak = new THREE.Mesh(beakGeo, pigeonBeakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, -0.01, 0.06);
    headGroup.add(beak);
    pigeon.add(headGroup);

    // Wings (Flap during flight)
    const wingGeo = new THREE.BoxGeometry(0.18, 0.02, 0.14);
    const wingL = new THREE.Mesh(wingGeo, pigeonWingMat);
    wingL.position.set(-0.11, 0.1, 0.01);
    const wingR = new THREE.Mesh(wingGeo, pigeonWingMat);
    wingR.position.set(0.11, 0.1, 0.01);
    pigeon.add(wingL, wingR);

    // Tail feathers
    const tailGeo = new THREE.BoxGeometry(0.09, 0.015, 0.12);
    const tailMesh = new THREE.Mesh(tailGeo, pigeonBodyMat);
    tailMesh.position.set(0, 0.09, -0.14);
    tailMesh.rotation.x = -0.2;
    pigeon.add(tailMesh);

    return {
      group: pigeon,
      head: headGroup,
      wingL,
      wingR,
      homePos: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      isFlying: false,
      flightTimer: 0,
      peckPhase: Math.random() * Math.PI * 2,
    };
  }

  // Spawn flocks resting on the road/curb near the fruit/vegetable carts
  thelaSpans.forEach((tVal, fIdx) => {
    const pt = trackCurve.getPointAt(tVal);
    const tan = trackCurve.getTangentAt(tVal).normalize();
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const side = fIdx % 2 === 0 ? 1 : -1;
    // Position on curb/road edge (offset ~4.2m)
    const flockCenter = pt.clone().addScaledVector(right, side * (trackWidth / 2 - 2.8));

    const flock = [];
    const numPigeons = 5 + (fIdx % 3);
    for (let i = 0; i < numPigeons; i++) {
      const p = createLowPolyPigeon();
      const ox = (Math.random() - 0.5) * 2.2;
      const oz = (Math.random() - 0.5) * 2.2;
      p.homePos.set(flockCenter.x + ox, 0.04, flockCenter.z + oz);
      p.group.position.copy(p.homePos);
      p.group.rotation.y = Math.random() * Math.PI * 2;
      clutterGroup.add(p.group);
      flock.push(p);
    }
    pigeonFlocks.push(flock);
  });

  /**
   * Animates pigeons pecking on the ground and scattering into the air when vehicles approach
   */
  function updatePigeons(dt, vehiclePos, rivals = []) {
    const now = performance.now() * 0.001;

    pigeonFlocks.forEach((flock) => {
      // Check if player or any rival is approaching this flock
      let shouldScatter = false;
      let threatPos = null;

      if (vehiclePos) {
        const distToPlayer = flock[0].group.position.distanceTo(vehiclePos);
        if (distToPlayer < 8.5) {
          shouldScatter = true;
          threatPos = vehiclePos;
        }
      }

      if (!shouldScatter && rivals && rivals.length > 0) {
        for (let r of rivals) {
          if (r.position && flock[0].group.position.distanceTo(r.position) < 8.0) {
            shouldScatter = true;
            threatPos = r.position;
            break;
          }
        }
      }

      flock.forEach((p) => {
        if (shouldScatter && !p.isFlying) {
          p.isFlying = true;
          p.flightTimer = 4.2 + Math.random() * 2.0;

          // Scatter launch velocity: upward + outwards away from vehicle
          const away = new THREE.Vector3().subVectors(p.group.position, threatPos).normalize();
          away.y = 0;
          const launchSpeed = 4.0 + Math.random() * 3.5;
          p.velocity.set(
            away.x * launchSpeed + (Math.random() - 0.5) * 2.0,
            4.8 + Math.random() * 2.5,
            away.z * launchSpeed + (Math.random() - 0.5) * 2.0
          );
        }

        if (p.isFlying) {
          p.flightTimer -= dt;

          // Physics integration
          p.group.position.addScaledVector(p.velocity, dt);

          // Furious wing flapping animation during flight
          const flap = Math.sin(now * 38.0 + p.peckPhase) * 0.75;
          p.wingL.rotation.z = flap;
          p.wingR.rotation.z = -flap;

          // Drag and circling behavior
          if (p.group.position.y > 6.5) {
            p.velocity.y *= 0.94;
            p.velocity.x += Math.sin(now * 2.0 + p.peckPhase) * 1.5 * dt;
            p.velocity.z += Math.cos(now * 2.0 + p.peckPhase) * 1.5 * dt;
          }

          // Face velocity direction
          if (p.velocity.lengthSq() > 0.1) {
            p.group.rotation.y = Math.atan2(p.velocity.x, p.velocity.z);
          }

          // Landing sequence when flight timer expires
          if (p.flightTimer <= 0) {
            // Glide smoothly back towards home position
            const toHome = new THREE.Vector3().subVectors(p.homePos, p.group.position);
            p.velocity.lerp(toHome.multiplyScalar(1.2), 2.5 * dt);
            p.velocity.y = -2.2;

            if (p.group.position.y <= p.homePos.y + 0.05) {
              p.group.position.copy(p.homePos);
              p.velocity.set(0, 0, 0);
              p.isFlying = false;
              p.wingL.rotation.z = 0;
              p.wingR.rotation.z = 0;
            }
          }
        } else {
          // Idle Pecking Animation on Ground
          p.peckPhase += dt * 4.5;
          const isPecking = Math.sin(p.peckPhase) > 0.6;
          p.head.rotation.x = isPecking ? 0.45 : -0.05;

          // Occasional tiny waddle
          if (Math.sin(p.peckPhase * 0.5) > 0.85) {
            p.group.rotation.y += (Math.random() - 0.5) * 0.12;
          }
        }
      });
    });
  }

  scene.add(clutterGroup);
  return {
    clutterGroup,
    updatePigeons,
  };
}

