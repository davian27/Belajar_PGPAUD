/**
 * Visual Quiz Engine for Petualangan Si Reog
 * 5 simple child-friendly questions with picture & audio support.
 */

class QuizEngine {
  constructor() {
    this.questions = window.appStorage ? window.appStorage.getQuizzes() : [];
    this.currentIndex = 0;
    this.score = 0;
  }

  initQuiz(containerId) {
    this.questions = window.appStorage ? window.appStorage.getQuizzes() : [];
    this.currentIndex = 0;
    this.score = 0;
    this.renderQuestion(containerId || 'quiz-game-container');
  }

  renderQuestion(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!this.questions || this.questions.length === 0) {
      container.innerHTML = '<div class="glow-card" style="text-align:center; padding: 20px;"><h3>Belum Ada Soal Kuis</h3><p>Tambahkan soal kuis melalui Dashboard Admin.</p></div>';
      return;
    }

    const q = this.questions[this.currentIndex];
    const isSimpleStringArray = Array.isArray(q.options) && typeof q.options[0] === 'string';

    const optionsHTML = isSimpleStringArray
      ? q.options.map((optText, idx) => `
          <button class="quiz-opt-btn" data-correct="${idx === q.answer}">
            <span class="quiz-opt-icon">${q.icon || '❓'}</span>
            <span class="quiz-opt-text">${optText}</span>
          </button>
        `).join('')
      : (q.options || []).map((opt) => `
          <button class="quiz-opt-btn" data-correct="${opt.correct}">
            <span class="quiz-opt-icon">${opt.icon || '❓'}</span>
            <span class="quiz-opt-text">${opt.text || ''}</span>
          </button>
        `).join('');

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
          ${optionsHTML}
        </div>
      </div>
    `;

    // Auto trigger speech or speech button
    const audioBtn = document.getElementById('btn-quiz-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        window.appAudio.speak(q.audioText || q.question);
      });
    }

    // Speak initial question automatically
    window.appAudio.speak(q.audioText || q.question);

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
