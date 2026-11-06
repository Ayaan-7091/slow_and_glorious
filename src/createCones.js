import * as THREE from 'three';

/**
 * createCones
 * 
 * Spawns 20 colorful, stylized traffic cones in an engaging slalom & track layout.
 * Each cone has a square weighted base, an orange cone body, and reflective white stripes.
 * 
 * Returns:
 *  - conesGroup: THREE.Group containing all cone meshes
 *  - coneDataList: array of cone objects with positions, radii, and tumble state for arcade collisions!
 */
export function createCones(scene) {
  const conesGroup = new THREE.Group();
  conesGroup.name = 'TrafficCones_Group';

  // Materials
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.8,
  });

  const coneOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xff5500,
    roughness: 0.35,
  });

  const stripeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,
    roughness: 0.2,
  });

  // Reusable cone geometry components
  const baseGeo = new THREE.BoxGeometry(0.55, 0.05, 0.55);
  const bodyGeo = new THREE.CylinderGeometry(0.04, 0.24, 0.75, 16);
  const stripeGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.18, 16);

  // 20 Strategic positions forming a slalom circuit, drift circle, and speed straightaway
  const conePositions = [
    // Slalom Section (S-curve weave)
    { x: 0, z: 8 },
    { x: -3.5, z: 16 },
    { x: 3.5, z: 24 },
    { x: -4.0, z: 32 },
    { x: 4.0, z: 40 },
    { x: 0, z: 48 },

    // Drift Roundabout Circle
    { x: -16, z: 15 },
    { x: -22, z: 22 },
    { x: -22, z: 32 },
    { x: -16, z: 38 },
    { x: -8, z: 32 },
    { x: -8, z: 22 },

    // High-speed chicane section
    { x: 14, z: 10 },
    { x: 20, z: 18 },
    { x: 16, z: 26 },
    { x: 22, z: 34 },

    // Rear / perimeter markers
    { x: -10, z: -8 },
    { x: 10, z: -8 },
    { x: -15, z: -18 },
    { x: 15, z: -18 },
  ];

  const coneDataList = [];

  conePositions.forEach((pos, idx) => {
    const singleCone = new THREE.Group();
    singleCone.name = `Cone_${idx + 1}`;

    // 1. Square base
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.025;
    base.castShadow = true;
    base.receiveShadow = true;
    singleCone.add(base);

    // 2. Conical body
    const body = new THREE.Mesh(bodyGeo, coneOrangeMat);
    body.position.y = 0.4;
    body.castShadow = true;
    singleCone.add(body);

    // 3. Reflective white stripe
    const stripe = new THREE.Mesh(stripeGeo, stripeWhiteMat);
    stripe.position.y = 0.38;
    stripe.castShadow = true;
    singleCone.add(stripe);

    // Position in world space
    singleCone.position.set(pos.x, 0, pos.z);
    conesGroup.add(singleCone);

    // Keep track for lightweight arcade collision/nudge
    coneDataList.push({
      mesh: singleCone,
      basePos: new THREE.Vector3(pos.x, 0, pos.z),
      radius: 0.6,
      tiltVel: new THREE.Vector3(0, 0, 0),
      isHit: false,
    });
  });

  if (scene) {
    scene.add(conesGroup);
  }

  return { conesGroup, coneDataList };
}

