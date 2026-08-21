/* ==========================================================================
   EMPATHY QUEST — Main JavaScript Engine & Game Logic
   Vanilla JS, Offline, Pointer Events, Web Audio API, LocalStorage
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. GAME STATE MANAGEMENT
    // ==========================================
    const DEFAULT_STATE = {
        playerName: 'Sahabat',
        avatarId: 'avatar-1',
        currentScreen: 'prolog',
        stars: 0,
        completedMissions: [], // Mission numbers e.g. [1, 2]
        badges: [], // e.g. ['empati', 'numerasi', 'literasi', 'kerjasama', 'beranibicara']
        positiveChoices: [],
        soundEnabled: true
    };

    let gameState = { ...DEFAULT_STATE };

    // Badges Definition Data (5 Lencana Kekuatan)
    const BADGES_DATA = [
        { id: 'empati', name: 'Badge Empati', icon: '❤️', desc: 'Mengenali emosi & peduli pada teman' },
        { id: 'numerasi', name: 'Badge Numerasi', icon: '🔢', desc: 'Berhitung & mengajak teman yang kesepian' },
        { id: 'literasi', name: 'Badge Literasi', icon: '📖', desc: 'Menyusun kata-kata baik' },
        { id: 'kerjasama', name: 'Badge Kerja Sama', icon: '🤝', desc: 'Berbagi bola & bergantian giliran' },
        { id: 'beranibicara', name: 'Badge Berani Bicara Baik', icon: '🗣️', desc: 'Membela teman yang diejek' }
    ];

    // Avatars Data
    const AVATARS = [
        { id: 'avatar-1', name: 'Kiran', shirtColor: '#FFD166', skinTone: '#F5D0A9', hairColor: '#2D3748', type: 'short' },
        { id: 'avatar-2', name: 'Kira', shirtColor: '#06D6A0', skinTone: '#DDB892', hairColor: '#1A202C', type: 'curly' },
        { id: 'avatar-3', name: 'Rian', shirtColor: '#FF9F1C', skinTone: '#FFE0B2', hairColor: '#8D6E63', type: 'spiky' },
        { id: 'avatar-4', name: 'Maya', shirtColor: '#8338EC', skinTone: '#F5D0A9', hairColor: '#212121', type: 'braid' }
    ];

    // ==========================================
    // 2. AUDIO SYNTHESIZER & BACKGROUND MUSIC ENGINE
    // ==========================================
    let audioCtx = null;
    let bgMusic = null;
    let bgMusicStarted = false;

    function initBgMusic() {
        if (!bgMusic) {
            bgMusic = new Audio('assets/backsound.mp3');
            bgMusic.loop = true;
            bgMusic.volume = 0.25; // Soft background music volume
        }
    }

    function playBgMusic() {
        if (!gameState.soundEnabled) return;
        initBgMusic();
        if (bgMusic && bgMusic.paused) {
            bgMusic.play().catch(e => console.log('Autoplay deferred until user interaction:', e));
        }
    }

    function pauseBgMusic() {
        if (bgMusic && !bgMusic.paused) {
            bgMusic.pause();
        }
    }

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        playBgMusic();
    }

    function playSound(type) {
        if (!gameState.soundEnabled) return;
        initAudio();
        if (!audioCtx) return;

        try {
            const now = audioCtx.currentTime;

            if (type === 'click') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.08);
            } 
            else if (type === 'star' || type === 'correct') {
                const notes = type === 'star' ? [523.25, 659.25, 783.99, 1046.50] : [440, 554.37, 659.25];
                notes.forEach((freq, i) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + i * 0.1);
                    gain.gain.setValueAtTime(0.25, now + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + i * 0.1);
                    osc.stop(now + i * 0.1 + 0.25);
                });
            } 
            else if (type === 'wheel') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(300, now);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.04);
            }
            else if (type === 'fanfare') {
                const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                notes.forEach((freq, i) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + i * 0.12);
                    gain.gain.setValueAtTime(0.3, now + i * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.4);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + i * 0.12);
                    osc.stop(now + i * 0.12 + 0.4);
                });
            }
        } catch (e) {
            console.log('Audio error:', e);
        }
    }

    // ==========================================
    // 3. SVG GRAPHICS GENERATORS
    // ==========================================
    function generateAvatarSVG(avatarId) {
        const av = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
        let hairSVG = '';

        if (av.type === 'short') {
            hairSVG = `<path d="M 20 40 Q 50 10 80 40 Q 50 25 20 40 Z" fill="${av.hairColor}" />`;
        } else if (av.type === 'curly') {
            hairSVG = `
                <circle cx="30" cy="30" r="16" fill="${av.hairColor}" />
                <circle cx="50" cy="22" r="18" fill="${av.hairColor}" />
                <circle cx="70" cy="30" r="16" fill="${av.hairColor}" />
                <path d="M 70 20 L 76 12 L 82 20 Z" fill="#FF5964" />`; // Red bow
        } else if (av.type === 'spiky') {
            hairSVG = `<path d="M 20 42 L 35 15 L 50 30 L 65 15 L 80 42 Z" fill="${av.hairColor}" />`;
        } else if (av.type === 'braid') {
            hairSVG = `
                <path d="M 20 40 Q 50 15 80 40 Q 50 30 20 40 Z" fill="${av.hairColor}" />
                <rect x="18" y="40" width="12" height="35" rx="6" fill="${av.hairColor}" />
                <rect x="70" y="40" width="12" height="35" rx="6" fill="${av.hairColor}" />`;
        }

        return `
        <svg viewBox="0 0 100 100" class="avatar-svg-img">
            <path d="M 25 95 L 30 65 Q 50 58 70 65 L 75 95 Z" fill="${av.shirtColor}" stroke="#1E293B" stroke-width="2.5"/>
            <circle cx="50" cy="45" r="26" fill="${av.skinTone}" stroke="#1E293B" stroke-width="2.5"/>
            ${hairSVG}
            <circle cx="42" cy="45" r="3.5" fill="#1E293B" />
            <circle cx="58" cy="45" r="3.5" fill="#1E293B" />
            <circle cx="36" cy="50" r="4" fill="#FF8A8A" opacity="0.6" />
            <circle cx="64" cy="50" r="4" fill="#FF8A8A" opacity="0.6" />
            <path d="M 44 54 Q 50 60 56 54" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`;
    }

    function generateMascotSVG() {
        return `
        <svg viewBox="0 0 100 100" class="mascot-svg-img">
            <polygon points="25,30 15,5 35,20" fill="#D97706" stroke="#78350F" stroke-width="2"/>
            <polygon points="75,30 85,5 65,20" fill="#D97706" stroke="#78350F" stroke-width="2"/>
            <polygon points="25,26 18,10 32,20" fill="#FDE68A"/>
            <polygon points="75,26 82,10 68,20" fill="#FDE68A"/>
            <ellipse cx="50" cy="50" rx="32" ry="28" fill="#F59E0B" stroke="#78350F" stroke-width="2.5"/>
            <ellipse cx="50" cy="60" rx="16" ry="12" fill="#FEF3C7"/>
            <ellipse cx="50" cy="54" rx="4" ry="3" fill="#78350F"/>
            <ellipse cx="38" cy="44" rx="5" ry="7" fill="#1E293B"/>
            <ellipse cx="62" cy="44" rx="5" ry="7" fill="#1E293B"/>
            <circle cx="40" cy="42" r="2" fill="#FFF"/>
            <circle cx="64" cy="42" r="2" fill="#FFF"/>
            <circle cx="36" cy="30" r="2.5" fill="#FFF" opacity="0.8"/>
            <circle cx="64" cy="30" r="2.5" fill="#FFF" opacity="0.8"/>
            <circle cx="50" cy="26" r="3" fill="#FFF" opacity="0.8"/>
            <path d="M 30 72 Q 50 82 70 72 Q 50 68 30 72 Z" fill="#06D6A0" stroke="#047857" stroke-width="2"/>
        </svg>`;
    }

    function generateDinaSVG(emotion = 'sad') {
        const mouthPath = emotion === 'sad' ? 'M 43 60 Q 50 52 57 60' : 'M 42 54 Q 50 62 58 54';
        const eyePath = emotion === 'sad' 
            ? `<path d="M 37 45 Q 42 42 45 46" stroke="#1E293B" stroke-width="2.5" fill="none"/>
               <path d="M 55 46 Q 58 42 63 45" stroke="#1E293B" stroke-width="2.5" fill="none"/>`
            : `<circle cx="42" cy="45" r="3.5" fill="#1E293B"/><circle cx="58" cy="45" r="3.5" fill="#1E293B"/>`;

        return `
        <svg viewBox="0 0 100 100" class="dina-svg-img">
            <path d="M 25 95 L 30 65 Q 50 58 70 65 L 75 95 Z" fill="#FF5964" stroke="#1E293B" stroke-width="2.5"/>
            <circle cx="50" cy="45" r="26" fill="#F5D0A9" stroke="#1E293B" stroke-width="2.5"/>
            <path d="M 20 45 Q 15 20 50 15 Q 85 20 80 45 Q 65 30 50 30 Q 35 30 20 45 Z" fill="#5D4037"/>
            <circle cx="20" cy="45" r="8" fill="#5D4037"/>
            <circle cx="80" cy="45" r="8" fill="#5D4037"/>
            ${eyePath}
            <path d="${mouthPath}" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`;
    }

    function generateGenericChildSVG(shirtColor, skinTone, hairColor) {
        return `
        <svg viewBox="0 0 100 100" class="child-svg-img">
            <path d="M 25 95 L 30 65 Q 50 58 70 65 L 75 95 Z" fill="${shirtColor}" stroke="#1E293B" stroke-width="2.5"/>
            <circle cx="50" cy="45" r="26" fill="${skinTone}" stroke="#1E293B" stroke-width="2.5"/>
            <path d="M 20 40 Q 50 15 80 40 Q 50 28 20 40 Z" fill="${hairColor}" />
            <circle cx="42" cy="45" r="3" fill="#1E293B"/>
            <circle cx="58" cy="45" r="3" fill="#1E293B"/>
            <path d="M 44 54 Q 50 58 56 54" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    }

    // ==========================================
    // 4. LOCAL STORAGE SYSTEM
    // ==========================================
    function saveProgress() {
        try {
            localStorage.setItem('empathy_quest_state', JSON.stringify(gameState));
        } catch (e) {
            console.error('LocalStorage save error:', e);
        }
    }

    function loadProgress() {
        try {
            const saved = localStorage.getItem('empathy_quest_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                gameState = { ...DEFAULT_STATE, ...parsed };
            }
        } catch (e) {
            console.error('LocalStorage load error:', e);
        }
    }

    // ==========================================
    // 5. UI CONTROLLER & SCREEN NAVIGATION
    // ==========================================
    function updateUIState() {
        const navAvatarEl = document.getElementById('nav-avatar-icon');
        const navNameEl = document.getElementById('nav-player-name');
        if (navAvatarEl) navAvatarEl.innerHTML = generateAvatarSVG(gameState.avatarId);
        if (navNameEl) navNameEl.textContent = gameState.playerName || 'Sahabat';

        for (let i = 1; i <= 4; i++) {
            const starEl = document.getElementById(`star-${i}`);
            if (starEl) {
                if (i <= gameState.stars) {
                    starEl.className = 'star-icon star-filled';
                } else {
                    starEl.className = 'star-icon star-empty';
                }
            }
        }

        for (let m = 1; m <= 4; m++) {
            const gateCard = document.getElementById(`gate-mission-${m}`);
            const gateBadge = document.getElementById(`gate-star-${m}`);
            if (gateCard && gateBadge) {
                if (gameState.completedMissions.includes(m)) {
                    gateCard.classList.add('completed');
                    gateBadge.textContent = '★ Selesai!';
                } else {
                    gateCard.classList.remove('completed');
                    gateBadge.textContent = `★ Misi ${m}`;
                }
            }
        }

        saveProgress();
    }

    function showScreen(screenId) {
        document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`screen-${screenId}`);
        if (target) {
            target.classList.add('active');
            gameState.currentScreen = screenId;
            window.scrollTo(0, 0);
            updateUIState();
        }
    }

    // ==========================================
    // 6. PROLOG & AVATAR PICKER INITIALIZATION
    // ==========================================
    function setupProlog() {
        const mascotBox = document.getElementById('kancil-prolog');
        if (mascotBox) mascotBox.innerHTML = generateMascotSVG();

        const prologSpeech = document.getElementById('prolog-speech');
        const startBtn = document.getElementById('btn-start-game');
        const hasSavedData = gameState.completedMissions.length > 0 || (gameState.playerName && gameState.playerName !== 'Sahabat');

        if (prologSpeech) {
            if (hasSavedData) {
                prologSpeech.innerHTML = `Selamat datang kembali, Sahabat <strong>${gameState.playerName}</strong>! 🎉 Bintangmu saat ini: <strong>${gameState.stars}/4 ★</strong>. Ayo pilih sahabatmu dan lanjutkan petualangan kebaikan di Taman Pelangi!`;
            } else {
                prologSpeech.innerHTML = `Halo, Sahabat! Selamat datang di <strong>Taman Pelangi Sahabat</strong>! Di sini kita akan mengumpulkan 5 Lencana Kekuatan: Empati, Literasi, Numerasi, Kerja Sama, dan Berani Bicara Baik!`;
            }
        }

        if (startBtn) {
            const btnSpan = startBtn.querySelector('span');
            if (btnSpan) {
                btnSpan.textContent = hasSavedData ? '🚀 Lanjutkan Petualangan!' : '🚀 Mulai Petualangan!';
            }
            startBtn.onclick = () => {
                playSound('star');
                showScreen('map');
            };
        }

        const avatarPicker = document.getElementById('avatar-picker');
        if (avatarPicker) {
            avatarPicker.innerHTML = AVATARS.map(av => `
                <div class="avatar-card ${av.id === gameState.avatarId ? 'selected' : ''}" data-avatar-id="${av.id}">
                    <div class="avatar-preview-svg">${generateAvatarSVG(av.id)}</div>
                    <span class="avatar-name-tag">${av.name}</span>
                </div>
            `).join('');

            avatarPicker.querySelectorAll('.avatar-card').forEach(card => {
                card.addEventListener('click', () => {
                    playSound('click');
                    avatarPicker.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    gameState.avatarId = card.getAttribute('data-avatar-id');
                    updateUIState();
                });
            });
        }

        const nameInput = document.getElementById('player-name-input');
        if (nameInput) {
            nameInput.value = gameState.playerName !== 'Sahabat' ? gameState.playerName : '';
            nameInput.addEventListener('input', (e) => {
                gameState.playerName = e.target.value.trim() || 'Sahabat';
                updateUIState();
            });
        }
    }

    // ==========================================
    // 7. MISSION 1 ENGINE — BACA PERASAANKU
    // ==========================================
    function setupMission1() {
        const dinaWrap = document.getElementById('dina-avatar-container');
        const mascotSmallList = document.querySelectorAll('.mascot-small-avatar');
        mascotSmallList.forEach(m => m.innerHTML = generateMascotSVG());

        if (dinaWrap) dinaWrap.innerHTML = generateDinaSVG('sad');

        const step1Block = document.getElementById('m1-step-1');
        const step2Block = document.getElementById('m1-step-2');
        const successBlock = document.getElementById('m1-success-block');
        const speechEl = document.getElementById('m1-speech');

        step1Block.classList.remove('hidden');
        step2Block.classList.add('hidden');
        successBlock.classList.add('hidden');

        if (speechEl) {
            speechEl.innerHTML = 'Dina duduk sendirian di bangku taman sambil murung. Teman-teman bermain tanpa mengajaknya. Lengkapi kalimat: <strong>“Dina merasa ____.”</strong>';
        }

        document.querySelectorAll('.emotion-card').forEach(btn => {
            btn.onclick = () => {
                const emotion = btn.getAttribute('data-emotion');
                if (emotion === 'sedih' || emotion === 'kesepian') {
                    playSound('correct');
                    if (dinaWrap) dinaWrap.innerHTML = generateDinaSVG('happy');
                    if (speechEl) {
                        speechEl.innerHTML = `Benar sekali! Dina merasa <strong>${emotion}</strong> karena tidak diajak bermain. Sekarang, bagaimana cara kita membantunya?`;
                    }
                    step1Block.classList.add('hidden');
                    step2Block.classList.remove('hidden');
                } else {
                    playSound('click');
                    if (speechEl) {
                        speechEl.innerHTML = 'Hmm... coba perhatikan lagi raut wajah Dina. Matanya redup dan bibirnya melengkung ke bawah. Menurutmu bagaimana perasaannya?';
                    }
                }
            };
        });

        document.querySelectorAll('.action-card').forEach(btn => {
            btn.onclick = () => {
                const action = btn.getAttribute('data-action');
                if (action === 'invite') {
                    playSound('star');
                    completeMission(1, 'empati', 'Membantu dan mengajak Dina bermain saat ia kesepian');
                    step2Block.classList.add('hidden');
                    successBlock.classList.remove('hidden');
                } else {
                    playSound('click');
                    if (speechEl) {
                        speechEl.innerHTML = 'Menurutmu, bagaimana perasaan Dina kalau begitu? Yuk pilih cara paling ramah untuk mengajaknya ditemani!';
                    }
                }
            };
        });

        const finishBtn = document.getElementById('btn-finish-m1');
        if (finishBtn) finishBtn.onclick = () => showScreen('map');
    }

    // ==========================================
    // 8. MISSION 2 ENGINE — HITUNG TEMAN BAIK
    // ==========================================
    function setupMission2() {
        const kidsGroup = document.getElementById('m2-kids-group');
        const lonelyKid = document.getElementById('lonely-kid-avatar');
        
        if (kidsGroup) {
            kidsGroup.innerHTML = `
                ${generateGenericChildSVG('#FF9F1C', '#F5D0A9', '#1E293B')}
                ${generateGenericChildSVG('#8338EC', '#DDB892', '#8D6E63')}
                ${generateGenericChildSVG('#FF5964', '#FFE0B2', '#212121')}
                ${generateGenericChildSVG('#06D6A0', '#F5D0A9', '#1A202C')}
                ${generateGenericChildSVG('#118AB2', '#DDB892', '#5D4037')}
            `;
        }
        if (lonelyKid) lonelyKid.innerHTML = generateGenericChildSVG('#94A3B8', '#F5D0A9', '#78350F');

        const step1 = document.getElementById('m2-step-1');
        const step2 = document.getElementById('m2-step-2');
        const success = document.getElementById('m2-success-block');
        const speech = document.getElementById('m2-speech');
        const wheelContainer = document.getElementById('wheel-container-m2');
        const wheelEl = document.getElementById('wheel-element');
        const spinBtn = document.getElementById('btn-spin-wheel');
        const answerInclusionBtn = document.getElementById('btn-answer-inclusion');

        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        success.classList.add('hidden');
        if (wheelContainer) wheelContainer.classList.add('hidden');
        if (speech) speech.textContent = 'Ada berapa teman yang sedang asyik bermain bersama?';

        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.onclick = () => {
                const num = parseInt(btn.getAttribute('data-num'));
                if (num === 5) {
                    playSound('correct');
                    if (speech) speech.innerHTML = 'Hebat! Ada <strong>5 teman</strong> yang sedang bermain!';
                    step1.classList.add('hidden');
                    step2.classList.remove('hidden');
                } else {
                    playSound('click');
                    if (speech) speech.textContent = 'Ayo kita hitung satu per satu anak yang ada di kelompok bermain. Coba hitung lagi!';
                }
            };
        });

        if (answerInclusionBtn) {
            answerInclusionBtn.onclick = () => {
                playSound('correct');
                if (speech) speech.innerHTML = 'Benar! Kita cukup mengajak <strong>1 teman (Tono)</strong> agar semua 6 anak bisa ikut bermain bersama!';
                if (wheelContainer) wheelContainer.classList.remove('hidden');
                answerInclusionBtn.parentElement.classList.add('hidden');
            };
        }

        let isSpinning = false;
        if (spinBtn) {
            spinBtn.onclick = () => {
                if (isSpinning) return;
                isSpinning = true;
                playSound('wheel');

                const randomDegree = 1080 + Math.floor(Math.random() * 360);
                if (wheelEl) wheelEl.style.transform = `rotate(${randomDegree}deg)`;

                setTimeout(() => {
                    playSound('star');
                    completeMission(2, 'numerasi', 'Berhitung 5 teman dan mengajak Tono bergabung bermain');
                    step2.classList.add('hidden');
                    success.classList.remove('hidden');
                    if (kidsGroup && lonelyKid) {
                        kidsGroup.innerHTML += generateGenericChildSVG('#06D6A0', '#F5D0A9', '#78350F');
                        lonelyKid.style.display = 'none';
                    }
                    isSpinning = false;
                }, 3200);
            };
        }

        const finishBtn = document.getElementById('btn-finish-m2');
        if (finishBtn) finishBtn.onclick = () => showScreen('map');
    }

    // ==========================================
    // 9. MISSION 3 ENGINE — KATA-KATA SAHABAT
    // ==========================================
    function setupMission3() {
        const beniWrap = document.getElementById('beni-avatar');
        const teasingWrap = document.getElementById('teasing-avatar');
        const heroWrap = document.getElementById('hero-speak-avatar');
        const teaseBubble = document.getElementById('tease-bubble-text');

        if (beniWrap) beniWrap.innerHTML = generateGenericChildSVG('#FFD166', '#F5D0A9', '#2D3748');
        if (teasingWrap) teasingWrap.innerHTML = generateGenericChildSVG('#94A3B8', '#DDB892', '#1A202C');
        if (heroWrap) heroWrap.innerHTML = generateAvatarSVG(gameState.avatarId);
        if (teaseBubble) teaseBubble.classList.remove('faded');

        const step1 = document.getElementById('m3-step-1');
        const step2 = document.getElementById('m3-step-2');
        const success = document.getElementById('m3-success-block');
        const checkBtn = document.getElementById('btn-check-sentence');
        const resetBtn = document.getElementById('btn-reset-sentence');
        const slots = document.querySelectorAll('.word-slot');
        const wordCards = document.querySelectorAll('.word-card');

        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        success.classList.add('hidden');

        let placedWords = ['', '', ''];

        function renderSlots() {
            slots.forEach((slot, index) => {
                if (placedWords[index]) {
                    slot.textContent = placedWords[index];
                    slot.classList.add('filled');
                } else {
                    slot.textContent = '_____';
                    slot.classList.remove('filled');
                }
            });
        }

        wordCards.forEach(card => {
            card.onclick = () => {
                playSound('click');
                const word = card.getAttribute('data-word');
                const emptyIdx = placedWords.indexOf('');
                if (emptyIdx !== -1 && !placedWords.includes(word)) {
                    placedWords[emptyIdx] = word;
                    card.style.opacity = '0.4';
                    renderSlots();
                }
            };
        });

        if (resetBtn) {
            resetBtn.onclick = () => {
                playSound('click');
                placedWords = ['', '', ''];
                wordCards.forEach(c => c.style.opacity = '1');
                renderSlots();
            };
        }

        if (checkBtn) {
            checkBtn.onclick = () => {
                const sentence = placedWords.join(' ');
                if (sentence === 'Jangan ejek teman') {
                    playSound('correct');
                    step1.classList.add('hidden');
                    step2.classList.remove('hidden');
                    if (teaseBubble) teaseBubble.classList.add('faded');

                    setTimeout(() => {
                        playSound('star');
                        completeMission(3, 'literasi', 'Menyusun kalimat baik dan membela Beni');
                        if (!gameState.badges.includes('beranibicara')) {
                            gameState.badges.push('beranibicara');
                        }
                        step2.classList.add('hidden');
                        success.classList.remove('hidden');
                    }, 3500);
                } else {
                    playSound('click');
                    const speech = document.getElementById('m3-speech');
                    if (speech) speech.textContent = 'Yuk coba lagi! Susun kata agar menjadi: "Jangan ejek teman"';
                }
            };
        }

        const finishBtn = document.getElementById('btn-finish-m3');
        if (finishBtn) finishBtn.onclick = () => showScreen('map');
    }

    // ==========================================
    // 10. MISSION 4 ENGINE — BAGI DAN BERGANTIAN
    // ==========================================
    function setupMission4() {
        const step1 = document.getElementById('m4-step-1');
        const step2 = document.getElementById('m4-step-2');
        const success = document.getElementById('m4-success-block');
        const turnBoard = document.getElementById('turn-board-display');
        const speech = document.getElementById('m4-speech');

        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        success.classList.add('hidden');
        if (turnBoard) turnBoard.classList.add('hidden');

        let basketCounts = { 1: 0, 2: 0, 3: 0 };

        const balls = document.querySelectorAll('.ball-item');
        balls.forEach((ball) => {
            ball.style.display = 'inline-block';
            ball.onclick = () => {
                playSound('click');
                let targetBasket = 1;
                if (basketCounts[1] <= basketCounts[2] && basketCounts[1] <= basketCounts[3] && basketCounts[1] < 2) {
                    targetBasket = 1;
                } else if (basketCounts[2] <= basketCounts[3] && basketCounts[2] < 2) {
                    targetBasket = 2;
                } else if (basketCounts[3] < 2) {
                    targetBasket = 3;
                }

                if (basketCounts[targetBasket] < 2) {
                    basketCounts[targetBasket]++;
                    ball.style.display = 'none';
                    document.getElementById(`count-basket-${targetBasket}`).textContent = `${basketCounts[targetBasket]} Bola`;
                    document.getElementById(`basket-${targetBasket}`).innerHTML += '⚽ ';

                    if (basketCounts[1] === 2 && basketCounts[2] === 2 && basketCounts[3] === 2) {
                        playSound('correct');
                        if (speech) speech.textContent = 'Luar biasa! 6 bola terbagi adil: masing-masing dapat 2 bola!';
                        setTimeout(() => {
                            step1.classList.add('hidden');
                            step2.classList.remove('hidden');
                        }, 1200);
                    }
                }
            };
        });

        document.querySelectorAll('.turn-choice-btn').forEach(btn => {
            btn.onclick = () => {
                const choice = btn.getAttribute('data-choice');
                if (choice === 'turns') {
                    playSound('star');
                    if (turnBoard) turnBoard.classList.remove('hidden');
                    setTimeout(() => {
                        completeMission(4, 'kerjasama', 'Membagi 6 bola dengan adil dan menyusun Papan Giliran');
                        step2.classList.add('hidden');
                        success.classList.remove('hidden');
                    }, 3000);
                } else {
                    playSound('click');
                    if (speech) speech.textContent = 'Berebut akan membuat teman sedih. Yuk, pilih cara bermain yang aman dan bergantian!';
                }
            };
        });

        const finishBtn = document.getElementById('btn-finish-m4');
        if (finishBtn) finishBtn.onclick = () => showScreen('epilog');
    }

    // ==========================================
    // 11. MISSION COMPLETION & REWARDS SYSTEM
    // ==========================================
    function completeMission(missionNum, badgeId, deedText) {
        if (!gameState.completedMissions.includes(missionNum)) {
            gameState.completedMissions.push(missionNum);
            gameState.stars = Math.min(4, gameState.stars + 1);
        }
        if (badgeId && !gameState.badges.includes(badgeId)) {
            gameState.badges.push(badgeId);
        }
        if (deedText && !gameState.positiveChoices.includes(deedText)) {
            gameState.positiveChoices.push(deedText);
        }
        updateUIState();
    }

    // ==========================================
    // 12. EPILOG & CERTIFICATE RENDERER
    // ==========================================
    function setupEpilog() {
        playSound('fanfare');

        const badgesGrid = document.getElementById('epilog-badges-grid');
        if (badgesGrid) {
            badgesGrid.innerHTML = BADGES_DATA.map(b => {
                const isUnlocked = gameState.badges.includes(b.id);
                return `
                    <div class="badge-card ${isUnlocked ? 'unlocked' : ''}">
                        <span class="badge-icon">${b.icon}</span>
                        <span class="badge-title">${b.name}</span>
                    </div>
                `;
            }).join('');
        }

        const deedsList = document.getElementById('kindness-records-list');
        if (deedsList) {
            deedsList.innerHTML = gameState.positiveChoices.map(d => `
                <div class="kindness-item">
                    <span>🌟</span>
                    <span>${d}</span>
                </div>
            `).join('');
        }

        const certName = document.getElementById('cert-player-name');
        if (certName) certName.textContent = gameState.playerName || 'Sahabat Cerdas';

        const printBtn = document.getElementById('btn-print-cert');
        if (printBtn) {
            printBtn.onclick = () => {
                window.print();
            };
        }

        const viewBagBtn = document.getElementById('btn-view-bag-epilog');
        if (viewBagBtn) viewBagBtn.onclick = () => openModal('modal-bag');

        const replayBtn = document.getElementById('btn-replay-game');
        if (replayBtn) {
            replayBtn.onclick = () => {
                if (confirm('Apakah kamu ingin memulai petualangan baru dari awal?')) {
                    gameState = { ...DEFAULT_STATE };
                    saveProgress();
                    updateUIState();
                    showScreen('prolog');
                }
            };
        }
    }

    // ==========================================
    // 13. MODALS MANAGEMENT
    // ==========================================
    function openModal(modalId) {
        playSound('click');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            if (modalId === 'modal-bag') {
                renderBagModal();
            }
        }
    }

    function closeModal(modalId) {
        playSound('click');
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('hidden');
    }

    function renderBagModal() {
        const bagAvatar = document.getElementById('bag-avatar-display');
        const bagName = document.getElementById('bag-player-name');
        const bagStars = document.getElementById('bag-star-count');
        const modalBadges = document.getElementById('modal-badges-grid');

        if (bagAvatar) bagAvatar.innerHTML = generateAvatarSVG(gameState.avatarId);
        if (bagName) bagName.textContent = gameState.playerName;
        if (bagStars) bagStars.textContent = `Bintang Terkumpul: ${gameState.stars} / 4 ★`;

        if (modalBadges) {
            modalBadges.innerHTML = BADGES_DATA.map(b => {
                const isUnlocked = gameState.badges.includes(b.id);
                return `
                    <div class="badge-card ${isUnlocked ? 'unlocked' : ''}">
                        <span class="badge-icon">${b.icon}</span>
                        <span class="badge-title">${b.name}</span>
                        <p style="font-size:0.8rem; color:#64748B;">${b.desc}</p>
                    </div>
                `;
            }).join('');
        }
    }

    // ==========================================
    // 14. INITIALIZATION & EVENT BINDINGS
    // ==========================================
    function init() {
        loadProgress();

        document.getElementById('btn-home-map').onclick = () => {
            playSound('click');
            showScreen('map');
        };

        const audioToggle = document.getElementById('btn-audio-toggle');
        if (audioToggle) {
            audioToggle.onclick = () => {
                gameState.soundEnabled = !gameState.soundEnabled;
                document.getElementById('audio-icon').textContent = gameState.soundEnabled ? '🔊' : '🔇';
                if (gameState.soundEnabled) {
                    playBgMusic();
                    playSound('click');
                } else {
                    pauseBgMusic();
                }
            };
        }

        // Start background music on first user interaction (touch/click)
        const startAudioOnUserInteraction = () => {
            if (!bgMusicStarted && gameState.soundEnabled) {
                bgMusicStarted = true;
                initAudio();
                playBgMusic();
            }
        };
        document.addEventListener('click', startAudioOnUserInteraction, { once: true });
        document.addEventListener('touchstart', startAudioOnUserInteraction, { once: true });

        document.getElementById('btn-bag').onclick = () => openModal('modal-bag');
        document.getElementById('btn-parent-guide').onclick = () => openModal('modal-parent');

        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.onclick = () => {
                const target = btn.getAttribute('data-close');
                if (target) closeModal(target);
            };
        });

        document.querySelectorAll('.mission-gate-card').forEach(gate => {
            gate.onclick = () => {
                const missionNum = parseInt(gate.getAttribute('data-mission'));
                playSound('click');
                if (missionNum === 1) {
                    setupMission1();
                    showScreen('mission-1');
                } else if (missionNum === 2) {
                    setupMission2();
                    showScreen('mission-2');
                } else if (missionNum === 3) {
                    setupMission3();
                    showScreen('mission-3');
                } else if (missionNum === 4) {
                    setupMission4();
                    showScreen('mission-4');
                }
            };
        });

        setupProlog();
        updateUIState();

        const screenObserver = new MutationObserver(() => {
            if (gameState.currentScreen === 'epilog') {
                setupEpilog();
            }
        });
        const appContainer = document.getElementById('app');
        if (appContainer) {
            screenObserver.observe(appContainer, { attributes: true, subtree: true, attributeFilter: ['class'] });
        }

        showScreen('prolog');
    }

    init();
});
