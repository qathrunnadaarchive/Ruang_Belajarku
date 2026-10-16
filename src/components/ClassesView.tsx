'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ClassItem, Jenjang, ProgramType } from '../types';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin,
  GraduationCap,
  CreditCard,
  UserPlus,
  UserMinus,
  X,
  Check,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const ClassesView: React.FC = () => {
  const {
    classes,
    teachers,
    students,
    addClass,
    updateClass,
    deleteClass,
    enrollStudentInClass,
    removeStudentFromClass,
    globalSearch,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenjang, setSelectedJenjang] = useState<string>('Semua');
  const [selectedProgram, setSelectedProgram] = useState<string>('Semua');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [managingClass, setManagingClass] = useState<ClassItem | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    namaKelas: '',
    jenjang: 'SMA' as Jenjang,
    tipeProgram: 'Reguler' as ProgramType,
    teacherId: '',
    ruangan: '',
    kapasitasMaksimal: 15,
    biayaBulanan: 450000,
    status: 'Aktif' as 'Aktif' | 'Selesai',
  });

  // Filtered classes
  const filteredClasses = useMemo(() => {
    const q = (searchTerm || globalSearch).toLowerCase().trim();
    return classes.filter((c) => {
      const matchSearch =
        !q ||
        c.namaKelas.toLowerCase().includes(q) ||
        c.ruangan.toLowerCase().includes(q) ||
        (c.teacherName && c.teacherName.toLowerCase().includes(q));

      const matchJenjang =
        selectedJenjang === 'Semua' || c.jenjang === selectedJenjang;
      const matchProgram =
        selectedProgram === 'Semua' || c.tipeProgram === selectedProgram;

      return matchSearch && matchJenjang && matchProgram;
    });
  }, [classes, searchTerm, globalSearch, selectedJenjang, selectedProgram]);

  const handleOpenAdd = () => {
    setFormData({
      namaKelas: '',
      jenjang: 'SMA',
      tipeProgram: 'Reguler',
      teacherId: teachers[0]?.id || '',
      ruangan: 'Ruang Galileo (Lt. 1)',
      kapasitasMaksimal: 15,
      biayaBulanan: 450000,
      status: 'Aktif',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: ClassItem) => {
    setEditingClass(c);
    setFormData({
      namaKelas: c.namaKelas,
      jenjang: c.jenjang,
      tipeProgram: c.tipeProgram,
      teacherId: c.teacherId || '',
      ruangan: c.ruangan,
      kapasitasMaksimal: c.kapasitasMaksimal,
      biayaBulanan: c.biayaBulanan,
      status: c.status,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKelas) return;

    if (editingClass) {
      updateClass(editingClass.id, formData);
      setEditingClass(null);
    } else {
      addClass(formData);
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BookOpen size={24} color="var(--orange-500)" />
            <span>Manajemen Kelas & Program Bimbingan</span>
          </h1>
          <p className="page-subtitle">
            Atur kapasitas kelompok belajar, alokasi ruangan, pengajar penanggung jawab, dan data siswa per kelas.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="rb-btn rb-btn-orange">
          <Plus size={16} />
          <span>Buka Kelas Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari nama kelas, pengajar, atau ruangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--slate-500)', fontWeight: 600 }}>Jenjang:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '7px 12px', fontSize: 13 }}
            value={selectedJenjang}
            onChange={(e) => setSelectedJenjang(e.target.value)}
          >
            <option value="Semua">Semua Jenjang</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
            <option value="UTBK/SNBT">UTBK/SNBT</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--slate-500)', fontWeight: 600 }}>Program:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '7px 12px', fontSize: 13 }}
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="Semua">Semua Program</option>
            <option value="Reguler">Reguler</option>
            <option value="Intensif">Intensif</option>
            <option value="Privat">Privat</option>
          </select>
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--slate-500)', marginLeft: 'auto' }}>
          Total <strong>{filteredClasses.length}</strong> kelas ditemukan
        </div>
      </div>

      {/* Classes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
        {filteredClasses.map((cls) => {
          const enrolledCount = cls.enrolledStudentIds?.length || 0;
          const capacityPercent = Math.min(
            100,
            Math.round((enrolledCount / cls.kapasitasMaksimal) * 100)
          );

          return (
            <div key={cls.id} className="rb-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '18px 20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <span className="rb-badge badge-jenjang">{cls.jenjang}</span>
                    <span className="rb-badge badge-program">{cls.tipeProgram}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)' }}>
                    {cls.namaKelas}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => handleOpenEdit(cls)}
                    className="rb-btn-icon rb-btn-secondary"
                    style={{ width: 30, height: 30 }}
                    title="Edit Kelas"
                  >
                    <Edit2 size={14} color="var(--orange-500)" />
                  </button>
                  <button
                    onClick={() => setDeletingClass(cls)}
                    className="rb-btn-icon rb-btn-danger"
                    style={{ width: 30, height: 30 }}
                    title="Hapus Kelas"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--slate-700)' }}>
                  <GraduationCap size={16} color="var(--indigo-600)" />
                  <span>
                    Tentor: <strong>{cls.teacherName || 'Belum ditentukan'}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--slate-700)' }}>
                  <MapPin size={16} color="var(--slate-400)" />
                  <span>Ruangan: {cls.ruangan}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--slate-700)' }}>
                  <CreditCard size={16} color="var(--emerald-600)" />
                  <span>
                    Biaya SPP: <strong>Rp {cls.biayaBulanan.toLocaleString('id-ID')} / bulan</strong>
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                    <span style={{ color: 'var(--slate-500)', fontWeight: 600 }}>Kapasitas Kelas</span>
                    <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                      {enrolledCount} / {cls.kapasitasMaksimal} Siswa ({capacityPercent}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      backgroundColor: 'var(--slate-100)',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${capacityPercent}%`,
                        backgroundColor:
                          capacityPercent >= 90
                            ? 'var(--rose-600)'
                            : capacityPercent >= 70
                            ? 'var(--orange-500)'
                            : 'var(--emerald-600)',
                        borderRadius: 10,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--slate-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--slate-500)' }}>
                  Status: <strong style={{ color: 'var(--emerald-600)' }}>{cls.status}</strong>
                </span>

                <button
                  onClick={() => setManagingClass(cls)}
                  className="rb-btn rb-btn-sm rb-btn-primary"
                >
                  <Users size={14} />
                  <span>Kelola Siswa ({enrolledCount})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Tambah / Edit Kelas */}
      {(isAddModalOpen || editingClass) && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">
                {editingClass ? 'Edit Informasi Kelas' : 'Buka Kelas Bimbingan Baru'}
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingClass(null);
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Kelas Bimbingan *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.namaKelas}
                    onChange={(e) => setFormData({ ...formData, namaKelas: e.target.value })}
                    placeholder="Contoh: Intensif SNBT UTBK 2026 - Saintek C"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Jenjang Pendidikan</label>
                    <select
                      className="form-select"
                      value={formData.jenjang}
                      onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as Jenjang })}
                    >
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="UTBK/SNBT">UTBK/SNBT</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipe Program</label>
                    <select
                      className="form-select"
                      value={formData.tipeProgram}
                      onChange={(e) => setFormData({ ...formData, tipeProgram: e.target.value as ProgramType })}
                    >
                      <option value="Reguler">Reguler</option>
                      <option value="Intensif">Intensif</option>
                      <option value="Privat">Privat</option>
                      <option value="Kedinasan">Kedinasan</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tentor / Guru Pengajar Utama</label>
                  <select
                    className="form-select"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  >
                    <option value="">Pilih Pengajar</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.namaLengkap} ({t.mataPelajaran.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Ruangan Belajar</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.ruangan}
                      onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                      placeholder="Contoh: Ruang Einstein (Lt. 2)"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kapasitas Maksimal (Siswa)</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className="form-input"
                      value={formData.kapasitasMaksimal}
                      onChange={(e) => setFormData({ ...formData, kapasitasMaksimal: parseInt(e.target.value) || 15 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Biaya SPP Bulanan (Rp)</label>
                  <input
                    type="number"
                    step={10000}
                    className="form-input"
                    value={formData.biayaBulanan}
                    onChange={(e) => setFormData({ ...formData, biayaBulanan: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingClass(null);
                  }}
                  className="rb-btn rb-btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="rb-btn rb-btn-orange">
                  <Check size={16} />
                  <span>{editingClass ? 'Simpan Perubahan' : 'Buka Kelas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Kelola Siswa Terdaftar dalam Kelas */}
      {managingClass && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Daftar Siswa di {managingClass.namaKelas}</div>
                <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 2 }}>
                  Kapasitas: {managingClass.enrolledStudentIds.length} / {managingClass.kapasitasMaksimal} Siswa
                </div>
              </div>
              <button
                onClick={() => setManagingClass(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {/* Tambah siswa ke kelas */}
              <div
                style={{
                  padding: 14,
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 8 }}>
                  Tambahkan Siswa ke Kelas Ini:
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <select
                    id="select-add-student"
                    className="form-select"
                    style={{ fontSize: 13 }}
                  >
                    <option value="">Pilih siswa yang belum terdaftar...</option>
                    {students
                      .filter((s) => !managingClass.enrolledStudentIds.includes(s.id))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.namaLengkap} ({s.jenjang} - {s.asalSekolah})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const sel = document.getElementById('select-add-student') as HTMLSelectElement;
                      if (sel && sel.value) {
                        enrollStudentInClass(managingClass.id, sel.value);
                        setManagingClass({
                          ...managingClass,
                          enrolledStudentIds: [...managingClass.enrolledStudentIds, sel.value],
                        });
                        sel.value = '';
                      }
                    }}
                    className="rb-btn rb-btn-orange rb-btn-sm"
                  >
                    <UserPlus size={15} />
                    <span>Daftarkan</span>
                  </button>
                </div>
              </div>

              {/* List of enrolled students */}
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 8 }}>
                Siswa yang Mengikuti Kelas:
              </div>

              {managingClass.enrolledStudentIds.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--slate-400)' }}>
                  Belum ada siswa terdaftar di kelas ini.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {managingClass.enrolledStudentIds.map((sid) => {
                    const stu = students.find((s) => s.id === sid);
                    if (!stu) return null;

                    return (
                      <div
                        key={sid}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: 8,
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--navy-900)' }}>
                            {stu.namaLengkap}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--slate-400)' }}>
                            NISN: {stu.nisn} • {stu.asalSekolah} • WA: {stu.noWaSiswa}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            removeStudentFromClass(managingClass.id, sid);
                            setManagingClass({
                              ...managingClass,
                              enrolledStudentIds: managingClass.enrolledStudentIds.filter((id) => id !== sid),
                            });
                          }}
                          className="rb-btn rb-btn-sm rb-btn-danger"
                          title="Keluarkan dari kelas"
                        >
                          <UserMinus size={13} />
                          <span>Keluarkan</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setManagingClass(null)}
                className="rb-btn rb-btn-primary"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Kelas */}
      {deletingClass && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: 'var(--rose-600)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} />
                <span>Hapus Kelas Bimbingan</span>
              </div>
              <button
                onClick={() => setDeletingClass(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: 14, color: 'var(--slate-700)', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus kelas <strong>{deletingClass.namaKelas}</strong>?
              <p style={{ marginTop: 8, fontSize: 12.5, color: 'var(--slate-500)' }}>
                Jadwal sesi belajar terkait kelas ini juga akan dihapus.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeletingClass(null)}
                className="rb-btn rb-btn-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteClass(deletingClass.id);
                  setDeletingClass(null);
                }}
                className="rb-btn rb-btn-danger"
              >
                <Trash2 size={15} />
                <span>Hapus Kelas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
