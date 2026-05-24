// ============================================
// DAY/NIGHT CYCLE & DYNAMIC LIGHTING
// ============================================

import * as THREE from 'three';

export class DayNightCycle {
  constructor(scene) {
    this.scene = scene;
    this.time = 0.5; // Start at noon (0 = midnight, 1 = midnight)
    this.dayLength = 600; // 10 minutes per day (in seconds)
    
    // Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
    this.moonLight = new THREE.DirectionalLight(0x4444ff, 0.2);
    
    // Colors
    this.dayAmbient = new THREE.Color(0xffffff);
    this.nightAmbient = new THREE.Color(0x222244);
    this.daySky = new THREE.Color(0x87ceeb);
    this.nightSky = new THREE.Color(0x0a0a20);
    this.sunriseColor = new THREE.Color(0xffaa55);
    
    this.setupLighting();
  }

  setupLighting() {
    // Sun
    this.sunLight.position.set(100, 80, 50);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 500;
    this.sunLight.shadow.camera.left = -100;
    this.sunLight.shadow.camera.right = 100;
    this.sunLight.shadow.camera.top = 100;
    this.sunLight.shadow.camera.bottom = -100;
    
    // Moon
    this.moonLight.position.set(-100, 80, -50);
    
    this.scene.add(this.ambientLight);
    this.scene.add(this.sunLight);
    this.scene.add(this.moonLight);
  }

  update(delta) {
    // Advance time
    this.time += delta / this.dayLength;
    if (this.time >= 1) this.time -= 1;
    
    // Calculate sun position
    const sunAngle = this.time * Math.PI * 2 - Math.PI / 2;
    const sunHeight = Math.sin(sunAngle);
    const sunHorizon = Math.cos(sunAngle);
    
    this.sunLight.position.x = Math.cos(sunAngle) * 100;
    this.sunLight.position.y = sunHeight * 100;
    this.sunLight.position.z = 50;
    
    this.moonLight.position.x = -Math.cos(sunAngle) * 100;
    this.moonLight.position.y = -sunHeight * 100;
    this.moonLight.position.z = -50;
    
    // Calculate intensity based on sun height
    const sunIntensity = Math.max(0, sunHeight);
    const moonIntensity = Math.max(0, -sunHeight) * 0.3;
    
    this.sunLight.intensity = sunIntensity * 1.2;
    this.moonLight.intensity = moonIntensity;
    
    // Interpolate ambient light
    let targetAmbient;
    let targetSky;
    
    if (sunHeight > 0.1) {
      // Day
      targetAmbient = this.dayAmbient.clone();
      targetSky = this.daySky.clone();
    } else if (sunHeight < -0.1) {
      // Night
      targetAmbient = this.nightAmbient.clone();
      targetSky = this.nightSky.clone();
    } else {
      // Twilight (sunrise/sunset)
      const t = Math.abs(sunHeight) / 0.1;
      targetAmbient = this.nightAmbient.clone().lerp(this.sunriseColor, 1 - t);
      targetSky = this.nightSky.clone().lerp(this.sunriseColor, 1 - t);
    }
    
    this.ambientLight.color.lerp(targetAmbient, delta * 2);
    this.scene.background.lerp(targetSky, delta * 2);
    
    // Update fog
    const fogDensity = sunHeight > 0 ? 0.015 : 0.025;
    this.scene.fog.color.lerp(targetSky, delta * 2);
    
    // Stars (at night)
    this.updateStars(sunHeight);
  }

  updateStars(sunHeight) {
    // Create stars if they don't exist
    if (!this.stars && sunHeight < 0) {
      this.createStars();
    }
    
    // Show/hide stars based on time
    if (this.stars) {
      this.stars.visible = sunHeight < -0.2;
      if (this.stars.visible) {
        this.stars.material.opacity = Math.min(1, (-sunHeight - 0.2) * 2);
      }
    }
  }

  createStars() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i < 2000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 400;
      
      vertices.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0
    });
    
    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  getTimeString() {
    const hours = Math.floor(this.time * 24);
    const minutes = Math.floor((this.time * 24 - hours) * 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  getDayPhase() {
    if (this.time < 0.25) return '🌅 Dawn';
    if (this.time < 0.5) return '☀️ Morning';
    if (this.time < 0.75) return '🌇 Evening';
    return '🌙 Night';
  }
}