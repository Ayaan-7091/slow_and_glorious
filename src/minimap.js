import * as THREE from 'three';

/**
 * ============================================================================
 * INTERACTIVE MINIMAP / TRACK RADAR SYSTEM
 * ============================================================================
 * 
 * Renders a lightweight, high-performance 2D vector radar of the track circuit
 * on an HTML5 canvas overlay. Shows real-time blips for:
 *  - Player (Bright Yellow with directional heading arrow)
 *  - Raju (Vibrant Green)
 *  - Babloo (Vibrant Pink)
 *  - Munna (Electric Cyan)
 *  - Start/Finish Line & Checkpoint Gates
 */

export class MinimapRadar {
  constructor(canvasId, trackCurve, numSegments = 160) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.trackCurve = trackCurve;

    // Precompute 2D track points and bounding box
    this.trackPoints2D = [];
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i <= numSegments; i++) {
      const pt = trackCurve.getPointAt((i / numSegments) % 1.0);
      this.trackPoints2D.push({ x: pt.x, z: pt.z });

      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.z < minZ) minZ = pt.z;
      if (pt.z > maxZ) maxZ = pt.z;
    }

    // Add padding to bounds
    const padding = 18;
    this.minX = minX - padding;
    this.maxX = maxX + padding;
    this.minZ = minZ - padding;
    this.maxZ = maxZ + padding;

    this.worldWidth = this.maxX - this.minX;
    this.worldHeight = this.maxZ - this.minZ;
  }

  /**
   * Transforms 3D world XZ to 2D Canvas pixels
   */
  worldToCanvas(x, z) {
    // Canvas X maps to World X
    const canvasX = ((x - this.minX) / this.worldWidth) * (this.width - 24) + 12;
    // Canvas Y maps to World Z (inverted so North is Up)
    const canvasY = ((z - this.minZ) / this.worldHeight) * (this.height - 24) + 12;
    return { x: canvasX, y: canvasY };
  }

  /**
   * Draws the radar frame and live competitor blips
   * @param {THREE.Vector3} playerPos - Player's world position
   * @param {number} playerHeading - Player's yaw angle
   * @param {Array} rivals - Array of rival objects with .position and .tagColor
   * @param {Array} gates - Array of checkpoint gates
   */
  render(playerPos, playerHeading, rivals = [], gates = []) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Track Circuit Path
    ctx.beginPath();
    for (let i = 0; i < this.trackPoints2D.length; i++) {
      const p = this.trackPoints2D[i];
      const c = this.worldToCanvas(p.x, p.z);
      if (i === 0) ctx.moveTo(c.x, c.y);
      else ctx.lineTo(c.x, c.y);
    }
    ctx.closePath();

    // Road outer glow
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Road inner asphalt line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 2. Draw Checkpoint Gates
    gates.forEach((gate, idx) => {
      const c = this.worldToCanvas(gate.position.x, gate.position.z);
      ctx.fillStyle = idx === 0 ? '#ffea00' : 'rgba(0, 240, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, idx === 0 ? 3.5 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Draw AI Rivals Blips
    rivals.forEach((rival) => {
      const c = this.worldToCanvas(rival.position.x, rival.position.z);
      ctx.fillStyle = rival.tagColor || '#ff2a85';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // 4. Draw Player Blip (Bright Yellow with Direction Pointer)
    if (playerPos) {
      const c = this.worldToCanvas(playerPos.x, playerPos.z);

      // Outer pulsing ring
      ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // Yellow core
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Heading pointer arrow
      if (playerHeading !== undefined) {
        const arrowLen = 9;
        const forwardX = Math.sin(playerHeading);
        const forwardZ = Math.cos(playerHeading);

        // Map world heading to canvas
        const arrowTipX = c.x + forwardX * arrowLen;
        const arrowTipY = c.y + forwardZ * arrowLen;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(arrowTipX, arrowTipY);
        ctx.stroke();
      }
    }
  }
}

