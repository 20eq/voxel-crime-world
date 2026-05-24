// ============================================
// SHOP SYSTEM
// ============================================

export class ShopSystem {
  constructor(player, firebaseService) {
    this.player = player;
    this.firebaseService = firebaseService;
    this.isOpen = false;
    
    this.items = {
      weapons: [
        { id: 'pistol', name: 'Pistol', price: 500, damage: 20, ammo: 30 },
        { id: 'shotgun', name: 'Shotgun', price: 1500, damage: 50, ammo: 8 },
        { id: 'rifle', name: 'Rifle', price: 2500, damage: 35, ammo: 25 },
        { id: 'knife', name: 'Knife', price: 200, damage: 15, melee: true }
      ],
      vehicles: [
        { id: 'sedan', name: 'Sedan', price: 3000, speed: 25 },
        { id: 'sports', name: 'Sports Car', price: 15000, speed: 35 },
        { id: 'suv', name: 'SUV', price: 8000, speed: 20 },
        { id: 'motorcycle', name: 'Motorcycle', price: 5000, speed: 40 },
        { id: 'helicopter', name: 'Helicopter', price: 50000, speed: 50 }
      ],
      ammo: [
        { id: 'pistol_ammo', name: 'Pistol Ammo (30)', price: 50 },
        { id: 'shotgun_ammo', name: 'Shotgun Shells (8)', price: 100 },
        { id: 'rifle_ammo', name: 'Rifle Ammo (25)', price: 75 }
      ],
      armor: [
        { id: 'light_armor', name: 'Light Armor', price: 500, protection: 25 },
        { id: 'heavy_armor', name: 'Heavy Armor', price: 1500, protection: 50 }
      ],
      upgrades: [
        { id: 'health_boost', name: 'Health Boost (+25)', price: 1000 },
        { id: 'speed_boost', name: 'Speed Boost (+10%)', price: 2000 },
        { id: 'damage_boost', name: 'Damage Boost (+15%)', price: 3000 }
      ]
    };
    
    this.createUI();
  }

  createUI() {
    // Shop overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'shop-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    `;

    // Shop container
    const container = document.createElement('div');
    container.id = 'shop-container';
    container.style.cssText = `
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 20px;
      padding: 30px;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="font-size: 2rem;">🛒 Black Market</h2>
        <div style="text-align: right;">
          <p style="color: #ffd93d; font-size: 1.5rem;">$${this.player.money}</p>
          <p style="color: #888; font-size: 0.8rem;">Your Cash</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <button class="shop-tab active" data-tab="weapons" style="
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          border-radius: 10px;
          cursor: pointer;
        ">🔫 Weapons</button>
        <button class="shop-tab" data-tab="vehicles" style="
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          border-radius: 10px;
          cursor: pointer;
        ">🚗 Vehicles</button>
        <button class="shop-tab" data-tab="ammo" style="
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          border-radius: 10px;
          cursor: pointer;
        ">📦 Ammo</button>
        <button class="shop-tab" data-tab="armor" style="
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          border-radius: 10px;
          cursor: pointer;
        ">🛡️ Armor</button>
      </div>
      
      <div id="shop-items" style="display: grid; gap: 10px;">
        <!-- Items will be populated here -->
      </div>
      
      <button id="close-shop" style="
        margin-top: 20px;
        padding: 10px 30px;
        background: #e74c3c;
        border: none;
        color: white;
        border-radius: 10px;
        cursor: pointer;
        font-size: 1rem;
      ">Close Shop (ESC)</button>
    `;

    this.overlay.appendChild(container);
    document.body.appendChild(this.overlay);

    // Tab switching
    container.querySelectorAll('.shop-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.showCategory(tab.dataset.tab);
      });
    });

    // Close button
    document.getElementById('close-shop').addEventListener('click', () => this.close());

    // ESC to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
      if (e.key === 'k' || e.key === 'K') {
        if (!this.isOpen && this.player.canMove) {
          this.open();
        }
      }
    });

    // Show first category
    this.showCategory('weapons');
  }

  showCategory(category) {
    const itemsContainer = document.getElementById('shop-items');
    const items = this.items[category] || [];
    
    itemsContainer.innerHTML = items.map(item => `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.2s;
      " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
        <div>
          <h4 style="margin: 0 0 5px 0;">${item.name}</h4>
          <p style="margin: 0; color: #888; font-size: 0.9rem;">
            ${item.damage ? `Damage: ${item.damage}` : ''}
            ${item.protection ? `Protection: ${item.protection}%` : ''}
            ${item.speed ? `Speed: ${item.speed}` : ''}
            ${item.ammo ? `Ammo: ${item.ammo}` : ''}
          </p>
        </div>
        <div style="text-align: right;">
          <p style="color: #ffd93d; font-size: 1.2rem; margin: 0;">$${item.price}</p>
          <button onclick="window.buyItem('${item.id}', '${category}')" style="
            padding: 5px 15px;
            background: #27ae60;
            border: none;
            color: white;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 5px;
          ">Buy</button>
        </div>
      </div>
    `).join('');

    // Global buy function
    window.buyItem = (itemId, category) => this.buyItem(itemId, category);
  }

  async buyItem(itemId, category) {
    const items = this.items[category];
    const item = items.find(i => i.id === itemId);
    
    if (!item) return;
    
    if (this.player.money < item.price) {
      this.player.showNotification('❌ Not enough cash!');
      return;
    }
    
    // Deduct money
    this.player.money -= item.price;
    
    // Apply item
    switch (category) {
      case 'weapons':
        // Add to hotbar
        this.player.hotbar.push({
          name: item.name,
          type: item.melee ? 'melee' : 'gun',
          damage: item.damage,
          ammo: item.ammo || 0
        });
        this.player.showNotification(`🎯 Purchased ${item.name}!`);
        break;
        
      case 'ammo':
        // Find matching weapon and add ammo
        this.player.hotbar.forEach(slot => {
          if (slot.name.toLowerCase().includes(itemId.split('_')[0])) {
            slot.ammo += item.name.match(/\d+/)?.[0] || 0;
          }
        });
        this.player.showNotification(`📦 Purchased ${item.name}!`);
        break;
        
      case 'armor':
        this.player.armor = Math.max(this.player.armor, item.protection);
        this.player.showNotification(`🛡️ Purchased ${item.name}!`);
        break;
        
      case 'vehicles':
        this.player.showNotification(`🚗 Purchase ${item.name} - Check your garage!`);
        break;
    }
    
    // Update cash display
    document.querySelector('#shop-container > div > div:last-child > p').textContent = `$${this.player.money}`;
    
    // Save to Firebase
    if (this.firebaseService.userData) {
      await this.firebaseService.saveUserData({
        cash: this.player.money,
        inventory: this.player.hotbar
      });
    }
  }

  open() {
    this.overlay.style.display = 'flex';
    this.isOpen = true;
    document.exitPointerLock();
  }

  close() {
    this.overlay.style.display = 'none';
    this.isOpen = false;
  }
}