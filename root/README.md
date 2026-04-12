# KelasKu — Platform E-Learning

> Platform belajar online untuk guru dan siswa. Guru dapat membuat kelas, upload materi, membuat tugas & kuis berbasis AI. Siswa dapat belajar, mengumpulkan tugas, dan mengerjakan kuis secara interaktif.

🌐 **Demo Live:** [https://capstone-project-kelasku-omega.vercel.app](https://capstone-project-kelasku-omega.vercel.app)

---

## 👤 Akun Demo (Siap Pakai)

Gunakan akun ini untuk langsung mencoba tanpa perlu daftar:

| Role | Email | Password |
|------|-------|----------|
| **Guru** | `guru.demo@kelasku.com` | `Demo1234!` |
| **Siswa** | `siswa.demo@kelasku.com` | `Demo1234!` |

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React + Vite + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI Kuis | Groq API (llama-3.3-70b) |
| Email | Gmail SMTP via Supabase |
| Hosting FE | Vercel |
| Hosting BE | Railway |

---

## 📁 Struktur Project

```
Capstone-Project-Kelasku/
├── Frontend/                  # React + Vite
│   ├── src/
│   │   ├── pages/             # Halaman utama
│   │   ├── components/        # Komponen reusable
│   │   └── App.jsx            # Router utama
│   ├── .env.example           # Template environment variable
│   └── package.json
│
├── Backend/                   # Node.js + Express
│   ├── route/                 # API routes
│   ├── middleware/            # Auth middleware
│   ├── db.js                  # Koneksi Supabase
│   ├── server.js              # Entry point
│   ├── .env.example           # Template environment variable
│   └── package.json
│
├── database/
│   ├── schema.sql             # Struktur tabel database
│   ├── schema_tambahan.sql    # Tabel tambahan
│   └── dataset.sql            # Data dummy untuk testing
│
└── README.md
```

---

## 🚀 Cara Menjalankan Secara Lokal

### Prasyarat
- Node.js v18 atau lebih baru → [nodejs.org](https://nodejs.org)
- Git → [git-scm.com](https://git-scm.com)
- Akun Supabase (gratis) → [supabase.com](https://supabase.com)
- Akun Groq (gratis) → [console.groq.com](https://console.groq.com)

---

### Step 1 — Clone Repository

```bash
git clone https://github.com/akhdann12/Capstone-Project-Kelasku.git
cd Capstone-Project-Kelasku
```

---

### Step 2 — Setup Supabase

1. Buka [supabase.com](https://supabase.com) → buat project baru
2. Masuk ke **SQL Editor**
3. Jalankan file-file ini secara berurutan:
   ```
   database/schema.sql          ← jalankan pertama
   database/schema_tambahan.sql ← jalankan kedua
   database/dataset.sql         ← jalankan ketiga (data dummy)
   ```
4. Buka **Project Settings → API**:
   - Catat **Project URL**
   - Catat **anon public** key
   - Catat **service_role** key (secret)

---

### Step 3 — Setup Groq API Key

1. Buka [console.groq.com](https://console.groq.com) → daftar gratis
2. Klik **API Keys** → **Create API Key**
3. Catat API key (format: `gsk_...`)

---

### Step 4 — Setup Backend

```bash
cd Backend
npm install
cp .env.example .env
```

Edit file `.env`:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
SUPABASE_ANON_KEY=eyJhbGci...
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
PORT=5001
FRONTEND_URL=http://localhost:5173
```

Jalankan backend:

```bash
npm run dev
```

Backend berjalan di → `http://localhost:5001`

---

### Step 5 — Setup Frontend

Buka terminal baru:

```bash
cd Frontend
npm install
cp .env.example .env
```

Edit file `.env`:

```env
VITE_API_URL=http://localhost:5001
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan di → `http://localhost:5173`

---

### Step 6 — Buka di Browser

Buka `http://localhost:5173` dan login dengan akun yang sudah dibuat atau daftar akun baru.

---

## 🗄️ Dataset

File `database/dataset.sql` berisi data dummy yang siap diimport:

| Data | Jumlah |
|------|--------|
| Guru | 2 akun |
| Siswa | 6 akun |
| Kelas | 3 kelas |
| Materi | 5 materi |
| Tugas | 4 tugas |
| Submisi | 4 submisi |
| Kuis | 2 kuis |
| Hasil Kuis | 5 hasil |

> **Catatan:** Dataset menggunakan UUID dummy. Untuk testing fitur lengkap, daftar akun baru melalui aplikasi agar mendapat UUID Supabase Auth yang valid, lalu join kelas menggunakan kode kelas dari dataset.

**Kode Kelas Dataset:**
| Kelas | Kode |
|-------|------|
| Matematika 10 RPL | `MTK001` |
| IPAS 10 TKJ | `IPS002` |
| Fisika 11 RPL | `FIS003` |

---

## ✨ Fitur Lengkap

### Untuk Guru
- ✅ Buat dan kelola kelas dengan kode unik
- ✅ Upload materi PDF
- ✅ Buat tugas dengan deadline
- ✅ Nilai submisi tugas siswa dengan feedback
- ✅ Buat kuis — AI Generate (Groq) atau Manual
- ✅ Pantau leaderboard kuis
- ✅ Dashboard statistik (kelas, siswa, materi, streak)
- ✅ Kalender deadline otomatis

### Untuk Siswa
- ✅ Join kelas dengan kode
- ✅ Akses dan baca materi PDF
- ✅ Tandai materi selesai (progres tersimpan permanen)
- ✅ Kumpulkan tugas (1x submit)
- ✅ Kerjakan kuis interaktif dengan timer (1x mengerjakan)
- ✅ Lihat skor real-time dan leaderboard kelas
- ✅ XP dari nilai kuis + tugas, ranking per kelas
- ✅ Streak login harian (reset 00:00 WIB)
- ✅ Notifikasi tugas belum dikumpul & kuis belum dikerjakan
- ✅ Kalender deadline tugas otomatis + agenda pribadi

### Umum
- ✅ Autentikasi email + verifikasi
- ✅ Reset password via email
- ✅ Edit profil + upload foto
- ✅ Komentar & diskusi per materi/tugas
- ✅ Responsive mobile (bottom navbar)
- ✅ Session management auto-refresh

---

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Daftar akun baru |
| POST | `/api/auth/login` | Login |
| GET | `/api/classes` | Ambil semua kelas user |
| POST | `/api/classes` | Buat kelas baru (guru) |
| POST | `/api/classes/join` | Join kelas (siswa) |
| GET | `/api/materials/class/:id` | Ambil materi kelas |
| POST | `/api/materials` | Upload materi (guru) |
| GET | `/api/assignments/class/:id` | Ambil tugas kelas |
| POST | `/api/assignments` | Buat tugas (guru) |
| POST | `/api/quizzes/ai-generate` | Generate kuis via AI |
| POST | `/api/quizzes/:id/submit` | Submit jawaban kuis |
| GET | `/api/dashboard/stats` | Statistik user |
| GET | `/api/dashboard/notifications` | Notifikasi user |

---

## 👥 Tim Pengembang

| Nama | Role |
|------|------|
| Muhammad Akhdan Hidayat          | Backend Developer |
| Mohammad Akbar Siahaan           | Frontend Developer |
| Muhammad Afriza Dwi Isnandarsyah | Frontend Developer |
| Taqiya Azmi Shamadani            | UI/UX Design |
| Raisa Afwa                       | UI/UX Design |

---

## 📄 Lisensi

Project ini dibuat untuk keperluan Capstone Project.