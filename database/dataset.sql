-- ============================================================
-- KELASKU — DATASET DUMMY
-- Jalankan di Supabase SQL Editor
-- ============================================================
-- CATATAN: Jalankan schema.sql dulu sebelum file ini!
-- ============================================================

-- ============================================================
-- 1. PROFILES (data user sudah dibuat via Supabase Auth)
--    Insert langsung ke profiles dengan UUID dummy
-- ============================================================

INSERT INTO profiles (id, name, role, bio, gender) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Budi Santoso', 'guru', 'Guru Matematika berpengalaman 10 tahun', 'Laki-laki'),
  ('11111111-0000-0000-0000-000000000002', 'Siti Rahayu', 'guru', 'Pengajar IPA dan IPAS', 'Perempuan'),
  ('22222222-0000-0000-0000-000000000001', 'Ahmad Fauzi', 'siswa', NULL, 'Laki-laki'),
  ('22222222-0000-0000-0000-000000000002', 'Dewi Kusuma', 'siswa', NULL, 'Perempuan'),
  ('22222222-0000-0000-0000-000000000003', 'Rizky Pratama', 'siswa', NULL, 'Laki-laki'),
  ('22222222-0000-0000-0000-000000000004', 'Nur Aisyah', 'siswa', NULL, 'Perempuan'),
  ('22222222-0000-0000-0000-000000000005', 'Dimas Arya', 'siswa', NULL, 'Laki-laki'),
  ('22222222-0000-0000-0000-000000000006', 'Putri Wulandari', 'siswa', NULL, 'Perempuan')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. CLASSES
-- ============================================================

INSERT INTO classes (id, name, subject, description, kode_kelas, guru_id) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Matematika 10 RPL', 'Matematika', 'Kelas Matematika untuk siswa kelas 10 RPL', 'MTK001', '11111111-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'IPAS 10 TKJ', 'IPAS', 'Ilmu Pengetahuan Alam dan Sosial kelas 10 TKJ', 'IPS002', '11111111-0000-0000-0000-000000000002'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Fisika 11 RPL', 'Fisika', 'Fisika lanjutan untuk kelas 11', 'FIS003', '11111111-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. CLASS MEMBERS (siswa bergabung ke kelas)
-- ============================================================

INSERT INTO class_members (class_id, siswa_id) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000003'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000004'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000005'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000006'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. MATERIALS
-- ============================================================

INSERT INTO materials (id, class_id, guru_id, title, description, type, file_url) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Bab 1 - Persamaan Linear', 'Pengantar persamaan linear satu variabel', 'pdf', 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Bab 2 - Pertidaksamaan', 'Materi pertidaksamaan linear', 'pdf', 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Bab 1 - Ekosistem', 'Pengertian dan komponen ekosistem', 'pdf', 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf'),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Bab 2 - Rantai Makanan', 'Rantai dan jaring-jaring makanan', 'pdf', 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf'),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Bab 1 - Gerak Lurus', 'Kinematika gerak lurus beraturan', 'pdf', 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. MATERIAL PROGRESS (siswa sudah selesai baca materi)
-- ============================================================

INSERT INTO material_progress (siswa_id, material_id, is_done, done_at) VALUES
  ('22222222-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', true, NOW() - INTERVAL '5 days'),
  ('22222222-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000003', true, NOW() - INTERVAL '3 days'),
  ('22222222-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001', true, NOW() - INTERVAL '4 days'),
  ('22222222-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002', true, NOW() - INTERVAL '2 days'),
  ('22222222-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000001', true, NOW() - INTERVAL '6 days')
ON CONFLICT (siswa_id, material_id) DO NOTHING;

-- ============================================================
-- 6. ASSIGNMENTS (tugas)
-- ============================================================

INSERT INTO assignments (id, class_id, guru_id, title, description, deadline, max_score) VALUES
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Latihan Soal Persamaan Linear', 'Kerjakan soal halaman 25-30 buku paket', NOW() + INTERVAL '7 days', 100),
  ('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Ulangan Harian Bab 1', 'Ujian tertulis materi bab 1', NOW() + INTERVAL '14 days', 100),
  ('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Laporan Ekosistem', 'Buat laporan tentang ekosistem di sekitar rumah', NOW() + INTERVAL '10 days', 100),
  ('cccccccc-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Diagram Rantai Makanan', 'Gambar diagram rantai makanan di ekosistem sawah', NOW() - INTERVAL '2 days', 100)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. ASSIGNMENT SUBMISSIONS (tugas yang sudah dikumpulkan)
-- ============================================================

INSERT INTO assignment_submissions (assignment_id, siswa_id, file_url, score, feedback, submitted_at) VALUES
  ('cccccccc-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf', 85, 'Bagus! Tapi perlu perhatikan cara penulisan langkah-langkah pengerjaan', NOW() - INTERVAL '3 days'),
  ('cccccccc-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf', 90, 'Sangat baik! Jawaban lengkap dan rapi', NOW() - INTERVAL '2 days'),
  ('cccccccc-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf', NULL, NULL, NOW() - INTERVAL '1 day'),
  ('cccccccc-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf', 75, 'Diagram sudah benar tapi kurang lengkap keterangannya', NOW() - INTERVAL '1 day')
ON CONFLICT (assignment_id, siswa_id) DO NOTHING;

-- ============================================================
-- 8. QUIZZES
-- ============================================================

INSERT INTO quizzes (id, class_id, guru_id, title, duration_minutes, questions) VALUES
  ('dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Kuis Persamaan Linear', 15,
  '[
    {"question": "Tentukan nilai x dari persamaan 2x + 4 = 10", "options": ["x = 2", "x = 3", "x = 4", "x = 5"], "answer": 1},
    {"question": "Jika 3x - 6 = 9, maka x adalah...", "options": ["3", "4", "5", "6"], "answer": 2},
    {"question": "Persamaan linear satu variabel adalah persamaan yang memiliki...", "options": ["Dua variabel", "Satu variabel", "Tiga variabel", "Tidak ada variabel"], "answer": 1},
    {"question": "Nilai x dari 5x = 25 adalah...", "options": ["3", "4", "5", "6"], "answer": 2},
    {"question": "Bentuk umum persamaan linear adalah...", "options": ["ax² + bx + c = 0", "ax + b = 0", "ax³ + b = 0", "a/x + b = 0"], "answer": 1}
  ]'::jsonb),
  ('dddddddd-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Kuis Ekosistem', 20,
  '[
    {"question": "Komponen biotik dalam ekosistem adalah...", "options": ["Tanah dan air", "Cahaya matahari", "Tumbuhan dan hewan", "Suhu dan kelembaban"], "answer": 2},
    {"question": "Organisme yang mengubah energi matahari menjadi makanan disebut...", "options": ["Konsumen", "Produsen", "Dekomposer", "Predator"], "answer": 1},
    {"question": "Rantai makanan dimulai dari...", "options": ["Hewan karnivora", "Tumbuhan (produsen)", "Hewan herbivora", "Bakteri pengurai"], "answer": 1},
    {"question": "Ekosistem buatan yang dibuat manusia contohnya adalah...", "options": ["Hutan hujan", "Padang rumput", "Sawah", "Danau alami"], "answer": 2},
    {"question": "Proses kembalinya zat organik menjadi zat anorganik disebut...", "options": ["Fotosintesis", "Respirasi", "Dekomposisi", "Evaporasi"], "answer": 2}
  ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. QUIZ RESULTS
-- ============================================================

INSERT INTO quiz_results (quiz_id, siswa_id, answers, score, correct, total, submitted_at) VALUES
  ('dddddddd-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '{"0":1,"1":2,"2":1,"3":2,"4":1}', 100, 5, 5, NOW() - INTERVAL '4 days'),
  ('dddddddd-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', '{"0":1,"1":2,"2":0,"3":2,"4":1}', 80, 4, 5, NOW() - INTERVAL '3 days'),
  ('dddddddd-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000003', '{"0":0,"1":2,"2":1,"3":2,"4":1}', 80, 4, 5, NOW() - INTERVAL '3 days'),
  ('dddddddd-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', '{"0":2,"1":1,"2":1,"3":2,"4":2}', 100, 5, 5, NOW() - INTERVAL '2 days'),
  ('dddddddd-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000004', '{"0":2,"1":1,"2":0,"3":2,"4":2}', 80, 4, 5, NOW() - INTERVAL '1 day')
ON CONFLICT (quiz_id, siswa_id) DO NOTHING;

-- ============================================================
-- 10. USER STREAKS
-- ============================================================

INSERT INTO user_streaks (user_id, streak_count, last_login_date) VALUES
  ('22222222-0000-0000-0000-000000000001', 7, CURRENT_DATE),
  ('22222222-0000-0000-0000-000000000002', 3, CURRENT_DATE),
  ('22222222-0000-0000-0000-000000000003', 5, CURRENT_DATE),
  ('11111111-0000-0000-0000-000000000001', 10, CURRENT_DATE),
  ('11111111-0000-0000-0000-000000000002', 4, CURRENT_DATE)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- SELESAI! Dataset berhasil diimport.
-- ============================================================