-- ==============================================================================
-- SKRIP PENGETATAN ROW LEVEL SECURITY (RLS) - RUANG BELAJARKU (REVISI)
-- ==============================================================================
-- Catatan Arsitektur:
-- 1. Pengguna tanpa autentikasi (anon/public) DITOLAK di seluruh tabel.
-- 2. Fungsi public.get_user_role() mengembalikan peran pengguna ('admin', 'pengajar', 'keuangan').
-- 3. Izin eksekusi public.get_user_role() hanya diberikan kepada peran 'authenticated'.
-- 4. refreshFromSupabase() membaca students, teachers, classes, class_enrollments,
--    schedules, attendances, dan payments. Oleh karena itu, pengajar & keuangan
--    memerlukan izin SELECT pada tabel-tabel data operasional/akademik agar
--    sinkronisasi dan kalkulasi Dashboard tidak mengalami error RLS (permission denied).
-- 5. Tabel payments tetap terisolasi penuh: hanya dapat diakses oleh admin & keuangan.
-- 6. Skrip rollback disertakan di bagian bawah sebagai komentar.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FUNGSI HELPER: public.get_user_role()
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Pembatasan hak eksekusi fungsi get_user_role()
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

-- ------------------------------------------------------------------------------
-- 2. HAPUS KEBIJAKAN LAMA ("Public full access ...")
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public full access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public full access teachers" ON public.teachers;
DROP POLICY IF EXISTS "Public full access students" ON public.students;
DROP POLICY IF EXISTS "Public full access classes" ON public.classes;
DROP POLICY IF EXISTS "Public full access class_enrollments" ON public.class_enrollments;
DROP POLICY IF EXISTS "Public full access schedules" ON public.schedules;
DROP POLICY IF EXISTS "Public full access attendances" ON public.attendances;
DROP POLICY IF EXISTS "Public full access payments" ON public.payments;

-- Pastikan RLS aktif di seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. KEBIJAKAN: public.profiles
-- ------------------------------------------------------------------------------
-- Pengguna terautentikasi dapat membaca profilnya sendiri
CREATE POLICY "Profiles self select"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admin memiliki akses penuh ke data profiles
CREATE POLICY "Admin full access profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 4. KEBIJAKAN: public.teachers
-- ------------------------------------------------------------------------------
-- Admin memiliki akses penuh (CRUD)
CREATE POLICY "Admin full access teachers"
ON public.teachers
FOR ALL
TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Pengajar boleh membaca data pengajar (untuk relasi kelas/jadwal)
CREATE POLICY "Pengajar select teachers"
ON public.teachers
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'pengajar');

-- Keuangan boleh membaca data pengajar (untuk dashboard KPI & relasi kelas)
CREATE POLICY "Keuangan select teachers"
ON public.teachers
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'keuangan');

-- ------------------------------------------------------------------------------
-- 5. KEBIJAKAN: public.students
-- ------------------------------------------------------------------------------
-- Admin memiliki akses penuh (CRUD)
CREATE POLICY "Admin full access students"
ON public.students
FOR ALL
TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Pengajar boleh membaca data siswa
CREATE POLICY "Pengajar select students"
ON public.students
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'pengajar');

-- Keuangan boleh membaca data siswa (untuk penagihan SPP & info siswa)
CREATE POLICY "Keuangan select students"
ON public.students
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'keuangan');

-- ------------------------------------------------------------------------------
-- 6. KEBIJAKAN: public.classes
-- ------------------------------------------------------------------------------
-- Admin memiliki akses penuh (CRUD)
CREATE POLICY "Admin full access classes"
ON public.classes
FOR ALL
TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Pengajar boleh membaca data kelas
CREATE POLICY "Pengajar select classes"
ON public.classes
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'pengajar');

-- Keuangan boleh membaca data kelas (untuk referensi biaya SPP bulanan kelas & join invoice)
CREATE POLICY "Keuangan select classes"
ON public.classes
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'keuangan');

-- ------------------------------------------------------------------------------
-- 7. KEBIJAKAN: public.class_enrollments
-- ------------------------------------------------------------------------------
-- Admin memiliki akses penuh (CRUD)
CREATE POLICY "Admin full access class_enrollments"
ON public.class_enrollments
FOR ALL
TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Pengajar boleh membaca daftar siswa terdaftar dalam kelas
CREATE POLICY "Pengajar select class_enrollments"
ON public.class_enrollments
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'pengajar');

-- Keuangan boleh membaca pendaftaran kelas (untuk kalkulasi kapasitas & sinkronisasi kelas)
CREATE POLICY "Keuangan select class_enrollments"
ON public.class_enrollments
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'keuangan');

-- ------------------------------------------------------------------------------
-- 8. KEBIJAKAN: public.schedules
-- ------------------------------------------------------------------------------
-- Admin memiliki akses penuh (CRUD)
CREATE POLICY "Admin full access schedules"
ON public.schedules
FOR ALL
TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Pengajar boleh membaca jadwal bimbingan belajar
CREATE POLICY "Pengajar select schedules"
ON public.schedules
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'pengajar');

-- Keuangan boleh membaca jadwal bimbingan (untuk kalender/dashboard jadwal hari ini)
CREATE POLICY "Keuangan select schedules"
ON public.schedules
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'keuangan');

-- ------------------------------------------------------------------------------
-- 9. KEBIJAKAN: public.attendances
-- ------------------------------------------------------------------------------
-- Admin memiliki akses penuh (CRUD)
CREATE POLICY "Admin full access attendances"
ON public.attendances
FOR ALL
TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Pengajar boleh membaca data presensi
CREATE POLICY "Pengajar select attendances"
ON public.attendances
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'pengajar');

-- Keuangan boleh membaca data presensi (untuk KPI kehadiran di dashboard & profil siswa)
CREATE POLICY "Keuangan select attendances"
ON public.attendances
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'keuangan');

-- Pengajar boleh menambah data presensi (saveAttendanceBatch -> upsert)
CREATE POLICY "Pengajar insert attendances"
ON public.attendances
FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'pengajar');

-- Pengajar boleh memperbarui data presensi (saveAttendanceBatch upsert & updateAttendance)
CREATE POLICY "Pengajar update attendances"
ON public.attendances
FOR UPDATE
TO authenticated
USING (public.get_user_role() = 'pengajar')
WITH CHECK (public.get_user_role() = 'pengajar');

-- ------------------------------------------------------------------------------
-- 10. KEBIJAKAN: public.payments (Terisolasi: Hanya Admin & Keuangan)
-- ------------------------------------------------------------------------------
-- Pengajar sama sekali TIDAK memiliki policy di tabel payments,
-- sehingga ditolak secara otomatis oleh RLS (SELECT menghasilkan [] kosong).

-- Admin memiliki akses penuh (CRUD)
CREATE POLICY "Admin full access payments"
ON public.payments
FOR ALL
TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Keuangan boleh membaca data pembayaran
CREATE POLICY "Keuangan select payments"
ON public.payments
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'keuangan');

-- Keuangan boleh menambah data transaksi pembayaran baru
CREATE POLICY "Keuangan insert payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'keuangan');

-- Keuangan boleh mengubah data transaksi pembayaran (misal: verifikasi status Lunas)
CREATE POLICY "Keuangan update payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (public.get_user_role() = 'keuangan')
WITH CHECK (public.get_user_role() = 'keuangan');

-- ==============================================================================
-- 11. SKRIP ROLLBACK (MENGEMBALIKAN KE KEBIJAKAN LAMA)
-- ==============================================================================
/*
-- Jalankan bagian ini jika ingin membatalkan pembatasan di atas dan mengembalikan
-- ke kebijakan akses penuh publik (Public full access):

-- A. Hapus seluruh policy baru
DROP POLICY IF EXISTS "Profiles self select" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;

DROP POLICY IF EXISTS "Admin full access teachers" ON public.teachers;
DROP POLICY IF EXISTS "Pengajar select teachers" ON public.teachers;
DROP POLICY IF EXISTS "Keuangan select teachers" ON public.teachers;

DROP POLICY IF EXISTS "Admin full access students" ON public.students;
DROP POLICY IF EXISTS "Pengajar select students" ON public.students;
DROP POLICY IF EXISTS "Keuangan select students" ON public.students;

DROP POLICY IF EXISTS "Admin full access classes" ON public.classes;
DROP POLICY IF EXISTS "Pengajar select classes" ON public.classes;
DROP POLICY IF EXISTS "Keuangan select classes" ON public.classes;

DROP POLICY IF EXISTS "Admin full access class_enrollments" ON public.class_enrollments;
DROP POLICY IF EXISTS "Pengajar select class_enrollments" ON public.class_enrollments;
DROP POLICY IF EXISTS "Keuangan select class_enrollments" ON public.class_enrollments;

DROP POLICY IF EXISTS "Admin full access schedules" ON public.schedules;
DROP POLICY IF EXISTS "Pengajar select schedules" ON public.schedules;
DROP POLICY IF EXISTS "Keuangan select schedules" ON public.schedules;

DROP POLICY IF EXISTS "Admin full access attendances" ON public.attendances;
DROP POLICY IF EXISTS "Pengajar select attendances" ON public.attendances;
DROP POLICY IF EXISTS "Keuangan select attendances" ON public.attendances;
DROP POLICY IF EXISTS "Pengajar insert attendances" ON public.attendances;
DROP POLICY IF EXISTS "Pengajar update attendances" ON public.attendances;

DROP POLICY IF EXISTS "Admin full access payments" ON public.payments;
DROP POLICY IF EXISTS "Keuangan select payments" ON public.payments;
DROP POLICY IF EXISTS "Keuangan insert payments" ON public.payments;
DROP POLICY IF EXISTS "Keuangan update payments" ON public.payments;

-- B. Hapus fungsi helper get_user_role()
DROP FUNCTION IF EXISTS public.get_user_role();

-- C. Buat kembali kebijakan Public full access lama
CREATE POLICY "Public full access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access class_enrollments" ON public.class_enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access attendances" ON public.attendances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
*/
