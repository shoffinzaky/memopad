# 📝 Memopad

**Memopad** adalah aplikasi catatan berbasis web yang ringan, cepat, dan minimalis, terinspirasi dari fungsionalitas Google Keep. Aplikasi ini dirancang untuk membantu pengguna mencatat ide, membuat daftar tugas, dan mengelola pengingat harian secara instan melalui antarmuka yang bersih.

---

## ✨ Fitur Utama (Saat Ini)

Aplikasi ini sudah mendukung fungsionalitas penuh **CRUD (Create, Read, Update, Delete)**:
*   **Create:** Tambah catatan baru secara instan dengan judul dan isi.
*   **Read:** Tampilan catatan yang responsif dan tersusun rapi dalam bentuk grid/list.
*   **Update:** Edit isi atau judul catatan yang sudah ada kapan saja.
*   **Delete:** Hapus catatan yang sudah tidak diperlukan lagi untuk menjaga ruang kerja tetap bersih.

---

## 🛠️ Tech Stack

Proyek ini dibangun menggunakan kombinasi teknologi modern untuk memastikan performa yang ringan dan manajemen data yang aman:

*   **Frontend:** HTML5 & Vanilla JavaScript (digunakan untuk *client-side rendering* agar pengelolaan komponen nota terasa mulus tanpa *reload* halaman penuh).
*   **Backend:** [Laravel](https://laravel.com/) (Framework PHP yang andal untuk menangani arsitektur RESTful API).
*   **Database:** [SQLite](https://www.sqlite.org/) (Database berbasis file yang sangat ringan, cocok untuk pengelolaan data lokal yang cepat tanpa perlu konfigurasi server DB yang rumit).

---

## 🚀 Cara Menjalankan Proyek Di Lokal

Ikuti langkah-langkah berikut untuk menjalankan Memopad di komputer kamu:

### Prasyarat
Pastikan kamu sudah menginstal **PHP**, **Composer**, dan **Node.js** (jika diperlukan untuk aset) di komputermu.

### Langkah-Langkah Instalasi

1. **Clone repositori ini:**
   ```bash
   git clone [https://github.com/username_kamu/memopad.git](https://github.com/username_kamu/memopad.git)
   cd memopad
2. **Instal dependensi PHP (Laravel):**
   ```bash
   composer install
3. **Salin file konfigurasi lingkungan (.env):**
   ```bash
   cp .env.example .env
4. **Generate Application Key:**
   ```bash
   php artisan key:generate
5. **Konfigurasi Database SQLite:**
   Buka file .env yang baru dibuat, lalu sesuaikan bagian database menjadi seperti ini:
    ```bash
    DB_CONNECTION=sqlite
    # Hapus atau beri komentar pada baris DB_DATABASE, DB_FOREIGN_KEYS jika menggunakan default SQLite Laravel
6. **Jalankan Migrasi Database:**
   ```bash
   php artisan migrate
7. **Jalankan Server Lokal:**
   ```bash
   php artisan serve

## 🗺️ Roadmap Pengembangan
Berikut adalah rencana pengembangan fitur Memopad untuk meningkatkan produktivitas dan kenyamanan pengguna ke depannya:

*   **Inti Catatan & Manajemen Kerja**
    *   [ ] **Fitur Pin Catatan:** Menyematkan catatan penting agar selalu berada di posisi paling atas grid.
    *   [ ] **Menu Pomodoro Timer:** Halaman/menu khusus untuk membantu fokus bekerja menggunakan teknik Pomodoro langsung di dalam aplikasi.
    *   [ ] **Menu Alarm & Pengingat:** Integrasi sistem pengingat waktu (tenggat waktu) pada catatan tertentu.

*   **Kenyamanan Visual**
    *   [ ] **Night Mode / Tema Gelap:** Opsi untuk beralih ke tema gelap guna mengurangi ketegangan mata saat mencatat di malam hari.

📄 Lisensi
Proyek ini bersifat open-source di bawah lisensi MIT License.
