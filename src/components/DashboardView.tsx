'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenAddStudent: () => void;
  onOpenAddPayment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddStudent,
  onOpenAddPayment,
}) => {
  const {
    students,
    classes,
    teachers,
    schedules,
    attendances,
    payments,
    setActiveTab,
    currentUser,
  } = useApp();

  // Metrics calculation
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Aktif').length;
  const totalClasses = classes.filter((c) => c.status === 'Aktif').length;
  const totalTeachers = teachers.filter((t) => t.status === 'Aktif').length;

  // Attendance rate
  const totalAtt = attendances.length;
  const hadirCount = attendances.filter((a) => a.status === 'Hadir').length;
  const attendanceRate = totalAtt > 0 ? Math.round((hadirCount / totalAtt) * 100) : 95;

  // Financial calculations
  const totalRevenue = payments
    .filter((p) => p.status === 'Lunas')
    .reduce((acc, curr) => acc + curr.jumlahBiaya, 0);

  const pendingPayments = payments.filter((p) => p.status !== 'Lunas');
  const pendingAmount = pendingPayments.reduce((acc, curr) => acc + curr.jumlahBiaya, 0);

  // Jenjang breakdown
  const jenjangCounts: Record<string, number> = {
    'UTBK/SNBT': 0,
    SMA: 0,
    SMP: 0,
    SD: 0,
  };
  students.forEach((s) => {
    if (jenjangCounts[s.jenjang] !== undefined) {
      jenjangCounts[s.jenjang]++;
    }
  });

  // Today's day name in Indonesian
  const dayNamesIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const currentDayName = dayNamesIndo[new Date().getDay()];

  // Today's schedules
  const todaySchedules = schedules.filter((s) => s.hari === currentDayName);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0c233f 0%, #153866 60%, #1e4b85 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -20,
            bottom: -30,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 124, 0, 0.25) 0%, rgba(245, 124, 0, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 600 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(245, 124, 0, 0.2)',
              border: '1px solid rgba(245, 124, 0, 0.4)',
              color: '#fdba74',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            <Sparkles size={13} />
            <span>Selamat Datang, {currentUser?.fullName || 'Pengelola Bimbel'}!</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 8 }}>
            Dashboard Akademik & Keuangan Ruang Belajarku
          </h2>
          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.5 }}>
            Pantau progres belajar siswa, ketersediaan ruang bimbingan, jadwal hari ini ({currentDayName}), dan rekapitulasi pembayaran SPP bulanan.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={onOpenAddStudent}
            className="rb-btn rb-btn-orange"
            style={{ padding: '10px 18px', fontSize: 13.5 }}
          >
            <Users size={16} />
            <span>Daftar Siswa Baru</span>
          </button>
          <button
            onClick={onOpenAddPayment}
            className="rb-btn rb-btn-secondary"
            style={{ padding: '10px 18px', fontSize: 13.5, backgroundColor: 'rgba(255,255,255,0.12)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)' }}
          >
            <CreditCard size={16} />
            <span>Catat Pembayaran</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Siswa */}
        <div
          className="kpi-card kpi-students"
          onClick={() => setActiveTab('students')}
          style={{ cursor: 'pointer' }}
        >
          <div>
            <div className="kpi-label">Total Siswa Terdaftar</div>
            <div className="kpi-value">{totalStudents}</div>
            <div style={{ fontSize: 12, color: 'var(--emerald-600)', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={13} />
              <span>{activeStudents} Siswa Aktif</span>
            </div>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: 'var(--navy-50)', color: 'var(--navy-800)' }}>
            <Users size={24} />
          </div>
        </div>

        {/* Kelas */}
        <div
          className="kpi-card kpi-classes"
          onClick={() => setActiveTab('classes')}
          style={{ cursor: 'pointer' }}
        >
          <div>
            <div className="kpi-label">Kelas Belajar Aktif</div>
            <div className="kpi-value">{totalClasses}</div>
            <div style={{ fontSize: 12, color: 'var(--orange-600)', fontWeight: 600, marginTop: 4 }}>
              SD, SMP, SMA & SNBT
            </div>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: 'var(--orange-50)', color: 'var(--orange-500)' }}>
            <BookOpen size={24} />
          </div>
        </div>

        {/* Pengajar */}
        <div
          className="kpi-card kpi-teachers"
          onClick={() => setActiveTab('teachers')}
          style={{ cursor: 'pointer' }}
        >
          <div>
            <div className="kpi-label">Tentor & Pengajar</div>
            <div className="kpi-value">{totalTeachers}</div>
            <div style={{ fontSize: 12, color: 'var(--indigo-600)', fontWeight: 600, marginTop: 4 }}>
              Spesialis Sains & Soshum
            </div>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: 'var(--indigo-50)', color: 'var(--indigo-600)' }}>
            <GraduationCap size={24} />
          </div>
        </div>

        {/* Kehadiran */}
        <div
          className="kpi-card kpi-attendance"
          onClick={() => setActiveTab('attendance')}
          style={{ cursor: 'pointer' }}
        >
          <div>
            <div className="kpi-label">Tingkat Kehadiran</div>
            <div className="kpi-value">{attendanceRate}%</div>
            <div style={{ fontSize: 12, color: 'var(--emerald-600)', fontWeight: 600, marginTop: 4 }}>
              {hadirCount} dari {totalAtt} sesi hadir
            </div>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: 'var(--emerald-50)', color: 'var(--emerald-600)' }}>
            <CalendarCheck size={24} />
          </div>
        </div>

        {/* Keuangan */}
        <div
          className="kpi-card kpi-revenue"
          onClick={() => setActiveTab('payments')}
          style={{ cursor: 'pointer' }}
        >
          <div>
            <div className="kpi-label">Pemasukan Terkumpul</div>
            <div className="kpi-value" style={{ fontSize: 20 }}>
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: 12, color: pendingAmount > 0 ? 'var(--rose-600)' : 'var(--slate-500)', fontWeight: 600, marginTop: 4 }}>
              {pendingPayments.length} Tagihan Menunggu
            </div>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Jadwal Hari Ini & Analitik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
        {/* Jadwal Hari Ini */}
        <div className="rb-card">
          <div className="rb-card-header">
            <div className="rb-card-title">
              <Clock size={18} color="var(--orange-500)" />
              <span>Jadwal Belajar Hari Ini ({currentDayName})</span>
            </div>
            <button
              onClick={() => setActiveTab('schedules')}
              className="rb-btn rb-btn-secondary rb-btn-sm"
            >
              <span>Semua Jadwal</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="rb-card-body" style={{ padding: 18 }}>
            {todaySchedules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--slate-500)' }}>
                <Calendar size={36} color="var(--slate-300)" style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontWeight: 600 }}>Tidak ada sesi tatap muka hari ini ({currentDayName}).</div>
                <div style={{ fontSize: 12.5, marginTop: 4 }}>Periksa hari lainnya di menu Jadwal Belajar.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {todaySchedules.map((sch) => (
                  <div
                    key={sch.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: 10,
                      backgroundColor: 'var(--slate-50)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          backgroundColor: 'var(--navy-900)',
                          color: '#ffffff',
                          borderRadius: 8,
                          padding: '6px 10px',
                          textAlign: 'center',
                          minWidth: 70,
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#fb923c' }}>{sch.jamMulai}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>s/d {sch.jamSelesai}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy-900)' }}>
                          {sch.className}
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--slate-500)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>Tentor: <strong>{sch.teacherName}</strong></span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <MapPin size={12} />
                            {sch.ruangan}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="rb-btn rb-btn-sm rb-btn-primary"
                    >
                      Presensi
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Distribusi Siswa per Jenjang */}
        <div className="rb-card">
          <div className="rb-card-header">
            <div className="rb-card-title">
              <Users size={18} color="var(--navy-700)" />
              <span>Komposisi Siswa per Jenjang</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--slate-500)' }}>Total: {totalStudents} Siswa</span>
          </div>
          <div className="rb-card-body" style={{ padding: 22 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(jenjangCounts).map(([jenjang, count]) => {
                const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                let barColor = 'var(--navy-700)';
                if (jenjang === 'UTBK/SNBT') barColor = 'var(--orange-500)';
                if (jenjang === 'SMA') barColor = 'var(--indigo-600)';
                if (jenjang === 'SMP') barColor = 'var(--emerald-600)';
                if (jenjang === 'SD') barColor = 'var(--amber-500)';

                return (
                  <div key={jenjang}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>{jenjang}</span>
                      <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                        {count} Siswa ({percentage}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: 9,
                        backgroundColor: 'var(--slate-100)',
                        borderRadius: 10,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          backgroundColor: barColor,
                          borderRadius: 10,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 22,
                padding: '12px 14px',
                borderRadius: 8,
                backgroundColor: 'var(--orange-50)',
                border: '1px solid var(--orange-100)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 12.5,
                color: 'var(--orange-600)',
              }}
            >
              <Sparkles size={16} />
              <span>Program Intensif SNBT UTBK 2026 menjadi pilihan terfavorit siswa saat ini.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Transaksi Terbaru & Siswa Terbaru */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
        {/* Siswa Terbaru */}
        <div className="rb-card">
          <div className="rb-card-header">
            <div className="rb-card-title">
              <Users size={17} color="var(--navy-900)" />
              <span>Siswa Terdaftar Terbaru</span>
            </div>
            <button
              onClick={() => setActiveTab('students')}
              className="rb-btn rb-btn-secondary rb-btn-sm"
            >
              Lihat Semua
            </button>
          </div>
          <div className="rb-card-body" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="rb-table">
                <thead>
                  <tr>
                    <th>Siswa</th>
                    <th>Jenjang</th>
                    <th>Sekolah</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 5).map((stu) => (
                    <tr key={stu.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                          {stu.namaLengkap}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--slate-400)' }}>
                          NISN: {stu.nisn}
                        </div>
                      </td>
                      <td>
                        <span className="rb-badge badge-jenjang">{stu.jenjang}</span>
                      </td>
                      <td style={{ fontSize: 12.5 }}>{stu.asalSekolah}</td>
                      <td>
                        <span className={`rb-badge badge-${stu.status.toLowerCase()}`}>
                          {stu.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pembayaran Terbaru */}
        <div className="rb-card">
          <div className="rb-card-header">
            <div className="rb-card-title">
              <CreditCard size={17} color="var(--emerald-600)" />
              <span>Catatan Pembayaran Terkini</span>
            </div>
            <button
              onClick={() => setActiveTab('payments')}
              className="rb-btn rb-btn-secondary rb-btn-sm"
            >
              Kelola SPP
            </button>
          </div>
          <div className="rb-card-body" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="rb-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Siswa</th>
                    <th>Nominal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 5).map((pay) => (
                    <tr key={pay.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--navy-800)' }}>
                          {pay.nomorTransaksi}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>
                          {pay.jenisPembayaran}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{pay.studentName}</td>
                      <td style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                        Rp {pay.jumlahBiaya.toLocaleString('id-ID')}
                      </td>
                      <td>
                        <span
                          className={`rb-badge ${
                            pay.status === 'Lunas'
                              ? 'badge-lunas'
                              : pay.status === 'Menunggu Konfirmasi'
                              ? 'badge-menunggu'
                              : 'badge-belum-lunas'
                          }`}
                        >
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
