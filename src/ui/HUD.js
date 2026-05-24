// ============================================
// HUD - Heads-Up Display
// ============================================

import * as THREE from 'three';

export class HUD {
  constructor(player) {
    this.player = player;
    this.elements = {};
    this.init();
  }

  init() {
    // Create HUD elements
    this.createHealthBar();
    this.createWantedStars();
    this.createMinimap();
    this.createHotbar();
  }

  createHealthBar() {
    const container = document.createElement('div');
    container.id = 'health-bar';
    container.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 30px;
      width: 200px;
      height: 20px;
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 3px;
      overflow: hidden;
    `;

    const healthFill = document.createElement('div');
    healthFill.id = 'health-fill';
    healthFill.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #e74c3c, #c0392b);
      transition: width 0.3s ease;
    `;

    const healthText = document.createElement('span');
    healthText.id = 'health-text';
    healthText.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
      font-weight: bold;
      text-shadow: 1px 1px 2px black;
    `;
    healthText.textContent = '100';

    container.appendChild(healthFill);
    container.appendChild(healthText);
    document.body.appendChild(container);

    this.elements.healthFill = healthFill;
    this.elements.healthText = healthText;
  }

  createWantedStars() {
    const container = document.createElement('div');
    container.id = 'wanted-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 30px;
      display: flex;
      gap: 5px;
    `;

    this.elements.wantedStars = [];
    for (let i = 0; i < 5; i++) {
      const star = document.createElement('span');
      star.textContent = '☆';
      star.style.cssText = `
        font-size: 28px;
        color: #ffd93d;
        text-shadow: 0 0 10px rgba(255, 217, 61, 0.5);
        opacity: 0.3;
        transition: opacity 0.3s ease;
      `;
      container.appendChild(star);
      this.elements.wantedStars.push(star);
    }

    document.body.appendChild(container);
  }

  createMinimap() {
    const container = document.createElement('div');
    container.id = 'minimap';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 30px;
      width: 150px;
      height: 150px;
      background: rgba(0, 0, 0, 0.6);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 5px;
      overflow: hidden;
    `;

    const canvas = document.createElement('canvas');
    canvas.id = 'minimap-canvas';
    canvas.width = 150;
    canvas.height = 150;
    container.appendChild(canvas);

    document.body.appendChild(container);
    this.elements.minimap = canvas;
    this.elements.minimapCtx = canvas.getContext('2d');
  }

  createHotbar() {
    const container = document.createElement('div');
    container.id = 'hotbar';
    container.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 5px;
      padding: 5px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 5px;
    `;

    this.elements.hotbarSlots = [];
    this.player.hotbar.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.className = 'hotbar-slot';
      slot.style.cssText = `
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        cursor: pointer;
      `;
      slot.innerHTML = `<span>${index + 1}</span><span style="margin-top:2px">${item.name}</span>`;
      
      if (index === 0) {
        slot.style.borderColor = '#ffd93d';
        slot.style.background = 'rgba(255, 217, 61, 0.2)';
      }

      container.appendChild(slot);
      this.elements.hotbarSlots.push(slot);
    });

    document.body.appendChild(container);
  }

  update() {
    // Update health bar
    const healthPercent = (this.player.health / this.player.maxHealth) * 100;
    this.elements.healthFill.style.width = `${healthPercent}%`;
    this.elements.healthText.textContent = Math.floor(this.player.health);

    // Update wanted stars
    for (let i = 0; i < 5; i++) {
      this.elements.wantedStars[i].style.opacity = i < this.player.wantedLevel ? '1' : '0.3';
    }

    // Update hotbar selection
    this.elements.hotbarSlots.forEach((slot, index) => {
      if (index === this.player.selectedSlot) {
        slot.style.borderColor = '#ffd93d';
        slot.style.background = 'rgba(255, 217, 61, 0.2)';
      } else {
        slot.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        slot.style.background = 'rgba(255, 255, 255, 0.1)';
      }
    });

    // Update minimap
    this.updateMinimap();
  }

  updateMinimap() {
    const ctx = this.elements.minimapCtx;
    const size = 150;
    
    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);

    // Draw player position (center)
    const centerX = size / 2;
    const centerY = size / 2;

    // Player indicator
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Direction indicator
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX - Math.sin(this.player.rotation.y) * 10,
      centerY - Math.cos(this.player.rotation.y) * 10
    );
    ctx.stroke();
  }
}