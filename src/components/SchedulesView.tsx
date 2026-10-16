'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Schedule, DayOfWeek } from '../types';
import {
  Clock,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  GraduationCap,
  Video,
  AlertTriangle,
  Calendar,
  X,
  Check,
  LayoutGrid,
  List,
} from 'lucide-react';

const DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const SchedulesView: React.FC = () => {
  const {
    schedules,
    classes,
    teachers,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    globalSearch,
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    classId: '',
    teacherId: '',
    hari: 'Senin' as DayOfWeek,
    jamMulai: '16:00',
    jamSelesai: '17:30',
    ruangan: 'Ruang Newton (Lt. 2)',
    linkDaring: '',
  });

  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    const q = (searchTerm || globalSearch).toLowerCase().trim();
    return schedules.filter((s) => {
      const matchSearch =
        !q ||
        (s.className && s.className.toLowerCase().includes(q)) ||
        (s.teacherName && s.teacherName.toLowerCase().includes(q)) ||
        s.ruangan.toLowerCase().includes(q);

      const matchDay = selectedDayFilter === 'Semua' || s.hari === selectedDayFilter;

      return matchSearch && matchDay;
    });
  }, [schedules, searchTerm, globalSearch, selectedDayFilter]);

  // Check schedule conflict
  const checkConflict = (day: DayOfWeek, start: string, end: string, room: string, teacherId: string, currentId?: string) => {
    const conflict = schedules.find((s) => {
      if (currentId && s.id === currentId) return false;
      if (s.hari !== day) return false;

      // Check time overlap: (StartA < EndB) and (EndA > StartB)
      const isTimeOverlap = s.jamMulai < end && s.jamSelesai > start;
      if (!isTimeOverlap) return false;

      const isRoomConflict = s.ruangan.toLowerCase().trim() === room.toLowerCase().trim();
      const isTeacherConflict = teacherId && s.teacherId === teacherId;

      return isRoomConflict || isTeacherConflict;
    });

    if (conflict) {
      if (conflict.ruangan.toLowerCase() === room.toLowerCase()) {
        return `Perhatian: Ruangan "${room}" sudah digunakan oleh kelas "${conflict.className}" pada ${day} (${conflict.jamMulai} - ${conflict.jamSelesai}).`;
      }
      return `Perhatian: Pengajar "${conflict.teacherName}" sudah memiliki jadwal kelas "${conflict.className}" pada ${day} (${conflict.jamMulai} - ${conflict.jamSelesai}).`;
    }
    return null;
  };

  const handleOpenAdd = () => {
    const initialClassId = classes[0]?.id || '';
    const initialTeacherId = classes[0]?.teacherId || teachers[0]?.id || '';
    setFormData({
      classId: initialClassId,
      teacherId: initialTeacherId,
      hari: 'Senin',
      jamMulai: '16:00',
      jamSelesai: '17:30',
      ruangan: 'Ruang Newton (Lt. 2)',
      linkDaring: '',
    });
    setConflictWarning(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sch: Schedule) => {
    setEditingSchedule(sch);
    setFormData({
      classId: sch.classId,
      teacherId: sch.teacherId || '',
      hari: sch.hari,
      jamMulai: sch.jamMulai,
      jamSelesai: sch.jamSelesai,
      ruangan: sch.ruangan,
      linkDaring: sch.linkDaring || '',
    });
    setConflictWarning(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId) return;

    const conflict = checkConflict(
      formData.hari,
      formData.jamMulai,
      formData.jamSelesai,
      formData.ruangan,
      formData.teacherId,
      editingSchedule?.id
    );

    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    if (editingSchedule) {
      updateSchedule(editingSchedule.id, formData);
      setEditingSchedule(null);
    } else {
      addSchedule(formData);
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Clock size={24} color="var(--orange-500)" />
            <span>Pengelolaan Jadwal Belajar</span>
          </h1>
          <p className="page-subtitle">
            Atur jadwal tatap muka mingguan, alokasi ruang kelas bimbingan, dan link kelas daring.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--slate-100)',
              borderRadius: 'var(--radius-sm)',
              padding: 3,
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                border: 'none',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? 'var(--navy-900)' : 'var(--slate-500)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <LayoutGrid size={14} />
              <span>Grid Mingguan</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                border: 'none',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? 'var(--navy-900)' : 'var(--slate-500)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <List size={14} />
              <span>Tabel Daftar</span>
            </button>
          </div>

          <button onClick={handleOpenAdd} className="rb-btn rb-btn-orange">
            <Plus size={16} />
            <span>Tambah Sesi Jadwal</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari berdasarkan kelas, pengajar, atau ruangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--slate-500)', fontWeight: 600 }}>Filter Hari:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '7px 12px', fontSize: 13 }}
            value={selectedDayFilter}
            onChange={(e) => setSelectedDayFilter(e.target.value)}
          >
            <option value="Semua">Semua Hari</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--slate-500)', marginLeft: 'auto' }}>
          Total <strong>{filteredSchedules.length}</strong> sesi pembelajaran
        </div>
      </div>

      {/* VIEW: Grid Mingguan (Senin - Minggu) */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {DAYS.map((day) => {
            const daySchedules = filteredSchedules.filter((s) => s.hari === day);
            if (selectedDayFilter !== 'Semua' && selectedDayFilter !== day) return null;

            return (
              <div key={day} className="rb-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: daySchedules.length > 0 ? 'var(--navy-900)' : 'var(--slate-50)',
                    color: daySchedules.length > 0 ? '#ffffff' : 'var(--slate-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{day}</div>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      backgroundColor: daySchedules.length > 0 ? 'rgba(255, 255, 255, 0.2)' : 'var(--slate-200)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {daySchedules.length} Sesi
                  </span>
                </div>

                <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {daySchedules.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--slate-400)', fontSize: 13 }}>
                      Tidak ada kelas terjadwal.
                    </div>
                  ) : (
                    daySchedules.map((sch) => (
                      <div
                        key={sch.id}
                        style={{
                          backgroundColor: 'var(--slate-50)',
                          borderRadius: 8,
                          padding: '12px 14px',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              backgroundColor: 'var(--orange-100)',
                              color: 'var(--orange-600)',
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            {sch.jamMulai} - {sch.jamSelesai} WIB
                          </span>

                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => handleOpenEdit(sch)}
                              className="rb-btn-icon rb-btn-secondary"
                              style={{ width: 26, height: 26 }}
                              title="Edit Jadwal"
                            >
                              <Edit2 size={12} color="var(--orange-500)" />
                            </button>
                            <button
                              onClick={() => setDeletingSchedule(sch)}
                              className="rb-btn-icon rb-btn-danger"
                              style={{ width: 26, height: 26 }}
                              title="Hapus Jadwal"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--navy-900)' }}>
                          {sch.className}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--slate-600)' }}>
                          <GraduationCap size={13} color="var(--indigo-600)" />
                          <span>{sch.teacherName}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--slate-500)' }}>
                          <MapPin size={13} />
                          <span>{sch.ruangan}</span>
                        </div>

                        {sch.linkDaring && (
                          <div style={{ marginTop: 2 }}>
                            <a
                              href={sch.linkDaring}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: 11.5,
                                color: '#2563eb',
                                textDecoration: 'none',
                                fontWeight: 600,
                              }}
                            >
                              <Video size={13} />
                              <span>Link Daring (Google Meet)</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: Tabel Daftar */}
      {viewMode === 'table' && (
        <div className="table-container">
          <table className="rb-table">
            <thead>
              <tr>
                <th>Hari & Jam</th>
                <th>Kelas</th>
                <th>Tentor / Pengajar</th>
                <th>Ruangan</th>
                <th>Daring</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-400)' }}>
                    Tidak ada jadwal yang cocok.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((sch) => (
                  <tr key={sch.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                        {sch.hari}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--orange-600)', fontWeight: 600 }}>
                        {sch.jamMulai} - {sch.jamSelesai}
                      </div>
                    </td>

                    <td style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                      {sch.className}
                    </td>

                    <td>{sch.teacherName}</td>

                    <td>{sch.ruangan}</td>

                    <td>
                      {sch.linkDaring ? (
                        <a
                          href={sch.linkDaring}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#2563eb',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          <Video size={13} />
                          <span>Meet</span>
                        </a>
                      ) : (
                        <span style={{ color: 'var(--slate-400)', fontSize: 12 }}>Tatap Muka</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button
                          onClick={() => handleOpenEdit(sch)}
                          className="rb-btn-icon rb-btn-secondary"
                          style={{ width: 30, height: 30 }}
                          title="Edit Jadwal"
                        >
                          <Edit2 size={13} color="var(--orange-500)" />
                        </button>
                        <button
                          onClick={() => setDeletingSchedule(sch)}
                          className="rb-btn-icon rb-btn-danger"
                          style={{ width: 30, height: 30 }}
                          title="Hapus Jadwal"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Tambah / Edit Jadwal */}
      {(isAddModalOpen || editingSchedule) && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">
                {editingSchedule ? 'Edit Sesi Jadwal' : 'Tambah Sesi Jadwal Baru'}
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSchedule(null);
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {conflictWarning && (
                  <div
                    style={{
                      backgroundColor: 'var(--rose-100)',
                      border: '1px solid rgba(225, 29, 72, 0.4)',
                      borderRadius: 8,
                      padding: '12px 14px',
                      color: 'var(--rose-600)',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>{conflictWarning}</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Pilih Kelas *</label>
                  <select
                    className="form-select"
                    required
                    value={formData.classId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const cls = classes.find((c) => c.id === cid);
                      setFormData({
                        ...formData,
                        classId: cid,
                        teacherId: cls?.teacherId || formData.teacherId,
                        ruangan: cls?.ruangan || formData.ruangan,
                      });
                    }}
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.namaKelas} ({c.jenjang})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tentor / Guru Pengajar</label>
                  <select
                    className="form-select"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  >
                    <option value="">Pilih Pengajar</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.namaLengkap}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Hari</label>
                    <select
                      className="form-select"
                      value={formData.hari}
                      onChange={(e) => setFormData({ ...formData, hari: e.target.value as DayOfWeek })}
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jam Mulai</label>
                    <input
                      type="time"
                      className="form-input"
                      required
                      value={formData.jamMulai}
                      onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jam Selesai</label>
                    <input
                      type="time"
                      className="form-input"
                      required
                      value={formData.jamSelesai}
                      onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ruangan Belajar *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.ruangan}
                    onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                    placeholder="Contoh: Ruang Galileo (Lt. 1)"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link Kelas Daring (Opsional)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.linkDaring}
                    onChange={(e) => setFormData({ ...formData, linkDaring: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingSchedule(null);
                  }}
                  className="rb-btn rb-btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="rb-btn rb-btn-orange">
                  <Check size={16} />
                  <span>{editingSchedule ? 'Simpan Perubahan' : 'Jadwalkan Sesi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Jadwal */}
      {deletingSchedule && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: 'var(--rose-600)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} />
                <span>Hapus Sesi Jadwal</span>
              </div>
              <button
                onClick={() => setDeletingSchedule(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: 14, color: 'var(--slate-700)', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus jadwal <strong>{deletingSchedule.className}</strong> pada hari {deletingSchedule.hari} ({deletingSchedule.jamMulai} - {deletingSchedule.jamSelesai})?
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeletingSchedule(null)}
                className="rb-btn rb-btn-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSchedule(deletingSchedule.id);
                  setDeletingSchedule(null);
                }}
                className="rb-btn rb-btn-danger"
              >
                <Trash2 size={15} />
                <span>Hapus Sesi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
