# Ruang Belajarku - Sistem Manajemen Bimbingan Belajar

Aplikasi manajemen bimbingan belajar (Bimbel) modern, responsif, dan lengkap yang dibangun menggunakan **Next.js**, **Vanilla CSS**, dan terintegrasi dengan **Supabase** (Database PostgreSQL & Autentikasi).

---

## 🌟 Fitur Utama

1. **Branding & Desain Resmi Ruang Belajarku**:
   - Menampilkan logo asli Ruang Belajarku pada halaman login dan sidebar aplikasi.
   - Skema warna elegan: *Deep Navy Blue* (`#0c233f`) dan *Warm Radiant Orange/Amber* (`#f57c00`).
   - Tampilan responsif (Desktop & Mobile) dengan micro-interactions yang mulus.

2. **Autentikasi & Multi-Role**:
   - Integrasi login Supabase Auth (Email & Password).
   - Fitur Masuk Cepat 1-Klik Akun Demo:
     - 👨‍💼 Administrator / Kepala Bimbel
     - 👩‍🏫 Tentor / Guru Pengajar
     - 💳 Staf Kasir & Keuangan

3. **Dashboard Ringkasan Data**:
   - KPI Stat Cards: Total Siswa Aktif, Jumlah Kelas, Total Pengajar, Rata-rata Kehadiran (%), dan Pemasukan SPP.
   - Jadwal Belajar Hari Ini (real-time otomatis mendeteksi hari).
   - Grafik komposisi siswa per jenjang (SD, SMP, SMA, UTBK/SNBT).
   - Aktivitas transaksi dan siswa terdaftar terbaru.

4. **Manajemen Siswa (Full CRUD + Filter & Search)**:
   - Tambah, lihat detail profil lengkap, edit, dan hapus data siswa.
   - Filter berdasarkan Jenjang (SD, SMP, SMA, UTBK) dan Status (Aktif, Cuti, Lulus).
   - Pencarian instan berdasarkan Nama, NISN, Asal Sekolah, atau No WA.
   - Integrasi link WhatsApp 1-klik untuk komunikasi langsung dengan siswa dan orang tua.
   - Ekspor data siswa ke format CSV.

5. **Manajemen Kelas & Kelompok Belajar**:
   - Pengelolaan kelas berdasarkan jenjang dan tipe program (Reguler, Intensif, Privat).
   - Indikator kapasitas siswa per kelas (*capacity progress bar*).
   - Alokasi ruangan belajar dan pengajar penanggung jawab.
   - Manajemen siswa per kelas: daftarkan siswa baru atau keluarkan siswa dari kelas.

6. **Data Pengajar / Tentor**:
   - Profil pengajar, NIP, spesialisasi materi, riwayat pendidikan, dan kontak WhatsApp.
   - Manajemen tag mata pelajaran yang diampu.
   - Jumlah kelas binaan per pengajar.

7. **Pencatatan Kehadiran Siswa (Presensi)**:
   - Pemilihan kelas dan tanggal presensi fleksibel.
   - Tombol cepat **"Tandai Semua Hadir"** (1-klik).
   - Pilihan status presensi: Hadir (H), Izin (I), Sakit (S), Alpa (A) disertai kolom catatan.
   - Ringkasan statistik kehadiran sesi real-time.

8. **Pengelolaan Jadwal Belajar**:
   - Dua mode tampilan: **Grid Mingguan (Senin - Minggu)** dan **Tabel Daftar**.
   - Fitur pendeteksi bentrok jadwal (*conflict detection*): mencegah ruangan atau guru terpakai ganda di jam yang sama.
   - Dukungan link tatap muka daring (Google Meet).

9. **Pembayaran Biaya Bimbingan (SPP) & Kwitansi Resmi**:
   - Pencatatan pembayaran SPP bulanan, modul materi, tryout, dan pendaftaran.
   - Status tagihan: Lunas, Belum Lunas, Menunggu Konfirmasi.
   - Modal cetak **Kwitansi Resmi Ruang Belajarku**: siap cetak langsung atau simpan PDF melalui fitur print browser.

10. **Dukungan Dual-Mode Supabase & Local Interactive Storage**:
    - Beroperasi 100% out-of-the-box tanpa konfigurasi rumit menggunakan penyimpanan lokal reaktif.
    - Modal pengaturan Supabase terintegrasi: cukup masukkan Project URL & Anon Key kapan saja.
    - Script skema SQL lengkap tersedia di file `supabase/schema.sql`.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Menjalankan Server Pengembangan

```bash
npm run dev
```

Buka peramban Anda di: `http://localhost:3000`

### 2. Konfigurasi Supabase (Opsional untuk Produksi)

1. Buat proyek baru di [Supabase.com](https://supabase.com).
2. Buka menu **SQL Editor**, buka file `supabase/schema.sql` dan jalankan (*Run*) skrip tersebut.
3. Buka **Project Settings -> API** dan salin URL serta Anon Key.
4. Masukkan kredensial melalui tombol **DB** di sidebar aplikasi atau isi file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
