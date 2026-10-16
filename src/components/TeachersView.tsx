'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Teacher } from '../types';
import {
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  BookOpen,
  MessageCircle,
  X,
  Check,
  AlertTriangle,
  Award,
} from 'lucide-react';

export const TeachersView: React.FC = () => {
  const {
    teachers,
    classes,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    globalSearch,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nip: '',
    namaLengkap: '',
    mataPelajaran: ['Matematika'],
    spesialisasi: '',
    noWa: '',
    email: '',
    pendidikanTerakhir: '',
    status: 'Aktif' as 'Aktif' | 'Cuti' | 'Nonaktif',
  });

  const [subjectInput, setSubjectInput] = useState('');

  // Filter logic
  const filteredTeachers = useMemo(() => {
    const q = (searchTerm || globalSearch).toLowerCase().trim();
    return teachers.filter((t) => {
      const matchSearch =
        !q ||
        t.namaLengkap.toLowerCase().includes(q) ||
        t.nip.toLowerCase().includes(q) ||
        t.spesialisasi.toLowerCase().includes(q) ||
        t.mataPelajaran.some((m) => m.toLowerCase().includes(q));

      const matchStatus =
        selectedStatus === 'Semua' || t.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [teachers, searchTerm, globalSearch, selectedStatus]);

  const handleOpenAdd = () => {
    const randomNip = 'TCH-2026-' + String(teachers.length + 1).padStart(3, '0');
    setFormData({
      nip: randomNip,
      namaLengkap: '',
      mataPelajaran: ['Matematika'],
      spesialisasi: '',
      noWa: '',
      email: '',
      pendidikanTerakhir: 'S1 Pendidikan',
      status: 'Aktif',
    });
    setSubjectInput('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      nip: t.nip,
      namaLengkap: t.namaLengkap,
      mataPelajaran: [...t.mataPelajaran],
      spesialisasi: t.spesialisasi,
      noWa: t.noWa,
      email: t.email,
      pendidikanTerakhir: t.pendidikanTerakhir,
      status: t.status,
    });
    setSubjectInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.nip) return;

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, formData);
      setEditingTeacher(null);
    } else {
      addTeacher(formData);
      setIsAddModalOpen(false);
    }
  };

  const addSubjectTag = () => {
    if (subjectInput.trim() && !formData.mataPelajaran.includes(subjectInput.trim())) {
      setFormData({
        ...formData,
        mataPelajaran: [...formData.mataPelajaran, subjectInput.trim()],
      });
      setSubjectInput('');
    }
  };

  const removeSubjectTag = (subject: string) => {
    setFormData({
      ...formData,
      mataPelajaran: formData.mataPelajaran.filter((s) => s !== subject),
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <GraduationCap size={24} color="var(--orange-500)" />
            <span>Data Tentor & Pengajar</span>
          </h1>
          <p className="page-subtitle">
            Kelola profil instruktur, bidang studi pengajaran, kontak WhatsApp, dan kelas binaan bimbingan belajar.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="rb-btn rb-btn-orange">
          <Plus size={16} />
          <span>Tambah Pengajar Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari nama pengajar, NIP, atau mata pelajaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--slate-500)', fontWeight: 600 }}>Status:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '7px 12px', fontSize: 13 }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Cuti">Cuti</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--slate-500)', marginLeft: 'auto' }}>
          Total <strong>{filteredTeachers.length}</strong> pengajar aktif
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
        {filteredTeachers.map((t) => {
          const taughtClasses = classes.filter((c) => c.teacherId === t.id);
          const waClean = t.noWa.replace(/[^0-9]/g, '');
          const waFormatted = waClean.startsWith('0') ? '62' + waClean.substring(1) : waClean;

          return (
            <div key={t.id} className="rb-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1e4273 0%, #0f243e 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 18,
                    }}
                  >
                    {t.namaLengkap.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--navy-900)' }}>
                      {t.namaLengkap}
                    </h3>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>
                      NIP: {t.nip}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="rb-btn-icon rb-btn-secondary"
                    style={{ width: 30, height: 30 }}
                    title="Edit Pengajar"
                  >
                    <Edit2 size={14} color="var(--orange-500)" />
                  </button>
                  <button
                    onClick={() => setDeletingTeacher(t)}
                    className="rb-btn-icon rb-btn-danger"
                    style={{ width: 30, height: 30 }}
                    title="Hapus Pengajar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Subject tags */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Mata Pelajaran:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {t.mataPelajaran.map((subj, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: 'var(--navy-50)',
                          color: 'var(--navy-800)',
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: 6,
                          border: '1px solid var(--navy-100)',
                        }}
                      >
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>

                {t.spesialisasi && (
                  <div style={{ fontSize: 12.5, color: 'var(--slate-600)' }}>
                    <strong>Spesialisasi:</strong> {t.spesialisasi}
                  </div>
                )}

                <div style={{ fontSize: 12.5, color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Award size={14} color="var(--orange-500)" />
                  <span>{t.pendidikanTerakhir}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
                  <a
                    href={`https://wa.me/${waFormatted}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      color: '#059669',
                      fontSize: 12.5,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp: {t.noWa}</span>
                  </a>

                  {t.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--slate-500)' }}>
                      <Mail size={13} />
                      <span>{t.email}</span>
                    </div>
                  )}
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
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--navy-900)', fontWeight: 600 }}>
                  <BookOpen size={14} color="var(--orange-500)" />
                  <span>Mengampu {taughtClasses.length} Kelas</span>
                </div>

                <span className={`rb-badge badge-${t.status.toLowerCase()}`}>
                  {t.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Tambah / Edit Pengajar */}
      {(isAddModalOpen || editingTeacher) && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">
                {editingTeacher ? 'Edit Data Pengajar' : 'Pendaftaran Pengajar Baru'}
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTeacher(null);
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">NIP Pengajar *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      placeholder="Contoh: TCH-2026-006"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nama Lengkap & Gelar *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.namaLengkap}
                      onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                      placeholder="Dr. ..., M.Pd. / S.Si."
                    />
                  </div>
                </div>

                {/* Subject Tags Input */}
                <div className="form-group">
                  <label className="form-label">Mata Pelajaran yang Diampu *</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ketik mata pelajaran lalu tekan Tambah"
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSubjectTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addSubjectTag}
                      className="rb-btn rb-btn-secondary"
                    >
                      Tambah
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {formData.mataPelajaran.map((subj) => (
                      <span
                        key={subj}
                        style={{
                          backgroundColor: 'var(--orange-50)',
                          color: 'var(--orange-600)',
                          border: '1px solid var(--orange-100)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 12,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>{subj}</span>
                        <X
                          size={12}
                          style={{ cursor: 'pointer' }}
                          onClick={() => removeSubjectTag(subj)}
                        />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Keahlian / Spesialisasi Materi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.spesialisasi}
                    onChange={(e) => setFormData({ ...formData, spesialisasi: e.target.value })}
                    placeholder="Contoh: Aljabar, Mekanika, Penalaran Kuantitatif SNBT"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.noWa}
                      onChange={(e) => setFormData({ ...formData, noWa: e.target.value })}
                      placeholder="0812xxxxxxxx"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Alamat Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@ruangbelajarku.com"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Pendidikan Terakhir & Kampus</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.pendidikanTerakhir}
                      onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                      placeholder="Contoh: S1 Fisika ITB"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status Keaktifan</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Cuti">Cuti</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTeacher(null);
                  }}
                  className="rb-btn rb-btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="rb-btn rb-btn-orange">
                  <Check size={16} />
                  <span>{editingTeacher ? 'Simpan Perubahan' : 'Daftarkan Pengajar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Pengajar */}
      {deletingTeacher && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: 'var(--rose-600)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} />
                <span>Hapus Pengajar</span>
              </div>
              <button
                onClick={() => setDeletingTeacher(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: 14, color: 'var(--slate-700)', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus data pengajar <strong>{deletingTeacher.namaLengkap}</strong>?
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeletingTeacher(null)}
                className="rb-btn rb-btn-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTeacher(deletingTeacher.id);
                  setDeletingTeacher(null);
                }}
                className="rb-btn rb-btn-danger"
              >
                <Trash2 size={15} />
                <span>Hapus Pengajar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
