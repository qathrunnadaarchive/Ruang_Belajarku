'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  Teacher,
  ClassItem,
  Schedule,
  AttendanceRecord,
  PaymentRecord,
  UserProfile,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_SCHEDULES,
  INITIAL_ATTENDANCES,
  INITIAL_PAYMENTS,
  INITIAL_USER,
  DEMO_USERS,
} from '../lib/mockData';
import {
  getSupabaseClient,
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  supabase,
} from '../lib/supabase';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  loginAsDemo: (role: 'admin' | 'pengajar' | 'keuangan') => void;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  students: Student[];
  teachers: Teacher[];
  classes: ClassItem[];
  schedules: Schedule[];
  attendances: AttendanceRecord[];
  payments: PaymentRecord[];

  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  isSupabaseConnected: boolean;
  supabaseConfig: { url: string; anonKey: string };
  updateSupabaseCredentials: (url: string, anonKey: string) => void;
  disconnectSupabase: () => void;

  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  addTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<void>;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;

  addClass: (cls: Omit<ClassItem, 'id' | 'enrolledStudentIds'>) => Promise<void>;
  updateClass: (id: string, cls: Partial<ClassItem>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  enrollStudentInClass: (classId: string, studentId: string) => Promise<void>;
  removeStudentFromClass: (classId: string, studentId: string) => Promise<void>;

  addSchedule: (sch: Omit<Schedule, 'id'>) => Promise<void>;
  updateSchedule: (id: string, sch: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  saveAttendanceBatch: (classId: string, tanggal: string, records: { studentId: string; status: any; catatan?: string }[]) => Promise<void>;
  updateAttendance: (id: string, record: Partial<AttendanceRecord>) => Promise<void>;

  addPayment: (payment: Omit<PaymentRecord, 'id' | 'nomorTransaksi' | 'createdAt'>) => Promise<void>;
  updatePayment: (id: string, payment: Partial<PaymentRecord>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;

  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  resetToInitialData: () => void;
  refreshFromSupabase: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to validate and generate UUIDs
const isUUID = (str?: string) =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const formatTimeForDb = (timeStr?: string): string => {
  if (!timeStr) return '16:00:00';
  const parts = timeStr.trim().split(':');
  const hh = (parts[0] || '16').padStart(2, '0');
  const mm = (parts[1] || '00').padStart(2, '0');
  const ss = (parts[2] || '00').padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Supabase sync and connection status
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [supabaseConfig, setSupabaseConfigState] = useState<{ url: string; anonKey: string }>({
    url: '',
    anonKey: '',
  });

  // Main collections (initialized with UUID matching seed)
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [classes, setClasses] = useState<ClassItem[]>(INITIAL_CLASSES);
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCES);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);

  // Toast helper
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch live data from Supabase
  const refreshFromSupabase = async () => {
    setIsSyncing(true);
    const client = getSupabaseClient();
    try {
      // 1. Students
      const { data: dbStudents, error: errStudents } = await client
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbStudents) {
        const mappedStudents: Student[] = dbStudents.map((s: any) => ({
          id: s.id,
          nisn: s.nisn,
          namaLengkap: s.nama_lengkap,
          jenisKelamin: s.jenis_kelamin,
          jenjang: s.jenjang,
          asalSekolah: s.asal_sekolah || '',
          noWaSiswa: s.no_wa_siswa || '',
          namaOrtu: s.nama_ortu,
          noWaOrtu: s.no_wa_ortu,
          alamat: s.alamat || '',
          tanggalDaftar: s.tanggal_daftar,
          status: s.status,
          catatan: s.catatan || '',
        }));
        setStudents(mappedStudents);
      } else if (errStudents) {
        console.error('Supabase fetch students error:', errStudents);
      }

      // 2. Teachers
      const { data: dbTeachers, error: errTeachers } = await client
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbTeachers) {
        const mappedTeachers: Teacher[] = dbTeachers.map((t: any) => ({
          id: t.id,
          nip: t.nip,
          namaLengkap: t.nama_lengkap,
          mataPelajaran: t.mata_pelajaran || [],
          spesialisasi: t.spesialisasi || '',
          noWa: t.no_wa,
          email: t.email || '',
          pendidikanTerakhir: t.pendidikan_terakhir || '',
          status: t.status,
        }));
        setTeachers(mappedTeachers);
      } else if (errTeachers) {
        console.error('Supabase fetch teachers error:', errTeachers);
      }

      // 3. Classes & enrollments
      const { data: dbClasses, error: errClasses } = await client
        .from('classes')
        .select('*, teachers(nama_lengkap)')
        .order('created_at', { ascending: false });
      const { data: dbEnrollments } = await client.from('class_enrollments').select('*');

      if (dbClasses) {
        const mappedClasses: ClassItem[] = dbClasses.map((c: any) => {
          const enrolled = dbEnrollments
            ? dbEnrollments.filter((e: any) => e.class_id === c.id).map((e: any) => e.student_id)
            : [];
          return {
            id: c.id,
            namaKelas: c.nama_kelas,
            jenjang: c.jenjang,
            tipeProgram: c.tipe_program,
            teacherId: c.teacher_id,
            teacherName: c.teachers?.nama_lengkap,
            ruangan: c.ruangan,
            kapasitasMaksimal: c.kapasitas_maksimal,
            biayaBulanan: Number(c.biaya_bulanan),
            status: c.status,
            enrolledStudentIds: enrolled,
          };
        });
        setClasses(mappedClasses);
      } else if (errClasses) {
        console.error('Supabase fetch classes error:', errClasses);
      }

      // 4. Schedules
      const { data: dbSchedules, error: errSchedules } = await client
        .from('schedules')
        .select('*, classes(nama_kelas), teachers(nama_lengkap)')
        .order('hari', { ascending: true });

      if (dbSchedules) {
        const mappedSchedules: Schedule[] = dbSchedules.map((s: any) => ({
          id: s.id,
          classId: s.class_id,
          className: s.classes?.nama_kelas,
          teacherId: s.teacher_id,
          teacherName: s.teachers?.nama_lengkap,
          hari: s.hari,
          jamMulai: (s.jam_mulai || '16:00').substring(0, 5),
          jamSelesai: (s.jam_selesai || '17:30').substring(0, 5),
          ruangan: s.ruangan,
          linkDaring: s.link_daring,
        }));
        setSchedules(mappedSchedules);
      } else if (errSchedules) {
        console.error('Supabase fetch schedules error:', errSchedules);
      }

      // 5. Payments
      const { data: dbPayments, error: errPayments } = await client
        .from('payments')
        .select('*, students(nama_lengkap), classes(nama_kelas)')
        .order('created_at', { ascending: false });

      if (dbPayments) {
        const mappedPayments: PaymentRecord[] = dbPayments.map((p: any) => ({
          id: p.id,
          nomorTransaksi: p.nomor_transaksi,
          studentId: p.student_id,
          studentName: p.students?.nama_lengkap,
          classId: p.class_id,
          className: p.classes?.nama_kelas,
          jenisPembayaran: p.jenis_pembayaran,
          bulanTagihan: p.bulan_tagihan,
          jumlahBiaya: Number(p.jumlah_biaya),
          tanggalBayar: p.tanggal_bayar,
          metodePembayaran: p.metode_pembayaran,
          status: p.status,
          catatan: p.catatan,
          createdAt: p.created_at,
        }));
        setPayments(mappedPayments);
      } else if (errPayments) {
        console.error('Supabase fetch payments error:', errPayments);
      }

      // 6. Attendances
      const { data: dbAttendances, error: errAttendances } = await client
        .from('attendances')
        .select('*, students(nama_lengkap), classes(nama_kelas)')
        .order('tanggal', { ascending: false });

      if (dbAttendances) {
        const mappedAttendances: AttendanceRecord[] = dbAttendances.map((a: any) => ({
          id: a.id,
          classId: a.class_id,
          className: a.classes?.nama_kelas,
          studentId: a.student_id,
          studentName: a.students?.nama_lengkap,
          tanggal: a.tanggal,
          status: a.status,
          catatan: a.catatan,
        }));
        setAttendances(mappedAttendances);
      } else if (errAttendances) {
        console.error('Supabase fetch attendances error:', errAttendances);
      }

      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial load and Realtime listener
  useEffect(() => {
    let channel: any = null;
    try {
      const cfg = getSupabaseConfig();
      setIsSupabaseConnected(cfg.isConfigured);
      setSupabaseConfigState({ url: cfg.url, anonKey: cfg.anonKey });

      const savedUser = localStorage.getItem('rb_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      // Always fetch directly from Supabase
      refreshFromSupabase();

      // Setup Realtime synchronization
      if (typeof window !== 'undefined') {
        const client = getSupabaseClient();
        channel = client
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public' },
            (payload) => {
              console.log('Realtime change from Supabase:', payload.eventType, payload.table);
              refreshFromSupabase();
            }
          )
          .subscribe();
      }
    } catch (e) {
      console.error('Error in initial load:', e);
    }

    return () => {
      if (channel) {
        try {
          const client = getSupabaseClient();
          client.removeChannel(channel);
        } catch (e) {}
      }
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('rb_students', JSON.stringify(students));
      localStorage.setItem('rb_teachers', JSON.stringify(teachers));
      localStorage.setItem('rb_classes', JSON.stringify(classes));
      localStorage.setItem('rb_schedules', JSON.stringify(schedules));
      localStorage.setItem('rb_attendances', JSON.stringify(attendances));
      localStorage.setItem('rb_payments', JSON.stringify(payments));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }, [students, teachers, classes, schedules, attendances, payments]);

  // Auth
  const loginAsDemo = (role: 'admin' | 'pengajar' | 'keuangan') => {
    const user = DEMO_USERS.find((u) => u.role === role) || INITIAL_USER;
    setCurrentUser(user);
    localStorage.setItem('rb_user', JSON.stringify(user));
    addToast({
      type: 'success',
      title: 'Selamat Datang!',
      message: `Masuk sebagai ${user.fullName} (${user.role.toUpperCase()})`,
    });
  };

  const loginWithSupabase = async (email: string, password: string) => {
    const client = getSupabaseClient();
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data?.user) {
        return {
          success: false,
          error: error?.message || 'Login gagal. Pengguna tidak ditemukan.',
        };
      }

      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('full_name, role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError || !profile || !profile.role) {
        await client.auth.signOut().catch(() => {});
        const errorMessage = profileError
          ? `Gagal memuat profil: ${profileError.message}`
          : 'Profil akun atau role tidak ditemukan di sistem. Silakan hubungi administrator.';

        addToast({
          type: 'error',
          title: 'Login Gagal',
          message: errorMessage,
        });

        return { success: false, error: errorMessage };
      }

      const userObj: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: profile.full_name || email.split('@')[0],
        role: profile.role as 'admin' | 'pengajar' | 'keuangan',
      };
      setCurrentUser(userObj);
      localStorage.setItem('rb_user', JSON.stringify(userObj));
      addToast({
        type: 'success',
        title: 'Login Berhasil',
        message: `Selamat datang kembali, ${userObj.fullName}`,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal login ke Supabase' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rb_user');
    const client = getSupabaseClient();
    if (client) {
      client.auth.signOut().catch(() => {});
    }
    addToast({
      type: 'info',
      title: 'Sampai Jumpa',
      message: 'Anda telah berhasil keluar dari akun Ruang Belajarku',
    });
  };

  // Supabase Credentials
  const updateSupabaseCredentials = (url: string, anonKey: string) => {
    saveSupabaseConfig(url, anonKey);
    const cfg = getSupabaseConfig();
    setIsSupabaseConnected(cfg.isConfigured);
    setSupabaseConfigState({ url: cfg.url, anonKey: cfg.anonKey });
    refreshFromSupabase();
    addToast({
      type: 'success',
      title: 'Konfigurasi Supabase Disimpan',
      message: 'Supabase aktif dan data berhasil disinkronkan langsung!',
    });
  };

  const disconnectSupabase = () => {
    clearSupabaseConfig();
    setIsSupabaseConnected(false);
    setSupabaseConfigState({ url: '', anonKey: '' });
    addToast({
      type: 'warning',
      title: 'Supabase Diputus',
      message: 'Aplikasi beralih menggunakan penyimpanan lokal.',
    });
  };

  // ============================================================================
  // STUDENT CRUD (Direct Supabase Sync)
  // ============================================================================
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    const client = getSupabaseClient();
    const newId = generateUUID();

    const insertPayload = {
      id: newId,
      nisn: studentData.nisn,
      nama_lengkap: studentData.namaLengkap,
      jenis_kelamin: studentData.jenisKelamin,
      jenjang: studentData.jenjang,
      asal_sekolah: studentData.asalSekolah || null,
      no_wa_siswa: studentData.noWaSiswa || null,
      nama_ortu: studentData.namaOrtu,
      no_wa_ortu: studentData.noWaOrtu,
      alamat: studentData.alamat || null,
      tanggal_daftar: studentData.tanggalDaftar || new Date().toISOString().split('T')[0],
      status: studentData.status || 'Aktif',
      catatan: studentData.catatan || null,
    };

    const { error } = await client
      .from('students')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase addStudent error:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menambah ke Supabase',
        message: error.message,
      });
      return;
    }

    await refreshFromSupabase();

    addToast({
      type: 'success',
      title: 'Siswa Ditambahkan ke Supabase',
      message: `${studentData.namaLengkap} berhasil tersimpan di database.`,
    });
  };

  const updateStudent = async (id: string, updatedData: Partial<Student>) => {
    const client = getSupabaseClient();
    const target = students.find((s) => s.id === id);

    const updatePayload: any = {};
    if (updatedData.nisn !== undefined) updatePayload.nisn = updatedData.nisn;
    if (updatedData.namaLengkap !== undefined) updatePayload.nama_lengkap = updatedData.namaLengkap;
    if (updatedData.jenisKelamin !== undefined) updatePayload.jenis_kelamin = updatedData.jenisKelamin;
    if (updatedData.jenjang !== undefined) updatePayload.jenjang = updatedData.jenjang;
    if (updatedData.asalSekolah !== undefined) updatePayload.asal_sekolah = updatedData.asalSekolah || null;
    if (updatedData.noWaSiswa !== undefined) updatePayload.no_wa_siswa = updatedData.noWaSiswa || null;
    if (updatedData.namaOrtu !== undefined) updatePayload.nama_ortu = updatedData.namaOrtu;
    if (updatedData.noWaOrtu !== undefined) updatePayload.no_wa_ortu = updatedData.noWaOrtu;
    if (updatedData.alamat !== undefined) updatePayload.alamat = updatedData.alamat || null;
    if (updatedData.tanggalDaftar !== undefined) updatePayload.tanggal_daftar = updatedData.tanggalDaftar;
    if (updatedData.status !== undefined) updatePayload.status = updatedData.status;
    if (updatedData.catatan !== undefined) updatePayload.catatan = updatedData.catatan || null;

    let res;
    if (isUUID(id)) {
      res = await client.from('students').update(updatePayload).eq('id', id).select();
    } else if (target?.nisn) {
      res = await client.from('students').update(updatePayload).eq('nisn', target.nisn).select();
    }

    if (res?.error) {
      console.error('Supabase updateStudent error:', res.error);
      addToast({
        type: 'error',
        title: 'Gagal Memperbarui di Supabase',
        message: res.error.message,
      });
      return;
    }

    await refreshFromSupabase();

    addToast({
      type: 'info',
      title: 'Data Siswa Diperbarui',
      message: 'Perubahan data berhasil disinkronkan ke Supabase.',
    });
  };

  const deleteStudent = async (id: string) => {
    const client = getSupabaseClient();
    const target = students.find((s) => s.id === id);

    try {
      if (isUUID(id)) {
        await client.from('class_enrollments').delete().eq('student_id', id);
        await client.from('attendances').delete().eq('student_id', id);
        await client.from('payments').delete().eq('student_id', id);
        const { error } = await client.from('students').delete().eq('id', id);
        if (error) throw error;
      } else if (target?.nisn) {
        const { error } = await client.from('students').delete().eq('nisn', target.nisn);
        if (error) throw error;
      }

      await refreshFromSupabase();

      addToast({
        type: 'warning',
        title: 'Siswa Dihapus dari Supabase',
        message: `${target?.namaLengkap || 'Siswa'} berhasil dihapus dari database.`,
      });
    } catch (e: any) {
      console.error('deleteStudent exception:', e);
      addToast({
        type: 'error',
        title: 'Gagal Menghapus Data Siswa',
        message: e.message || 'Terjadi kesalahan sistem saat menghapus data di Supabase.',
      });
    }
  };

  // ============================================================================
  // TEACHER CRUD (Direct Supabase Sync)
  // ============================================================================
  const addTeacher = async (teacherData: Omit<Teacher, 'id'>) => {
    const client = getSupabaseClient();
    const newId = generateUUID();

    const insertPayload = {
      id: newId,
      nip: teacherData.nip,
      nama_lengkap: teacherData.namaLengkap,
      mata_pelajaran: teacherData.mataPelajaran || [],
      spesialisasi: teacherData.spesialisasi || null,
      no_wa: teacherData.noWa,
      email: teacherData.email || null,
      pendidikan_terakhir: teacherData.pendidikanTerakhir || null,
      status: teacherData.status || 'Aktif',
    };

    const { error } = await client
      .from('teachers')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase addTeacher error:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menambah Pengajar',
        message: error.message,
      });
      return;
    }

    await refreshFromSupabase();

    addToast({
      type: 'success',
      title: 'Pengajar Ditambahkan ke Supabase',
      message: `${teacherData.namaLengkap} berhasil disimpan di database.`,
    });
  };

  const updateTeacher = async (id: string, updatedData: Partial<Teacher>) => {
    const client = getSupabaseClient();
    const target = teachers.find((t) => t.id === id);

    const updatePayload: any = {};
    if (updatedData.nip !== undefined) updatePayload.nip = updatedData.nip;
    if (updatedData.namaLengkap !== undefined) updatePayload.nama_lengkap = updatedData.namaLengkap;
    if (updatedData.mataPelajaran !== undefined) updatePayload.mata_pelajaran = updatedData.mataPelajaran;
    if (updatedData.spesialisasi !== undefined) updatePayload.spesialisasi = updatedData.spesialisasi || null;
    if (updatedData.noWa !== undefined) updatePayload.no_wa = updatedData.noWa;
    if (updatedData.email !== undefined) updatePayload.email = updatedData.email || null;
    if (updatedData.pendidikanTerakhir !== undefined) updatePayload.pendidikan_terakhir = updatedData.pendidikanTerakhir || null;
    if (updatedData.status !== undefined) updatePayload.status = updatedData.status;

    let res;
    if (isUUID(id)) {
      res = await client.from('teachers').update(updatePayload).eq('id', id).select();
    } else if (target?.nip) {
      res = await client.from('teachers').update(updatePayload).eq('nip', target.nip).select();
    }

    if (res?.error) {
      console.error('Supabase updateTeacher error:', res.error);
      addToast({
        type: 'error',
        title: 'Gagal Memperbarui Pengajar',
        message: res.error.message,
      });
      return;
    }

    await refreshFromSupabase();

    addToast({
      type: 'info',
      title: 'Data Pengajar Diperbarui',
      message: 'Informasi pengajar berhasil disinkronkan ke Supabase.',
    });
  };

  const deleteTeacher = async (id: string) => {
    const client = getSupabaseClient();
    const target = teachers.find((t) => t.id === id);

    try {
      if (isUUID(id)) {
        await client.from('schedules').delete().eq('teacher_id', id);
        await client.from('classes').update({ teacher_id: null }).eq('teacher_id', id);
        const { error } = await client.from('teachers').delete().eq('id', id);
        if (error) throw error;
      } else if (target?.nip) {
        const { error } = await client.from('teachers').delete().eq('nip', target.nip);
        if (error) throw error;
      }

      await refreshFromSupabase();

      addToast({
        type: 'warning',
        title: 'Pengajar Dihapus dari Supabase',
        message: `${target?.namaLengkap || 'Pengajar'} telah dihapus dari database.`,
      });
    } catch (e: any) {
      console.error('deleteTeacher exception:', e);
      addToast({
        type: 'error',
        title: 'Gagal Hapus Pengajar',
        message: e.message || 'Gagal menghapus data pengajar dari Supabase.',
      });
    }
  };

  // ============================================================================
  // CLASSES CRUD (Direct Supabase Sync)
  // ============================================================================
  const addClass = async (clsData: Omit<ClassItem, 'id' | 'enrolledStudentIds'>) => {
    const client = getSupabaseClient();
    const newId = generateUUID();

    const insertPayload = {
      id: newId,
      nama_kelas: clsData.namaKelas,
      jenjang: clsData.jenjang,
      tipe_program: clsData.tipeProgram,
      teacher_id: isUUID(clsData.teacherId) ? clsData.teacherId : null,
      ruangan: clsData.ruangan,
      kapasitas_maksimal: Number(clsData.kapasitasMaksimal) || 15,
      biaya_bulanan: Number(clsData.biayaBulanan) || 0,
      status: clsData.status || 'Aktif',
    };

    const { error } = await client
      .from('classes')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase addClass error:', error);
      addToast({
        type: 'error',
        title: 'Gagal Buka Kelas di Supabase',
        message: error.message,
      });
      return;
    }

    await refreshFromSupabase();

    addToast({
      type: 'success',
      title: 'Kelas Berhasil Dibuka di Supabase',
      message: `Kelas ${clsData.namaKelas} telah tersimpan di database.`,
    });
  };

  const updateClass = async (id: string, updatedData: Partial<ClassItem>) => {
    const client = getSupabaseClient();
    const target = classes.find((c) => c.id === id);

    const updatePayload: any = {};
    if (updatedData.namaKelas !== undefined) updatePayload.nama_kelas = updatedData.namaKelas;
    if (updatedData.jenjang !== undefined) updatePayload.jenjang = updatedData.jenjang;
    if (updatedData.tipeProgram !== undefined) updatePayload.tipe_program = updatedData.tipeProgram;
    if (updatedData.teacherId !== undefined) {
      updatePayload.teacher_id = isUUID(updatedData.teacherId) ? updatedData.teacherId : null;
    }
    if (updatedData.ruangan !== undefined) updatePayload.ruangan = updatedData.ruangan;
    if (updatedData.kapasitasMaksimal !== undefined) updatePayload.kapasitas_maksimal = Number(updatedData.kapasitasMaksimal);
    if (updatedData.biayaBulanan !== undefined) updatePayload.biaya_bulanan = Number(updatedData.biayaBulanan);
    if (updatedData.status !== undefined) updatePayload.status = updatedData.status;

    let res;
    if (isUUID(id)) {
      res = await client.from('classes').update(updatePayload).eq('id', id).select();
    } else if (target?.namaKelas) {
      res = await client.from('classes').update(updatePayload).eq('nama_kelas', target.namaKelas).select();
    }

    if (res?.error) {
      console.error('Supabase updateClass error:', res.error);
      addToast({
        type: 'error',
        title: 'Gagal Memperbarui Kelas',
        message: res.error.message,
      });
      return;
    }

    await refreshFromSupabase();

    addToast({
      type: 'info',
      title: 'Kelas Diperbarui',
      message: 'Data kelas berhasil disinkronkan ke Supabase.',
    });
  };

  const deleteClass = async (id: string) => {
    const client = getSupabaseClient();
    const target = classes.find((c) => c.id === id);

    try {
      if (isUUID(id)) {
        await client.from('class_enrollments').delete().eq('class_id', id);
        await client.from('schedules').delete().eq('class_id', id);
        await client.from('attendances').delete().eq('class_id', id);
        await client.from('payments').update({ class_id: null }).eq('class_id', id);
        const { error } = await client.from('classes').delete().eq('id', id);
        if (error) throw error;
      } else if (target?.namaKelas) {
        const { error } = await client.from('classes').delete().eq('nama_kelas', target.namaKelas);
        if (error) throw error;
      }

      await refreshFromSupabase();

      addToast({
        type: 'warning',
        title: 'Kelas Dihapus dari Supabase',
        message: `Kelas ${target?.namaKelas || ''} telah dihapus dari database.`,
      });
    } catch (e: any) {
      console.error('deleteClass exception:', e);
      addToast({
        type: 'error',
        title: 'Gagal Hapus Kelas',
        message: e.message || 'Gagal menghapus kelas dari Supabase.',
      });
    }
  };

  const enrollStudentInClass = async (classId: string, studentId: string) => {
    const client = getSupabaseClient();

    if (isUUID(classId) && isUUID(studentId)) {
      const { error } = await client.from('class_enrollments').insert({
        class_id: classId,
        student_id: studentId,
      });

      if (error) {
        console.error('Supabase enrollStudentInClass error:', error);
        addToast({
          type: 'error',
          title: 'Gagal Mendaftarkan Siswa ke Kelas',
          message: error.message,
        });
        return;
      }
    }

    await refreshFromSupabase();

    const stu = students.find((s) => s.id === studentId);
    addToast({
      type: 'success',
      title: 'Siswa Ditambahkan ke Kelas',
      message: `${stu?.namaLengkap || 'Siswa'} berhasil didaftarkan ke kelas di Supabase.`,
    });
  };

  const removeStudentFromClass = async (classId: string, studentId: string) => {
    const client = getSupabaseClient();

    if (isUUID(classId) && isUUID(studentId)) {
      const { error } = await client
        .from('class_enrollments')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', studentId);

      if (error) {
        console.error('Supabase removeStudentFromClass error:', error);
        addToast({
          type: 'error',
          title: 'Gagal Mengeluarkan Siswa',
          message: error.message,
        });
        return;
      }
    }

    await refreshFromSupabase();

    addToast({
      type: 'info',
      title: 'Siswa Dikeluarkan dari Kelas',
      message: 'Data keanggotaan kelas telah diperbarui di Supabase.',
    });
  };

  // ============================================================================
  // SCHEDULES CRUD (Direct Supabase Sync)
  // ============================================================================
  const addSchedule = async (schData: Omit<Schedule, 'id'>) => {
    const client = getSupabaseClient();
    const newId = generateUUID();

    const insertPayload = {
      id: newId,
      class_id: schData.classId,
      teacher_id: isUUID(schData.teacherId) ? schData.teacherId : null,
      hari: schData.hari,
      jam_mulai: formatTimeForDb(schData.jamMulai),
      jam_selesai: formatTimeForDb(schData.jamSelesai),
      ruangan: schData.ruangan,
      link_daring: schData.linkDaring || null,
    };

    const { error } = await client
      .from('schedules')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase addSchedule error:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan Jadwal di Supabase',
        message: error.message,
      });
      return;
    }

    await refreshFromSupabase();

    addToast({
      type: 'success',
      title: 'Jadwal Ditambahkan ke Supabase',
      message: `${schData.hari}, ${schData.jamMulai} - ${schData.jamSelesai}`,
    });
  };

  const updateSchedule = async (id: string, schData: Partial<Schedule>) => {
    const client = getSupabaseClient();

    const updatePayload: any = {};
    if (schData.classId && isUUID(schData.classId)) updatePayload.class_id = schData.classId;
    if (schData.teacherId !== undefined) {
      updatePayload.teacher_id = isUUID(schData.teacherId) ? schData.teacherId : null;
    }
    if (schData.hari !== undefined) updatePayload.hari = schData.hari;
    if (schData.jamMulai !== undefined) updatePayload.jam_mulai = formatTimeForDb(schData.jamMulai);
    if (schData.jamSelesai !== undefined) updatePayload.jam_selesai = formatTimeForDb(schData.jamSelesai);
    if (schData.ruangan !== undefined) updatePayload.ruangan = schData.ruangan;
    if (schData.linkDaring !== undefined) updatePayload.link_daring = schData.linkDaring || null;

    if (isUUID(id)) {
      const { error } = await client.from('schedules').update(updatePayload).eq('id', id).select();
      if (error) {
        console.error('Supabase updateSchedule error:', error);
        addToast({
          type: 'error',
          title: 'Gagal Memperbarui Jadwal',
          message: error.message,
        });
        return;
      }
    }

    await refreshFromSupabase();

    addToast({
      type: 'info',
      title: 'Jadwal Diperbarui',
      message: 'Perubahan jadwal belajar telah disinkronkan ke Supabase.',
    });
  };

  const deleteSchedule = async (id: string) => {
    const client = getSupabaseClient();
    try {
      if (isUUID(id)) {
        const { error } = await client.from('schedules').delete().eq('id', id);
        if (error) throw error;
      }

      await refreshFromSupabase();

      addToast({
        type: 'warning',
        title: 'Jadwal Dihapus dari Supabase',
        message: 'Sesi jadwal belajar telah dihapus dari database.',
      });
    } catch (e: any) {
      console.error('deleteSchedule exception:', e);
      addToast({
        type: 'error',
        title: 'Gagal Hapus Jadwal',
        message: e.message || 'Gagal menghapus jadwal belajar di Supabase.',
      });
    }
  };

  // ============================================================================
  // ATTENDANCES (Direct Supabase Sync)
  // ============================================================================
  const saveAttendanceBatch = async (
    classId: string,
    tanggal: string,
    records: { studentId: string; status: any; catatan?: string }[]
  ) => {
    const client = getSupabaseClient();

    const validRows = records
      .filter((r) => isUUID(r.studentId) && isUUID(classId))
      .map((r) => ({
        class_id: classId,
        student_id: r.studentId,
        tanggal,
        status: r.status,
        catatan: r.catatan || null,
      }));

    if (validRows.length > 0) {
      const { error } = await client
        .from('attendances')
        .upsert(validRows, { onConflict: 'class_id,student_id,tanggal' });

      if (error) {
        console.error('Supabase saveAttendances error:', error);
        addToast({
          type: 'error',
          title: 'Gagal Simpan Presensi di Supabase',
          message: error.message,
        });
        return;
      }
    }

    await refreshFromSupabase();

    addToast({
      type: 'success',
      title: 'Kehadiran Disimpan di Supabase!',
      message: `Presensi ${records.length} siswa untuk tanggal ${tanggal} berhasil dicatat di database.`,
    });
  };

  const updateAttendance = async (id: string, record: Partial<AttendanceRecord>) => {
    const client = getSupabaseClient();

    if (isUUID(id)) {
      const updatePayload: any = {};
      if (record.status) updatePayload.status = record.status;
      if (record.catatan !== undefined) updatePayload.catatan = record.catatan || null;

      const { error } = await client.from('attendances').update(updatePayload).eq('id', id).select();
      if (error) {
        console.error('Supabase updateAttendance error:', error);
        addToast({
          type: 'error',
          title: 'Gagal Memperbarui Presensi',
          message: error.message,
        });
        return;
      }
    }

    await refreshFromSupabase();

    addToast({
      type: 'info',
      title: 'Status Kehadiran Diperbarui',
      message: 'Catatan presensi telah diperbarui di Supabase.',
    });
  };

  // ============================================================================
  // PAYMENTS CRUD (Direct Supabase Sync)
  // ============================================================================
  const addPayment = async (paymentData: Omit<PaymentRecord, 'id' | 'nomorTransaksi' | 'createdAt'>) => {
    const client = getSupabaseClient();
    const student = students.find((s) => s.id === paymentData.studentId);
    const now = new Date();
    const invCode = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      Math.floor(Math.random() * 900) + 100
    )}`;
    const newId = generateUUID();

    const insertPayload = {
      id: newId,
      nomor_transaksi: invCode,
      student_id: paymentData.studentId,
      class_id: isUUID(paymentData.classId) ? paymentData.classId : null,
      jenis_pembayaran: paymentData.jenisPembayaran,
      bulan_tagihan: paymentData.bulanTagihan,
      jumlah_biaya: Number(paymentData.jumlahBiaya),
      tanggal_bayar: paymentData.tanggalBayar || null,
      metode_pembayaran: paymentData.metodePembayaran || null,
      status: paymentData.status,
      catatan: paymentData.catatan || null,
    };

    const { error } = await client
      .from('payments')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase addPayment error:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan Pembayaran di Supabase',
        message: error.message,
      });
      return;
    }

    await refreshFromSupabase();

    addToast({
      type: 'success',
      title: 'Pembayaran Dicatat di Supabase!',
      message: `Transaksi ${invCode} a.n. ${student?.namaLengkap || 'Siswa'} sebesar Rp ${paymentData.jumlahBiaya.toLocaleString('id-ID')} disimpan di database.`,
    });
  };

  const updatePayment = async (id: string, paymentData: Partial<PaymentRecord>) => {
    const client = getSupabaseClient();
    const target = payments.find((p) => p.id === id);

    const updatePayload: any = {};
    if (paymentData.studentId !== undefined && isUUID(paymentData.studentId)) {
      updatePayload.student_id = paymentData.studentId;
    }
    if (paymentData.classId !== undefined) {
      updatePayload.class_id = isUUID(paymentData.classId) ? paymentData.classId : null;
    }
    if (paymentData.jenisPembayaran !== undefined) {
      updatePayload.jenis_pembayaran = paymentData.jenisPembayaran;
    }
    if (paymentData.bulanTagihan !== undefined) {
      updatePayload.bulan_tagihan = paymentData.bulanTagihan;
    }
    if (paymentData.jumlahBiaya !== undefined) {
      updatePayload.jumlah_biaya = Number(paymentData.jumlahBiaya);
    }
    if (paymentData.status !== undefined) {
      updatePayload.status = paymentData.status;
    }
    if (paymentData.tanggalBayar !== undefined) {
      updatePayload.tanggal_bayar = paymentData.tanggalBayar || null;
    }
    if (paymentData.metodePembayaran !== undefined) {
      updatePayload.metode_pembayaran = paymentData.metodePembayaran || null;
    }
    if (paymentData.catatan !== undefined) {
      updatePayload.catatan = paymentData.catatan || null;
    }

    let res;
    if (isUUID(id)) {
      res = await client.from('payments').update(updatePayload).eq('id', id).select();
    } else if (target?.nomorTransaksi) {
      res = await client.from('payments').update(updatePayload).eq('nomor_transaksi', target.nomorTransaksi).select();
    }

    if (res?.error) {
      console.error('Supabase updatePayment error:', res.error);
      addToast({
        type: 'error',
        title: 'Gagal Memperbarui Pembayaran',
        message: res.error.message,
      });
      return;
    }

    await refreshFromSupabase();

    addToast({
      type: 'info',
      title: 'Data Pembayaran Diperbarui',
      message: 'Status tagihan berhasil disinkronkan ke Supabase.',
    });
  };

  const deletePayment = async (id: string) => {
    const client = getSupabaseClient();
    const target = payments.find((p) => p.id === id);

    try {
      if (isUUID(id)) {
        const { error } = await client.from('payments').delete().eq('id', id);
        if (error) throw error;
      } else if (target?.nomorTransaksi) {
        const { error } = await client.from('payments').delete().eq('nomor_transaksi', target.nomorTransaksi);
        if (error) throw error;
      }

      await refreshFromSupabase();

      addToast({
        type: 'warning',
        title: 'Transaksi Dihapus dari Supabase',
        message: `Kwitansi ${target?.nomorTransaksi || ''} telah dihapus dari database.`,
      });
    } catch (e: any) {
      console.error('deletePayment exception:', e);
      addToast({
        type: 'error',
        title: 'Gagal Hapus Pembayaran di Supabase',
        message: e.message || 'Gagal menghapus transaksi dari database.',
      });
    }
  };

  const resetToInitialData = () => {
    setStudents(INITIAL_STUDENTS);
    setTeachers(INITIAL_TEACHERS);
    setClasses(INITIAL_CLASSES);
    setSchedules(INITIAL_SCHEDULES);
    setAttendances(INITIAL_ATTENDANCES);
    setPayments(INITIAL_PAYMENTS);
    localStorage.clear();
    refreshFromSupabase();
    addToast({
      type: 'info',
      title: 'Data Direset',
      message: 'Seluruh database telah dikembalikan ke data awal bawaan sistem dan disinkronkan ulang.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginAsDemo,
        loginWithSupabase,
        logout,
        students,
        teachers,
        classes,
        schedules,
        attendances,
        payments,
        activeTab,
        setActiveTab,
        globalSearch,
        setGlobalSearch,
        isSupabaseConnected,
        supabaseConfig,
        updateSupabaseCredentials,
        disconnectSupabase,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addClass,
        updateClass,
        deleteClass,
        enrollStudentInClass,
        removeStudentFromClass,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        saveAttendanceBatch,
        updateAttendance,
        addPayment,
        updatePayment,
        deletePayment,
        toasts,
        addToast,
        removeToast,
        resetToInitialData,
        refreshFromSupabase,
        isSyncing,
        lastSyncTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
