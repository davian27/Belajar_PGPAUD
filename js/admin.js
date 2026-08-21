/* ==========================================================================
   EMPATHY QUEST — Admin Dashboard Script
   2-Option Backsound Switcher & Content Management
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // DEFAULT CONFIG VALUES
    // ==========================================
    const DEFAULT_CONFIG = {
        pin: '1234',
        backsoundUrl: 'assets/backsound.mp3',
        prologSpeech: 'Halo, Sahabat! Selamat datang di <strong>Taman Pelangi Sahabat</strong>! Di sini kita akan mengumpulkan 5 Lencana Kekuatan: Empati, Literasi, Numerasi, Kerja Sama, dan Berani Bicara Baik!',
        m1Speech: 'Dina duduk sendirian di bangku taman sambil murung. Teman-teman bermain tanpa mengajaknya. Lengkapi kalimat: <strong>"Dina merasa ____."</strong>',
        m2Speech: 'Ada berapa teman yang sedang asyik bermain bersama?',
        m3Speech: 'Beni diejek karena gambarnya berbeda. Yuk, susun kata-kata baik untuk membantu dan membela Beni!',
        m3HeroSpeak: 'Jangan ejek teman! Gambarmu sangat unik dan keren, Beni!',
        m4Speech: 'Tersedia 6 bola untuk 3 teman. Bagikan bola ke dalam keranjang agar setiap teman mendapat jumlah yang sama rata (2 bola)!'
    };

    let config = { ...DEFAULT_CONFIG };

    // ==========================================
    // LOAD & SAVE CONFIG
    // ==========================================
    function loadConfig() {
        try {
            const saved = localStorage.getItem('empathy_quest_config');
            if (saved) {
                config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Config load error:', e);
        }
    }

    function saveConfig(msg = '✅ Perubahan berhasil disimpan!') {
        try {
            localStorage.setItem('empathy_quest_config', JSON.stringify(config));
            showToast(msg);
            updateDashboardStats();
        } catch (e) {
            alert('Gagal menyimpan konfigurasi!');
        }
    }

    function showToast(msg) {
        const toast = document.getElementById('toast-msg');
        if (!toast) return;
        toast.textContent = msg;
        toast.style.display = 'block';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }

    // ==========================================
    // PIN PROTECTION
    // ==========================================
    const pinModal = document.getElementById('pin-modal');
    const pinInput = document.getElementById('pin-input-field');
    const pinSubmit = document.getElementById('btn-submit-pin');
    const pinError = document.getElementById('pin-error-msg');

    loadConfig();

    function checkPin() {
        if (pinInput.value === config.pin) {
            pinModal.style.display = 'none';
            populateAllFields();
            updateDashboardStats();
        } else {
            pinError.style.display = 'block';
            pinInput.value = '';
            pinInput.focus();
        }
    }

    pinSubmit.addEventListener('click', checkPin);
    pinInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') checkPin(); });

    // ==========================================
    // SIDEBAR NAVIGATION
    // ==========================================
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    const sections = document.querySelectorAll('.admin-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-section');
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            const targetSection = document.getElementById(`section-${target}`);
            if (targetSection) targetSection.classList.add('active');
        });
    });

    // ==========================================
    // POPULATE FORM FIELDS
    // ==========================================
    function populateAllFields() {
        setValue('cfg-prolog-speech', config.prologSpeech);
        setValue('cfg-m1-speech', config.m1Speech);
        setValue('cfg-m2-speech', config.m2Speech);
        setValue('cfg-m3-speech', config.m3Speech);
        setValue('cfg-m3-hero', config.m3HeroSpeak);
        setValue('cfg-m4-speech', config.m4Speech);
        setValue('cfg-pin', '');

        // Set active music radio
        const activeUrl = config.backsoundUrl || 'assets/backsound.mp3';
        const radio1 = document.getElementById('radio-music-1');
        const radio2 = document.getElementById('radio-music-2');

        if (radio1 && radio2) {
            if (activeUrl === 'assets/backsound2.mp3') {
                radio2.checked = true;
            } else {
                radio1.checked = true;
            }
        }

        refreshMusicCards();
        updateAudioPreview(activeUrl);
    }

    function setValue(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    }

    function getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    // ==========================================
    // MUSIC SELECTION
    // ==========================================
    const audioPreview = document.getElementById('admin-audio-preview');

    function refreshMusicCards() {
        const card1 = document.getElementById('card-music-1');
        const card2 = document.getElementById('card-music-2');
        const radio1 = document.getElementById('radio-music-1');
        const radio2 = document.getElementById('radio-music-2');
        if (card1) card1.classList.toggle('selected', radio1 && radio1.checked);
        if (card2) card2.classList.toggle('selected', radio2 && radio2.checked);
    }

    function updateAudioPreview(src) {
        if (audioPreview) {
            audioPreview.src = src;
        }
    }

    // Click on music cards -> update preview
    document.querySelectorAll('input[name="backsound-choice"]').forEach(radio => {
        radio.addEventListener('change', () => {
            refreshMusicCards();
            updateAudioPreview(radio.value);
        });
    });

    document.querySelectorAll('.music-choice-card').forEach(card => {
        card.addEventListener('click', () => {
            setTimeout(() => {
                refreshMusicCards();
                const selected = document.querySelector('input[name="backsound-choice"]:checked');
                if (selected) updateAudioPreview(selected.value);
            }, 10);
        });
    });

    // Save Music button
    document.getElementById('btn-save-music').addEventListener('click', () => {
        const selected = document.querySelector('input[name="backsound-choice"]:checked');
        if (selected) {
            config.backsoundUrl = selected.value;
            saveConfig('🎵 Pilihan lagu berhasil disimpan!');
        }
    });

    // ==========================================
    // SECTION-SPECIFIC SAVE BUTTONS
    // ==========================================
    document.querySelectorAll('[data-save-section]').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-save-section');
            if (section === 'prolog') {
                config.prologSpeech = getValue('cfg-prolog-speech');
            } else if (section === 'mission1') {
                config.m1Speech = getValue('cfg-m1-speech');
            } else if (section === 'mission2') {
                config.m2Speech = getValue('cfg-m2-speech');
            } else if (section === 'mission3') {
                config.m3Speech = getValue('cfg-m3-speech');
                config.m3HeroSpeak = getValue('cfg-m3-hero');
            } else if (section === 'mission4') {
                config.m4Speech = getValue('cfg-m4-speech');
            }
            saveConfig('✅ Konten berhasil disimpan!');
        });
    });

    // ==========================================
    // SAVE ALL (top navbar button)
    // ==========================================
    document.getElementById('btn-save-all-config').addEventListener('click', () => {
        const selected = document.querySelector('input[name="backsound-choice"]:checked');
        if (selected) config.backsoundUrl = selected.value;

        config.prologSpeech = getValue('cfg-prolog-speech');
        config.m1Speech = getValue('cfg-m1-speech');
        config.m2Speech = getValue('cfg-m2-speech');
        config.m3Speech = getValue('cfg-m3-speech');
        config.m3HeroSpeak = getValue('cfg-m3-hero');
        config.m4Speech = getValue('cfg-m4-speech');

        saveConfig('✅ Semua perubahan berhasil disimpan!');
    });

    // ==========================================
    // SETTINGS: PIN CHANGE
    // ==========================================
    document.getElementById('btn-save-pin').addEventListener('click', () => {
        const newPin = getValue('cfg-pin');
        if (!newPin || newPin.length < 4) {
            showToast('❌ PIN minimal 4 digit!');
            return;
        }
        config.pin = newPin;
        saveConfig('🔑 PIN berhasil diperbarui!');
        document.getElementById('cfg-pin').value = '';
    });

    // ==========================================
    // SETTINGS: RESET TO DEFAULT
    // ==========================================
    document.getElementById('btn-reset-all-config').addEventListener('click', () => {
        if (!confirm('Kembalikan seluruh konten & backsound ke pengaturan awal?')) return;
        config = { ...DEFAULT_CONFIG };
        saveConfig('🔄 Semua konten dikembalikan ke default!');
        populateAllFields();
    });

    // ==========================================
    // SETTINGS: CLEAR PLAYER PROGRESS
    // ==========================================
    document.getElementById('btn-clear-player-progress').addEventListener('click', () => {
        if (!confirm('Hapus seluruh progres bermain siswa? Tindakan ini tidak bisa dibatalkan.')) return;
        localStorage.removeItem('empathy_quest_state');
        showToast('🗑️ Progres siswa berhasil dihapus!');
    });

    // ==========================================
    // DASHBOARD STATS
    // ==========================================
    function updateDashboardStats() {
        const musicNameEl = document.getElementById('stat-music-name');
        const configStatusEl = document.getElementById('stat-config-status');

        if (musicNameEl) {
            musicNameEl.textContent = config.backsoundUrl === 'assets/backsound2.mp3'
                ? 'Backsound 2' : 'Backsound 1';
        }

        if (configStatusEl) {
            const isDefault = JSON.stringify(config) === JSON.stringify(DEFAULT_CONFIG);
            configStatusEl.textContent = isDefault ? 'Default' : 'Custom';
        }
    }

});
