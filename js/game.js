/**
 * Interactive Games Manager for Petualangan Si Reog
 * Handles:
 * 1. Puzzle Game (Mission 3)
 * 2. Coloring Canvas Game (Mission 4) with Native Line Art & Adjustable Brush Size
 * 3. Sound / Music Game (Mission 5)
 */

class GamesManager {
  constructor() {
    this.currentPuzzlePieces = [];
    this.puzzleSolvedCount = 0;
    this.selectedColor = '#EF4444'; // Red default
    this.brushSize = 16; // Default medium brush size
    this.toolMode = 'fill'; // Default 'fill' or 'brush' or 'eraser'
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    this.musicRounds = [
      {
        id: 'gamelan',
        title: 'Suara apakah ini?',
        sound: 'gamelan',
        options: [
          { id: 'gamelan', label: 'Gamelan', icon: '🥁', correct: true },
          { id: 'piano', label: 'Piano', icon: '🎹', correct: false },
          { id: 'guitar', label: 'Gitar', icon: '🎸', correct: false }
        ]
      },
      {
        id: 'kendang',
        title: 'Suara alat musik apa ini?',
        sound: 'kendang',
        options: [
          { id: 'guitar', label: 'Gitar', icon: '🎸', correct: false },
          { id: 'kendang', label: 'Kendang', icon: '🪘', correct: true },
          { id: 'piano', label: 'Piano', icon: '🎹', correct: false }
        ]
      },
      {
        id: 'suling',
        title: 'Instrumen manakah ini?',
        sound: 'suling',
        options: [
          { id: 'piano', label: 'Piano', icon: '🎹', correct: false },
          { id: 'suling', label: 'Suling Bambu', icon: '🪈', correct: true },
          { id: 'gamelan', label: 'Gamelan', icon: '🥁', correct: false }
        ]
      },
      {
        id: 'angklung',
        title: 'Dengarkan petunjuk suara!',
        sound: 'angklung',
        options: [
          { id: 'angklung', label: 'Angklung', icon: '🪵', correct: true },
          { id: 'guitar', label: 'Gitar', icon: '🎸', correct: false },
          { id: 'kendang', label: 'Kendang', icon: '🪘', correct: false }
        ]
      }
    ];
    this.currentMusicRoundIdx = 0;
  }

  // ==========================================
  // 1. PUZZLE GAME LOGIC (6 or 9 Pieces)
  // ==========================================
  initPuzzle(containerId, cols = 3, rows = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    this.puzzleSolvedCount = 0;
    const totalPieces = cols * rows;

    const gridEl = document.createElement('div');
    gridEl.className = 'puzzle-grid';
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    const poolEl = document.createElement('div');
    poolEl.className = 'puzzle-pool';

    let pieces = [];
    for (let i = 0; i < totalPieces; i++) {
      pieces.push({ id: i, correctPos: i });
    }

    let shuffled = [...pieces].sort(() => Math.random() - 0.5);

    for (let i = 0; i < totalPieces; i++) {
      const slot = document.createElement('div');
      slot.className = 'puzzle-slot';
      slot.dataset.slotIndex = i;
      
      slot.addEventListener('dragover', (e) => e.preventDefault());
      slot.addEventListener('drop', (e) => this.handlePuzzleDrop(e, slot));
      slot.addEventListener('click', () => this.handleSlotClick(slot));

      gridEl.appendChild(slot);
    }

    shuffled.forEach((piece) => {
      const pieceEl = document.createElement('div');
      pieceEl.className = 'puzzle-piece';
      pieceEl.draggable = true;
      pieceEl.dataset.pieceId = piece.id;
      
      const col = piece.id % cols;
      const row = Math.floor(piece.id / cols);
      const bgX = (col / (cols - 1)) * 100;
      const bgY = (row / (rows - 1)) * 100;

      pieceEl.style.backgroundImage = 'url("assets/images/mascot.svg")';
      pieceEl.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
      pieceEl.style.backgroundPosition = `${bgX}% ${bgY}%`;

      pieceEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', piece.id);
        window.selectedPuzzlePiece = pieceEl;
        window.appAudio.playPop();
      });

      pieceEl.addEventListener('click', () => {
        document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('selected'));
        pieceEl.classList.add('selected');
        window.selectedPuzzlePiece = pieceEl;
        window.appAudio.playPop();
      });

      poolEl.appendChild(pieceEl);
    });

    container.appendChild(gridEl);
    container.appendChild(poolEl);
  }

  handlePuzzleDrop(e, slot) {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData('text/plain') || (window.selectedPuzzlePiece ? window.selectedPuzzlePiece.dataset.pieceId : null);
    if (!pieceId) return;

    this.placePuzzlePiece(pieceId, slot);
  }

  handleSlotClick(slot) {
    if (window.selectedPuzzlePiece && !slot.hasChildNodes()) {
      const pieceId = window.selectedPuzzlePiece.dataset.pieceId;
      this.placePuzzlePiece(pieceId, slot);
    }
  }

  placePuzzlePiece(pieceId, slot) {
    const slotIdx = Number(slot.dataset.slotIndex);
    const pieceEl = document.querySelector(`.puzzle-piece[data-piece-id="${pieceId}"]`);
    
    if (pieceEl && Number(pieceId) === slotIdx) {
      slot.appendChild(pieceEl);
      pieceEl.draggable = false;
      pieceEl.classList.add('placed-correct');
      pieceEl.classList.remove('selected');
      window.selectedPuzzlePiece = null;
      window.appAudio.playStar();
      
      this.puzzleSolvedCount++;

      if (this.puzzleSolvedCount >= 9) {
        setTimeout(() => this.celebratePuzzleWin(), 300);
      }
    } else {
      window.appAudio.playGentleRetry();
      if (window.appMascot) {
        window.appMascot.say("Coba tempatkan di kotak yang pas ya, Teman!", "encouragement");
      }
    }
  }

  celebratePuzzleWin() {
    window.appAudio.playSuccess();
    window.appStorage.addStars(5);
    window.appStorage.completeMission(3);
    window.appStorage.unlockBadge('ahli_puzzle');

    if (window.appMascot) {
      window.appMascot.say("Hebat! Kamu berhasil menyusun Reog!", "celebrate");
    }

    const modal = document.getElementById('victory-modal');
    if (modal) {
      document.getElementById('victory-title').innerText = "Hebat! Kamu Berhasil!";
      document.getElementById('victory-desc').innerText = "Kamu telah menyelesaikan puzzle Si Reog dan mendapatkan 5 Bintang serta Lencana Ahli Puzzle!";
      modal.classList.add('active');
    }
  }

  // ==========================================
  // 2. COLORING GAME LOGIC (Native Vector Line-Art Canvas + Adjustable Brush)
  // ==========================================
  initColoringCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    this.canvasCtx = canvas.getContext('2d', { willReadFrequently: true });
    this.canvas = canvas;

    canvas.width = 600;
    canvas.height = 450;

    // Draw initial blank white canvas + native Reog line art
    this.drawColoringTemplate();

    // Re-bind listeners cleanly
    if (this._onCanvasDown) {
      canvas.removeEventListener('mousedown', this._onCanvasDown);
      canvas.removeEventListener('touchstart', this._onCanvasDown);
      canvas.removeEventListener('mousemove', this._onCanvasMove);
      canvas.removeEventListener('touchmove', this._onCanvasMove);
      canvas.removeEventListener('mouseup', this._onCanvasUp);
      canvas.removeEventListener('touchend', this._onCanvasUp);
    }

    this._onCanvasDown = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const coords = this.getCanvasCoords(e);
      this.lastX = coords.x;
      this.lastY = coords.y;

      if (this.toolMode === 'fill') {
        this.floodFill(coords.x, coords.y, this.selectedColor);
        this.redrawOutlines();
        window.appAudio.playPop();
      } else {
        this.drawBrush(coords.x, coords.y);
      }
    };

    this._onCanvasMove = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const coords = this.getCanvasCoords(e);
      if (this.toolMode === 'brush' || this.toolMode === 'eraser') {
        this.drawBrushLine(this.lastX, this.lastY, coords.x, coords.y);
        this.lastX = coords.x;
        this.lastY = coords.y;
      }
    };

    this._onCanvasUp = (e) => {
      this.isDrawing = false;
    };

    canvas.addEventListener('mousedown', this._onCanvasDown);
    canvas.addEventListener('touchstart', this._onCanvasDown, { passive: false });
    canvas.addEventListener('mousemove', this._onCanvasMove);
    canvas.addEventListener('touchmove', this._onCanvasMove, { passive: false });
    window.addEventListener('mouseup', this._onCanvasUp);
    window.addEventListener('touchend', this._onCanvasUp);
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: Math.floor((clientX - rect.left) * scaleX),
      y: Math.floor((clientY - rect.top) * scaleY)
    };
  }

  drawColoringTemplate() {
    const ctx = this.canvasCtx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.redrawOutlines();
  }

  redrawOutlines() {
    const ctx = this.canvasCtx;
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Dadak Merak Peacock Feathers Fan
    ctx.beginPath();
    ctx.moveTo(300, 240); ctx.quadraticCurveTo(90, 50, 60, 180); ctx.quadraticCurveTo(30, 280, 300, 250); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(300, 240); ctx.quadraticCurveTo(510, 50, 540, 180); ctx.quadraticCurveTo(570, 280, 300, 250); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(300, 240); ctx.quadraticCurveTo(120, 10, 300, 30); ctx.quadraticCurveTo(480, 10, 300, 240); ctx.stroke();

    // Feather Circles
    const circles = [
      [150, 110, 22], [150, 110, 10],
      [240, 70, 24], [240, 70, 12],
      [300, 55, 28], [300, 55, 14],
      [360, 70, 24], [360, 70, 12],
      [450, 110, 22], [450, 110, 10]
    ];
    circles.forEach(([cx, cy, r]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 2. Lion Mane
    ctx.beginPath();
    ctx.moveTo(165, 180);
    ctx.bezierCurveTo(105, 200, 90, 260, 135, 300);
    ctx.bezierCurveTo(90, 320, 105, 380, 180, 390);
    ctx.bezierCurveTo(225, 430, 375, 430, 420, 390);
    ctx.bezierCurveTo(495, 380, 510, 320, 465, 300);
    ctx.bezierCurveTo(510, 260, 495, 200, 435, 180);
    ctx.bezierCurveTo(405, 140, 195, 140, 165, 180);
    ctx.stroke();

    // 3. Crown / Headband
    ctx.beginPath();
    ctx.moveTo(195, 175); ctx.lineTo(300, 150); ctx.lineTo(405, 175); ctx.lineTo(375, 200); ctx.lineTo(225, 200); ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(300, 175, 14, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Face Base
    ctx.beginPath();
    ctx.ellipse(300, 260, 135, 115, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(300, 290, 75, 55, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Snout / Nose
    ctx.beginPath();
    ctx.moveTo(275, 260); ctx.quadraticCurveTo(300, 245, 325, 260); ctx.quadraticCurveTo(300, 285, 275, 260);
    ctx.stroke();

    // 6. Eyes
    ctx.beginPath(); ctx.ellipse(240, 230, 22, 30, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(232, 220, 10, 0, Math.PI * 2); ctx.stroke();

    ctx.beginPath(); ctx.ellipse(360, 230, 22, 30, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(352, 220, 10, 0, Math.PI * 2); ctx.stroke();

    // 7. Cheeks
    ctx.beginPath(); ctx.ellipse(210, 270, 20, 14, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(390, 270, 20, 14, 0, 0, Math.PI * 2); ctx.stroke();

    // 8. Smile & Teeth
    ctx.beginPath(); ctx.moveTo(260, 295); ctx.quadraticCurveTo(300, 345, 340, 295); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(280, 310); ctx.quadraticCurveTo(300, 340, 320, 310); ctx.stroke();

    ctx.beginPath(); ctx.moveTo(255, 290); ctx.lineTo(265, 308); ctx.lineTo(275, 290); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(325, 290); ctx.lineTo(335, 308); ctx.lineTo(345, 290); ctx.stroke();

    // Paws
    ctx.beginPath(); ctx.ellipse(165, 360, 30, 36, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(435, 335, 34, 40, 0, 0, Math.PI * 2); ctx.stroke();

    ctx.restore();
  }

  drawBrush(x, y) {
    const ctx = this.canvasCtx;
    ctx.save();
    ctx.fillStyle = (this.toolMode === 'eraser') ? '#FFFFFF' : this.selectedColor;
    ctx.beginPath();
    ctx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    this.redrawOutlines();
  }

  drawBrushLine(x1, y1, x2, y2) {
    const ctx = this.canvasCtx;
    ctx.save();
    ctx.strokeStyle = (this.toolMode === 'eraser') ? '#FFFFFF' : this.selectedColor;
    ctx.lineWidth = this.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();

    this.redrawOutlines();
  }

  floodFill(startX, startY, strokeColorHex) {
    const ctx = this.canvasCtx;
    const canvas = this.canvas;
    const width = canvas.width;
    const height = canvas.height;

    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, width, height);
    } catch (e) {
      console.warn("Canvas getImageData failed, falling back to brush fill.", e);
      this.drawBrush(startX, startY);
      return;
    }

    const data = imageData.data;

    const targetColor = (this.toolMode === 'eraser') ? '#FFFFFF' : strokeColorHex;
    const targetR = parseInt(targetColor.slice(1, 3), 16);
    const targetG = parseInt(targetColor.slice(3, 5), 16);
    const targetB = parseInt(targetColor.slice(5, 7), 16);

    const startPos = (startY * width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];

    // Don't fill if clicking on black outline pixels (R<60, G<60, B<60) or if target color matches
    if ((startR < 60 && startG < 60 && startB < 60) || 
        (startR === targetR && startG === targetG && startB === targetB)) {
      return;
    }

    const colorMatch = (pos) => {
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      return (r > 60 || g > 60 || b > 60) && 
             (Math.abs(r - startR) < 80 && Math.abs(g - startG) < 80 && Math.abs(b - startB) < 80);
    };

    const pixelStack = [[startX, startY]];

    while (pixelStack.length) {
      const newPos = pixelStack.pop();
      const x = newPos[0];
      let y = newPos[1];

      let pixelPos = (y * width + x) * 4;

      while (y >= 0 && colorMatch(pixelPos)) {
        y--;
        pixelPos -= width * 4;
      }

      pixelPos += width * 4;
      y++;

      let reachLeft = false;
      let reachRight = false;

      while (y < height && colorMatch(pixelPos)) {
        data[pixelPos] = targetR;
        data[pixelPos + 1] = targetG;
        data[pixelPos + 2] = targetB;
        data[pixelPos + 3] = 255;

        if (x > 0) {
          if (colorMatch(pixelPos - 4)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < width - 1) {
          if (colorMatch(pixelPos + 4)) {
            if (!reachRight) {
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        y++;
        pixelPos += width * 4;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  setColor(colorHex) {
    this.selectedColor = colorHex;
    if (this.toolMode === 'eraser') {
      this.toolMode = 'brush';
    }
    window.appAudio.playPop();
  }

  setBrushSize(sizePx) {
    this.brushSize = Number(sizePx);
    window.appAudio.playPop();
  }

  setToolMode(mode) {
    this.toolMode = mode; // 'fill', 'brush', 'eraser'
    window.appAudio.playPop();
  }

  resetColoring() {
    this.drawColoringTemplate();
    window.appAudio.playPop();
  }

  finishColoring() {
    window.appAudio.playSuccess();
    window.appStorage.addStars(5);
    window.appStorage.completeMission(4);
    window.appStorage.unlockBadge('seniman_cilik');

    if (window.appMascot) {
      window.appMascot.say("Wow! Gambarmu keren sekali!", "celebrate");
    }

    const modal = document.getElementById('victory-modal');
    if (modal) {
      document.getElementById('victory-title').innerText = "Karya yang Indah!";
      document.getElementById('victory-desc').innerText = "Gambarmu luar biasa! Kamu berhak mendapatkan 5 Bintang dan Lencana Seniman Cilik!";
      modal.classList.add('active');
    }
  }

  // ==========================================
  // 3. SOUND / MUSIC GAME LOGIC
  // ==========================================
  initMusicGame(containerId) {
    this.currentMusicRoundIdx = 0;
    this.renderMusicRound(containerId);
  }

  renderMusicRound(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const round = this.musicRounds[this.currentMusicRoundIdx];
    container.innerHTML = `
      <div class="music-card glow-card">
        <h3 class="music-question">${round.title}</h3>
        
        <button class="btn-play-sound pulse-animation" id="btn-listen-sound">
          <span class="icon">🔊</span>
          <span class="text">Dengar Suara Musik</span>
        </button>

        <div class="music-options-grid">
          ${round.options.map(opt => `
            <button class="music-opt-btn" data-correct="${opt.correct}" data-sound="${opt.id}">
              <span class="opt-icon">${opt.icon}</span>
              <span class="opt-label">${opt.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    const listenBtn = document.getElementById('btn-listen-sound');
    if (listenBtn) {
      listenBtn.addEventListener('click', () => {
        window.appAudio.playInstrumentSound(round.sound);
        window.appAudio.speak(`Dengarkan instrumen ${round.sound}`);
      });
    }

    container.querySelectorAll('.music-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.correct === 'true';
        window.appAudio.playInstrumentSound(btn.dataset.sound);

        if (isCorrect) {
          btn.classList.add('correct');
          window.appAudio.playSuccess();
          
          if (window.appMascot) {
            window.appMascot.say("Hebat! Jawabanmu benar sekali!", "celebrate");
          }

          setTimeout(() => {
            this.currentMusicRoundIdx++;
            if (this.currentMusicRoundIdx < this.musicRounds.length) {
              this.renderMusicRound(containerId);
            } else {
              this.celebrateMusicWin();
            }
          }, 1200);

        } else {
          btn.classList.add('wrong');
          window.appAudio.playGentleRetry();
          if (window.appMascot) {
            window.appMascot.say("Ayo coba lagi, dengarkan baik-baik ya!", "encouragement");
          }
        }
      });
    });
  }

  celebrateMusicWin() {
    window.appAudio.playSuccess();
    window.appStorage.addStars(5);
    window.appStorage.completeMission(5);
    window.appStorage.unlockBadge('pendengar_musik');

    const modal = document.getElementById('victory-modal');
    if (modal) {
      document.getElementById('victory-title').innerText = "Telinga Hebat!";
      document.getElementById('victory-desc').innerText = "Kamu berhasil mengenali semua suara alat musik Nusantara! Kamu mendapatkan 5 Bintang dan Lencana Pendengar Musik!";
      modal.classList.add('active');
    }
  }
}

window.appGames = new GamesManager();
