import * as THREE from 'three';

/**
 * ============================================================================
 * 3D ENVIRONMENT, SKY DOME & CLOUDS SYSTEM (Sprint 4)
 * ============================================================================
 * 
 * Features:
 *  1. Large 3D Sky Dome with gradient shader: rich daylight cerulean blue at zenith
 *     transitioning to warm golden-peach at the horizon.
 *  2. Glowing 3D Sun disc with warm corona.
 *  3. 18 Puffy low-poly cloud clusters drifting slowly across the sky.
 *  4. Sandy-ochre Indian earth terrain (#d4a373) with lush grassy patches (#6a994e).
 */

export function createEnvironment(scene) {
  const envGroup = new THREE.Group();
  envGroup.name = 'Environment_Sky_Terrain';

  // --------------------------------------------------------------------------
  // 1. SKY DOME WITH PROCEDURAL GRADIENT SHADER
  // --------------------------------------------------------------------------
  // Inverted sphere surrounding the entire race circuit
  const skyGeo = new THREE.SphereGeometry(520, 32, 24);
  
  // Custom Vertex & Fragment Shaders for smooth atmospheric gradient
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x2880c4) },    // Rich daylight cerulean blue
      midColor: { value: new THREE.Color(0x6eb7e8) },    // Soft azure sky
      horizonColor: { value: new THREE.Color(0xfed09d) },// Warm golden-peach
      offset: { value: 20 },
      exponent: { value: 0.65 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 horizonColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        float factor = max(pow(max(h, 0.0), exponent), 0.0);
        vec3 col = mix(horizonColor, midColor, smoothstep(0.0, 0.35, factor));
        col = mix(col, topColor, smoothstep(0.35, 1.0, factor));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  envGroup.add(skyDome);

  // --------------------------------------------------------------------------
  // 2. GLOWING 3D SUN DISC
  // --------------------------------------------------------------------------
  const sunGroup = new THREE.Group();
  // Angled low in the afternoon sky
  sunGroup.position.set(160, 180, 220);

  // Sun core disc
  const sunCoreGeo = new THREE.CircleGeometry(16, 24);
  const sunCoreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const sunCore = new THREE.Mesh(sunCoreGeo, sunCoreMat);
  sunGroup.add(sunCore);

  // Sun outer golden halo glow
  const sunGlowGeo = new THREE.CircleGeometry(38, 24);
  const sunGlowMat = new THREE.MeshBasicMaterial({
    color: 0xffe099,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
  sunGlow.position.z = -0.5;
  sunGroup.add(sunGlow);

  sunGroup.lookAt(0, 0, 0); // Face towards center of track
  envGroup.add(sunGroup);

  // --------------------------------------------------------------------------
  // 3. PUFFY LOW-POLY 3D CLOUDS DRIFTING SLOWLY
  // --------------------------------------------------------------------------
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true,
  });

  const clouds = [];
  const numClouds = 18;

  function createCloudCluster(scale = 1.0) {
    const cluster = new THREE.Group();
    // Low-poly cloud composed of overlapping spheres
    const numPuffs = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numPuffs; i++) {
      const radius = 6 + Math.random() * 6;
      const puffGeo = new THREE.DodecahedronGeometry(radius, 1);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(
        (i - numPuffs / 2) * 8 + (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 8
      );
      puff.castShadow = false;
      cluster.add(puff);
    }
    cluster.scale.setScalar(scale);
    return cluster;
  }

  for (let i = 0; i < numClouds; i++) {
    const scale = 0.8 + Math.random() * 0.8;
    const cloud = createCloudCluster(scale);
    
    // Spread clouds across the sky
    const posX = (Math.random() - 0.5) * 650;
    const posY = 110 + Math.random() * 60;
    const posZ = (Math.random() - 0.5) * 650;
    cloud.position.set(posX, posY, posZ);

    envGroup.add(cloud);
    clouds.push({
      mesh: cloud,
      speed: 1.5 + Math.random() * 2.5, // Drifting speed along X axis
    });
  }

  // --------------------------------------------------------------------------
  // 4. SANDY-OCHRE DUSTY TERRAIN & GRASSY PATCHES
  // --------------------------------------------------------------------------
  // Base dusty earth terrain
  const terrainGeo = new THREE.PlaneGeometry(900, 900, 32, 32);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0xd4a373, // Warm sandy-ochre / dusty Indian earth
    roughness: 0.95,
    metalness: 0.05,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = 0.0;
  terrain.receiveShadow = true;
  envGroup.add(terrain);

  scene.add(envGroup);

  /**
   * Updates drifting clouds animation
   */
  function updateClouds(dt) {
    clouds.forEach((c) => {
      c.mesh.position.x += c.speed * dt;
      // Wrap around when drifting beyond boundary
      if (c.mesh.position.x > 350) {
        c.mesh.position.x = -350;
      }
    });
  }

  return {
    envGroup,
    updateClouds,
  };
}

