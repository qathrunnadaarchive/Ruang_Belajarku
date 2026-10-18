import { UserRole } from '../types';

export type AppFeature =
  // Tab menu
  | 'tab.dashboard'
  | 'tab.students'
  | 'tab.classes'
  | 'tab.teachers'
  | 'tab.attendance'
  | 'tab.schedules'
  | 'tab.payments'
  // Aksi Siswa
  | 'students.create'
  | 'students.edit'
  | 'students.delete'
  // Aksi Kelas
  | 'classes.create'
  | 'classes.edit'
  | 'classes.delete'
  | 'classes.manage_students'
  // Aksi Pengajar
  | 'teachers.create'
  | 'teachers.edit'
  | 'teachers.delete'
  // Aksi Presensi
  | 'attendance.record'
  // Aksi Jadwal
  | 'schedules.create'
  | 'schedules.edit'
  | 'schedules.delete'
  // Aksi Pembayaran & Metrik
  | 'payments.create'
  | 'payments.edit'
  | 'payments.delete'
  | 'payments.view_revenue';

export const ROLE_PERMISSIONS: Record<UserRole, AppFeature[]> = {
  admin: [
    'tab.dashboard',
    'tab.students',
    'tab.classes',
    'tab.teachers',
    'tab.attendance',
    'tab.schedules',
    'tab.payments',
    'students.create',
    'students.edit',
    'students.delete',
    'classes.create',
    'classes.edit',
    'classes.delete',
    'classes.manage_students',
    'teachers.create',
    'teachers.edit',
    'teachers.delete',
    'attendance.record',
    'schedules.create',
    'schedules.edit',
    'schedules.delete',
    'payments.create',
    'payments.edit',
    'payments.delete',
    'payments.view_revenue',
  ],
  pengajar: [
    'tab.dashboard',
    'tab.students',
    'tab.classes',
    'tab.attendance',
    'tab.schedules',
    'attendance.record',
  ],
  keuangan: [
    'tab.dashboard',
    'tab.students',
    'tab.payments',
    'payments.create',
    'payments.edit',
    'payments.view_revenue',
  ],
};

export function canAccess(role: UserRole | undefined | null, feature: AppFeature): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(feature) ?? false;
}

export function canAccessTab(role: UserRole | undefined | null, tab: string): boolean {
  return canAccess(role, `tab.${tab}` as AppFeature);
}
