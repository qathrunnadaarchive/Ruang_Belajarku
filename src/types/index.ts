export type Jenjang = 'SD' | 'SMP' | 'SMA' | 'UTBK/SNBT' | 'Alumni';

export type StudentStatus = 'Aktif' | 'Cuti' | 'Lulus';

export type ProgramType = 'Reguler' | 'Intensif' | 'Privat' | 'Kedinasan';

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export type PaymentStatus = 'Lunas' | 'Belum Lunas' | 'Menunggu Konfirmasi';

export type PaymentType = 'SPP Bulanan' | 'Biaya Pendaftaran' | 'Modul & Materi' | 'Biaya Tryout & Ujian' | 'Paket Semester';

export type PaymentMethod = 'Transfer Bank BCA' | 'Transfer Bank Mandiri' | 'Transfer BRI' | 'QRIS' | 'Tunai';

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export type UserRole = 'admin' | 'pengajar' | 'keuangan';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Student {
  id: string;
  nisn: string;
  namaLengkap: string;
  jenisKelamin: 'L' | 'P';
  jenjang: Jenjang;
  asalSekolah: string;
  noWaSiswa: string;
  namaOrtu: string;
  noWaOrtu: string;
  alamat: string;
  tanggalDaftar: string;
  status: StudentStatus;
  catatan?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  namaLengkap: string;
  mataPelajaran: string[];
  spesialisasi: string;
  noWa: string;
  email: string;
  pendidikanTerakhir: string;
  status: 'Aktif' | 'Cuti' | 'Nonaktif';
}

export interface ClassItem {
  id: string;
  namaKelas: string;
  jenjang: Jenjang;
  tipeProgram: ProgramType;
  teacherId?: string;
  teacherName?: string;
  ruangan: string;
  kapasitasMaksimal: number;
  biayaBulanan: number;
  status: 'Aktif' | 'Selesai';
  enrolledStudentIds: string[];
}

export interface Schedule {
  id: string;
  classId: string;
  className?: string;
  teacherId?: string;
  teacherName?: string;
  hari: DayOfWeek;
  jamMulai: string; // HH:mm
  jamSelesai: string; // HH:mm
  ruangan: string;
  linkDaring?: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  className?: string;
  studentId: string;
  studentName?: string;
  tanggal: string; // YYYY-MM-DD
  status: AttendanceStatus;
  catatan?: string;
}

export interface PaymentRecord {
  id: string;
  nomorTransaksi: string;
  studentId: string;
  studentName?: string;
  classId?: string;
  className?: string;
  jenisPembayaran: PaymentType;
  bulanTagihan: string;
  jumlahBiaya: number;
  tanggalBayar?: string;
  metodePembayaran?: PaymentMethod;
  status: PaymentStatus;
  catatan?: string;
  createdAt: string;
}
