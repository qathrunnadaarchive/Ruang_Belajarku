'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Student, Jenjang, StudentStatus } from '../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Phone,
  MessageCircle,
  Download,
  School,
  Calendar,
  X,
  Check,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

export const StudentsView: React.FC = () => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    classes,
    attendances,
    payments,
    globalSearch,
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenjang, setSelectedJenjang] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    nisn: '',
    namaLengkap: '',
    jenisKelamin: 'L',
    jenjang: 'SMA',
    asalSekolah: '',
    noWaSiswa: '',
    namaOrtu: '',
    noWaOrtu: '',
    alamat: '',
    tanggalDaftar: new Date().toISOString().split('T')[0],
    status: 'Aktif',
    catatan: '',
  });

  // Filter logic
  const filteredStudents = useMemo(() => {
    const q = (searchTerm || globalSearch).toLowerCase().trim();
    return students.filter((s) => {
      const matchSearch =
        !q ||
        s.namaLengkap.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q) ||
        s.asalSekolah.toLowerCase().includes(q) ||
        s.noWaSiswa.includes(q) ||
        s.namaOrtu.toLowerCase().includes(q);

      const matchJenjang =
        selectedJenjang === 'Semua' || s.jenjang === selectedJenjang;
      const matchStatus =
        selectedStatus === 'Semua' || s.status === selectedStatus;

      return matchSearch && matchJenjang && matchStatus;
    });
  }, [students, searchTerm, globalSearch, selectedJenjang, selectedStatus]);

  // Open add modal
  const handleOpenAdd = () => {
    const randomNisn = '00' + Math.floor(10000000 + Math.random() * 90000000);
    setFormData({
      nisn: randomNisn,
      namaLengkap: '',
      jenisKelamin: 'L',
      jenjang: 'SMA',
      asalSekolah: '',
      noWaSiswa: '',
      namaOrtu: '',
      noWaOrtu: '',
      alamat: '',
      tanggalDaftar: new Date().toISOString().split('T')[0],
      status: 'Aktif',
      catatan: '',
    });
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setFormData({
      nisn: stu.nisn,
      namaLengkap: stu.namaLengkap,
      jenisKelamin: stu.jenisKelamin,
      jenjang: stu.jenjang,
      asalSekolah: stu.asalSekolah,
      noWaSiswa: stu.noWaSiswa,
      namaOrtu: stu.namaOrtu,
      noWaOrtu: stu.noWaOrtu,
      alamat: stu.alamat,
      tanggalDaftar: stu.tanggalDaftar,
      status: stu.status,
      catatan: stu.catatan || '',
    });
  };

  // Submit Add or Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.nisn) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
      setEditingStudent(null);
    } else {
      addStudent(formData);
      setIsAddModalOpen(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'NISN',
      'Nama Lengkap',
      'Gender',
      'Jenjang',
      'Asal Sekolah',
      'WA Siswa',
      'Nama Ortu',
      'WA Ortu',
      'Status',
      'Tanggal Daftar',
    ];
    const rows = filteredStudents.map((s) => [
      `"${s.nisn}"`,
      `"${s.namaLengkap}"`,
      `"${s.jenisKelamin}"`,
      `"${s.jenjang}"`,
      `"${s.asalSekolah}"`,
      `"${s.noWaSiswa}"`,
      `"${s.namaOrtu}"`,
      `"${s.noWaOrtu}"`,
      `"${s.status}"`,
      `"${s.tanggalDaftar}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `siswa_ruang_belajarku_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={24} color="var(--orange-500)" />
            <span>Manajemen Data Siswa</span>
          </h1>
          <p className="page-subtitle">
            Kelola pendaftaran siswa, detail profil akademik, dan riwayat presensi bimbingan belajar.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleExportCSV}
            className="rb-btn rb-btn-secondary"
            title="Download CSV"
          >
            <Download size={16} />
            <span>Ekspor CSV</span>
          </button>
          <button onClick={handleOpenAdd} className="rb-btn rb-btn-orange">
            <Plus size={16} />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NISN, sekolah, atau no WA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Jenjang Filter */}
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

        {/* Status Filter */}
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
            <option value="Lulus">Lulus</option>
          </select>
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--slate-500)', marginLeft: 'auto' }}>
          Menampilkan <strong>{filteredStudents.length}</strong> dari {students.length} siswa
        </div>
      </div>

      {/* Student Data Table */}
      <div className="table-container">
        <table className="rb-table">
          <thead>
            <tr>
              <th>Siswa</th>
              <th>Jenjang</th>
              <th>Asal Sekolah</th>
              <th>WhatsApp Siswa</th>
              <th>Orang Tua / Wali</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--slate-400)' }}>
                  <Users size={36} color="var(--slate-300)" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <div>Tidak ada siswa yang sesuai dengan filter pencarian.</div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((stu) => {
                const waClean = stu.noWaSiswa.replace(/[^0-9]/g, '');
                const waFormatted = waClean.startsWith('0') ? '62' + waClean.substring(1) : waClean;

                return (
                  <tr key={stu.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            backgroundColor:
                              stu.jenisKelamin === 'P' ? '#fdf2f8' : '#eff6ff',
                            color: stu.jenisKelamin === 'P' ? '#db2777' : '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                            border:
                              stu.jenisKelamin === 'P'
                                ? '1.5px solid #fbcfe8'
                                : '1.5px solid #bfdbfe',
                          }}
                        >
                          {stu.namaLengkap.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                            {stu.namaLengkap}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--slate-400)' }}>
                            NISN: {stu.nisn} ({stu.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'})
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="rb-badge badge-jenjang">{stu.jenjang}</span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                        <School size={14} color="var(--slate-400)" />
                        <span>{stu.asalSekolah || '-'}</span>
                      </div>
                    </td>

                    <td>
                      <a
                        href={`https://wa.me/${waFormatted}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#059669',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: 12.5,
                          backgroundColor: '#ecfdf5',
                          padding: '3px 8px',
                          borderRadius: 6,
                        }}
                        title="Chat WhatsApp"
                      >
                        <MessageCircle size={13} />
                        <span>{stu.noWaSiswa}</span>
                      </a>
                    </td>

                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-800)' }}>
                        {stu.namaOrtu}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--slate-400)' }}>
                        WA: {stu.noWaOrtu}
                      </div>
                    </td>

                    <td>
                      <span className={`rb-badge badge-${stu.status.toLowerCase()}`}>
                        {stu.status}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button
                          onClick={() => setViewingStudent(stu)}
                          className="rb-btn-icon rb-btn-secondary"
                          style={{ width: 32, height: 32 }}
                          title="Lihat Detail Profil Siswa"
                        >
                          <Eye size={15} color="var(--navy-700)" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(stu)}
                          className="rb-btn-icon rb-btn-secondary"
                          style={{ width: 32, height: 32 }}
                          title="Edit Siswa"
                        >
                          <Edit2 size={15} color="var(--orange-500)" />
                        </button>
                        <button
                          onClick={() => setDeletingStudent(stu)}
                          className="rb-btn-icon rb-btn-danger"
                          style={{ width: 32, height: 32 }}
                          title="Hapus Siswa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Tambah / Edit Siswa */}
      {(isAddModalOpen || editingStudent) && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <div className="modal-title">
                {editingStudent ? 'Edit Data Siswa' : 'Pendaftaran Siswa Baru'}
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">NISN Siswa *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      placeholder="Contoh: 0061234567"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Siswa *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.namaLengkap}
                      onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                      placeholder="Nama lengkap sesuai ijazah"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Jenis Kelamin</label>
                    <select
                      className="form-select"
                      value={formData.jenisKelamin}
                      onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as any })}
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jenjang Bimbingan</label>
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
                    <label className="form-label">Status Siswa</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Cuti">Cuti</option>
                      <option value="Lulus">Lulus</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Asal Sekolah</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.asalSekolah}
                      onChange={(e) => setFormData({ ...formData, asalSekolah: e.target.value })}
                      placeholder="Contoh: SMAN 1 Kota"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">No. WhatsApp Siswa</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.noWaSiswa}
                      onChange={(e) => setFormData({ ...formData, noWaSiswa: e.target.value })}
                      placeholder="0812xxxxxxxx"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Nama Orang Tua / Wali *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.namaOrtu}
                      onChange={(e) => setFormData({ ...formData, namaOrtu: e.target.value })}
                      placeholder="Nama ayah / ibu / wali"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">No. WhatsApp Orang Tua *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.noWaOrtu}
                      onChange={(e) => setFormData({ ...formData, noWaOrtu: e.target.value })}
                      placeholder="0812xxxxxxxx"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Tempat Tinggal</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Alamat domisili siswa"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Tambahan / Target Belajar</label>
                  <textarea
                    className="form-textarea"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    placeholder="Contoh: Target lolos SNBT Kedokteran, butuh les tambahan Fisika..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="rb-btn rb-btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="rb-btn rb-btn-orange">
                  <Check size={16} />
                  <span>{editingStudent ? 'Simpan Perubahan' : 'Daftarkan Siswa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Detail Siswa Profile */}
      {viewingStudent && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={20} color="var(--orange-500)" />
                <span>Detail Siswa: {viewingStudent.namaLengkap}</span>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Header profile info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px',
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 12,
                  marginBottom: 20,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0c233f 0%, #153866 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 800,
                  }}
                >
                  {viewingStudent.namaLengkap.charAt(0)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy-900)' }}>
                      {viewingStudent.namaLengkap}
                    </h3>
                    <span className="rb-badge badge-jenjang">{viewingStudent.jenjang}</span>
                    <span className={`rb-badge badge-${viewingStudent.status.toLowerCase()}`}>
                      {viewingStudent.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--slate-500)', marginTop: 4 }}>
                    NISN: {viewingStudent.nisn} • Sekolah: {viewingStudent.asalSekolah}
                  </div>
                </div>
              </div>

              {/* Data fields */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 16,
                  marginBottom: 20,
                  fontSize: 13,
                }}
              >
                <div style={{ padding: '12px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
                  <div style={{ color: 'var(--slate-500)', fontSize: 11.5, fontWeight: 600 }}>NO. WHATSAPP SISWA</div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-900)', marginTop: 4 }}>
                    {viewingStudent.noWaSiswa || '-'}
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
                  <div style={{ color: 'var(--slate-500)', fontSize: 11.5, fontWeight: 600 }}>ORANG TUA / WALI</div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-900)', marginTop: 4 }}>
                    {viewingStudent.namaOrtu} ({viewingStudent.noWaOrtu})
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
                  <div style={{ color: 'var(--slate-500)', fontSize: 11.5, fontWeight: 600 }}>ALAMAT DOMISILI</div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-900)', marginTop: 4 }}>
                    {viewingStudent.alamat || '-'}
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
                  <div style={{ color: 'var(--slate-500)', fontSize: 11.5, fontWeight: 600 }}>TANGGAL PENDAFTARAN</div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-900)', marginTop: 4 }}>
                    {viewingStudent.tanggalDaftar}
                  </div>
                </div>
              </div>

              {viewingStudent.catatan && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    marginBottom: 20,
                    fontSize: 13,
                    color: '#92400e',
                  }}
                >
                  <strong>Catatan Khusus:</strong> {viewingStudent.catatan}
                </div>
              )}

              {/* Riwayat Kehadiran Siswa */}
              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 10 }}>
                  Riwayat Presensi Siswa
                </h4>
                <div className="table-container" style={{ border: '1px solid var(--border-subtle)' }}>
                  <table className="rb-table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Kelas</th>
                        <th>Status</th>
                        <th>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendances
                        .filter((a) => a.studentId === viewingStudent.id)
                        .map((att) => (
                          <tr key={att.id}>
                            <td>{att.tanggal}</td>
                            <td>{att.className}</td>
                            <td>
                              <span className={`rb-badge badge-${att.status.toLowerCase()}`}>
                                {att.status}
                              </span>
                            </td>
                            <td>{att.catatan || '-'}</td>
                          </tr>
                        ))}
                      {attendances.filter((a) => a.studentId === viewingStudent.id).length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', color: 'var(--slate-400)', padding: 16 }}>
                            Belum ada riwayat presensi kehadiran tercatat.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  const s = viewingStudent;
                  setViewingStudent(null);
                  handleOpenEdit(s);
                }}
                className="rb-btn rb-btn-secondary"
              >
                <Edit2 size={15} />
                <span>Edit Siswa Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="rb-btn rb-btn-primary"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Siswa */}
      {deletingStudent && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: 'var(--rose-600)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} />
                <span>Konfirmasi Hapus Siswa</span>
              </div>
              <button
                onClick={() => setDeletingStudent(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: 14, color: 'var(--slate-700)', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus data siswa <strong>{deletingStudent.namaLengkap}</strong> (NISN: {deletingStudent.nisn})?
              <p style={{ marginTop: 8, fontSize: 12.5, color: 'var(--slate-500)' }}>
                Tindakan ini juga akan mengeluarkan siswa dari kelas yang sedang diikutinya.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="rb-btn rb-btn-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStudent(deletingStudent.id);
                  setDeletingStudent(null);
                }}
                className="rb-btn rb-btn-danger"
              >
                <Trash2 size={15} />
                <span>Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
