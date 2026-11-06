import * as THREE from 'three';

/**
 * SparkParticleSystem
 * 
 * Manages lightweight square spark particles emitted from the rear wheels during drifting.
 * Uses a fixed pool of square plane meshes for optimal performance and easy understanding.
 */
export class SparkParticleSystem {
  constructor(scene, maxSparks = 60) {
    this.scene = scene;
    this.maxSparks = maxSparks;
    this.particles = [];

    // Square particle geometry
    const geo = new THREE.PlaneGeometry(0.14, 0.14);

    // Glowing unlit material with vertex/mesh colors
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffdd33,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    // Create pool
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

  /**
   * Spawn a spark at a specific 3D location with random ejection velocity
   * @param {THREE.Vector3} origin - Ground contact point of rear wheel
   * @param {THREE.Vector3} forwardDir - Current direction of vehicle
   */
  emitSpark(origin, forwardDir) {
    // Find first inactive particle in pool
    const p = this.particles.find(part => !part.active);
    if (!p) return; // Pool full, drop frame

    p.active = true;
    p.mesh.visible = true;
    p.life = 0;
    p.maxLife = 0.25 + Math.random() * 0.2;

    // Position spark slightly above asphalt
    p.mesh.position.copy(origin);
    p.mesh.position.y = 0.06 + Math.random() * 0.06;

    // Eject spark backwards with random spread and upward kick
    const backward = forwardDir.clone().negate().multiplyScalar(4 + Math.random() * 6);
    const lateralJitter = (Math.random() - 0.5) * 3;
    const upwardJitter = 1.0 + Math.random() * 2.5;

    p.velocity.set(
      backward.x + lateralJitter,
      upwardJitter,
      backward.z + lateralJitter
    );

    // Randomize initial square tilt
    p.mesh.rotation.x = Math.random() * Math.PI;
    p.mesh.rotation.y = Math.random() * Math.PI;
    p.mesh.rotation.z = Math.random() * Math.PI;
    p.baseScale = 0.8 + Math.random() * 0.6;
    p.mesh.scale.setScalar(p.baseScale);

    // Initial color: bright yellow spark
    p.mesh.material.color.setHex(0xffea20);
    p.mesh.material.opacity = 1.0;
  }

  /**
   * Update particle positions, apply gravity, fade color/scale, and recycle
   * @param {number} dt - delta time in seconds
   * @param {THREE.Camera} camera - used for billboarding face-to-camera
   */
  update(dt, camera) {
    const gravity = -14.0;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life += dt;
      const progress = p.life / p.maxLife;

      if (progress >= 1.0) {
        // Recycle
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      // Physics integration: move velocity and apply gravity
      p.velocity.y += gravity * dt;
      p.mesh.position.x += p.velocity.x * dt;
      p.mesh.position.y += p.velocity.y * dt;
      p.mesh.position.z += p.velocity.z * dt;

      // Don't fall through ground
      if (p.mesh.position.y < 0.02) {
        p.mesh.position.y = 0.02;
        p.velocity.y *= -0.3; // bounce slightly
        p.velocity.x *= 0.8;
        p.velocity.z *= 0.8;
      }

      // Shrink and fade
      const scale = p.baseScale * (1.0 - progress);
      p.mesh.scale.setScalar(Math.max(0.01, scale));

      // Color shifts: Bright yellow -> Orange -> Fiery Red
      if (progress < 0.4) {
        p.mesh.material.color.setHex(0xffea20);
      } else if (progress < 0.75) {
        p.mesh.material.color.setHex(0xff6e00);
      } else {
        p.mesh.material.color.setHex(0xd41100);
      }

      p.mesh.material.opacity = (1.0 - progress) * 0.95;

      // Face camera (billboarding)
      if (camera) {
        p.mesh.quaternion.copy(camera.quaternion);
      }
    }
  }
}

