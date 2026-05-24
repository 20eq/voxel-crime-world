// ============================================
// VOXEL CRIME WORLD - Complete Game
// ============================================

import * as THREE from 'three';
import { World } from './world/World.js';
import { BuildingSystem } from './world/BuildingSystem.js';
import { DayNightCycle } from './world/DayNightCycle.js';
import { VehicleManager } from './vehicles/VehicleManager.js';
import { CombatSystem } from './combat/CombatSystem.js';
import { MissionSystem } from './missions/MissionSystem.js';
import { ShopSystem } from './ui/ShopSystem.js';
import { AuthUI } from './ui/Auth.js';
import { HUD } from './ui/HUD.js';
import { AudioManager } from './audio/AudioManager.js';
import { supabaseService } from './supabase/config.js';

class Game {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    this.player = null;
    this.hud = null;
    this.clock = new THREE.Clock();
    this.isRunning = false;
    
    // Systems
    this.buildingSystem = null;
    this.dayNightCycle = null;
    this.vehicleManager = null;
    this.combatSystem = null;
    this.missionSystem = null;
    this.shopSystem = null;
    this.authUI = null;
    this.audioManager = null;
    
    // Notification system
    this.notifications = [];
  }

  async init() {
    console.log('🎮 Initializing VoxelCrime World...');
    this.showLoadingProgress(10);

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);
    this.showLoadingProgress(20);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.showLoadingProgress(30);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(this.renderer.domElement);
    this.showLoadingProgress(40);

    // Initialize world
    this.world = new World(this.scene);
    await this.world.generate();
    this.showLoadingProgress(60);

    // Initialize player
    this.player = new Player(this.camera, this.world);
    this.player.spawn();
    this.showLoadingProgress(70);

    // Initialize all systems
    this.dayNightCycle = new DayNightCycle(this.scene);
    this.buildingSystem = new BuildingSystem(this.player, this.world);
    this.vehicleManager = new VehicleManager(this.scene, this.player, this.world);
    this.combatSystem = new CombatSystem(this.scene, this.player, this.world);
    this.missionSystem = new MissionSystem(this.player, supabaseService);
    this.shopSystem = new ShopSystem(this.player, supabaseService);
    this.audioManager = new AudioManager();
    this.showLoadingProgress(80);

    // Initialize HUD
    this.hud = new HUD(this.player);
    this.showLoadingProgress(90);

    // Initialize Supabase Auth
    this.authUI = new AuthUI(this);
    supabaseService.init({
      onLogin: (user, data) => {
        if (data) {
          this.player.money = data.stats?.cash || 5000;
        }
        this.showNotification(`✅ Signed in as ${user.email}`);
      },
      onLogout: () => {
        this.showNotification('Signed out');
      }
    });

    // Event listeners
    this.setupEventListeners();
    
    // Show auth screen
    this.authUI.show();
    this.showLoadingProgress(100);

    // Start game loop
    this.isRunning = true;
    this.animate();

    console.log('✅ Game initialized successfully!');
  }

  setupLighting() {
    // Lighting handled by DayNightCycle
  }

  setupEventListeners() {
    // Window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Keyboard
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // Mouse
    window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));

    // Pointer lock
    document.addEventListener('click', () => {
      if (this.isRunning && !document.pointerLockElement && !this.shopSystem.isOpen && !this.authUI.isVisible) {
        document.body.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.player.isLocked = document.pointerLockElement === document.body;
    });
  }

  handleKeyDown(e) {
    // Shop toggle
    if (e.key === 'k' || e.key === 'K') {
      if (this.shopSystem.isOpen) {
        this.shopSystem.close();
      } else if (!this.authUI.isVisible) {
        this.shopSystem.open();
      }
      return;
    }

    // Mission start (M key)
    if (e.key === 'm' || e.key === 'M') {
      this.showMissionMenu();
      return;
    }

    // Building mode toggle
    if (e.key === 'b' || e.key === 'B') {
      this.buildingSystem.mode = this.buildingSystem.mode === 'break' ? 'place' : 'break';
      this.showNotification(this.buildingSystem.mode === 'break' ? '🔨 Breaking mode' : '🧱 Placing mode');
      return;
    }

    // Vehicle exit
    if (e.key === 'f' || e.key === 'F') {
      if (this.player.isInVehicle) {
        this.vehicleManager.exitVehicle();
        this.showNotification('Exited vehicle 🚗');
      } else {
        // Try to enter nearby vehicle
        const vehicle = this.vehicleManager.findNearestVehicle(this.player.position);
        if (vehicle) {
          this.vehicleManager.enterVehicle(vehicle);
          this.showNotification(`Entered ${vehicle.type.name} 🚗`);
        }
      }
      return;
    }

    this.player.onKeyDown(e);
  }

  handleKeyUp(e) {
    this.player.onKeyUp(e);
  }

  handleMouseDown(e) {
    if (!this.player.isLocked || this.shopSystem.isOpen) return;

    switch (e.button) {
      case 0: // Left click
        if (this.player.isInVehicle) {
          this.combatSystem.shoot();
        } else {
          if (this.buildingSystem.mode === 'break') {
            this.buildingSystem.breakBlock();
            this.audioManager.play('hit');
          } else {
            this.combatSystem.shoot();
            this.audioManager.play('shoot');
          }
        }
        break;
      case 2: // Right click
        if (!this.player.isInVehicle && this.buildingSystem.mode === 'place') {
          this.buildingSystem.placeBlock();
          this.audioManager.play('hit');
        }
        this.player.isAiming = true;
        break;
    }
  }

  handleMouseUp(e) {
    if (e.button === 2) {
      this.player.isAiming = false;
    }
  }

  handleMouseMove(e) {
    if (!this.player.isLocked || this.shopSystem.isOpen) return;
    this.player.onMouseMove(e);
  }

  showLoadingProgress(percent) {
    const progress = document.querySelector('.progress');
    if (progress) {
      progress.style.width = `${percent}%`;
    }
    
    if (percent >= 100) {
      setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
          loadingScreen.classList.add('hidden');
        }
      }, 500);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'game-notification';
    notification.textContent = message;
    
    const colors = {
      info: '#3498db',
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors[type] || colors.info};
      color: white;
      padding: 15px 30px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: bold;
      z-index: 3000;
      animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
      box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showMissionMenu() {
    const missions = this.missionSystem.getAvailableMissions();
    const missionList = missions.map(m => 
      `<div style="padding: 15px; margin: 10px 0; background: rgba(255,255,255,0.1); border-radius: 10px;">
        <h4 style="margin: 0 0 5px 0;">${m.name}</h4>
        <p style="margin: 0 0 10px 0; color: #888;">${m.description}</p>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #ffd93d;">💰 $${m.reward.cash}</span>
          <button onclick="window.startMission('${m.id}')" style="
            padding: 5px 15px;
            background: #27ae60;
            border: none;
            color: white;
            border-radius: 5px;
            cursor: pointer;
          ">Accept</button>
        </div>
      </div>`
    ).join('');
    
    const menu = document.createElement('div');
    menu.id = 'mission-menu';
    menu.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      padding: 30px;
      border-radius: 20px;
      color: white;
      min-width: 400px;
      z-index: 2000;
      border: 1px solid rgba(255,255,255,0.1);
    `;
    menu.innerHTML = `
      <h2 style="margin-bottom: 20px;">🎯 Available Missions</h2>
      ${missionList || '<p>All missions completed! 🎉</p>'}
      <button onclick="this.parentElement.remove()" style="
        margin-top: 20px;
        padding: 10px 30px;
        background: #e74c3c;
        border: none;
        color: white;
        border-radius: 10px;
        cursor: pointer;
      ">Close (ESC)</button>
    `;
    
    window.startMission = (id) => {
      this.missionSystem.startMission(id);
      menu.remove();
    };
    
    document.body.appendChild(menu);
    
    window.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        menu.remove();
        window.removeEventListener('keydown', escHandler);
      }
    });
  }

  animate() {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.player) {
      this.player.update(delta);
      
      if (this.player.isInVehicle) {
        const vehicle = this.player.currentVehicle;
        this.camera.position.copy(vehicle.position).add(new THREE.Vector3(0, 3, 0));
        this.camera.lookAt(vehicle.position);
      }
    }

    if (this.world) {
      this.world.update(this.player.position);
    }

    if (this.dayNightCycle) this.dayNightCycle.update(delta);
    if (this.buildingSystem) this.buildingSystem.update(delta);
    if (this.vehicleManager) this.vehicleManager.update(delta);
    if (this.combatSystem) this.combatSystem.update(delta);
    if (this.audioManager) this.audioManager.update(delta);
    if (this.hud) this.hud.update();

    this.renderer.render(this.scene, this.camera);
  }

  updateVehicleControls(vehicle, delta) {
    const acceleration = 20;
    const friction = 0.98;
    const turnSpeed = 2;

    if (this.player.keys.forward) {
      vehicle.speed = Math.min(vehicle.speed + acceleration * delta, vehicle.maxSpeed);
    }
    if (this.player.keys.backward) {
      vehicle.speed = Math.max(vehicle.speed - acceleration * delta * 1.5, -vehicle.maxSpeed / 2);
    }

    vehicle.speed *= friction;

    if (Math.abs(vehicle.speed) > 0.5) {
      if (this.player.keys.left) vehicle.rotation += turnSpeed * delta * (vehicle.speed > 0 ? 1 : -1);
      if (this.player.keys.right) vehicle.rotation -= turnSpeed * delta * (vehicle.speed > 0 ? 1 : -1);
    }

    vehicle.position.x += Math.sin(vehicle.rotation) * vehicle.speed * delta;
    vehicle.position.z += Math.cos(vehicle.rotation) * vehicle.speed * delta;
    
    vehicle.group.position.copy(vehicle.position);
    vehicle.group.rotation.y = vehicle.rotation;
    
    if (Math.abs(vehicle.speed) > 1) {
      this.audioManager.play('engine', Math.abs(vehicle.speed) / vehicle.maxSpeed * 0.3);
    }
  }
}

// Player class
class Player {
  constructor(camera, world) {
    this.camera = camera;
    this.world = world;
    
    this.position = new THREE.Vector3(0, 20, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    
    this.health = 100;
    this.maxHealth = 100;
    this.armor = 0;
    this.money = 5000;
    this.wantedLevel = 0;
    this.xp = 0;
    this.level = 1;
    
    this.speed = 8;
    this.sprintSpeed = 14;
    this.jumpForce = 8;
    this.gravity = 20;
    this.mouseSensitivity = 0.002;
    
    this.isGrounded = false;
    this.isSprinting = false;
    this.isAiming = false;
    this.isInVehicle = false;
    this.currentVehicle = null;
    this.canMove = true;
    
    this.keys = {
      forward: false, backward: false,
      left: false, right: false,
      jump: false, sprint: false, interact: false
    };
    
    this.selectedSlot = 0;
    this.hotbar = [
      { name: 'Fists', type: 'melee', damage: 5 },
      { name: 'Pistol', type: 'gun', damage: 20, ammo: 30 },
      { name: 'Shotgun', type: 'gun', damage: 50, ammo: 8 }
    ];
    
    this.isLocked = false;
  }

  spawn() {
    const spawnY = this.getGroundLevel(0, 0) + 2;
    this.position.set(0, spawnY, 0);
    this.camera.position.copy(this.position);
  }

  getGroundLevel(x, z) {
    for (let y = 32; y >= 0; y--) {
      const block = this.world.getBlock(Math.floor(x), y, Math.floor(z));
      if (block > 0) return y + 1;
    }
    return 10;
  }

  onKeyDown(e) {
    switch (e.code) {
      case 'KeyW': this.keys.forward = true; break;
      case 'KeyS': this.keys.backward = true; break;
      case 'KeyA': this.keys.left = true; break;
      case 'KeyD': this.keys.right = true; break;
      case 'Space': this.keys.jump = true; break;
      case 'ShiftLeft': this.keys.sprint = true; break;
      case 'Digit1': this.selectedSlot = 0; break;
      case 'Digit2': this.selectedSlot = 1; break;
      case 'Digit3': this.selectedSlot = 2; break;
      case 'Digit4': this.selectedSlot = 3; break;
      case 'Digit5': this.selectedSlot = 4; break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': this.keys.forward = false; break;
      case 'KeyS': this.keys.backward = false; break;
      case 'KeyA': this.keys.left = false; break;
      case 'KeyD': this.keys.right = false; break;
      case 'Space': this.keys.jump = false; break;
      case 'ShiftLeft': this.keys.sprint = false; break;
    }
  }

  onMouseMove(e) {
    if (!this.isLocked) return;
    this.rotation.y -= e.movementX * this.mouseSensitivity;
    this.rotation.x -= e.movementY * this.mouseSensitivity;
    this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
  }

  update(delta) {
    if (!this.canMove || this.isInVehicle) return;

    const moveDir = new THREE.Vector3();
    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.left) moveDir.x -= 1;
    if (this.keys.right) moveDir.x += 1;

    moveDir.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
    moveDir.normalize();

    this.isSprinting = this.keys.sprint && moveDir.length() > 0;
    const currentSpeed = this.isSprinting ? this.sprintSpeed : this.speed;

    this.velocity.x = moveDir.x * currentSpeed;
    this.velocity.z = moveDir.z * currentSpeed;

    if (this.isGrounded && this.keys.jump) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * delta;
    }

    const newPosition = this.position.clone();
    newPosition.x += this.velocity.x * delta;
    newPosition.y += this.velocity.y * delta;
    newPosition.z += this.velocity.z * delta;

    const groundY = this.getGroundLevel(newPosition.x, newPosition.z);
    
    if (newPosition.y <= groundY) {
      newPosition.y = groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    this.position.copy(newPosition);
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
    if (this.health <= 0) this.die();
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  die() {
    console.log('💀 Player died!');
    setTimeout(() => {
      this.health = this.maxHealth;
      this.wantedLevel = 0;
      this.spawn();
    }, 2000);
  }
}

// Start game
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translate(-50%, -20px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes fadeOut {
      to { opacity: 0; transform: translate(-50%, -20px); }
    }
    .shop-tab.active {
      background: #ffd93d !important;
      color: #1a1a2e !important;
    }
  `;
  document.head.appendChild(style);

  const game = new Game();
  game.init().catch(err => {
    console.error('❌ Failed to initialize game:', err);
  });
});

export { Game };