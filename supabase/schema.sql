-- ==============================================================================
-- Schema Database Bimbingan Belajar: "Ruang Belajarku"
-- Supabase PostgreSQL Schema with Row Level Security (RLS) & Seed Data
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Pengguna Sistem: Admin, Pengajar, Keuangan)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'pengajar', 'keuangan')) DEFAULT 'admin',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Teachers Table (Data Pengajar / Tentor)
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nip TEXT UNIQUE NOT NULL,
    nama_lengkap TEXT NOT NULL,
    mata_pelajaran TEXT[] NOT NULL DEFAULT '{}',
    spesialisasi TEXT,
    no_wa TEXT NOT NULL,
    email TEXT,
    pendidikan_terakhir TEXT,
    status TEXT NOT NULL CHECK (status IN ('Aktif', 'Cuti', 'Nonaktif')) DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Students Table (Data Siswa)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nisn TEXT UNIQUE NOT NULL,
    nama_lengkap TEXT NOT NULL,
    jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')) NOT NULL,
    jenjang TEXT NOT NULL CHECK (jenjang IN ('SD', 'SMP', 'SMA', 'UTBK/SNBT', 'Alumni')),
    asal_sekolah TEXT,
    no_wa_siswa TEXT,
    nama_ortu TEXT NOT NULL,
    no_wa_ortu TEXT NOT NULL,
    alamat TEXT,
    tanggal_daftar DATE DEFAULT CURRENT_DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Aktif', 'Cuti', 'Lulus')) DEFAULT 'Aktif',
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Classes Table (Manajemen Kelas)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_kelas TEXT NOT NULL,
    jenjang TEXT NOT NULL CHECK (jenjang IN ('SD', 'SMP', 'SMA', 'UTBK/SNBT', 'Alumni')),
    tipe_program TEXT NOT NULL CHECK (tipe_program IN ('Reguler', 'Intensif', 'Privat', 'Kedinasan')) DEFAULT 'Reguler',
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    ruangan TEXT NOT NULL,
    kapasitas_maksimal INT NOT NULL DEFAULT 15,
    biaya_bulanan NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('Aktif', 'Selesai')) DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Class Enrollments Table (Siswa dalam Kelas)
CREATE TABLE IF NOT EXISTS public.class_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(class_id, student_id)
);

-- 6. Schedules Table (Jadwal Belajar)
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    hari TEXT NOT NULL CHECK (hari IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    ruangan TEXT NOT NULL,
    link_daring TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Attendances Table (Pencatatan Kehadiran Siswa)
CREATE TABLE IF NOT EXISTS public.attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('Hadir', 'Izin', 'Sakit', 'Alpa')) DEFAULT 'Hadir',
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(class_id, student_id, tanggal)
);

-- 8. Payments Table (Pembayaran Biaya Bimbingan)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomor_transaksi TEXT UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    jenis_pembayaran TEXT NOT NULL CHECK (jenis_pembayaran IN ('SPP Bulanan', 'Biaya Pendaftaran', 'Modul & Materi', 'Biaya Tryout & Ujian', 'Paket Semester')) DEFAULT 'SPP Bulanan',
    bulan_tagihan TEXT NOT NULL,
    jumlah_biaya NUMERIC NOT NULL,
    tanggal_bayar DATE,
    metode_pembayaran TEXT CHECK (metode_pembayaran IN ('Transfer Bank BCA', 'Transfer Bank Mandiri', 'Transfer BRI', 'QRIS', 'Tunai')),
    status TEXT NOT NULL CHECK (status IN ('Lunas', 'Belum Lunas', 'Menunggu Konfirmasi')) DEFAULT 'Belum Lunas',
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_students_jenjang ON public.students(jenjang);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_classes_jenjang ON public.classes(jenjang);
CREATE INDEX IF NOT EXISTS idx_attendances_date_class ON public.attendances(class_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_schedules_class ON public.schedules(class_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users and public read/write for bimbel app
CREATE POLICY "Public full access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access class_enrollments" ON public.class_enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access attendances" ON public.attendances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SAMPLE SEED DATA
-- ==============================================================================

-- 1. Sample Teachers
INSERT INTO public.teachers (id, nip, nama_lengkap, mata_pelajaran, spesialisasi, no_wa, email, pendidikan_terakhir, status)
VALUES
('a1111111-1111-1111-1111-111111111111', 'TCH-001', 'Dr. Hendra Kurniawan, M.Pd.', ARRAY['Matematika', 'Penalaran Kuantitatif'], 'Aljabar & Kalkulus UTBK', '081234567890', 'hendra.k@ruangbelajarku.com', 'S3 Pendidikan Matematika UPI', 'Aktif'),
('a2222222-2222-2222-2222-222222222222', 'TCH-002', 'Siti Rahmawati, S.Si.', ARRAY['Fisika', 'IPA Terpadu'], 'Mekanika & Gelombang', '081298765432', 'siti.r@ruangbelajarku.com', 'S1 Fisika ITB', 'Aktif'),
('a3333333-3333-3333-3333-333333333333', 'TCH-003', 'Budi Santoso, M.Hum.', ARRAY['Bahasa Indonesia', 'Literasi Bahasa'], 'Pemahaman Bacaan SNBT & Tata Bahasa', '081356781234', 'budi.s@ruangbelajarku.com', 'S2 Linguistik UI', 'Aktif'),
('a4444444-4444-4444-4444-444444444444', 'TCH-004', 'Clara Amanda, B.Ed., M.A.', ARRAY['Bahasa Inggris', 'TOEFL Preparation'], 'Grammar Mastery & English Literacy', '081778901234', 'clara.a@ruangbelajarku.com', 'S2 TESOL Melbourne Univ', 'Aktif'),
('a5555555-5555-5555-5555-555555555555', 'TCH-005', 'Rizky Pratama, S.Pd.', ARRAY['Kimia', 'Biologi'], 'Kimia Organik & Biologi Sel', '085212347890', 'rizky.p@ruangbelajarku.com', 'S1 Pendidikan Kimia UNY', 'Aktif')
ON CONFLICT (nip) DO NOTHING;

-- 2. Sample Classes
INSERT INTO public.classes (id, nama_kelas, jenjang, tipe_program, teacher_id, ruangan, kapasitas_maksimal, biaya_bulanan, status)
VALUES
('c1111111-1111-1111-1111-111111111111', 'Intensif SNBT UTBK 2026 - Saintek A', 'UTBK/SNBT', 'Intensif', 'a1111111-1111-1111-1111-111111111111', 'Ruang Newton (Lt. 2)', 15, 650000, 'Aktif'),
('c2222222-2222-2222-2222-222222222222', 'Intensif SNBT UTBK 2026 - Soshum B', 'UTBK/SNBT', 'Intensif', 'a3333333-3333-3333-3333-333333333333', 'Ruang Plato (Lt. 2)', 15, 650000, 'Aktif'),
('c3333333-3333-3333-3333-333333333333', 'Reguler 12 SMA IPA Juara', 'SMA', 'Reguler', 'a2222222-2222-2222-2222-222222222222', 'Ruang Galileo (Lt. 1)', 12, 450000, 'Aktif'),
('c4444444-4444-4444-4444-444444444444', 'Reguler 9 SMP Bintang Prestasi', 'SMP', 'Reguler', 'a1111111-1111-1111-1111-111111111111', 'Ruang Archimedes (Lt. 1)', 12, 375000, 'Aktif'),
('c5555555-5555-5555-5555-555555555555', 'Privat Bahasa Inggris Super', 'SMA', 'Privat', 'a4444444-4444-4444-4444-444444444444', 'Ruang Shakespeare (VIP)', 3, 900000, 'Aktif'),
('c6666666-6666-6666-6666-666666666666', 'Reguler 6 SD Siap Ujian', 'SD', 'Reguler', 'a5555555-5555-5555-5555-555555555555', 'Ruang Ki Hajar (Lt. 1)', 10, 325000, 'Aktif')
ON CONFLICT (id) DO NOTHING;

-- 3. Sample Students
INSERT INTO public.students (id, nisn, nama_lengkap, jenis_kelamin, jenjang, asal_sekolah, no_wa_siswa, nama_ortu, no_wa_ortu, alamat, tanggal_daftar, status, catatan)
VALUES
('b1111111-1111-1111-1111-111111111111', '0061234567', 'Aditya Pratama Nugraha', 'L', 'UTBK/SNBT', 'SMAN 3 Kota', '081234567801', 'Bambang Nugraha', '081234567802', 'Jl. Merdeka No. 45', '2026-07-10', 'Aktif', 'Target FK UI / STEI ITB'),
('b2222222-2222-2222-2222-222222222222', '0072345678', 'Anindya Putri Maharani', 'P', 'UTBK/SNBT', 'SMAN 1 Kota', '081234567803', 'Tri Wahyudi', '081234567804', 'Jl. Kenanga Blok C No. 12', '2026-07-12', 'Aktif', 'Target Ilmu Komunikasi UGM'),
('b3333333-3333-3333-3333-333333333333', '0083456789', 'Farhan Rizki Ramadhan', 'L', 'SMA', 'SMAN 5 Kota', '081234567805', 'H. Ramadhan', '081234567806', 'Komplek Permata Hijau B-7', '2026-08-01', 'Aktif', 'Perlu penguatan Fisika & Kimia'),
('b4444444-4444-4444-4444-444444444444', '0094567890', 'Nathania Aurelia Chen', 'P', 'SMA', 'SMA Kristen 1', '081234567807', 'David Chen', '081234567808', 'Jl. Boulevard Raya 88', '2026-08-05', 'Aktif', 'Persiapan lomba olimpiade Matematika'),
('b5555555-5555-5555-5555-555555555555', '0105678901', 'Dimas Arya Pamungkas', 'L', 'SMP', 'SMPN 2 Kota', '081234567809', 'Eko Pamungkas', '081234567810', 'Jl. Melati IV No. 9', '2026-08-15', 'Aktif', 'Meningkatkan nilai rapor semester 1'),
('b6666666-6666-6666-6666-666666666666', '0116789012', 'Syifa Zahra Azzahra', 'P', 'SMP', 'SMP Al-Azhar', '081234567811', 'Zulkifli', '081234567812', 'Jl. Anggrek No. 23', '2026-08-20', 'Aktif', 'Minat tinggi di Biologi dan English'),
('b7777777-7777-7777-7777-777777777777', '0127890123', 'Muhammad Kevin Alfarizi', 'L', 'SD', 'SDN Sukamaju 01', '081234567813', 'Ahmad Farizi', '081234567814', 'Jl. Dahlia No. 15', '2026-09-01', 'Aktif', 'Fokus latihan Calistung & Math dasar'),
('b8888888-8888-8888-8888-888888888888', '0138901234', 'Zahra Putri Kirana', 'P', 'SD', 'SDIT Bintang Cemerlang', '081234567815', 'Hadi Sucipto', '081234567816', 'Perum Asri Blok D-2', '2026-09-05', 'Aktif', 'Sangat aktif dan ceria')
ON CONFLICT (nisn) DO NOTHING;

-- 4. Sample Class Enrollments
INSERT INTO public.class_enrollments (class_id, student_id)
VALUES
('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111'),
('c1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444'),
('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222'),
('c3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333'),
('c3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444'),
('c4444444-4444-4444-4444-444444444444', 'b5555555-5555-5555-5555-555555555555'),
('c4444444-4444-4444-4444-444444444444', 'b6666666-6666-6666-6666-666666666666'),
('c5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111'),
('c6666666-6666-6666-6666-666666666666', 'b7777777-7777-7777-7777-777777777777'),
('c6666666-6666-6666-6666-666666666666', 'b8888888-8888-8888-8888-888888888888')
ON CONFLICT DO NOTHING;

-- 5. Sample Schedules
INSERT INTO public.schedules (class_id, teacher_id, hari, jam_mulai, jam_selesai, ruangan, link_daring)
VALUES
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Senin', '16:00:00', '17:30:00', 'Ruang Newton (Lt. 2)', 'https://meet.google.com/xyz-ruang-belajar'),
('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'Rabu', '16:00:00', '17:30:00', 'Ruang Newton (Lt. 2)', 'https://meet.google.com/xyz-ruang-belajar'),
('c2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'Selasa', '16:00:00', '17:30:00', 'Ruang Plato (Lt. 2)', NULL),
('c3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'Kamis', '15:30:00', '17:00:00', 'Ruang Galileo (Lt. 1)', NULL),
('c4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Jumat', '14:00:00', '15:30:00', 'Ruang Archimedes (Lt. 1)', NULL),
('c5555555-5555-5555-5555-555555555555', 'a4444444-4444-4444-4444-444444444444', 'Sabtu', '10:00:00', '12:00:00', 'Ruang Shakespeare (VIP)', NULL),
('c6666666-6666-6666-6666-666666666666', 'a5555555-5555-5555-5555-555555555555', 'Sabtu', '08:00:00', '09:30:00', 'Ruang Ki Hajar (Lt. 1)', NULL)
ON CONFLICT DO NOTHING;

-- 6. Sample Payments
INSERT INTO public.payments (nomor_transaksi, student_id, class_id, jenis_pembayaran, bulan_tagihan, jumlah_biaya, tanggal_bayar, metode_pembayaran, status, catatan)
VALUES
('INV-202610-001', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'SPP Bulanan', 'Oktober 2026', 650000, '2026-10-02', 'Transfer Bank BCA', 'Lunas', 'Pembayaran via m-BCA a.n. Bambang Nugraha'),
('INV-202610-002', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'SPP Bulanan', 'Oktober 2026', 650000, '2026-10-05', 'QRIS', 'Lunas', 'Pembayaran via QRIS GoPay'),
('INV-202610-003', 'b3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'SPP Bulanan', 'Oktober 2026', 450000, '2026-10-08', 'Transfer BRI', 'Lunas', 'Pembayaran via BRImo'),
('INV-202610-004', 'b4444444-4444-4444-4444-444444444444', 'c3333333-3333-3333-3333-333333333333', 'SPP Bulanan', 'Oktober 2026', 450000, NULL, NULL, 'Belum Lunas', 'Jatuh tempo tanggal 20 Oktober 2026'),
('INV-202610-005', 'b5555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444', 'SPP Bulanan', 'Oktober 2026', 375000, '2026-10-10', 'Tunai', 'Lunas', 'Dibayarkan langsung ke kasir'),
('INV-202610-006', 'b6666666-6666-6666-6666-666666666666', 'c4444444-4444-4444-4444-444444444444', 'Modul & Materi', 'Oktober 2026', 150000, '2026-10-11', 'QRIS', 'Lunas', 'Pembelian Buku Modul Sem 1'),
('INV-202610-007', 'b7777777-7777-7777-7777-777777777777', 'c6666666-6666-6666-6666-666666666666', 'SPP Bulanan', 'Oktober 2026', 325000, NULL, NULL, 'Menunggu Konfirmasi', 'Slip transfer sudah dikirim via WA orang tua'),
('INV-202610-008', 'b8888888-8888-8888-8888-888888888888', 'c6666666-6666-6666-6666-666666666666', 'SPP Bulanan', 'Oktober 2026', 325000, '2026-10-14', 'Transfer Bank Mandiri', 'Lunas', 'Livin Mandiri')
ON CONFLICT (nomor_transaksi) DO NOTHING;
