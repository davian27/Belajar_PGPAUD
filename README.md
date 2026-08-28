# EMPATHY QUEST — Misi Sahabat Cerdas & Peduli 🌈

[![Web Application](https://img.shields.io/badge/Platform-Web%20%7C%20HTML5%20%7C%20JS-blue.svg)](https://e-pgpaud.vercel.app)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-black.svg)](https://vercel.com)
[![Target Audience](https://img.shields.io/badge/Target-PAUD%20%285--6%20Tahun%29-ff69b4.svg)](#tujuan-edukasi)

**EMPATHY QUEST** adalah aplikasi web game interaktif edukatif yang dirancang khusus untuk anak usia dini (PAUD usia 5–6 tahun). Game ini menggabungkan pembelajaran sosial-emosional, pencegahan perundungan (*anti-bullying*), literasi dasar, numerasi inklusif, dan kerja sama melalui petualangan seru di **Taman Pelangi Sahabat**.

---

## 📸 Fitur Utama Aplikasi

### 🎮 1. Fitur Game Interaktif
* **Validasi Nama Panggilan & Avatar**: Wajib mengisi nama panggilan sebelum memulai petualangan (dilengkapi animasi *shake error* & kursor otomatis jika kosong).
* **Misi 1: Baca Perasaanku (Empati)**  
  Mengenali emosi teman (Dina yang sedih/kesepian) melalui cermin perasaan dan memilih tindakan empati untuk mengajak bermain.
* **Misi 2: Hitung Teman Baik (Numerasi & Inklusi)**  
  Menghitung anak yang sedang bermain bersama dengan animasi bergerak (*bobbing & bouncing ball*), mengajak Tono bergabung dari 5 menjadi 6 anak, serta memutar Roda Permainan.
* **Misi 3: Kata-Kata Sahabat (Literasi & Keberanian Baik)**  
  Menyusun kata (*"Jangan ejek teman"*) untuk membela Beni yang diejek, serta menyuarakan keberanian bicara baik.
* **Misi 4: Bagi dan Bergantian (Numerasi & Kerja Sama)**  
  Membagi 6 bola secara adil ke 3 keranjang teman (2 bola/keranjang) dan menggunakan papan giliran bermain.
* **Pembukaan Level Bertahap (*Progressive Level Unlock*)**:  
  Level 2, 3, dan 4 terkunci secara berurutan hingga misi sebelumnya berhasil diselesaikan.
* **Sertifikat Kelulusan & Tas Sahabat**:  
  Menyimpan 5 Lencana Kekuatan (Empati, Literasi, Numerasi, Kerja Sama, Berani Bicara Baik) dan fitur Cetak Sertifikat Kelulusan.

---

### 🗣️ 2. Google Cloud AI Text-to-Speech (TTS)
* **Pengucap Suara Otomatis & Tombol `🔊 Baca Soal`**:  
  Membacakan cerita dan pertanyaan soal menggunakan **Google Cloud AI Neural Voice (Perempuan Bahasa Indonesia)** dengan intonasi ramah, santai, dan mudah dipahami oleh anak usia PAUD.
* **Fallback Dual-Engine**:  
  Jika jaringan terbatas, sistem otomatis beralih ke *Web Speech API* lokal tanpa mengganggu jalannya permainan.

---

### ⚙️ 3. Panel Admin (`/admin`)
* **Endpoint `/admin` Vercel**: Akses mudah via URL `/admin` tanpa `.html`.
* **Proteksi PIN Keamanan**: Menggunakan PIN bawaan **`1234`** (dapat diubah di menu Pengaturan).
* **Pengubah Backsound (2 Pilihan Musik)**:  
  Dua pilihan lagu backsound dari folder `assets/` (`backsound.mp3` & `backsound2.mp3`) lengkap dengan pemutar *Audio Preview*.
* **Pengelola Konten & Dialog**: Mengedit teks ucapan Kancil Pandu dan cerita Misi 1–4.
* **Manajemen Data**: Fitur *Reset Data Pemain* & *Reset Konfigurasi Default*.

---

### 📱 4. Ultra Responsive Mobile Layout
* Desain responsif presisi yang menyesuaikan dari layar Desktop hingga layar Smartphone kecil (320px–540px).
* Header navbar compact dengan icon bulat anti-terpotong di layar HP.

---

## 📁 Struktur Berkas Proyek

```text
Web Interaktif/
├── admin.html          # Antarmuka Panel Admin
├── index.html          # Antarmuka Game Utama
├── vercel.json         # Routing Rewrite Vercel (/admin -> /admin.html)
├── README.md           # Dokumentasi Proyek
├── assets/             # Berkas Audio Musik Backsound
│   ├── backsound.mp3   # Backsound Pilihan 1 (Default)
│   └── backsound2.mp3  # Backsound Pilihan 2 (Alternatif)
├── css/
│   └── styles.css      # Design System CSS, Animations, & Responsive Queries
└── js/
    ├── admin.js        # Logic & Interaktivitas Panel Admin (PIN, Config, Audio Preview)
    └── app.js          # Core Game Engine, Web Audio Synthesizer, & TTS Engine
```

---

## 🛠️ Teknologi Yang Digunakan

* **HTML5 & Semantic Elements** — Struktur antarmuka ramah aksesibilitas.
* **CSS3 Vanilla** — Glassmorphism, CSS Grid/Flexbox, Custom Animations (`@keyframes`).
* **JavaScript ES6+** — State Management (`localStorage`), Game Engine Modules.
* **Web Audio API** — Efek suara sintetis (bintang, klik, papan putar, fanfare).
* **Web Speech API & Google Cloud TTS** — Suara pengucap soal Bahasa Indonesia.
* **Vercel** — Hosting & Serverless Rewrite Routing.

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone / Unduh Repository**:
   ```bash
   git clone https://github.com/davian27/Belajar_PGPAUD.git
   ```
2. **Jalankan via Local Server**:
   Anda dapat menggunakan ekstensi **Live Server** di VS Code atau perintah Python/Node.js:
   ```bash
   npx serve .
   ```
3. **Buka di Browser**:
   * Game Utama: `http://localhost:3000/index.html`
   * Panel Admin: `http://localhost:3000/admin.html` (PIN: `1234`)

---

## ☁️ Deployment di Vercel

Proyek ini telah dikonfigurasi untuk langsung di-deploy ke **Vercel**:
* Berkas `vercel.json` sudah memetakan URL `/admin` ke `admin.html`.
* Cukup sambungkan repository GitHub ke Vercel Dashboard dan pilih **Deploy**.

---

## 🎯 Capaian Pembelajaran PAUD

| Misi | Fokus Pembelajaran | Output Lencana |
| :--- | :--- | :--- |
| **Prolog** | Mengenal Diri & Memilih Sahabat | — |
| **Misi 1** | Kesadaran Sosial & Empati Emosi | 🌟 Badge Empati |
| **Misi 2** | Numerasi Inklusif & Berhitung 1–6 | 🤝 Badge Numerasi |
| **Misi 3** | Literasi & Menentang Bullying | 🎨 Badge Literasi & Berani Bicara Baik |
| **Misi 4** | Berbagi Sama Rata & Bergantian | ⚽ Badge Kerja Sama |
| **Epilog** | Refleksi & Sertifikat Kelulusan | 🏆 Sertifikat Anak Baik |

---

## 🔒 Keamanan Admin Default
* **URL Admin**: `/admin`
* **Default PIN**: `1234`  
*(PIN dapat diubah melalui Panel Admin pada menu ⚙️ Pengaturan).*

---

*Dikembangkan dengan ❤️ untuk Pendidikan Anak Usia Dini (PAUD) Indonesia.*
