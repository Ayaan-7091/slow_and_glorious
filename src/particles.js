import * as THREE from 'three';

/**
 * ============================================================================
 * PARTICLES & DYNAMIC ARCADE EFFECTS
 * ============================================================================
 * 
 * Includes:
 *  1. SparkParticleSystem: Yellow/orange drift sparks from rear tire contact
 *  2. NitroFlameSystem: Cyan/electric blue fiery exhaust flame particles during Boost
 *  3. TireSmokeSystem: Billowy soft white/gray tire smoke emitted during drifts & hard braking
 */

function createSmokeCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  grad.addColorStop(0.45, 'rgba(225, 230, 235, 0.55)');
  grad.addColorStop(0.8, 'rgba(190, 195, 205, 0.2)');
  grad.addColorStop(1, 'rgba(170, 175, 185, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * TireSmokeSystem
 * Heavy soft white/gray billowy smoke clouds emitted behind rear tires during drifts and braking
 */
export class TireSmokeSystem {
  constructor(scene, maxSmoke = 80) {
    this.scene = scene;
    this.maxSmoke = maxSmoke;
    this.particles = [];

    const smokeTex = createSmokeCanvasTexture();
    const geo = new THREE.PlaneGeometry(0.7, 0.7);
    const mat = new THREE.MeshBasicMaterial({
      map: smokeTex,
      color: 0xeeeeee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });

    for (let i = 0; i < maxSmoke; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.visible = false;
      this.scene.add(mesh);

      this.particles.push({
        mesh: mesh,
        active: false,
        velocity: new THREE.Vector3(),
        rotSpeed: (Math.random() - 0.5) * 3.5,
        life: 0,
        maxLife: 0.65,
        baseScale: 0.6,
      });
    }
  }

  emitSmoke(origin, forwardDir, vehicleSpeed = 0) {
    const p = this.particles.find((part) => !part.active);
    if (!p) return;

    p.active = true;
    p.mesh.visible = true;
    p.life = 0;
    p.maxLife = 0.55 + Math.random() * 0.35; // 0.55s - 0.9s duration

    p.mesh.position.copy(origin);
    p.mesh.position.y = 0.12 + Math.random() * 0.08;

    // Gentle backward ejection + billowy upward rise + lateral swirl
    const speedRatio = Math.min(1.0, Math.abs(vehicleSpeed) / 20.0);
    const backwardSpeed = 1.2 + speedRatio * 3.5;
    const backward = forwardDir.clone().negate().multiplyScalar(backwardSpeed);

    p.velocity.set(
      backward.x + (Math.random() - 0.5) * 1.5,
      0.8 + Math.random() * 1.4, // Upward buoyant rise
      backward.z + (Math.random() - 0.5) * 1.5
    );

    p.baseScale = 0.5 + Math.random() * 0.4;
    p.mesh.scale.setScalar(p.baseScale);
    p.mesh.rotation.z = Math.random() * Math.PI * 2;
    p.rotSpeed = (Math.random() - 0.5) * 3.0;
    p.mesh.material.opacity = 0.65;
  }

  update(dt, camera) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life += dt;
      const progress = p.life / p.maxLife;

      if (progress >= 1.0) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      // Drag / air resistance on smoke velocity
      p.velocity.x *= 0.96;
      p.velocity.z *= 0.96;
      p.velocity.y *= 0.98;

      p.mesh.position.x += p.velocity.x * dt;
      p.mesh.position.y += p.velocity.y * dt;
      p.mesh.position.z += p.velocity.z * dt;

      // Rapid initial expansion, billowing out
      const scale = p.baseScale * (1.0 + progress * 3.2);
      p.mesh.scale.setScalar(scale);

      // Smooth alpha fade out
      p.mesh.material.opacity = (1.0 - Math.pow(progress, 1.4)) * 0.65;

      if (camera) {
        p.mesh.quaternion.copy(camera.quaternion);
        p.mesh.rotateZ(p.rotSpeed * dt);
      }
    }
  }
}

/**
 * SparkParticleSystem
 * Lightweight pool of square particles for tire drift sparks
 */
export class SparkParticleSystem {
  constructor(scene, maxSparks = 70) {
    this.scene = scene;
    this.maxSparks = maxSparks;
    this.particles = [];

    const geo = new THREE.PlaneGeometry(0.14, 0.14);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffdd33,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    for (let i = 0; i < maxSparks; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.visible = false;
      this.scene.add(mesh);

      this.particles.push({
        mesh: mesh,
        active: false,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 0.35,
        baseScale: 1.0,
      });
    }
  }

  emitSpark(origin, forwardDir) {
    const p = this.particles.find((part) => !part.active);
    if (!p) return;

    p.active = true;
    p.mesh.visible = true;
    p.life = 0;
    p.maxLife = 0.22 + Math.random() * 0.18;

    p.mesh.position.copy(origin);
    p.mesh.position.y = 0.08 + Math.random() * 0.06;

    const backward = forwardDir.clone().negate().multiplyScalar(4 + Math.random() * 6);
    const lateralJitter = (Math.random() - 0.5) * 3;
    const upwardJitter = 1.0 + Math.random() * 2.5;

    p.velocity.set(
      backward.x + lateralJitter,
      upwardJitter,
      backward.z + lateralJitter
    );

    p.baseScale = 0.8 + Math.random() * 0.6;
    p.mesh.scale.setScalar(p.baseScale);
    p.mesh.material.color.setHex(0xffea20);
    p.mesh.material.opacity = 1.0;
  }

  update(dt, camera) {
    const gravity = -15.0;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life += dt;
      const progress = p.life / p.maxLife;

      if (progress >= 1.0) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      p.velocity.y += gravity * dt;
      p.mesh.position.x += p.velocity.x * dt;
      p.mesh.position.y += p.velocity.y * dt;
      p.mesh.position.z += p.velocity.z * dt;

      if (p.mesh.position.y < 0.04) {
        p.mesh.position.y = 0.04;
        p.velocity.y *= -0.25;
        p.velocity.x *= 0.8;
        p.velocity.z *= 0.8;
      }

      const scale = p.baseScale * (1.0 - progress);
      p.mesh.scale.setScalar(Math.max(0.01, scale));

      // Color shifts: Yellow -> Orange -> Deep Red
      if (progress < 0.35) {
        p.mesh.material.color.setHex(0xffea20);
      } else if (progress < 0.7) {
        p.mesh.material.color.setHex(0xff5500);
      } else {
        p.mesh.material.color.setHex(0xc91200);
      }

      p.mesh.material.opacity = (1.0 - progress) * 0.95;

      if (camera) {
        p.mesh.quaternion.copy(camera.quaternion);
      }
    }
  }
}

/**
 * NitroFlameSystem
 * High-intensity cyan/blue fiery exhaust particles emitted during Garam Chai Nitro Boost
 */
export class NitroFlameSystem {
  constructor(scene, maxParticles = 60) {
    this.scene = scene;
    this.particles = [];

    const geo = new THREE.PlaneGeometry(0.2, 0.2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });

    for (let i = 0; i < maxParticles; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.visible = false;
      this.scene.add(mesh);

      this.particles.push({
        mesh: mesh,
        active: false,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 0.22,
        baseScale: 1.0,
      });
    }
  }

  /**
   * Spawns a fiery nitro particle from the exhaust pipe
   * @param {THREE.Vector3} origin - Exhaust pipe tip in world space
   * @param {THREE.Vector3} forwardDir - Forward heading vector
   */
  emitFlame(origin, forwardDir) {
    const p = this.particles.find((part) => !part.active);
    if (!p) return;

    p.active = true;
    p.mesh.visible = true;
    p.life = 0;
    p.maxLife = 0.16 + Math.random() * 0.12;

    p.mesh.position.copy(origin);
    // Slight jitter around exhaust pipe
    p.mesh.position.x += (Math.random() - 0.5) * 0.08;
    p.mesh.position.y += (Math.random() - 0.5) * 0.08;
    p.mesh.position.z += (Math.random() - 0.5) * 0.08;

    // Fast ejection backward
    const speed = 12.0 + Math.random() * 8.0;
    const backward = forwardDir.clone().negate().multiplyScalar(speed);
    const jitter = 1.2;

    p.velocity.set(
      backward.x + (Math.random() - 0.5) * jitter,
      (Math.random() - 0.3) * jitter,
      backward.z + (Math.random() - 0.5) * jitter
    );

    p.baseScale = 0.7 + Math.random() * 0.6;
    p.mesh.scale.setScalar(p.baseScale);
    p.mesh.material.color.setHex(0x00f0ff);
    p.mesh.material.opacity = 1.0;
  }

  update(dt, camera) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life += dt;
      const progress = p.life / p.maxLife;

      if (progress >= 1.0) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      p.mesh.position.x += p.velocity.x * dt;
      p.mesh.position.y += p.velocity.y * dt;
      p.mesh.position.z += p.velocity.z * dt;

      // Expansion and fade
      const scale = p.baseScale * (1.0 + progress * 1.5);
      p.mesh.scale.setScalar(scale);

      // Color shifts: Intense White/Cyan -> Electric Blue -> Deep Violet/Purple
      if (progress < 0.3) {
        p.mesh.material.color.setHex(0xe0ffff); // White-cyan core
      } else if (progress < 0.65) {
        p.mesh.material.color.setHex(0x00d4ff); // Vivid neon cyan
      } else {
        p.mesh.material.color.setHex(0x7928ca); // Hot violet
      }

      p.mesh.material.opacity = (1.0 - progress) * 0.9;

      if (camera) {
        p.mesh.quaternion.copy(camera.quaternion);
      }
    }
  }
}

/**
 * RainParticleSystem
 * 1400 fast-falling vertical rain streaks bounding around the player camera during Monsoon Weather
 */
export class RainParticleSystem {
  constructor(scene, numDrops = 1400) {
    this.scene = scene;
    this.numDrops = numDrops;
    this.visible = false;

    const positions = new Float32Array(numDrops * 6);
    const colors = new Float32Array(numDrops * 6);

    const range = 70.0;
    const heightRange = 34.0;

    for (let i = 0; i < numDrops; i++) {
      const idx = i * 6;
      const x = (Math.random() - 0.5) * range;
      const y = Math.random() * heightRange;
      const z = (Math.random() - 0.5) * range;
      const streakLen = 0.85 + Math.random() * 0.75;

      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;

      positions[idx + 3] = x + 0.1;
      positions[idx + 4] = y - streakLen;
      positions[idx + 5] = z;

      for (let v = 0; v < 2; v++) {
        colors[idx + v * 3] = 0.75;
        colors[idx + v * 3 + 1] = 0.88;
        colors[idx + v * 3 + 2] = 0.98;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });

    this.mesh = new THREE.LineSegments(geo, mat);
    this.mesh.visible = false;
    this.scene.add(this.mesh);

    this.range = range;
    this.heightRange = heightRange;
    this.fallSpeed = 44.0;
  }

  setVisible(visible) {
    this.visible = visible;
    this.mesh.visible = visible;
  }

  update(dt, cameraPos) {
    if (!this.visible || !this.mesh.visible) return;

    const posAttr = this.mesh.geometry.attributes.position;
    const posArr = posAttr.array;
    const camX = cameraPos ? cameraPos.x : 0;
    const camZ = cameraPos ? cameraPos.z : 0;

    const deltaY = this.fallSpeed * dt;
    const halfR = this.range / 2;

    for (let i = 0; i < this.numDrops; i++) {
      const idx = i * 6;
      posArr[idx + 1] -= deltaY;
      posArr[idx + 4] -= deltaY;

      if (posArr[idx + 4] <= 0 || Math.abs(posArr[idx] - camX) > halfR || Math.abs(posArr[idx + 2] - camZ) > halfR) {
        const x = camX + (Math.random() - 0.5) * this.range;
        const y = 16.0 + Math.random() * (this.heightRange - 16.0);
        const z = camZ + (Math.random() - 0.5) * this.range;
        const streakLen = 0.85 + Math.random() * 0.75;

        posArr[idx] = x;
        posArr[idx + 1] = y;
        posArr[idx + 2] = z;

        posArr[idx + 3] = x + 0.1;
        posArr[idx + 4] = y - streakLen;
        posArr[idx + 5] = z;
      }
    }

    posAttr.needsUpdate = true;
  }
}

/**
 * WaterSplashSystem
 * Water spray droplets and road spray kicking up under tires on wet monsoon asphalt
 */
export class WaterSplashSystem {
  constructor(scene, maxSplashes = 90) {
    this.scene = scene;
    this.maxSplashes = maxSplashes;
    this.particles = [];

    const splashCanvas = document.createElement('canvas');
    splashCanvas.width = 32;
    splashCanvas.height = 32;
    const sctx = splashCanvas.getContext('2d');
    const grad = sctx.createRadialGradient(16, 16, 2, 16, 16, 15);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.5, 'rgba(215, 238, 255, 0.55)');
    grad.addColorStop(1, 'rgba(180, 220, 255, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 32, 32);

    const splashTex = new THREE.CanvasTexture(splashCanvas);
    const geo = new THREE.PlaneGeometry(0.35, 0.35);
    const mat = new THREE.MeshBasicMaterial({
      map: splashTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < maxSplashes; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.visible = false;
      this.scene.add(mesh);

      this.particles.push({
        mesh,
        active: false,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 0.32,
        baseScale: 1.0,
      });
    }
  }

  emitSplash(origin, forwardDir, vehicleSpeed = 0) {
    const p = this.particles.find((part) => !part.active);
    if (!p) return;

    p.active = true;
    p.mesh.visible = true;
    p.life = 0;
    p.maxLife = 0.22 + Math.random() * 0.16;

    p.mesh.position.copy(origin);
    p.mesh.position.y = 0.05 + Math.random() * 0.04;

    const speed = Math.abs(vehicleSpeed);
    const backwardSpeed = 2.0 + speed * 0.25;
    const backward = forwardDir.clone().negate().multiplyScalar(backwardSpeed);

    p.velocity.set(
      backward.x + (Math.random() - 0.5) * 2.5,
      1.2 + Math.random() * 1.8,
      backward.z + (Math.random() - 0.5) * 2.5
    );

    p.baseScale = 0.6 + Math.random() * 0.5;
    p.mesh.scale.setScalar(p.baseScale);
    p.mesh.material.opacity = 0.75;
  }

  update(dt, camera) {
    const gravity = -14.0;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life += dt;
      const progress = p.life / p.maxLife;

      if (progress >= 1.0) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      p.velocity.y += gravity * dt;
      p.mesh.position.x += p.velocity.x * dt;
      p.mesh.position.y += p.velocity.y * dt;
      p.mesh.position.z += p.velocity.z * dt;

      if (p.mesh.position.y < 0.02) {
        p.mesh.position.y = 0.02;
        p.velocity.y = 0;
      }

      const scale = p.baseScale * (1.0 + progress * 2.0);
      p.mesh.scale.setScalar(scale);
      p.mesh.material.opacity = (1.0 - progress) * 0.75;

      if (camera) {
        p.mesh.quaternion.copy(camera.quaternion);
      }
    }
  }
}
