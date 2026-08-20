/**
 * Storage Manager for Petualangan Si Reog
 * Manages user progress, dynamic content (Stories, Quizzes, Learn Cards),
 * and Admin Dashboard authentication & persistence.
 */

const STORAGE_KEY_PROGRESS = 'petualangan_si_reog_progress_v1';
const STORAGE_KEY_STORIES = 'petualangan_si_reog_stories_v1';
const STORAGE_KEY_QUIZZES = 'petualangan_si_reog_quizzes_v1';
const STORAGE_KEY_LEARN = 'petualangan_si_reog_learn_v1';
const STORAGE_KEY_ADMIN = 'petualangan_si_reog_admin_v1';
const STORAGE_KEY_SESSION = 'petualangan_si_reog_session_v1';

const DEFAULT_PROGRESS = {
  stars: 0,
  unlockedMissions: [1],
  completedMissions: [],
  badges: [],
  coloringProgress: null,
  quizHighScore: 0,
  lastPlayed: new Date().toISOString()
};

const DEFAULT_STORIES = [
  { id: 1, title: "Scene 1: Festival Budaya", desc: "Budi dan Sisi pergi ke Festival Budaya Nusantara bersama ibu dan ayah. Ada banyak kebudayaan indah dari seluruh Indonesia!", icon: "🎡" },
  { id: 2, title: "Scene 2: Melihat Reog Pertama Kali", desc: "Tiba-tiba terdengar suara musik yang meriah! Budi kaget melihat topeng singa raksasa bermahkota bulu merak yang sangat megah. Itulah Reog Ponorogo!", icon: "🦁" },
  { id: 3, title: "Scene 3: Mengenal Kostum Reog", desc: "Penari Reog memakai kostum Singo Barong yang beratnya bisa mencapai 50 kilogram! Penari mengangkatnya hanya dengan menggunakan kekuatan gigi dan rahang.", icon: "👑" },
  { id: 4, title: "Scene 4: Mendengarkan Musik Tradisional", desc: "Suara gamelan, kendang, dan suling berbunyi nyaring. Ritme musiknya membuat semua orang ingin menari dengan gembira!", icon: "🪘" },
  { id: 5, title: "Scene 5: Berbincang dengan Penari", desc: "Budi bertanya kepada Pak Penari, 'Bagaimana cara melestarikan Reog?' Pak Penari tersenyum dan menjawab, 'Dengan rajin belajar dan mencintai budaya kita!'", icon: "🎭" },
  { id: 6, title: "Scene 6: Janji Menjaga Budaya", desc: "Budi dan Sisi berjanji akan terus mengenalkan kebudayaan Indonesia kepada teman-teman lainnya agar budaya Nusantara tetap lestari.", icon: "🤝" },
  { id: 7, title: "Scene 7: Lencana Sahabat Budaya", desc: "Selamat! Kamu telah membaca cerita hingga selesai dan berhak mendapatkan Lencana Sahabat Budaya!", icon: "🏆" }
];

const DEFAULT_QUIZZES = [
  { id: 1, question: "Reog berasal dari daerah mana ya?", options: ["Ponorogo", "Jakarta", "Bali"], answer: 0, icon: "🗺️" },
  { id: 2, question: "Reog Ponorogo merupakan apa?", options: ["Kesenian Tradisional", "Makanan", "Baju"], answer: 0, icon: "🦁" },
  { id: 3, question: "Mana perbuatan yang menjaga budaya kita?", options: ["Cinta Budaya", "Merusak Alat Musik", "Melupakan Tradisi"], answer: 0, icon: "❤️" },
  { id: 4, question: "Musik pengiring Reog dimainkan dengan alat apa?", options: ["Gamelan & Kendang", "Gitar Listrik", "Drum Modern"], answer: 0, icon: "🪘" },
  { id: 5, question: "Apa nama mahkota bulu merak di atas Reog?", options: ["Dadak Merak", "Topeng Kertas", "Topeng Kayu"], answer: 0, icon: "🦚" }
];

const DEFAULT_LEARN_CARDS = [
  { id: 1, title: "Reog Ponorogo", text: "Kesenian tradisional Indonesia yang sangat megah dan terkenal di dunia!", icon: "🦁" },
  { id: 2, title: "Asal Daerah", text: "Reog berasal dari Kabupaten Ponorogo, Jawa Timur, Indonesia.", icon: "🗺️" },
  { id: 3, title: "Singo Barong", text: "Kepala singa raksasa yang diangkat penari hanya dengan menggunakan gigi dan rahang!", icon: "👑" },
  { id: 4, title: "Dadak Merak", text: "Hiasan bulu merak yang sangat cantik dan megah berdiri tinggi di atas Reog.", icon: "🦚" },
  { id: 5, title: "Musik Pengiring", text: "Reog diiringi oleh instrumen gamelan, kendang, terompet, dan suling yang bersemangat!", icon: "🪘" }
];

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123'
};

class StorageManager {
  constructor() {
    this.data = this.loadData();
  }

  // --- Progress Management ---
  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (stored) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('LocalStorage not available, using in-memory state.', e);
    }
    return { ...DEFAULT_PROGRESS };
  }

  saveData() {
    try {
      this.data.lastPlayed = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(this.data));
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
      return true;
    }
    return false;
  }

  saveColoring(canvasDataUrl) {
    this.data.coloringProgress = canvasDataUrl;
    this.saveData();
  }

  getColoring() {
    return this.data.coloringProgress;
  }

  resetAllData() {
    this.data = { ...DEFAULT_PROGRESS, unlockedMissions: [1], completedMissions: [], badges: [] };
    this.saveData();
  }

  // --- Dynamic Content Management ---
  getStories() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STORIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [...DEFAULT_STORIES];
  }

  saveStories(stories) {
    try {
      localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(stories));
    } catch (e) {}
  }

  getQuizzes() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_QUIZZES);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [...DEFAULT_QUIZZES];
  }

  saveQuizzes(quizzes) {
    try {
      localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(quizzes));
    } catch (e) {}
  }

  getLearnCards() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LEARN);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [...DEFAULT_LEARN_CARDS];
  }

  saveLearnCards(cards) {
    try {
      localStorage.setItem(STORAGE_KEY_LEARN, JSON.stringify(cards));
    } catch (e) {}
  }

  resetContentToDefault() {
    localStorage.removeItem(STORAGE_KEY_STORIES);
    localStorage.removeItem(STORAGE_KEY_QUIZZES);
    localStorage.removeItem(STORAGE_KEY_LEARN);
  }

  // --- Admin Authentication & Credentials ---
  getAdminCredentials() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ADMIN);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return { ...DEFAULT_ADMIN };
  }

  saveAdminCredentials(creds) {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(creds));
    } catch (e) {}
  }

  isAdminLoggedIn() {
    return sessionStorage.getItem(STORAGE_KEY_SESSION) === 'true';
  }

  setAdminLoggedIn(status) {
    if (status) {
      sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEY_SESSION);
    }
  }
}

window.appStorage = new StorageManager();
