/**
 * Storage Manager for Petualangan Si Reog
 * Manages stars, completed missions, unlocked badges, and persistence.
 */

const STORAGE_KEY = 'petualangan_si_reog_data_v1';

const DEFAULT_DATA = {
  stars: 0,
  unlockedMissions: [1], // Mission 1 is unlocked by default
  completedMissions: [],
  badges: [],
  coloringProgress: null,
  quizHighScore: 0,
  lastPlayed: new Date().toISOString()
};

class StorageManager {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_DATA, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('LocalStorage not available, using in-memory state.', e);
    }
    return { ...DEFAULT_DATA };
  }

  saveData() {
    try {
      this.data.lastPlayed = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save to localStorage.', e);
    }
  }

  getStars() {
    return this.data.stars || 0;
  }

  addStars(amount) {
    this.data.stars = (this.data.stars || 0) + amount;
    this.saveData();
    return this.data.stars;
  }

  isMissionUnlocked(missionId) {
    return this.data.unlockedMissions.includes(Number(missionId));
  }

  isMissionCompleted(missionId) {
    return this.data.completedMissions.includes(Number(missionId));
  }

  completeMission(missionId) {
    const id = Number(missionId);
    if (!this.data.completedMissions.includes(id)) {
      this.data.completedMissions.push(id);
    }
    
    // Unlock next mission
    const nextMission = id + 1;
    if (nextMission <= 6 && !this.data.unlockedMissions.includes(nextMission)) {
      this.data.unlockedMissions.push(nextMission);
    }
    
    this.saveData();
  }

  getBadges() {
    return this.data.badges || [];
  }

  hasBadge(badgeId) {
    return (this.data.badges || []).includes(badgeId);
  }

  unlockBadge(badgeId) {
    if (!this.data.badges) {
      this.data.badges = [];
    }
    if (!this.data.badges.includes(badgeId)) {
      this.data.badges.push(badgeId);
      this.saveData();
      return true; // Newly unlocked
    }
    return false; // Already had it
  }

  saveColoring(canvasDataUrl) {
    this.data.coloringProgress = canvasDataUrl;
    this.saveData();
  }

  getColoring() {
    return this.data.coloringProgress;
  }

  resetAllData() {
    this.data = { ...DEFAULT_DATA, unlockedMissions: [1], completedMissions: [], badges: [] };
    this.saveData();
  }
}

window.appStorage = new StorageManager();
