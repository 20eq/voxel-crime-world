// ============================================
// PLAYER - Movement & Controls
// ============================================

import * as THREE from 'three';

export class Player {
  constructor(camera, world) {
    this.camera = camera;
    this.world = world;
    
    // Position & Movement
    this.position = new THREE.Vector3(0, 20, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    
    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.armor = 0;
    this.money = 1000;
    this.wantedLevel = 0;
    
    // Movement settings
    this.speed = 8;
    this.sprintSpeed = 14;
    this.jumpForce = 8;
    this.gravity = 20;
    this.mouseSensitivity = 0.002;
    
    // State
    this.isGrounded = false;
    this.isSprinting = false;
    this.isAiming = false;
    this.canMove = true;
    
    // Controls
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      interact: false
    };
    
    // Inventory
    this.selectedSlot = 0;
    this.hotbar = [
      { name: 'Fists', type: 'melee', damage: 5 },
      { name: 'Pistol', type: 'gun', damage: 20, ammo: 30 },
      { name: 'Shotgun', type: 'gun', damage: 50, ammo: 8 },
      { name: 'Rifle', type: 'gun', damage: 35, ammo: 25 }
    ];
    
    // Pointer lock
    this.isLocked = false;
    
    this.setupControls();
  }

  setupControls() {
    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === document.body;
    });
  }

  spawn() {
    // Find spawn location
    const spawnY = this.getGroundLevel(0, 0) + 2;
    this.position.set(0, spawnY, 0);
    this.camera.position.copy(this.position);
  }

  getGroundLevel(x, z) {
    for (let y = this.world.height || 32; y >= 0; y--) {
      const block = this.world.getBlock(Math.floor(x), y, Math.floor(z));
      if (block > 0) return y + 1;
    }
    return 10;
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW': this.keys.forward = true; break;
      case 'KeyS': this.keys.backward = true; break;
      case 'KeyA': this.keys.left = true; break;
      case 'KeyD': this.keys.right = true; break;
      case 'Space': this.keys.jump = true; break;
      case 'ShiftLeft': this.keys.sprint = true; break;
      case 'KeyE': this.keys.interact = true; break;
      case 'Digit1': this.selectedSlot = 0; break;
      case 'Digit2': this.selectedSlot = 1; break;
      case 'Digit3': this.selectedSlot = 2; break;
      case 'Digit4': this.selectedSlot = 3; break;
      case 'Digit5': this.selectedSlot = 4; break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW': this.keys.forward = false; break;
      case 'KeyS': this.keys.backward = false; break;
      case 'KeyA': this.keys.left = false; break;
      case 'KeyD': this.keys.right = false; break;
      case 'Space': this.keys.jump = false; break;
      case 'ShiftLeft': this.keys.sprint = false; break;
      case 'KeyE': this.keys.interact = false; break;
    }
  }

  onMouseDown(event) {
    if (!this.isLocked) return;

    switch (event.button) {
      case 0: // Left click - Attack
        this.attack();
        break;
      case 2: // Right click - Aim
        this.isAiming = true;
        break;
    }
  }

  onMouseUp(event) {
    if (event.button === 2) {
      this.isAiming = false;
    }
  }

  onMouseMove(event) {
    if (!this.isLocked) return;

    this.rotation.y -= event.movementX * this.mouseSensitivity;
    this.rotation.x -= event.movementY * this.mouseSensitivity;
    this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
  }

  attack() {
    const item = this.hotbar[this.selectedSlot];
    console.log(`⚔️ Attacking with ${item.name}!`);
    // Combat logic will be implemented in Phase 4
  }

  update(delta) {
    if (!this.canMove) return;

    // Calculate movement direction
    const moveDir = new THREE.Vector3();
    
    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.left) moveDir.x -= 1;
    if (this.keys.right) moveDir.x += 1;

    // Apply rotation to movement
    moveDir.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
    moveDir.normalize();

    // Sprint
    this.isSprinting = this.keys.sprint && moveDir.length() > 0;
    const currentSpeed = this.isSprinting ? this.sprintSpeed : this.speed;

    // Horizontal movement
    this.velocity.x = moveDir.x * currentSpeed;
    this.velocity.z = moveDir.z * currentSpeed;

    // Gravity & jumping
    if (this.isGrounded && this.keys.jump) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * delta;
    }

    // Apply velocity
    const newPosition = this.position.clone();
    newPosition.x += this.velocity.x * delta;
    newPosition.y += this.velocity.y * delta;
    newPosition.z += this.velocity.z * delta;

    // Ground collision
    const groundY = this.getGroundLevel(newPosition.x, newPosition.z);
    
    if (newPosition.y <= groundY) {
      newPosition.y = groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    this.position.copy(newPosition);

    // Update camera
    this.camera.position.copy(this.position);
    this.camera.rotation.copy(this.rotation);
  }

  takeDamage(amount) {
    if (this.armor > 0) {
      const armorDamage = Math.min(this.armor, amount * 0.5);
      this.armor -= armorDamage;
      amount *= 0.5;
    }
    
    this.health = Math.max(0, this.health - amount);
    
    if (this.health <= 0) {
      this.die();
    }
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  addWantedLevel(amount) {
    this.wantedLevel = Math.min(5, this.wantedLevel + amount);
  }

  clearWantedLevel() {
    this.wantedLevel = 0;
  }

  die() {
    console.log('💀 Player died!');
    // Respawn logic
    setTimeout(() => {
      this.health = this.maxHealth;
      this.wantedLevel = 0;
      this.spawn();
    }, 2000);
  }
}