/**
 * Visual Quiz Engine for Petualangan Si Reog
 * 5 simple child-friendly questions with picture & audio support.
 */

class QuizEngine {
  constructor() {
    this.questions = [
      {
        id: 1,
        question: "Reog berasal dari daerah mana?",
        audioText: "Reog berasal dari daerah mana ya?",
        options: [
          { text: "Ponorogo (Jawa Timur)", icon: "🦁", correct: true },
          { text: "Jakarta", icon: "🏙️", correct: false },
          { text: "Bali", icon: "🏝️", correct: false }
        ]
      },
      {
        id: 2,
        question: "Reog Ponorogo merupakan...",
        audioText: "Reog Ponorogo merupakan apa?",
        options: [
          { text: "Kesenian Tradisional", icon: "🎭", correct: true },
          { text: "Kendaraan Mobil", icon: "🚗", correct: false },
          { text: "Makanan Lezat", icon: "🍲", correct: false }
        ]
      },
      {
        id: 3,
        question: "Mana yang menunjukkan kita menjaga budaya?",
        audioText: "Mana perbuatan yang menjaga budaya kita?",
        options: [
          { text: "Belajar Budaya", icon: "❤️", correct: true },
          { text: "Merusak Benda Budaya", icon: "❌", correct: false },
          { text: "Mengejek Budaya", icon: "🙈", correct: false }
        ]
      },
      {
        id: 4,
        question: "Musik pengiring Reog dimainkan dengan alat...",
        audioText: "Musik pengiring Reog dimainkan dengan alat apa?",
        options: [
          { text: "Gamelan & Kendang", icon: "🥁", correct: true },
          { text: "Telepon Genggam", icon: "📱", correct: false },
          { text: "Roda Sepeda", icon: "🚲", correct: false }
        ]
      },
      {
        id: 5,
        question: "Apa nama mahkota merak di atas kepala Reog?",
        audioText: "Apa nama mahkota bulu merak di atas Reog?",
        options: [
          { text: "Dadak Merak", icon: "🦚", correct: true },
          { text: "Topi Badut", icon: "🤡", correct: false },
          { text: "Kacamata", icon: "🕶️", correct: false }
        ]
      }
    ];

    this.currentIndex = 0;
    this.score = 0;
  }

  initQuiz(containerId) {
    this.currentIndex = 0;
    this.score = 0;
    this.renderQuestion(containerId);
  }

  renderQuestion(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const q = this.questions[this.currentIndex];

    container.innerHTML = `
      <div class="quiz-card glow-card">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${((this.currentIndex + 1) / this.questions.length) * 100}%"></div>
        </div>
        <span class="quiz-step-badge">Pertanyaan ${this.currentIndex + 1} dari ${this.questions.length}</span>

        <h3 class="quiz-question-title">${q.question}</h3>
        
        <button class="btn-speaker" id="btn-quiz-audio" aria-label="Dengarkan Pertanyaan">
          🔊 Dengarkan
        </button>

        <div class="quiz-options-list">
          ${q.options.map((opt, idx) => `
            <button class="quiz-opt-btn" data-correct="${opt.correct}">
              <span class="quiz-opt-icon">${opt.icon}</span>
              <span class="quiz-opt-text">${opt.text}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Auto trigger speech or speech button
    const audioBtn = document.getElementById('btn-quiz-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        window.appAudio.speak(q.audioText);
      });
    }

    // Speak initial question automatically
    window.appAudio.speak(q.audioText);

    // Option Event Listeners
    container.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.correct === 'true';

        if (isCorrect) {
          btn.classList.add('correct');
          window.appAudio.playSuccess();
          this.score++;

          if (window.appMascot) {
            window.appMascot.say("Luar biasa! Jawabanmu tepat sekali!", "celebrate");
          }

          setTimeout(() => {
            this.currentIndex++;
            if (this.currentIndex < this.questions.length) {
              this.renderQuestion(containerId);
            } else {
              this.finishQuiz();
            }
          }, 1200);

        } else {
          btn.classList.add('wrong');
          window.appAudio.playGentleRetry();
          
          if (window.appMascot) {
            const encouragedPhrases = [
              "Coba lagi ya, kamu pasti bisa!",
              "Hampir benar! Ayo pilih lagi!",
              "Ayo kita coba bersama-sama!"
            ];
            const phrase = encouragedPhrases[Math.floor(Math.random() * encouragedPhrases.length)];
            window.appMascot.say(phrase, "encouragement");
          }
        }
      });
    });
  }

  finishQuiz() {
    window.appAudio.playSuccess();
    window.appStorage.addStars(5);
    window.appStorage.completeMission(6);
    window.appStorage.unlockBadge('petualang_nusantara');

    if (window.appMascot) {
      window.appMascot.say("Kamu hebat sekali! Berhasil menjawab semua pertanyaan!", "celebrate");
    }

    const modal = document.getElementById('victory-modal');
    if (modal) {
      document.getElementById('victory-title').innerText = "⭐⭐⭐⭐⭐ Kuis Selesai!";
      document.getElementById('victory-desc').innerText = "Hebat! Kamu mendapatkan 5 bintang penuh dan Lencana Petualang Nusantara!";
      modal.classList.add('active');
    }
  }
}

window.appQuiz = new QuizEngine();
