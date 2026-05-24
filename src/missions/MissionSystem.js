// ============================================
// PHASE 5: MISSIONS & ECONOMY SYSTEM
// ============================================

export class MissionSystem {
  constructor(player, firebaseService) {
    this.player = player;
    this.firebaseService = firebaseService;
    this.currentMission = null;
    this.missions = this.loadMissions();
    this.missionProgress = {};
  }

  loadMissions() {
    return [
      {
        id: 'tutorial_1',
        name: 'First Steps',
        description: 'Explore the city and find a vehicle',
        type: 'explore',
        target: 'vehicle',
        reward: { cash: 500, xp: 100 },
        completed: false
      },
      {
        id: 'tutorial_2',
        name: 'Street Race',
        description: 'Win a race against the clock',
        type: 'race',
        targetDistance: 500,
        timeLimit: 120,
        reward: { cash: 1000, xp: 200 },
        completed: false
      },
      {
        id: 'heist_1',
        name: 'Bank Heist',
        description: 'Rob the city bank and escape',
        type: 'heist',
        steps: ['Enter bank', 'Disable alarm', 'Get to vault', 'Escape'],
        reward: { cash: 5000, xp: 1000 },
        completed: false
      },
      {
        id: 'survival_1',
        name: 'Survive the Hunt',
        description: 'Escape from 5-star wanted level for 2 minutes',
        type: 'survival',
        requiredStars: 5,
        survivalTime: 120,
        reward: { cash: 2000, xp: 500 },
        completed: false
      },
      {
        id: 'delivery_1',
        name: 'Package Delivery',
        description: 'Deliver a package across the city',
        type: 'delivery',
        targetDistance: 1000,
        reward: { cash: 800, xp: 150 },
        completed: false
      },
      {
        id: 'collection_1',
        name: 'Collector',
        description: 'Collect 10 hidden packages',
        type: 'collection',
        packagesRequired: 10,
        reward: { cash: 3000, xp: 800 },
        completed: false
      }
    ];
  }

  startMission(missionId) {
    const mission = this.missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return false;
    
    this.currentMission = { ...mission, progress: 0, startTime: Date.now() };
    this.player.showNotification(`🎯 Mission started: ${mission.name}`);
    return true;
  }

  updateMission(progressData) {
    if (!this.currentMission) return;
    
    const mission = this.currentMission;
    
    switch (mission.type) {
      case 'explore':
        if (progressData.foundVehicle) {
          this.completeMission();
        }
        break;
        
      case 'race':
        const elapsed = (Date.now() - mission.startTime) / 1000;
        mission.progress = Math.min(100, (elapsed / mission.timeLimit) * 100);
        if (progressData.distance >= mission.targetDistance) {
          if (elapsed <= mission.timeLimit) {
            this.completeMission();
          }
        }
        break;
        
      case 'survival':
        const survivalTime = (Date.now() - mission.startTime) / 1000;
        if (this.player.wantedLevel >= mission.requiredStars) {
          mission.progress = (survivalTime / mission.survivalTime) * 100;
          if (survivalTime >= mission.survivalTime) {
            this.completeMission();
          }
        } else {
          this.failMission('Lost your wanted level!');
        }
        break;
        
      case 'delivery':
        if (progressData.distance >= mission.targetDistance) {
          this.completeMission();
        }
        break;
        
      case 'collection':
        mission.collected = mission.collected || 0;
        if (progressData.packageCollected) {
          mission.collected++;
          mission.progress = (mission.collected / mission.packagesRequired) * 100;
          this.player.showNotification(`📦 ${mission.collected}/${mission.packagesRequired} packages`);
          
          if (mission.collected >= mission.packagesRequired) {
            this.completeMission();
          }
        }
        break;
    }
  }

  completeMission() {
    if (!this.currentMission) return;
    
    const mission = this.currentMission;
    mission.completed = true;
    
    // Award rewards
    if (mission.reward.cash) {
      this.player.money += mission.reward.cash;
      this.player.showNotification(`💰 +$${mission.reward.cash}`);
    }
    if (mission.reward.xp) {
      this.addXP(mission.reward.xp);
    }
    
    // Save to Firebase
    if (this.firebaseService.userData) {
      this.firebaseService.updateStats({
        missionsCompleted: (this.firebaseService.userData.stats.missionsCompleted || 0) + 1,
        cash: this.player.money
      });
    }
    
    this.player.showNotification(`✅ Mission Complete: ${mission.name}!`);
    this.currentMission = null;
  }

  failMission(reason) {
    this.player.showNotification(`❌ Mission Failed: ${reason}`);
    this.currentMission = null;
  }

  addXP(amount) {
    this.player.xp = (this.player.xp || 0) + amount;
    
    // Level up check
    const xpNeeded = this.player.level * 500;
    if (this.player.xp >= xpNeeded) {
      this.player.xp -= xpNeeded;
      this.player.level = (this.player.level || 1) + 1;
      this.player.showNotification(`🎉 Level Up! You're now level ${this.player.level}`);
    }
  }

  getAvailableMissions() {
    return this.missions.filter(m => !m.completed);
  }

  getMissionStatus() {
    if (!this.currentMission) return null;
    return {
      name: this.currentMission.name,
      progress: this.currentMission.progress,
      description: this.currentMission.description
    };
  }
}