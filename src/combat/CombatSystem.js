// ============================================
// PHASE 4: COMBAT & WANTED SYSTEM
// ============================================

import * as THREE from 'three';

export class CombatSystem {
  constructor(scene, player, world) {
    this.scene = scene;
    this.player = player;
    this.world = world;
    
    // Weapons
    this.weapons = {
      fists: { name: 'Fists', damage: 5, range: 2, fireRate: 0.5, type: 'melee' },
      pistol: { name: 'Pistol', damage: 20, range: 50, fireRate: 0.3, type: 'gun', ammo: 30, maxAmmo: 30 },
      shotgun: { name: 'Shotgun', damage: 50, range: 20, fireRate: 1, type: 'gun', ammo: 8, maxAmmo: 8 },
      rifle: { name: 'Rifle', damage: 35, range: 100, fireRate: 0.15, type: 'gun', ammo: 25, maxAmmo: 25 },
      knife: { name: 'Knife', damage: 15, range: 2, fireRate: 0.4, type: 'melee' }
    };
    
    this.currentWeapon = 'pistol';
    this.lastShot = 0;
    
    // Wanted system
    this.wantedLevel = 0;
    this.wantedDecayTimer = 0;
    this.wantedDecayTime = 30; // Seconds to lose 1 star
    this.cops = [];
    
    // NPCs
    this.npcs = [];
    this.spawnNPCs();
  }

  spawnNPCs() {
    // Spawn some cops
    for (let i = 0; i < 5; i++) {
      const cop = this.createNPC('cop');
      cop.position.set(
        Math.random() * 100 - 50,
        0,
        Math.random() * 100 - 50
      );
      this.npcs.push(cop);
    }
    
    // Spawn civilians
    for (let i = 0; i < 20; i++) {
      const civilian = this.createNPC('civilian');
      civilian.position.set(
        Math.random() * 100 - 50,
        0,
        Math.random() * 100 - 50
      );
      this.npcs.push(civilian);
    }
  }

  createNPC(type) {
    const group = new THREE.Group();
    
    // Body
    const bodyGeom = new THREE.BoxGeometry(0.8, 1.5, 0.6);
    const bodyColor = type === 'cop' ? 0x1a365d : 0x4a5568;
    const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 1.5;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 2.3;
    head.castShadow = true;
    group.add(head);
    
    // Hat for cops
    if (type === 'cop') {
      const hatGeom = new THREE.BoxGeometry(0.6, 0.2, 0.6);
      const hatMat = new THREE.MeshLambertMaterial({ color: 0x1a365d });
      const hat = new THREE.Mesh(hatGeom, hatMat);
      hat.position.y = 2.6;
      group.add(hat);
    }
    
    group.position.y = 0;
    
    this.scene.add(group);
    
    return {
      mesh: group,
      type: type,
      health: type === 'cop' ? 80 : 50,
      state: 'idle', // idle, alert, chasing
      alertTimer: 0
    };
  }

  shoot() {
    const weapon = this.weapons[this.currentWeapon];
    const now = performance.now() / 1000;
    
    if (now - this.lastShot < weapon.fireRate) return false;
    this.lastShot = now;
    
    // Raycast
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.player.camera.quaternion);
    
    // Check for NPC hit
    let hit = null;
    let minDist = weapon.range;
    
    this.npcs.forEach(npc => {
      const toNpc = npc.mesh.position.clone().sub(this.player.camera.position);
      const dist = toNpc.length();
      
      if (dist < minDist) {
        const angle = direction.angleTo(toNpc.normalize());
        if (angle < 0.1) { // Hit detection angle
          hit = npc;
          minDist = dist;
        }
      }
    });
    
    if (hit) {
      hit.health -= weapon.damage;
      
      if (hit.health <= 0) {
        this.killNPC(hit);
      } else {
        hit.state = 'alert';
        hit.alertTimer = 10;
        
        // Add wanted level for attacking
        if (hit.type === 'cop') {
          this.addWantedLevel(1);
        } else if (this.wantedLevel > 0) {
          this.addWantedLevel(0.5);
        }
      }
    }
    
    // Decrease ammo
    if (weapon.type === 'gun' && this.player.hotbar[this.player.selectedSlot]) {
      const slot = this.player.hotbar[this.player.selectedSlot];
      if (slot.ammo !== undefined) {
        slot.ammo = Math.max(0, slot.ammo - 1);
        if (slot.ammo <= 0) {
          this.player.showNotification('Out of ammo! ⏳');
        }
      }
    }
    
    return true;
  }

  killNPC(npc) {
    // Remove from scene
    this.scene.remove(npc.mesh);
    
    // Remove from array
    const index = this.npcs.indexOf(npc);
    if (index > -1) {
      this.npcs.splice(index, 1);
    }
    
    // Add wanted level
    if (npc.type === 'cop') {
      this.addWantedLevel(2);
    } else if (this.wantedLevel > 0) {
      this.addWantedLevel(1);
    }
    
    // Respawn after delay
    setTimeout(() => {
      const newNpc = this.createNPC(npc.type);
      newNpc.position.set(
        Math.random() * 100 - 50,
        0,
        Math.random() * 100 - 50
      );
      this.npcs.push(newNpc);
    }, 10000);
  }

  addWantedLevel(amount) {
    this.wantedLevel = Math.min(5, this.wantedLevel + amount);
    this.player.wantedLevel = this.wantedLevel;
    this.wantedDecayTimer = this.wantedDecayTime;
    
    if (this.wantedLevel >= 5) {
      this.player.showNotification('🌟🌟🌟🌟🌟 MAXIMUM WANTED!');
    } else if (this.wantedLevel >= 3) {
      this.player.showNotification('⭐⭐⭐ High alert!');
    }
  }

  update(delta) {
    // Update wanted level decay
    if (this.wantedLevel > 0 && this.wantedDecayTimer > 0) {
      this.wantedDecayTimer -= delta;
      
      if (this.wantedDecayTimer <= 0) {
        this.wantedLevel = Math.max(0, this.wantedLevel - 1);
        this.player.wantedLevel = this.wantedLevel;
        this.wantedDecayTimer = this.wantedDecayTime;
        
        if (this.wantedLevel > 0) {
          this.player.showNotification(`⭐ Wanted level decreased to ${this.wantedLevel}`);
        } else {
          this.player.showNotification('✅ Wanted level cleared!');
        }
      }
    }
    
    // Update NPCs
    this.npcs.forEach(npc => {
      this.updateNPC(npc, delta);
    });
  }

  updateNPC(npc, delta) {
    if (npc.state === 'idle') {
      // Random wandering
      npc.alertTimer -= delta;
      if (npc.alertTimer <= 0) {
        npc.alertTimer = 5 + Math.random() * 10;
        // Move to new position
        npc.mesh.position.x += (Math.random() - 0.5) * 2;
        npc.mesh.position.z += (Math.random() - 0.5) * 2;
      }
    } else if (npc.state === 'alert' || npc.state === 'chasing') {
      // Chase player
      const toPlayer = this.player.position.clone().sub(npc.mesh.position);
      toPlayer.y = 0;
      const dist = toPlayer.length();
      
      if (dist > 0.1) {
        const moveDir = toPlayer.normalize().multiplyScalar(delta * (npc.state === 'chasing' ? 6 : 3));
        npc.mesh.position.add(moveDir);
        
        // Look at player
        npc.mesh.lookAt(this.player.position.x, npc.mesh.position.y, this.player.position.z);
      }
      
      // Attack player if close
      if (dist < 2 && npc.type === 'cop') {
        this.player.takeDamage(10 * delta);
      }
      
      // Lose interest over time
      npc.alertTimer -= delta;
      if (npc.alertTimer <= 0) {
        npc.state = 'idle';
      }
    }
  }

  destroy() {
    this.npcs.forEach(npc => {
      this.scene.remove(npc.mesh);
    });
  }
}