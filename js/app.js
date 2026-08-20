/**
 * Main Controller App for Petualangan Si Reog
 * Manages SPA Routing, Mascot System, Adventure Map, Storybook, and Modals.
 */

class AppController {
  constructor() {
    this.currentScreen = 'home';
    this.currentStoryScene = 0;

    this.storyScenes = [
      {
        title: "Scene 1: Festival Budaya",
        desc: "Budi dan Sisi pergi ke Festival Budaya Nusantara bersama ibu dan ayah. Ada banyak kebudayaan indah dari seluruh Indonesia!",
        audioText: "Budi dan Sisi pergi ke Festival Budaya Nusantara bersama ibu dan ayah. Ada banyak kebudayaan indah dari seluruh Indonesia!",
        icon: "🎡"
      },
      {
        title: "Scene 2: Melihat Reog Pertama Kali",
        desc: "Tiba-tiba terdengar suara musik yang meriah! Budi kaget melihat topeng singa raksasa bermahkota bulu merak yang sangat megah. Itulah Reog Ponorogo!",
        audioText: "Tiba-tiba terdengar suara musik yang meriah! Budi kaget melihat topeng singa raksasa bermahkota bulu merak yang sangat megah. Itulah Reog Ponorogo!",
        icon: "🦁"
      },
      {
        title: "Scene 3: Mengenal Kostum Reog",
        desc: "Penari Reog memakai kostum Singo Barong yang beratnya bisa mencapai 50 kilogram! Penari mengangkatnya hanya dengan menggunakan kekuatan gigi dan rahang.",
        audioText: "Penari Reog memakai kostum Singo Barong yang sangat berat! Penari mengangkatnya hanya dengan kekuatan giginya.",
        icon: "👑"
      },
      {
        title: "Scene 4: Mendengarkan Musik Tradisional",
        desc: "Suara gamelan, kendang, dan suling berbunyi nyaring. Ritme musiknya membuat semua orang ingin menari dengan gembira!",
        audioText: "Suara gamelan, kendang, dan suling berbunyi nyaring. Ritme musiknya membuat semua orang ingin menari gembira!",
        icon: "🪘"
      },
      {
        title: "Scene 5: Berbincang dengan Penari",
        desc: "Budi bertanya kepada Pak Penari, 'Bagaimana cara melestarikan Reog?' Pak Penari tersenyum dan menjawab, 'Dengan rajin belajar dan mencintai budaya kita!'",
        audioText: "Pak Penari berpesan, rajinlah belajar dan cintai budaya Indonesia!",
        icon: "🎭"
      },
      {
        title: "Scene 6: Janji Menjaga Budaya",
        desc: "Budi dan Sisi berjanji akan terus mengenalkan kebudayaan Indonesia kepada teman-teman lainnya agar budaya Nusantara tetap lestari.",
        audioText: "Budi dan Sisi berjanji akan terus mengenalkan kebudayaan Indonesia agar tetap lestari.",
        icon: "🤝"
      },
      {
        title: "Scene 7: Lencana Sahabat Budaya",
        desc: "Selamat! Kamu telah membaca cerita hingga selesai dan berhak mendapatkan Lencana Sahabat Budaya!",
        audioText: "Selamat! Kamu telah membaca cerita hingga selesai dan berhak mendapatkan Lencana Sahabat Budaya!",
        icon: "🏆"
      }
    ];
  }

  init() {
    this.bindEvents();
    this.updateHeaderStats();
    this.renderAdventureMap();
    this.renderBadges();
    this.showScreen('home');
  }

  bindEvents() {
    // First user interaction listener to start BGM smoothly (bypasses browser autoplay policy)
    const startAudioOnFirstInteraction = () => {
      window.appAudio.playBGM();
      document.removeEventListener('click', startAudioOnFirstInteraction);
      document.removeEventListener('keydown', startAudioOnFirstInteraction);
    };
    document.addEventListener('click', startAudioOnFirstInteraction);
    document.addEventListener('keydown', startAudioOnFirstInteraction);

    // Navigation Buttons
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetScreen = btn.dataset.nav;
        if (targetScreen) {
          window.appAudio.playPop();
          this.showScreen(targetScreen);
        }
      });
    });

    // Mute / Unmute Button
    const muteBtn = document.getElementById('btn-mute-toggle');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = window.appAudio.toggleMute();
        muteBtn.innerText = isMuted ? '🔇 Audio Off' : '🔊 Audio On';
        muteBtn.classList.toggle('muted', isMuted);
      });
    }

    // Storybook Navigation
    const prevStoryBtn = document.getElementById('btn-prev-story');
    const nextStoryBtn = document.getElementById('btn-next-story');
    const speakStoryBtn = document.getElementById('btn-speak-story');

    if (prevStoryBtn) {
      prevStoryBtn.addEventListener('click', () => {
        if (this.currentStoryScene > 0) {
          this.currentStoryScene--;
          this.renderStoryScene();
          window.appAudio.playPop();
        }
      });
    }

    if (nextStoryBtn) {
      nextStoryBtn.addEventListener('click', () => {
        if (this.currentStoryScene < this.storyScenes.length - 1) {
          this.currentStoryScene++;
          this.renderStoryScene();
          window.appAudio.playPop();
        } else {
          // Complete Mission 2, unlock badge & return to map
          window.appStorage.completeMission(2);
          window.appStorage.unlockBadge('sahabat_budaya');
          window.appStorage.addStars(5);
          window.appAudio.playSuccess();
          
          if (window.appMascot) {
            window.appMascot.say("Hebat! Kamu telah menyimak seluruh Cerita Reog!", "celebrate");
          }

          const modal = document.getElementById('victory-modal');
          if (modal) {
            document.getElementById('victory-title').innerText = "Cerita Selesai!";
            document.getElementById('victory-desc').innerText = "Kamu telah menyelesaikan Cerita Reog, mendapatkan 5 Bintang dan Lencana Sahabat Budaya!";
            modal.classList.add('active');
          }

          this.showScreen('adventure');
        }
      });
    }

    if (speakStoryBtn) {
      speakStoryBtn.addEventListener('click', () => {
        const scene = this.storyScenes[this.currentStoryScene];
        window.appAudio.speak(scene.audioText);
      });
    }

    // Learn Section Audio Buttons
    document.querySelectorAll('.btn-learn-audio').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.speech;
        if (text) {
          window.appAudio.speak(text);
          window.appAudio.playPop();
        }
      });
    });

    // Tool Mode Buttons (Cat Ember, Kuas, Penghapus)
    document.querySelectorAll('.tool-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        window.appGames.setToolMode(mode);
      });
    });

    // Brush Size Buttons (Kecil, Sedang, Besar)
    document.querySelectorAll('.brush-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.brush-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const size = btn.dataset.size;
        window.appGames.setBrushSize(size);
      });
    });

    // Coloring Colors
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        window.appGames.setColor(btn.dataset.color);
      });
    });

    const resetColorBtn = document.getElementById('btn-color-reset');
    if (resetColorBtn) {
      resetColorBtn.addEventListener('click', () => {
        window.appGames.resetColoring();
      });
    }

    const finishColorBtn = document.getElementById('btn-color-finish');
    if (finishColorBtn) {
      finishColorBtn.addEventListener('click', () => {
        window.appGames.finishColoring();
      });
    }

    // Modal Close Button
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
        this.updateHeaderStats();
        this.renderAdventureMap();
        this.renderBadges();
        this.showScreen('adventure');
      });
    });

    // Parent Guide Tab Switches
    document.querySelectorAll('.guide-tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.guide-tab-btn').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.guide-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const targetPanel = document.getElementById(tab.dataset.target);
        if (targetPanel) targetPanel.classList.add('active');
        window.appAudio.playPop();
      });
    });
  }

  showScreen(screenId) {
    this.currentScreen = screenId;
    document.querySelectorAll('.screen-view').forEach(sc => sc.classList.remove('active'));

    const activeEl = document.getElementById(`screen-${screenId}`);
    if (activeEl) {
      activeEl.classList.add('active');
    }

    this.updateHeaderStats();

    switch (screenId) {
      case 'home':
        this.sayMascot("Halo, Teman! Ayo jelajahi kebudayaan Nusantara bersama Si Reog!", "cheerful");
        break;
      case 'adventure':
        this.renderAdventureMap();
        this.sayMascot("Pilih misi petualanganmu ya!", "cheerful");
        break;
      case 'learn':
        window.appStorage.completeMission(1);
        this.renderAdventureMap();
        this.sayMascot("Yuk, kita belajar mengenal Reog Ponorogo!", "cheerful");
        break;
      case 'story':
        this.currentStoryScene = 0;
        this.renderStoryScene();
        this.sayMascot("Dengarkan cerita seru tentang Reog ya!", "cheerful");
        break;
      case 'puzzle':
        window.appGames.initPuzzle('puzzle-game-container', 3, 3);
        this.sayMascot("Susun potongan gambar Reog ini ke tempat yang tepat!", "cheerful");
        break;
      case 'coloring':
        window.appGames.initColoringCanvas('coloring-canvas');
        this.sayMascot("Pilih mode alat, ukuran kuas, dan warna di bawah!", "cheerful");
        break;
      case 'music':
        window.appGames.initMusicGame('music-game-container');
        this.sayMascot("Dengarkan suara alat musik dan tebak yang mana jawabannya!", "cheerful");
        break;
      case 'quiz':
        window.appQuiz.initQuiz('quiz-game-container');
        this.sayMascot("Jawab pertanyaan kuis ceria ini dengan teliti ya!", "cheerful");
        break;
      case 'badges':
        this.renderBadges();
        this.sayMascot("Ini dia semua koleksi lencana hebatmu!", "cheerful");
        break;
      case 'parent-guide':
        this.sayMascot("Panduan belajar ini khusus untuk Orang Tua dan Guru.", "informative");
        break;
    }
  }

  updateHeaderStats() {
    const starCountEl = document.getElementById('header-star-count');
    if (starCountEl) {
      starCountEl.innerText = window.appStorage.getStars();
    }
  }

  sayMascot(message, emotion = 'cheerful') {
    const bubble = document.getElementById('mascot-dialog-text');
    if (bubble) {
      bubble.innerText = message;
      window.appAudio.speak(message);
    }
  }

  renderAdventureMap() {
    const mapContainer = document.getElementById('adventure-nodes-container');
    if (!mapContainer) return;

    const missions = [
      { id: 1, title: 'Kenalan dengan Reog', nav: 'learn', icon: '📖' },
      { id: 2, title: 'Cerita Reog', nav: 'story', icon: '📚' },
      { id: 3, title: 'Puzzle Reog', nav: 'puzzle', icon: '🧩' },
      { id: 4, title: 'Mewarnai Reog', nav: 'coloring', icon: '🎨' },
      { id: 5, title: 'Kenali Musik', nav: 'music', icon: '🎵' },
      { id: 6, title: 'Kuis Ceria', nav: 'quiz', icon: '🌟' }
    ];

    mapContainer.innerHTML = missions.map(m => {
      const isUnlocked = window.appStorage.isMissionUnlocked(m.id);
      const isCompleted = window.appStorage.isMissionCompleted(m.id);

      return `
        <button class="mission-node ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}" 
                data-nav="${isUnlocked ? m.nav : ''}" 
                ${!isUnlocked ? 'disabled' : ''}>
          <div class="mission-badge-icon">${m.icon}</div>
          <div class="mission-title">Misi ${m.id}: ${m.title}</div>
          <div class="mission-status-stars">
            ${isCompleted ? '⭐⭐⭐' : isUnlocked ? '⭐ Baru' : '🔒 Terkunci'}
          </div>
        </button>
      `;
    }).join('');

    mapContainer.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.nav) {
          window.appAudio.playPop();
          this.showScreen(btn.dataset.nav);
        }
      });
    });
  }

  renderStoryScene() {
    const scene = this.storyScenes[this.currentStoryScene];
    const container = document.getElementById('story-scene-container');
    if (!container) return;

    const isLastScene = (this.currentStoryScene === this.storyScenes.length - 1);

    container.innerHTML = `
      <div class="story-card glow-card">
        <div class="story-icon">${scene.icon}</div>
        <h3 class="story-title">${scene.title}</h3>
        <p class="story-desc">${scene.desc}</p>
        <span class="story-progress">Halaman ${this.currentStoryScene + 1} dari ${this.storyScenes.length}</span>
      </div>
    `;

    const nextBtn = document.getElementById('btn-next-story');
    if (nextBtn) {
      nextBtn.innerHTML = isLastScene ? 'Selesai & Ke Peta 🗺️' : 'Lanjut ➡️';
    }

    window.appAudio.speak(scene.audioText);
  }

  renderBadges() {
    const container = document.getElementById('badges-grid-container');
    if (!container) return;

    const allBadges = [
      { id: 'sahabat_budaya', name: 'Sahabat Budaya', desc: 'Membaca cerita Reog sampai selesai', icon: '🏆' },
      { id: 'seniman_cilik', name: 'Seniman Cilik', desc: 'Menyelesaikan mewarnai Reog', icon: '🎨' },
      { id: 'ahli_puzzle', name: 'Ahli Puzzle', desc: 'Berhasil menyusun puzzle Reog', icon: '🧩' },
      { id: 'pendengar_musik', name: 'Pendengar Musik', desc: 'Menebak instrumen tradisional', icon: '🎵' },
      { id: 'petualang_nusantara', name: 'Petualang Nusantara', desc: 'Menjawab Kuis Ceria dengan baik', icon: '🌟' }
    ];

    container.innerHTML = allBadges.map(b => {
      const isEarned = window.appStorage.hasBadge(b.id);
      return `
        <div class="badge-card ${isEarned ? 'earned' : 'locked'} glow-card">
          <div class="badge-icon-wrap">${b.icon}</div>
          <h4 class="badge-name">${b.name}</h4>
          <p class="badge-desc">${b.desc}</p>
          <span class="badge-status-tag">${isEarned ? '✅ Terbuka' : '🔒 Belum Terbuka'}</span>
        </div>
      `;
    }).join('');
  }
}

window.appMascot = {
  say: (msg, emotion) => {
    if (window.appController) {
      window.appController.sayMascot(msg, emotion);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.appController = new AppController();
  window.appController.init();
});
