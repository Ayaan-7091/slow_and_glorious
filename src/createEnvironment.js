import * as THREE from 'three';
import { createUrbanGroundTexture } from './createStreetTextures.js';

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

export function createEnvironment(scene, trackCurve = null) {
  const envGroup = new THREE.Group();
  envGroup.name = 'Environment_Sky_Terrain';

  // --------------------------------------------------------------------------
  // 1. SKY DOME WITH PROCEDURAL GRADIENT SHADER
  // --------------------------------------------------------------------------
  // Inverted sphere surrounding the entire race circuit
  const skyGeo = new THREE.SphereGeometry(520, 32, 24);
  
  // Color Palettes: Daylight Sunset -> Moody Twilight / Deep Dusk
  const dayTop = new THREE.Color(0x2880c4);     // Cerulean daylight
  const dayMid = new THREE.Color(0x6eb7e8);     // Azure
  const dayHorizon = new THREE.Color(0xfed09d); // Warm golden-peach

  const duskTop = new THREE.Color(0x130d32);    // Deep twilight violet-indigo
  const duskMid = new THREE.Color(0x6a2c68);    // Rich magenta/purple
  const duskHorizon = new THREE.Color(0xff5719);// Burning embers orange-red
  
  // Custom Vertex & Fragment Shaders for smooth atmospheric gradient
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: dayTop.clone() },
      midColor: { value: dayMid.clone() },
      horizonColor: { value: dayHorizon.clone() },
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
  const daySunPos = new THREE.Vector3(160, 180, 220);
  const duskSunPos = new THREE.Vector3(160, 26, 220);
  sunGroup.position.copy(daySunPos);

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
    
    const posX = (Math.random() - 0.5) * 650;
    const posY = 110 + Math.random() * 60;
    const posZ = (Math.random() - 0.5) * 650;
    cloud.position.set(posX, posY, posZ);

    envGroup.add(cloud);
    clouds.push({
      mesh: cloud,
      speed: 1.5 + Math.random() * 2.5,
    });
  }

  // --------------------------------------------------------------------------
  // 4. STREET & SHOP WARM POINT-LIGHTS (Turn on during Dusk)
  // --------------------------------------------------------------------------
  const duskPointLights = [];
  const lampSphereGeo = new THREE.SphereGeometry(0.32, 10, 10);
  const lampSphereMat = new THREE.MeshBasicMaterial({
    color: 0xffea88,
    transparent: true,
    opacity: 0.2,
  });

  if (trackCurve) {
    // 8 Strategic lamp light posts distributed around the track perimeter
    const lampTs = [0.06, 0.18, 0.32, 0.44, 0.58, 0.70, 0.82, 0.94];
    lampTs.forEach((tVal, idx) => {
      const pt = trackCurve.getPointAt(tVal);
      const tan = trackCurve.getTangentAt(tVal).normalize();
      const normal = new THREE.Vector3(-tan.z, 0, tan.x);
      const side = idx % 2 === 0 ? 8.2 : -8.2;
      const lightPos = new THREE.Vector3(
        pt.x + normal.x * side,
        4.8,
        pt.z + normal.z * side
      );

      const pLight = new THREE.PointLight(0xffa834, 0.0, 36, 1.7);
      pLight.position.copy(lightPos);
      envGroup.add(pLight);

      const lampGlowMesh = new THREE.Mesh(lampSphereGeo, lampSphereMat.clone());
      lampGlowMesh.position.copy(lightPos);
      envGroup.add(lampGlowMesh);

      duskPointLights.push({ light: pLight, mesh: lampGlowMesh });
    });
  }

  // --------------------------------------------------------------------------
  // 5. URBAN CITY PAVEMENT & COURTYARD GROUND BASE (Never Desert)
  // --------------------------------------------------------------------------
  const terrainGeo = new THREE.PlaneGeometry(1200, 1200, 32, 32);
  const urbanGroundTex = createUrbanGroundTexture();
  const terrainMat = new THREE.MeshStandardMaterial({
    map: urbanGroundTex,
    color: 0xffffff,
    roughness: 0.92,
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
      if (c.mesh.position.x > 350) {
        c.mesh.position.x = -350;
      }
    });
  }

  /**
   * Smoothly transitions the sky, sun disc, clouds, and streetlights from golden hour to dusk.
   * @param {number} factor - Transition progress [0.0 (Daylight) to 1.0 (Deep Dusk)]
   */
  function setDuskProgress(factor) {
    const f = Math.max(0.0, Math.min(1.0, factor));

    // 1. Lerp Sky Dome gradient colors
    skyMat.uniforms.topColor.value.copy(dayTop).lerp(duskTop, f);
    skyMat.uniforms.midColor.value.copy(dayMid).lerp(duskMid, f);
    skyMat.uniforms.horizonColor.value.copy(dayHorizon).lerp(duskHorizon, f);

    // 2. Sun lowers toward the horizon and burns deep orange-red
    sunGroup.position.lerpVectors(daySunPos, duskSunPos, f);
    sunGroup.lookAt(0, 0, 0);

    const sunCoreColor = new THREE.Color(0xffffff).lerp(new THREE.Color(0xff4500), f);
    sunCoreMat.color.copy(sunCoreColor);

    const sunGlowColor = new THREE.Color(0xffe099).lerp(new THREE.Color(0xff2a00), f);
    sunGlowMat.color.copy(sunGlowColor);
    sunGlowMat.opacity = 0.45 + f * 0.35;

    // 3. Clouds take on pink/purple sunset tint
    const cloudColor = new THREE.Color(0xffffff).lerp(new THREE.Color(0xcaa2b8), f);
    cloudMat.color.copy(cloudColor);

    // 4. Streetlamps and shop point lights gradually illuminate
    // Smoothstep ramp so lights turn on as twilight sets in (f > 0.35)
    const lightIntensity = Math.pow(Math.max(0.0, (f - 0.25) / 0.75), 1.6) * 2.6;
    duskPointLights.forEach(({ light, mesh }) => {
      light.intensity = lightIntensity;
      mesh.material.opacity = 0.2 + (lightIntensity / 2.6) * 0.8;
    });
  }

  return {
    envGroup,
    updateClouds,
    setDuskProgress,
  };
}

