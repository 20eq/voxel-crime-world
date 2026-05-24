// ============================================
// PHASE 3: VEHICLE SYSTEM
// ============================================

import * as THREE from 'three';

export class VehicleManager {
  constructor(scene, player, world) {
    this.scene = scene;
    this.player = player;
    this.world = world;
    this.vehicles = [];
    this.currentVehicle = null;
    
    this.vehicleTypes = {
      sedan: {
        name: 'Sedan',
        color: 0x2c3e50,
        maxSpeed: 25,
        acceleration: 15,
        handling: 0.95,
        passengers: 4
      },
      sports: {
        name: 'Sports Car',
        color: 0xe74c3c,
        maxSpeed: 35,
        acceleration: 25,
        handling: 1.2,
        passengers: 2
      },
      suv: {
        name: 'SUV',
        color: 0x27ae60,
        maxSpeed: 20,
        acceleration: 10,
        handling: 0.8,
        passengers: 6
      },
      motorcycle: {
        name: 'Motorcycle',
        color: 0x8e44ad,
        maxSpeed: 40,
        acceleration: 30,
        handling: 1.5,
        passengers: 2
      },
      helicopter: {
        name: 'Helicopter',
        color: 0x95a5a6,
        maxSpeed: 50,
        acceleration: 20,
        handling: 1.0,
        passengers: 4,
        flying: true
      }
    };
    
    this.spawnVehicles();
  }

  spawnVehicles() {
    // Spawn some vehicles in the world
    const positions = [
      { x: 20, z: 20, type: 'sedan' },
      { x: -15, z: 30, type: 'sports' },
      { x: 35, z: -10, type: 'suv' },
      { x: -30, z: -25, type: 'motorcycle' },
      { x: 50, z: 50, type: 'helicopter' }
    ];
    
    positions.forEach(pos => {
      this.spawnVehicle(pos.x, pos.z, pos.type);
    });
  }

  spawnVehicle(x, z, typeName) {
    const type = this.vehicleTypes[typeName];
    if (!type) return null;
    
    const vehicle = new Vehicle(x, z, type, this.scene);
    this.vehicles.push(vehicle);
    return vehicle;
  }

  findNearestVehicle(position, maxDistance = 5) {
    let nearest = null;
    let nearestDist = maxDistance;
    
    this.vehicles.forEach(vehicle => {
      const dist = position.distanceTo(vehicle.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = vehicle;
      }
    });
    
    return nearest;
  }

  enterVehicle(vehicle) {
    if (this.currentVehicle) {
      this.exitVehicle();
    }
    
    this.currentVehicle = vehicle;
    vehicle.enter(this.player);
    this.player.isInVehicle = true;
    this.player.currentVehicle = vehicle;
  }

  exitVehicle() {
    if (!this.currentVehicle) return;
    
    const exitPos = this.currentVehicle.position.clone();
    exitPos.y += 2;
    
    this.currentVehicle.exit();
    this.currentVehicle = null;
    this.player.isInVehicle = false;
    this.player.currentVehicle = null;
    this.player.position.copy(exitPos);
  }

  update(delta) {
    this.vehicles.forEach(vehicle => {
      vehicle.update(delta);
    });
  }

  destroy() {
    this.vehicles.forEach(vehicle => {
      vehicle.destroy();
    });
  }
}

class Vehicle {
  constructor(x, z, type, scene) {
    this.type = type;
    this.scene = scene;
    
    this.position = new THREE.Vector3(x, 0, z);
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    
    this.speed = 0;
    this.maxSpeed = type.maxSpeed;
    this.acceleration = type.acceleration;
    this.handling = type.handling;
    
    this.health = 100;
    this.isOccupied = false;
    this.isFlying = type.flying || false;
    
    this.createMesh();
  }

  createMesh() {
    this.group = new THREE.Group();
    
    // Create vehicle mesh based on type
    if (this.type.name === 'Motorcycle') {
      this.createMotorcycle();
    } else if (this.type.name === 'Helicopter') {
      this.createHelicopter();
    } else {
      this.createCar();
    }
    
    this.group.position.copy(this.position);
    this.scene.add(this.group);
  }

  createCar() {
    // Body
    const bodyGeom = new THREE.BoxGeometry(2, 1, 4);
    const bodyMat = new THREE.MeshLambertMaterial({ color: this.type.color });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    this.group.add(body);
    
    // Roof
    const roofGeom = new THREE.BoxGeometry(1.8, 0.8, 2);
    const roof = new THREE.Mesh(roofGeom, bodyMat);
    roof.position.y = 1.5;
    roof.position.z = -0.3;
    roof.castShadow = true;
    this.group.add(roof);
    
    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    
    const wheelPositions = [
      { x: -1, z: 1.2 }, { x: 1, z: 1.2 },
      { x: -1, z: -1.2 }, { x: 1, z: -1.2 }
    ];
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, 0.4, pos.z);
      this.group.add(wheel);
    });
    
    // Headlights
    const lightGeom = new THREE.BoxGeometry(0.3, 0.2, 0.1);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
    
    const lightL = new THREE.Mesh(lightGeom, lightMat);
    lightL.position.set(-0.6, 0.7, 2);
    this.group.add(lightL);
    
    const lightR = new THREE.Mesh(lightGeom, lightMat);
    lightR.position.set(0.6, 0.7, 2);
    this.group.add(lightR);
  }

  createMotorcycle() {
    // Frame
    const frameGeom = new THREE.BoxGeometry(0.5, 0.6, 2.5);
    const frameMat = new THREE.MeshLambertMaterial({ color: this.type.color });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    frame.position.y = 0.8;
    frame.castShadow = true;
    this.group.add(frame);
    
    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    
    const frontWheel = new THREE.Mesh(wheelGeom, wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.5, 1);
    this.group.add(frontWheel);
    
    const backWheel = new THREE.Mesh(wheelGeom, wheelMat);
    backWheel.rotation.z = Math.PI / 2;
    backWheel.position.set(0, 0.5, -1);
    this.group.add(backWheel);
    
    // Handlebars
    const handleGeom = new THREE.BoxGeometry(1.5, 0.1, 0.1);
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.set(0, 1.2, 0.8);
    this.group.add(handle);
  }

  createHelicopter() {
    // Body
    const bodyGeom = new THREE.BoxGeometry(2, 1.5, 4);
    const bodyMat = new THREE.MeshLambertMaterial({ color: this.type.color });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.castShadow = true;
    this.group.add(body);
    
    // Tail
    const tailGeom = new THREE.BoxGeometry(0.5, 0.5, 3);
    const tail = new THREE.Mesh(tailGeom, bodyMat);
    tail.position.set(0, 0.5, -3);
    tail.castShadow = true;
    this.group.add(tail);
    
    // Rotor
    const rotorGeom = new THREE.BoxGeometry(8, 0.1, 0.3);
    const rotorMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    this.rotor = new THREE.Mesh(rotorGeom, rotorMat);
    this.rotor.position.y = 1.2;
    this.group.add(this.rotor);
    
    // Tail rotor
    const tailRotorGeom = new THREE.BoxGeometry(0.1, 1.5, 0.2);
    this.tailRotor = new THREE.Mesh(tailRotorGeom, rotorMat);
    this.tailRotor.position.set(0, 0.8, -4.5);
    this.group.add(this.tailRotor);
    
    // Skids
    const skidGeom = new THREE.BoxGeometry(0.2, 0.1, 2);
    const skidMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    const skidL = new THREE.Mesh(skidGeom, skidMat);
    skidL.position.set(-1, -1, 0);
    this.group.add(skidL);
    
    const skidR = new THREE.Mesh(skidGeom, skidMat);
    skidR.position.set(1, -1, 0);
    this.group.add(skidR);
  }

  enter(player) {
    this.isOccupied = true;
    player.position.set(0, 1, 0);
  }

  exit() {
    this.isOccupied = false;
  }

  update(delta) {
    if (!this.isOccupied) return;
    
    // Rotate rotors for helicopter
    if (this.rotor) {
      this.rotor.rotation.y += delta * 20;
    }
    if (this.tailRotor) {
      this.tailRotor.rotation.z += delta * 30;
    }
  }

  destroy() {
    this.scene.remove(this.group);
  }
}