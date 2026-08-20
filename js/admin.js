/**
 * Admin Controller for Petualangan Si Reog
 * Manages Admin Login Authentication, Content Management System (Stories, Quizzes, Learn Material),
 * Password Updates, and Data Resets.
 */

class AdminController {
  constructor() {
    this.activeTab = 'overview';
  }

  init() {
    this.bindEvents();
    if (window.appStorage.isAdminLoggedIn()) {
      this.showDashboard();
    }
  }

  bindEvents() {
    // Admin Login Form
    const loginForm = document.getElementById('form-admin-login');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Admin Logout Button
    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.handleLogout();
      });
    }

    // Admin Tabs Navigation
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Add Modals
    const addStoryBtn = document.getElementById('btn-add-story-modal');
    if (addStoryBtn) {
      addStoryBtn.addEventListener('click', () => this.openEditModal('story', null));
    }

    const addQuizBtn = document.getElementById('btn-add-quiz-modal');
    if (addQuizBtn) {
      addQuizBtn.addEventListener('click', () => this.openEditModal('quiz', null));
    }

    const addLearnBtn = document.getElementById('btn-add-learn-modal');
    if (addLearnBtn) {
      addLearnBtn.addEventListener('click', () => this.openEditModal('learn', null));
    }

    // Edit Form Submit
    const editForm = document.getElementById('form-admin-edit');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveEditItem();
      });
    }

    // Cancel Edit Modal
    const cancelBtn = document.getElementById('btn-cancel-admin-edit');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeEditModal());
    }

    // Change Password Form
    const changePassForm = document.getElementById('form-change-password');
    if (changePassForm) {
      changePassForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleChangePassword();
      });
    }

    // Reset User Progress Button
    const resetUserBtn = document.getElementById('btn-reset-user-progress');
    if (resetUserBtn) {
      resetUserBtn.addEventListener('click', () => {
        if (confirm('Yakin ingin mereset seluruh progres bintang dan lencana pemain?')) {
          window.appStorage.resetAllData();
          alert('Progres user berhasil direset!');
          this.renderOverviewStats();
          if (window.appController) window.appController.updateHeaderStats();
        }
      });
    }

    // Reset Content to Default Button
    const resetContentBtn = document.getElementById('btn-reset-content-default');
    if (resetContentBtn) {
      resetContentBtn.addEventListener('click', () => {
        if (confirm('Yakin ingin mereset seluruh konten cerita, kuis, dan materi ke setelan awal?')) {
          window.appStorage.resetContentToDefault();
          alert('Seluruh konten berhasil dikembalikan ke setelan default!');
          this.renderAllDashboardLists();
          if (window.appController) {
            window.appController.storyScenes = window.appStorage.getStories();
            window.appController.renderStoryScene();
            window.appController.renderLearnCards();
          }
          if (window.appQuiz) window.appQuiz.initQuiz();
        }
      });
    }
  }

  handleLogin() {
    const userIn = document.getElementById('admin-username').value.trim();
    const passIn = document.getElementById('admin-password').value.trim();
    const msgBox = document.getElementById('admin-login-msg');

    const creds = window.appStorage.getAdminCredentials();
    if (userIn === creds.username && passIn === creds.password) {
      window.appStorage.setAdminLoggedIn(true);
      if (msgBox) {
        msgBox.innerHTML = '<span class="msg-success">✅ Login Berhasil! Membuka Dashboard...</span>';
      }
      setTimeout(() => {
        this.showDashboard();
      }, 400);
    } else {
      if (msgBox) {
        msgBox.innerHTML = '<span class="msg-error">❌ Username atau password salah!</span>';
      }
    }
  }

  handleLogout() {
    window.appStorage.setAdminLoggedIn(false);
    if (window.appController) {
      window.appController.showScreen('home');
    }
  }

  showDashboard() {
    if (window.appController) {
      window.appController.showScreen('admin-dashboard');
    }
    this.renderOverviewStats();
    this.renderAllDashboardLists();
    this.populateAccountSettings();
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.admin-tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });
  }

  renderOverviewStats() {
    const stories = window.appStorage.getStories();
    const quizzes = window.appStorage.getQuizzes();
    const learn = window.appStorage.getLearnCards();
    const stars = window.appStorage.getStars();

    const elStories = document.getElementById('stat-stories-count');
    const elQuizzes = document.getElementById('stat-quizzes-count');
    const elLearn = document.getElementById('stat-learn-count');
    const elStars = document.getElementById('stat-user-stars');

    if (elStories) elStories.innerText = stories.length;
    if (elQuizzes) elQuizzes.innerText = quizzes.length;
    if (elLearn) elLearn.innerText = learn.length;
    if (elStars) elStars.innerText = stars;
  }

  renderAllDashboardLists() {
    this.renderStoriesList();
    this.renderQuizzesList();
    this.renderLearnList();
  }

  renderStoriesList() {
    const container = document.getElementById('admin-stories-list');
    if (!container) return;
    const stories = window.appStorage.getStories();
    if (stories.length === 0) {
      container.innerHTML = '<p class="empty-msg">Belum ada adegan cerita. Klik tombol Tambah di atas.</p>';
      return;
    }
    container.innerHTML = stories.map((s) => `
      <div class="admin-item-card">
        <div class="admin-item-main">
          <span class="item-icon">${s.icon || '📖'}</span>
          <div>
            <strong>${s.title}</strong>
            <p>${s.desc}</p>
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-child btn-secondary btn-xs" onclick="window.appAdmin.openEditModal('story', ${s.id})">✏️ Edit</button>
          <button class="btn-child btn-danger btn-xs" onclick="window.appAdmin.deleteItem('story', ${s.id})">🗑️ Hapus</button>
        </div>
      </div>
    `).join('');
  }

  renderQuizzesList() {
    const container = document.getElementById('admin-quizzes-list');
    if (!container) return;
    const quizzes = window.appStorage.getQuizzes();
    if (quizzes.length === 0) {
      container.innerHTML = '<p class="empty-msg">Belum ada soal kuis. Klik tombol Tambah di atas.</p>';
      return;
    }
    container.innerHTML = quizzes.map((q, idx) => `
      <div class="admin-item-card">
        <div class="admin-item-main">
          <span class="item-icon">${q.icon || '❓'}</span>
          <div>
            <strong>Soal ${idx + 1}: ${q.question}</strong>
            <p>Pilihan: ${q.options.join(' | ')} (Kunci: Opsi ${q.answer + 1})</p>
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-child btn-secondary btn-xs" onclick="window.appAdmin.openEditModal('quiz', ${q.id})">✏️ Edit</button>
          <button class="btn-child btn-danger btn-xs" onclick="window.appAdmin.deleteItem('quiz', ${q.id})">🗑️ Hapus</button>
        </div>
      </div>
    `).join('');
  }

  renderLearnList() {
    const container = document.getElementById('admin-learn-list');
    if (!container) return;
    const learn = window.appStorage.getLearnCards();
    if (learn.length === 0) {
      container.innerHTML = '<p class="empty-msg">Belum ada kartu materi. Klik tombol Tambah di atas.</p>';
      return;
    }
    container.innerHTML = learn.map((l) => `
      <div class="admin-item-card">
        <div class="admin-item-main">
          <span class="item-icon">${l.icon || '💡'}</span>
          <div>
            <strong>${l.title}</strong>
            <p>${l.text}</p>
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-child btn-secondary btn-xs" onclick="window.appAdmin.openEditModal('learn', ${l.id})">✏️ Edit</button>
          <button class="btn-child btn-danger btn-xs" onclick="window.appAdmin.deleteItem('learn', ${l.id})">🗑️ Hapus</button>
        </div>
      </div>
    `).join('');
  }

  openEditModal(type, itemId) {
    const modal = document.getElementById('admin-edit-modal');
    const titleEl = document.getElementById('admin-modal-title');
    const fieldsContainer = document.getElementById('edit-fields-container');
    const hiddenType = document.getElementById('edit-item-type');
    const hiddenId = document.getElementById('edit-item-id');

    if (!modal || !fieldsContainer) return;

    hiddenType.value = type;
    hiddenId.value = itemId || '';

    if (type === 'story') {
      const stories = window.appStorage.getStories();
      const item = itemId ? stories.find(s => s.id === Number(itemId)) : { title: '', desc: '', icon: '📖' };
      titleEl.innerText = itemId ? 'Edit Adegan Cerita' : 'Tambah Adegan Cerita';
      fieldsContainer.innerHTML = `
        <div class="form-group">
          <label>Judul Adegan:</label>
          <input type="text" id="field-story-title" class="form-input" value="${item.title || ''}" required>
        </div>
        <div class="form-group">
          <label>Deskripsi Cerita:</label>
          <textarea id="field-story-desc" class="form-input" rows="3" required>${item.desc || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Ikon Emoji:</label>
          <input type="text" id="field-story-icon" class="form-input" value="${item.icon || '🦁'}" placeholder="Contoh: 🦁" required>
        </div>
      `;
    } else if (type === 'quiz') {
      const quizzes = window.appStorage.getQuizzes();
      const item = itemId ? quizzes.find(q => q.id === Number(itemId)) : { question: '', options: ['', '', ''], answer: 0, icon: '❓' };
      titleEl.innerText = itemId ? 'Edit Soal Kuis' : 'Tambah Soal Kuis';
      fieldsContainer.innerHTML = `
        <div class="form-group">
          <label>Pertanyaan Kuis:</label>
          <input type="text" id="field-quiz-q" class="form-input" value="${item.question || ''}" required>
        </div>
        <div class="form-group">
          <label>Opsi 1 (Pilihan A):</label>
          <input type="text" id="field-quiz-opt0" class="form-input" value="${item.options[0] || ''}" required>
        </div>
        <div class="form-group">
          <label>Opsi 2 (Pilihan B):</label>
          <input type="text" id="field-quiz-opt1" class="form-input" value="${item.options[1] || ''}" required>
        </div>
        <div class="form-group">
          <label>Opsi 3 (Pilihan C):</label>
          <input type="text" id="field-quiz-opt2" class="form-input" value="${item.options[2] || ''}" required>
        </div>
        <div class="form-group">
          <label>Kunci Jawaban Benar:</label>
          <select id="field-quiz-ans" class="form-input">
            <option value="0" ${item.answer === 0 ? 'selected' : ''}>Opsi 1 (Pilihan A)</option>
            <option value="1" ${item.answer === 1 ? 'selected' : ''}>Opsi 2 (Pilihan B)</option>
            <option value="2" ${item.answer === 2 ? 'selected' : ''}>Opsi 3 (Pilihan C)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Ikon Emoji:</label>
          <input type="text" id="field-quiz-icon" class="form-input" value="${item.icon || '🗺️'}" required>
        </div>
      `;
    } else if (type === 'learn') {
      const learn = window.appStorage.getLearnCards();
      const item = itemId ? learn.find(l => l.id === Number(itemId)) : { title: '', text: '', icon: '💡' };
      titleEl.innerText = itemId ? 'Edit Materi Belajar' : 'Tambah Materi Belajar';
      fieldsContainer.innerHTML = `
        <div class="form-group">
          <label>Judul / Topik Materi:</label>
          <input type="text" id="field-learn-title" class="form-input" value="${item.title || ''}" required>
        </div>
        <div class="form-group">
          <label>Penjelasan Materi:</label>
          <textarea id="field-learn-text" class="form-input" rows="3" required>${item.text || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Ikon Emoji:</label>
          <input type="text" id="field-learn-icon" class="form-input" value="${item.icon || '🦚'}" placeholder="Contoh: 🦚" required>
        </div>
      `;
    }

    modal.classList.add('active');
  }

  closeEditModal() {
    const modal = document.getElementById('admin-edit-modal');
    if (modal) modal.classList.remove('active');
  }

  saveEditItem() {
    const type = document.getElementById('edit-item-type').value;
    const itemId = document.getElementById('edit-item-id').value;

    if (type === 'story') {
      let stories = window.appStorage.getStories();
      const title = document.getElementById('field-story-title').value.trim();
      const desc = document.getElementById('field-story-desc').value.trim();
      const icon = document.getElementById('field-story-icon').value.trim() || '📖';

      if (itemId) {
        stories = stories.map(s => s.id === Number(itemId) ? { ...s, title, desc, icon } : s);
      } else {
        const newId = stories.length > 0 ? Math.max(...stories.map(s => s.id)) + 1 : 1;
        stories.push({ id: newId, title, desc, icon });
      }
      window.appStorage.saveStories(stories);
      if (window.appController) {
        window.appController.storyScenes = stories;
        window.appController.renderStoryScene();
      }
    } else if (type === 'quiz') {
      let quizzes = window.appStorage.getQuizzes();
      const question = document.getElementById('field-quiz-q').value.trim();
      const opt0 = document.getElementById('field-quiz-opt0').value.trim();
      const opt1 = document.getElementById('field-quiz-opt1').value.trim();
      const opt2 = document.getElementById('field-quiz-opt2').value.trim();
      const answer = Number(document.getElementById('field-quiz-ans').value);
      const icon = document.getElementById('field-quiz-icon').value.trim() || '❓';

      if (itemId) {
        quizzes = quizzes.map(q => q.id === Number(itemId) ? { ...q, question, options: [opt0, opt1, opt2], answer, icon } : q);
      } else {
        const newId = quizzes.length > 0 ? Math.max(...quizzes.map(q => q.id)) + 1 : 1;
        quizzes.push({ id: newId, question, options: [opt0, opt1, opt2], answer, icon });
      }
      window.appStorage.saveQuizzes(quizzes);
      if (window.appQuiz) window.appQuiz.initQuiz();
    } else if (type === 'learn') {
      let learn = window.appStorage.getLearnCards();
      const title = document.getElementById('field-learn-title').value.trim();
      const text = document.getElementById('field-learn-text').value.trim();
      const icon = document.getElementById('field-learn-icon').value.trim() || '💡';

      if (itemId) {
        learn = learn.map(l => l.id === Number(itemId) ? { ...l, title, text, icon } : l);
      } else {
        const newId = learn.length > 0 ? Math.max(...learn.map(l => l.id)) + 1 : 1;
        learn.push({ id: newId, title, text, icon });
      }
      window.appStorage.saveLearnCards(learn);
      if (window.appController) window.appController.renderLearnCards();
    }

    this.closeEditModal();
    this.renderOverviewStats();
    this.renderAllDashboardLists();
  }

  deleteItem(type, id) {
    if (!confirm('Yakin ingin menghapus item ini?')) return;

    if (type === 'story') {
      let stories = window.appStorage.getStories().filter(s => s.id !== Number(id));
      window.appStorage.saveStories(stories);
      if (window.appController) {
        window.appController.storyScenes = stories;
        window.appController.renderStoryScene();
      }
    } else if (type === 'quiz') {
      let quizzes = window.appStorage.getQuizzes().filter(q => q.id !== Number(id));
      window.appStorage.saveQuizzes(quizzes);
      if (window.appQuiz) window.appQuiz.initQuiz();
    } else if (type === 'learn') {
      let learn = window.appStorage.getLearnCards().filter(l => l.id !== Number(id));
      window.appStorage.saveLearnCards(learn);
      if (window.appController) window.appController.renderLearnCards();
    }

    this.renderOverviewStats();
    this.renderAllDashboardLists();
  }

  populateAccountSettings() {
    const creds = window.appStorage.getAdminCredentials();
    const userEl = document.getElementById('change-username');
    const passEl = document.getElementById('change-password');
    if (userEl) userEl.value = creds.username;
    if (passEl) passEl.value = creds.password;
  }

  handleChangePassword() {
    const newUsername = document.getElementById('change-username').value.trim();
    const newPassword = document.getElementById('change-password').value.trim();

    if (!newUsername || !newPassword) return;

    window.appStorage.saveAdminCredentials({ username: newUsername, password: newPassword });
    alert('Akun Admin berhasil diperbarui!');
  }
}

window.appAdmin = new AdminController();
