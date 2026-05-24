// ============================================
// PHASE 2: WORLD & BUILDING SYSTEM
// ============================================

import * as THREE from 'three';

export class BuildingSystem {
  constructor(player, world) {
    this.player = player;
    this.world = world;
    this.isEnabled = true;
    
    // Block placement
    this.selectedBlock = 1; // GRASS
    this.blockTypes = {
      1: { name: 'Grass', color: 0x4a7c23 },
      2: { name: 'Dirt', color: 0x8b5a2b },
      3: { name: 'Stone', color: 0x808080 },
      4: { name: 'Wood', color: 0x8b4513 },
      5: { name: 'Brick', color: 0xb22222 },
      6: { name: 'Glass', color: 0xadd8e6, transparent: true },
      7: { name: 'Metal', color: 0x696969 },
      8: { name: 'Sand', color: 0xc2b280 },
      9: { name: 'Concrete', color: 0x909090 }
    };
    
    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 10; // Max interaction distance
    
    // Highlight block
    this.highlightMesh = this.createHighlightMesh();
    this.world.scene.add(this.highlightMesh);
    
    // Mode: 'break' or 'place'
    this.mode = 'break';
    
    this.setupControls();
  }

  createHighlightMesh() {
    const geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ 
      color: 0xffffff, 
      linewidth: 2 
    });
    const mesh = new THREE.LineSegments(edges, material);
    mesh.visible = false;
    return mesh;
  }

  setupControls() {
    // Number keys for block selection
    window.addEventListener('keydown', (e) => {
      if (e.key >= '1' && e.key <= '9') {
        this.selectedBlock = parseInt(e.key);
        this.updateHotbar();
      }
      
      // Toggle mode
      if (e.key === 'b' || e.key === 'B') {
        this.mode = this.mode === 'break' ? 'place' : 'break';
        this.player.showNotification(
          this.mode === 'break' ? '🔨 Breaking mode' : '🧱 Placing mode'
        );
      }
    });

    // Right click to place
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  update(delta) {
    if (!this.isEnabled) return;

    this.updateHighlight();
  }

  updateHighlight() {
    // Cast ray from camera
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.player.camera.quaternion);
    
    this.raycaster.set(this.player.camera.position, direction);
    
    // Check for block intersection
    const hit = this.world.raycast(this.player.camera.position, direction, 8);
    
    if (hit) {
      this.highlightMesh.visible = true;
      this.highlightMesh.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);
    } else {
      this.highlightMesh.visible = false;
    }
  }

  breakBlock() {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.player.camera.quaternion);
    
    const hit = this.world.raycast(this.player.camera.position, direction, 8);
    
    if (hit && hit.block > 0) {
      this.world.setBlock(hit.x, hit.y, hit.z, 0);
      this.player.showNotification('Block broken! 💥');
      return true;
    }
    return false;
  }

  placeBlock() {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.player.camera.quaternion);
    
    const hit = this.world.raycast(this.player.camera.position, direction, 8);
    
    if (hit) {
      // Place block adjacent to the hit block
      const placeX = hit.x + Math.round(direction.x);
      const placeY = hit.y + Math.round(direction.y);
      const placeZ = hit.z + Math.round(direction.z);
      
      // Check if placement position is clear (not inside player)
      const playerBlockX = Math.floor(this.player.position.x);
      const playerBlockY = Math.floor(this.player.position.y);
      const playerBlockZ = Math.floor(this.player.position.z);
      
      if (placeX === playerBlockX && placeZ === playerBlockZ && 
          (placeY === playerBlockY || placeY === playerBlockY + 1)) {
        this.player.showNotification('Cannot place here! 🚫');
        return false;
      }
      
      this.world.setBlock(placeX, placeY, placeZ, this.selectedBlock);
      this.player.showNotification(`Placed ${this.blockTypes[this.selectedBlock].name}! 🧱`);
      return true;
    }
    return false;
  }

  updateHotbar() {
    // This will be called from the main game
  }

  destroy() {
    this.world.scene.remove(this.highlightMesh);
  }
}