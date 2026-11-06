import * as THREE from 'three';

/**
 * ============================================================================
 * PARTICLES & DYNAMIC ARCADE EFFECTS
 * ============================================================================
 * 
 * Includes:
 *  1. SparkParticleSystem: Yellow/orange drift sparks from rear tire contact
 *  2. NitroFlameSystem: Cyan/electric blue fiery exhaust flame particles during Boost
 */

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
