# Ruang Belajarku - Sistem Manajemen Bimbingan Belajar

Aplikasi manajemen bimbingan belajar (Bimbel) modern, responsif, dan lengkap yang dibangun menggunakan **Next.js**, **Vanilla CSS**, dan terintegrasi penuh dengan **Supabase** (Database PostgreSQL, Supabase Auth, dan Row Level Security / RLS).

---

## 🌟 Fitur Utama

1. **Branding & Desain Resmi Ruang Belajarku**:
   - Menampilkan logo resmi Ruang Belajarku pada halaman login dan sidebar aplikasi.
   - Skema warna elegan: *Deep Navy Blue* (`#0c233f`) dan *Warm Radiant Orange/Amber* (`#f57c00`).
   - Tampilan responsif (Desktop & Mobile) dengan interaksi modern.

2. **Autentikasi & Pembagian Peran (Role-Based Access Control)**:
   - Autentikasi aman berbasis **Supabase Auth** menggunakan email dan password.
   - **Tiga Peran Pengguna dengan Hak Akses Berbeda**:
     - 👨‍💼 **Admin**: Akses penuh ke seluruh menu dan operasi sistem (Dashboard, Data Siswa, Manajemen Kelas, Data Pengajar, Pencatatan Kehadiran, Jadwal Belajar, dan Pembayaran Biaya SPP).
     - 👩‍🏫 **Tentor (Pengajar)**: Mengakses Dashboard, Data Siswa (lihat profil), Manajemen Kelas (lihat anggota kelas), Pencatatan Kehadiran (input & simpan presensi kelas), dan Jadwal Belajar. Menu Pengajar dan Pembayaran disembunyikan.
     - 💳 **Staf Keuangan**: Mengakses Dashboard, Data Siswa (lihat profil), dan Pengelolaan Pembayaran SPP (catat transaksi, kelola tagihan, cetak kwitansi resmi). Menu Kelas, Pengajar, Presensi, dan Jadwal disembunyikan.
   - Proteksi berlapis (*defense-in-depth*): pembatasan tampilan navigasi/tombol aksi di antarmuka (UI) dan validasi izin peran pada seluruh fungsi pengubah data di aplikasi.

3. **Row Level Security (RLS) di Supabase**:
   - RLS aktif di seluruh tabel database (`profiles`, `students`, `teachers`, `classes`, `class_enrollments`, `schedules`, `attendances`, `payments`).
   - Akses publik tanpa login (*unauthenticated/anon*) ditolak secara otomatis di seluruh tabel.
   - Kebijakan keamanan berbasis fungsi helper `public.get_user_role()`.
   - Skrip pengetatan RLS dan opsi rollback tersedia di file `supabase/rls_policies.sql`.

4. **Dashboard Ringkasan Data**:
   - Kartu KPI: Total Siswa Terdaftar, Kelas Belajar Aktif, Total Pengajar, Tingkat Kehadiran, dan Total Pemasukan SPP (khusus Admin & Keuangan).
   - Jadwal Belajar Hari Ini secara otomatis berdasarkan hari aktif.
   - Grafik komposisi siswa per jenjang pendidikan (SD, SMP, SMA, UTBK/SNBT).
   - Aktivitas transaksi pembayaran dan siswa terdaftar terbaru.

5. **Manajemen Siswa (CRUD + Filter & Pencarian)**:
   - Tambah data siswa baru, edit, hapus, dan lihat riwayat profil detail (termasuk riwayat kehadiran).
   - Filter berdasarkan Jenjang (SD, SMP, SMA, UTBK/SNBT) dan Status (Aktif, Cuti, Lulus).
   - Pencarian instan berdasarkan Nama, NISN, Asal Sekolah, atau Nomor WhatsApp.
   - Integrasi link WhatsApp langsung untuk komunikasi dengan siswa dan orang tua.
   - Ekspor data siswa ke format CSV.

6. **Manajemen Kelas & Kelompok Belajar**:
   - Pengelolaan kelas berdasarkan jenjang dan program (Reguler, Intensif, Privat).
   - Indikator kapasitas siswa per kelas (*capacity progress bar*).
   - Penugasan tentor penanggung jawab dan alokasi ruangan kelas.
   - Pengelolaan anggota kelas: daftarkan siswa baru atau keluarkan siswa dari kelas.

7. **Data Pengajar / Tentor**:
   - Profil pengajar, NIP, spesialisasi materi, riwayat pendidikan, dan kontak WhatsApp.
   - Pengelolaan tag mata pelajaran yang diampu.
   - Informasi jumlah kelas binaan per pengajar.

8. **Pencatatan Kehadiran Siswa (Presensi)**:
   - Pemilihan kelas dan tanggal pembelajaran fleksibel.
   - Tombol cepat **"Tandai Semua Hadir"**.
   - Pilihan status kehadiran: Hadir, Izin, Sakit, Alpa disertai catatan.
   - Rekapitulasi kehadiran real-time.

9. **Pengelolaan Jadwal Belajar**:
   - Dua mode tampilan: **Grid Mingguan** dan **Tabel Daftar**.
   - Fitur deteksi bentrok jadwal (*conflict detection*): mencegah tabrakan ruangan atau pengajar pada waktu yang sama.
   - Dukungan link sesi tatap muka daring (Google Meet).

10. **Pembayaran Biaya Bimbingan (SPP) & Kwitansi Resmi**:
    - Pencatatan pembayaran SPP bulanan, modul materi, tryout, dan biaya pendaftaran.
    - Status tagihan: Lunas, Belum Lunas, Menunggu Konfirmasi.
    - Modal cetak **Kwitansi Resmi Ruang Belajarku** (siap cetak fisik atau simpan format PDF via browser).

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat

Pastikan Anda telah menginstal **Node.js** (versi 18 atau lebih baru) dan memiliki akun/proyek di **Supabase**.

### 2. Instalasi Dependensi

Jalankan perintah berikut pada terminal proyek:

```bash
npm install
```

### 3. Konfigurasi Environment Variable

Buat berkas `.env.local` di direktori utama proyek, lalu isi dengan URL dan Anon Key proyek Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Catatan**: Nilai URL dan Anon Key dapat diperoleh melalui menu **Project Settings -> API** di dashboard Supabase Anda.

### 4. Setup Database & RLS di Supabase

1. Buka dashboard proyek Anda di [Supabase](https://supabase.com).
2. Masuk ke menu **SQL Editor**.
3. Jalankan skrip skema awal dari berkas `supabase/schema.sql`.
4. Jalankan skrip pengetatan hak akses RLS dari berkas `supabase/rls_policies.sql`.

### 5. Buat Akun Pengguna di Supabase

1. Di dashboard Supabase, buka menu **Authentication** $\rightarrow$ **Users**.
2. Klik tombol **Add user** $\rightarrow$ **Create user**.
3. Masukkan **Email** dan **Password** pengguna baru, lalu centang opsi **Auto Confirm User?** agar akun dapat langsung digunakan untuk login tanpa perlu verifikasi email.
4. Buka menu **SQL Editor**, lalu hubungkan akun tersebut ke profil sistem dengan menjalankan perintah SQL berikut (sesuaikan email, nama lengkap, dan perannya):

```sql
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Nama Lengkap Pengguna', 'admin'
FROM auth.users
WHERE email = 'email_pengguna@example.com';
```

> **Pilihan Nilai `role`**:
> - `'admin'` : Akses penuh ke seluruh fitur dan data bimbel.
> - `'pengajar'` : Akses operasional akademik (Siswa, Kelas, Presensi, Jadwal).
> - `'keuangan'` : Akses administratif keuangan (Siswa dan Pembayaran SPP).

### 6. Menjalankan Server Pengembangan

Mulai server lokal dengan perintah:

```bash
npm run dev
```

Buka peramban di [http://localhost:3000](http://localhost:3000) dan masuk menggunakan email serta password akun yang telah dibuat.
