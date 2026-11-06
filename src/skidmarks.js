import * as THREE from 'three';

/**
 * ============================================================================
 * TIRE SKID MARKS SYSTEM
 * ============================================================================
 * 
 * Generates persistent dark rubber skid marks on the road surface during
 * power drifts and heavy braking. Gradually fades over time.
 */

export class SkidMarkSystem {
  constructor(scene, maxSegments = 180) {
    this.scene = scene;
    this.maxSegments = maxSegments;
    this.segments = [];

    // Shared plane geometry for skid marks
    const geo = new THREE.PlaneGeometry(0.3, 0.9);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x111115,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });

    for (let i = 0; i < maxSegments; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.054; // Sits just above asphalt
      mesh.visible = false;
      this.scene.add(mesh);

      this.segments.push({
        mesh: mesh,
        active: false,
        life: 0,
        maxLife: 3.5, // Fades over 3.5 seconds
      });
    }

    this.lastSpawnDist = 0;
  }

  /**
   * Spawns a skid mark segment at wheel contact point
   */
  spawnMark(wheelPos, heading) {
    const s = this.segments.find((seg) => !seg.active);
    if (!s) {
      // Recycle oldest segment
      const oldest = this.segments.reduce((prev, curr) => (prev.life > curr.life ? prev : curr));
      oldest.active = true;
      oldest.mesh.visible = true;
      oldest.life = 0;
      oldest.mesh.position.set(wheelPos.x, 0.054, wheelPos.z);
      oldest.mesh.rotation.z = -heading;
      oldest.mesh.material.opacity = 0.65;
      return;
    }

    s.active = true;
    s.mesh.visible = true;
    s.life = 0;
    s.mesh.position.set(wheelPos.x, 0.054, wheelPos.z);
    s.mesh.rotation.z = -heading;
    s.mesh.material.opacity = 0.65;
  }

  /**
   * Fades out active skid mark segments over time
   */
  update(dt) {
    for (let i = 0; i < this.segments.length; i++) {
      const s = this.segments[i];
      if (!s.active) continue;

      s.life += dt;
      const progress = s.life / s.maxLife;

      if (progress >= 1.0) {
        s.active = false;
        s.mesh.visible = false;
      } else {
        s.mesh.material.opacity = (1.0 - progress) * 0.65;
      }
    }
  }
}

