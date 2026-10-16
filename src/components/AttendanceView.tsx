'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../types';
import {
  CalendarCheck,
  Calendar,
  BookOpen,
  CheckCircle2,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  Save,
  Users,
  Search,
  Filter,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    students,
    attendances,
    saveAttendanceBatch,
    globalSearch,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Current batch records state for the selected class & date
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const enrolledStudentIds = selectedClass?.enrolledStudentIds || [];

  // Local attendance status map for the form
  const [statusMap, setStatusMap] = useState<Record<string, { status: AttendanceStatus; catatan: string }>>({});

  // Initialize statusMap whenever class or date changes
  React.useEffect(() => {
    const initialMap: Record<string, { status: AttendanceStatus; catatan: string }> = {};

    enrolledStudentIds.forEach((sid) => {
      // Check if already in attendances
      const existing = attendances.find(
        (a) => a.classId === selectedClassId && a.studentId === sid && a.tanggal === selectedDate
      );
      if (existing) {
        initialMap[sid] = {
          status: existing.status,
          catatan: existing.catatan || '',
        };
      } else {
        // default to Hadir
        initialMap[sid] = {
          status: 'Hadir',
          catatan: '',
        };
      }
    });

    setStatusMap(initialMap);
  }, [selectedClassId, selectedDate, attendances, classes]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleCatatanChange = (studentId: string, catatan: string) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        catatan,
      },
    }));
  };

  const markAllHadir = () => {
    setStatusMap((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((sid) => {
        updated[sid] = { ...updated[sid], status: 'Hadir' };
      });
      return updated;
    });
  };

  const handleSaveAttendance = () => {
    const records = Object.entries(statusMap).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      catatan: data.catatan,
    }));
    saveAttendanceBatch(selectedClassId, selectedDate, records);
  };

  // Stats for the active batch
  const batchStudents = enrolledStudentIds.map((sid) => students.find((s) => s.id === sid)).filter(Boolean);
  const hadirCount = Object.values(statusMap).filter((v) => v.status === 'Hadir').length;
  const izinCount = Object.values(statusMap).filter((v) => v.status === 'Izin').length;
  const sakitCount = Object.values(statusMap).filter((v) => v.status === 'Sakit').length;
  const alpaCount = Object.values(statusMap).filter((v) => v.status === 'Alpa').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarCheck size={24} color="var(--orange-500)" />
            <span>Pencatatan Kehadiran Siswa</span>
          </h1>
          <p className="page-subtitle">
            Catat dan rekapitulasi presensi harian kelas bimbingan belajar secara cepat dan akurat.
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          className="rb-btn rb-btn-orange"
          disabled={enrolledStudentIds.length === 0}
        >
          <Save size={16} />
          <span>Simpan Presensi Kelas</span>
        </button>
      </div>

      {/* Class and Date Selector Bar */}
      <div
        className="filter-bar"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div>
          <label className="form-label" style={{ marginBottom: 4 }}>
            Pilih Kelas Bimbingan:
          </label>
          <select
            className="form-select"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.namaKelas} ({c.jenjang} - {c.tipeProgram})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" style={{ marginBottom: 4 }}>
            Tanggal Pembelajaran:
          </label>
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingBottom: 2 }}>
          <button
            type="button"
            onClick={markAllHadir}
            className="rb-btn rb-btn-secondary"
            style={{ width: '100%' }}
          >
            <CheckCircle2 size={16} color="var(--emerald-600)" />
            <span>Tandai Semua Hadir</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <div style={{ padding: '14px 18px', backgroundColor: '#ffffff', borderRadius: 10, border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--slate-500)', fontWeight: 600 }}>Total Peserta</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy-900)' }}>{enrolledStudentIds.length} Siswa</div>
          </div>
          <Users size={22} color="var(--navy-700)" />
        </div>

        <div style={{ padding: '14px 18px', backgroundColor: 'var(--emerald-50)', borderRadius: 10, border: '1px solid rgba(5, 150, 105, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--emerald-600)', fontWeight: 600 }}>Hadir</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--emerald-600)' }}>{hadirCount}</div>
          </div>
          <CheckCircle2 size={22} color="var(--emerald-600)" />
        </div>

        <div style={{ padding: '14px 18px', backgroundColor: '#fffbeb', borderRadius: 10, border: '1px solid rgba(217, 119, 6, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>Izin</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#b45309' }}>{izinCount}</div>
          </div>
          <Clock size={22} color="#b45309" />
        </div>

        <div style={{ padding: '14px 18px', backgroundColor: 'var(--navy-50)', borderRadius: 10, border: '1px solid rgba(28, 66, 115, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--navy-700)', fontWeight: 600 }}>Sakit</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy-700)' }}>{sakitCount}</div>
          </div>
          <AlertCircle size={22} color="var(--navy-700)" />
        </div>

        <div style={{ padding: '14px 18px', backgroundColor: 'var(--rose-50)', borderRadius: 10, border: '1px solid rgba(225, 29, 72, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--rose-600)', fontWeight: 600 }}>Alpa</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--rose-600)' }}>{alpaCount}</div>
          </div>
          <HelpCircle size={22} color="var(--rose-600)" />
        </div>
      </div>

      {/* Attendance Form Table */}
      <div className="rb-card">
        <div className="rb-card-header">
          <div className="rb-card-title">
            <span>Daftar Siswa di {selectedClass?.namaKelas}</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--slate-500)' }}>
            Tanggal: <strong>{selectedDate}</strong>
          </span>
        </div>

        <div className="rb-card-body" style={{ padding: 0 }}>
          {enrolledStudentIds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--slate-400)' }}>
              <Users size={40} color="var(--slate-300)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--slate-600)' }}>
                Belum ada siswa terdaftar di kelas ini.
              </div>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                Silakan buka menu <strong>Manajemen Kelas</strong> dan tambahkan siswa ke dalam kelas ini terlebih dahulu.
              </div>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="rb-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Nama Siswa</th>
                    <th style={{ width: '40%', textAlign: 'center' }}>Status Kehadiran</th>
                    <th style={{ width: '30%' }}>Keterangan / Alasan</th>
                  </tr>
                </thead>
                <tbody>
                  {batchStudents.map((stu) => {
                    if (!stu) return null;
                    const curStatus = statusMap[stu.id]?.status || 'Hadir';
                    const curCatatan = statusMap[stu.id]?.catatan || '';

                    return (
                      <tr key={stu.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                            {stu.namaLengkap}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--slate-400)' }}>
                            NISN: {stu.nisn} • {stu.asalSekolah}
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((st) => {
                              const isSelected = curStatus === st;
                              let activeBg = 'var(--emerald-600)';
                              if (st === 'Izin') activeBg = 'var(--orange-500)';
                              if (st === 'Sakit') activeBg = 'var(--navy-700)';
                              if (st === 'Alpa') activeBg = 'var(--rose-600)';

                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleStatusChange(stu.id, st)}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: 'var(--radius-full)',
                                    border: isSelected ? `1.5px solid ${activeBg}` : '1.5px solid var(--slate-200)',
                                    backgroundColor: isSelected ? activeBg : '#ffffff',
                                    color: isSelected ? '#ffffff' : 'var(--slate-600)',
                                    fontWeight: isSelected ? 700 : 500,
                                    fontSize: 12.5,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: isSelected ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                                  }}
                                >
                                  {st}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        <td>
                          <input
                            type="text"
                            placeholder="Catatan (opsional)..."
                            value={curCatatan}
                            onChange={(e) => handleCatatanChange(stu.id, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '7px 12px',
                              fontSize: 12.5,
                              border: '1.5px solid var(--slate-200)',
                              borderRadius: 6,
                              outline: 'none',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'var(--orange-500)')}
                            onBlur={(e) => (e.target.style.borderColor = 'var(--slate-200)')}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {enrolledStudentIds.length > 0 && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--slate-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <button
              onClick={handleSaveAttendance}
              className="rb-btn rb-btn-orange"
            >
              <Save size={16} />
              <span>Simpan & Perbarui Presensi</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
