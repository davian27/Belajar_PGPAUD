/* ==========================================================================
   EMPATHY QUEST — Admin Dashboard Script
   Content Management, Audio File Uploader & PIN Security
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_CONFIG = {
        pin: '1234',
        backsoundSource: 'default',
        backsoundUrl: 'assets/backsound.mp3',
        mascotName: 'Kancil Pandu',
        prologSpeech: 'Halo, Sahabat! Selamat datang di <strong>Taman Pelangi Sahabat</strong>! Di sini kita akan mengumpulkan 5 Lencana Kekuatan: Empati, Literasi, Numerasi, Kerja Sama, dan Berani Bicara Baik!',
        m1Speech: 'Dina duduk sendirian di bangku taman sambil murung. Teman-teman bermain tanpa mengajaknya. Lengkapi kalimat: <strong>“Dina merasa ____.”</strong>',
        m2Speech: 'Ada berapa teman yang sedang asyik bermain bersama?',
        m3Speech: 'Beni diejek karena gambarnya berbeda. Yuk, susun kata-kata baik untuk membantu dan membela Beni!',
        m3HeroSpeak: 'Jangan ejek teman! Gambarmu sangat unik dan keren, Beni!',
        m4Speech: 'Tersedia 6 bola untuk 3 teman. Bagikan bola ke dalam keranjang agar setiap teman mendapat jumlah yang sama rata (2 bola)!'
    };

    let config = { ...DEFAULT_CONFIG };

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

    function saveConfig() {
        try {
            localStorage.setItem('empathy_quest_config', JSON.stringify(config));
            showToast('Perubahan berhasil disimpan!');
        } catch (e) {
            alert('Gagal menyimpan! File audio mungkin terlalu besar untuk LocalStorage.');
            console.error(e);
        }
    }

    function showToast(msg) {
        const toast = document.getElementById('toast-msg');
        if (toast) {
            toast.textContent = msg;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
    }

    // PIN Protection
    const pinModal = document.getElementById('pin-modal');
    const pinInput = document.getElementById('pin-input-field');
    const pinSubmit = document.getElementById('btn-submit-pin');
    const pinError = document.getElementById('pin-error-msg');

    loadConfig();

    function checkPin() {
        if (pinInput.value === config.pin) {
            pinModal.style.display = 'none';
            populateFormFields();
        } else {
            pinError.style.display = 'block';
        }
    }

    pinSubmit.onclick = checkPin;
    pinInput.onkeyup = (e) => {
        if (e.key === 'Enter') checkPin();
    };

    // Form Population
    function populateFormFields() {
        document.getElementById('cfg-mascot-name').value = config.mascotName || DEFAULT_CONFIG.mascotName;
        document.getElementById('cfg-prolog-speech').value = config.prologSpeech || DEFAULT_CONFIG.prologSpeech;
        document.getElementById('cfg-m1-speech').value = config.m1Speech || DEFAULT_CONFIG.m1Speech;
        document.getElementById('cfg-m2-speech').value = config.m2Speech || DEFAULT_CONFIG.m2Speech;
        document.getElementById('cfg-m3-speech').value = config.m3Speech || DEFAULT_CONFIG.m3Speech;
        document.getElementById('cfg-m3-hero').value = config.m3HeroSpeak || DEFAULT_CONFIG.m3HeroSpeak;
        document.getElementById('cfg-m4-speech').value = config.m4Speech || DEFAULT_CONFIG.m4Speech;
        document.getElementById('cfg-pin').value = config.pin || '1234';

        // Audio Source Selection
        const audioSourceSelect = document.getElementById('audio-source-type');
        audioSourceSelect.value = config.backsoundSource || 'default';
        toggleAudioInputs(config.backsoundSource || 'default');

        if (config.backsoundSource === 'url') {
            document.getElementById('audio-url-input').value = config.backsoundUrl;
        }

        updateAudioPreview(config.backsoundUrl || 'assets/backsound.mp3');
    }

    const audioSourceSelect = document.getElementById('audio-source-type');
    const uploadGroup = document.getElementById('upload-group');
    const urlGroup = document.getElementById('url-group');
    const audioPreview = document.getElementById('admin-audio-preview');

    function toggleAudioInputs(type) {
        uploadGroup.classList.add('hidden');
        urlGroup.classList.add('hidden');

        if (type === 'upload') uploadGroup.classList.remove('hidden');
        if (type === 'url') urlGroup.classList.remove('hidden');
    }

    audioSourceSelect.onchange = () => {
        const type = audioSourceSelect.value;
        config.backsoundSource = type;
        toggleAudioInputs(type);

        if (type === 'default') {
            config.backsoundUrl = 'assets/backsound.mp3';
            updateAudioPreview(config.backsoundUrl);
        }
    };

    // File Upload Handler
    const audioFileInput = document.getElementById('audio-file-input');
    audioFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('Ukuran file maksimal adalah 10MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                config.backsoundUrl = event.target.result;
                config.backsoundSource = 'upload';
                updateAudioPreview(config.backsoundUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    // Audio URL Handler
    const audioUrlInput = document.getElementById('audio-url-input');
    audioUrlInput.oninput = () => {
        config.backsoundUrl = audioUrlInput.value.trim();
        config.backsoundSource = 'url';
        updateAudioPreview(config.backsoundUrl);
    };

    function updateAudioPreview(src) {
        if (audioPreview) {
            audioPreview.src = src;
        }
    }

    // Reset Audio to Default
    document.getElementById('btn-reset-audio').onclick = () => {
        config.backsoundSource = 'default';
        config.backsoundUrl = 'assets/backsound.mp3';
        audioSourceSelect.value = 'default';
        toggleAudioInputs('default');
        updateAudioPreview('assets/backsound.mp3');
        showToast('Lagu backsound dikembalikan ke bawaan.');
    };

    // Save All Configuration Button
    document.getElementById('btn-save-admin').onclick = () => {
        config.mascotName = document.getElementById('cfg-mascot-name').value.trim();
        config.prologSpeech = document.getElementById('cfg-prolog-speech').value.trim();
        config.m1Speech = document.getElementById('cfg-m1-speech').value.trim();
        config.m2Speech = document.getElementById('cfg-m2-speech').value.trim();
        config.m3Speech = document.getElementById('cfg-m3-speech').value.trim();
        config.m3HeroSpeak = document.getElementById('cfg-m3-hero').value.trim();
        config.m4Speech = document.getElementById('cfg-m4-speech').value.trim();
        config.pin = document.getElementById('cfg-pin').value.trim() || '1234';

        saveConfig();
    };

    // Reset All Configuration to Defaults
    document.getElementById('btn-reset-all-config').onclick = () => {
        if (confirm('Apakah Anda yakin ingin mengembalikan seluruh konten ke pengaturan awal?')) {
            config = { ...DEFAULT_CONFIG };
            saveConfig();
            populateFormFields();
            showToast('Konten berhasil dikembalikan ke bawaan!');
        }
    };

    // Clear Player Progress
    document.getElementById('btn-clear-player-progress').onclick = () => {
        if (confirm('Apakah Anda yakin ingin menghapus seluruh progres bermain siswa?')) {
            localStorage.removeItem('empathy_quest_state');
            showToast('Progress siswa telah berhasil dihapus!');
        }
    };
});
