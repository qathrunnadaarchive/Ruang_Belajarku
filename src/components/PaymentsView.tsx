'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentRecord, PaymentStatus, PaymentType, PaymentMethod } from '../types';
import {
  CreditCard,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  FileText,
  Edit2,
  Trash2,
  Download,
  Calendar,
  DollarSign,
  X,
  Check,
  AlertTriangle,
  Receipt,
  Sparkles,
} from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const {
    payments,
    students,
    classes,
    addPayment,
    updatePayment,
    deletePayment,
    globalSearch,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [selectedType, setSelectedType] = useState<string>('Semua');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<PaymentRecord | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<PaymentRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    jenisPembayaran: 'SPP Bulanan' as PaymentType,
    bulanTagihan: 'Oktober 2026',
    jumlahBiaya: 450000,
    tanggalBayar: new Date().toISOString().split('T')[0],
    metodePembayaran: 'Transfer Bank BCA' as PaymentMethod,
    status: 'Lunas' as PaymentStatus,
    catatan: '',
  });

  // Filtered payments
  const filteredPayments = useMemo(() => {
    const q = (searchTerm || globalSearch).toLowerCase().trim();
    return payments.filter((p) => {
      const matchSearch =
        !q ||
        p.nomorTransaksi.toLowerCase().includes(q) ||
        (p.studentName && p.studentName.toLowerCase().includes(q)) ||
        (p.className && p.className.toLowerCase().includes(q)) ||
        p.bulanTagihan.toLowerCase().includes(q);

      const matchStatus =
        selectedStatus === 'Semua' || p.status === selectedStatus;
      const matchType =
        selectedType === 'Semua' || p.jenisPembayaran === selectedType;

      return matchSearch && matchStatus && matchType;
    });
  }, [payments, searchTerm, globalSearch, selectedStatus, selectedType]);

  // Calculations
  const totalLunas = payments
    .filter((p) => p.status === 'Lunas')
    .reduce((sum, p) => sum + p.jumlahBiaya, 0);

  const totalBelumLunas = payments
    .filter((p) => p.status === 'Belum Lunas')
    .reduce((sum, p) => sum + p.jumlahBiaya, 0);

  const pendingCount = payments.filter((p) => p.status === 'Menunggu Konfirmasi').length;

  const handleOpenAdd = () => {
    const defaultStudent = students[0];
    setFormData({
      studentId: defaultStudent?.id || '',
      classId: classes[0]?.id || '',
      jenisPembayaran: 'SPP Bulanan',
      bulanTagihan: 'Oktober 2026',
      jumlahBiaya: classes[0]?.biayaBulanan || 450000,
      tanggalBayar: new Date().toISOString().split('T')[0],
      metodePembayaran: 'Transfer Bank BCA',
      status: 'Lunas',
      catatan: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: PaymentRecord) => {
    setEditingPayment(p);
    setFormData({
      studentId: p.studentId,
      classId: p.classId || '',
      jenisPembayaran: p.jenisPembayaran,
      bulanTagihan: p.bulanTagihan,
      jumlahBiaya: p.jumlahBiaya,
      tanggalBayar: p.tanggalBayar || new Date().toISOString().split('T')[0],
      metodePembayaran: p.metodePembayaran || 'Transfer Bank BCA',
      status: p.status,
      catatan: p.catatan || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return;

    if (editingPayment) {
      updatePayment(editingPayment.id, formData);
      setEditingPayment(null);
    } else {
      addPayment(formData);
      setIsAddModalOpen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="page-header print-hide">
        <div>
          <h1 className="page-title">
            <CreditCard size={24} color="var(--orange-500)" />
            <span>Pembayaran Biaya Bimbingan (SPP)</span>
          </h1>
          <p className="page-subtitle">
            Kelola tagihan pendaftaran, SPP bulanan, modul & tryout, serta cetak kwitansi resmi siswa.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="rb-btn rb-btn-orange">
          <Plus size={16} />
          <span>Catat Pembayaran Baru</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="print-hide" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 13, color: 'var(--slate-500)', fontWeight: 600 }}>Total Pembayaran Lunas</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--emerald-600)', marginTop: 4 }}>
            Rp {totalLunas.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4 }}>
            {payments.filter((p) => p.status === 'Lunas').length} transaksi berhasil
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 13, color: 'var(--slate-500)', fontWeight: 600 }}>Tagihan Belum Lunas</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--rose-600)', marginTop: 4 }}>
            Rp {totalBelumLunas.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4 }}>
            {payments.filter((p) => p.status === 'Belum Lunas').length} siswa jatuh tempo
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 13, color: 'var(--slate-500)', fontWeight: 600 }}>Menunggu Konfirmasi</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
            {pendingCount} Transaksi
          </div>
          <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4 }}>
            Membutuhkan verifikasi mutasi bank
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar print-hide">
        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari nomor kwitansi, siswa, atau bulan tagihan..."
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
            <option value="Lunas">Lunas</option>
            <option value="Belum Lunas">Belum Lunas</option>
            <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--slate-500)', fontWeight: 600 }}>Jenis:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '7px 12px', fontSize: 13 }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="Semua">Semua Jenis Biaya</option>
            <option value="SPP Bulanan">SPP Bulanan</option>
            <option value="Biaya Pendaftaran">Biaya Pendaftaran</option>
            <option value="Modul & Materi">Modul & Materi</option>
            <option value="Biaya Tryout & Ujian">Biaya Tryout & Ujian</option>
          </select>
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--slate-500)', marginLeft: 'auto' }}>
          Menampilkan <strong>{filteredPayments.length}</strong> transaksi
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-container print-hide">
        <table className="rb-table">
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>Nama Siswa</th>
              <th>Rincian Biaya</th>
              <th>Bulan Tagihan</th>
              <th>Nominal</th>
              <th>Metode</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-400)' }}>
                  Tidak ada catatan pembayaran yang sesuai dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy-900)' }}>
                      {p.nomorTransaksi}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>
                      {p.tanggalBayar ? `Tgl: ${p.tanggalBayar}` : 'Belum bayar'}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                      {p.studentName}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--slate-500)' }}>
                      {p.className || 'Semua Program'}
                    </div>
                  </td>

                  <td>
                    <span className="rb-badge badge-program">{p.jenisPembayaran}</span>
                  </td>

                  <td style={{ fontWeight: 500 }}>{p.bulanTagihan}</td>

                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--navy-900)', fontSize: 14 }}>
                      Rp {p.jumlahBiaya.toLocaleString('id-ID')}
                    </div>
                  </td>

                  <td style={{ fontSize: 12.5, color: 'var(--slate-600)' }}>
                    {p.metodePembayaran || '-'}
                  </td>

                  <td>
                    <span
                      className={`rb-badge ${
                        p.status === 'Lunas'
                          ? 'badge-lunas'
                          : p.status === 'Menunggu Konfirmasi'
                          ? 'badge-menunggu'
                          : 'badge-belum-lunas'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <button
                        onClick={() => setReceiptPayment(p)}
                        className="rb-btn-icon rb-btn-secondary"
                        style={{ width: 32, height: 32 }}
                        title="Lihat & Cetak Kwitansi Resmi"
                      >
                        <Printer size={14} color="var(--navy-800)" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="rb-btn-icon rb-btn-secondary"
                        style={{ width: 32, height: 32 }}
                        title="Edit Data Pembayaran"
                      >
                        <Edit2 size={14} color="var(--orange-500)" />
                      </button>
                      <button
                        onClick={() => setDeletingPayment(p)}
                        className="rb-btn-icon rb-btn-danger"
                        style={{ width: 32, height: 32 }}
                        title="Hapus Pembayaran"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Tambah / Edit Pembayaran */}
      {(isAddModalOpen || editingPayment) && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">
                {editingPayment ? 'Edit Catatan Pembayaran' : 'Catat Pembayaran Biaya Baru'}
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPayment(null);
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Pilih Siswa *</label>
                  <select
                    className="form-select"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  >
                    <option value="">Pilih Siswa</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.namaLengkap} (NISN: {s.nisn} - {s.jenjang})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Jenis Pembayaran</label>
                    <select
                      className="form-select"
                      value={formData.jenisPembayaran}
                      onChange={(e) => setFormData({ ...formData, jenisPembayaran: e.target.value as PaymentType })}
                    >
                      <option value="SPP Bulanan">SPP Bulanan</option>
                      <option value="Biaya Pendaftaran">Biaya Pendaftaran</option>
                      <option value="Modul & Materi">Modul & Materi</option>
                      <option value="Biaya Tryout & Ujian">Biaya Tryout & Ujian</option>
                      <option value="Paket Semester">Paket Semester</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bulan / Periode Tagihan</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.bulanTagihan}
                      onChange={(e) => setFormData({ ...formData, bulanTagihan: e.target.value })}
                      placeholder="Contoh: Oktober 2026"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Nominal Biaya (Rp) *</label>
                    <input
                      type="number"
                      step={5000}
                      className="form-input"
                      required
                      value={formData.jumlahBiaya}
                      onChange={(e) => setFormData({ ...formData, jumlahBiaya: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status Pembayaran</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                    >
                      <option value="Lunas">Lunas</option>
                      <option value="Belum Lunas">Belum Lunas</option>
                      <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Metode Pembayaran</label>
                    <select
                      className="form-select"
                      value={formData.metodePembayaran}
                      onChange={(e) => setFormData({ ...formData, metodePembayaran: e.target.value as PaymentMethod })}
                    >
                      <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                      <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                      <option value="Transfer BRI">Transfer BRI</option>
                      <option value="QRIS">QRIS</option>
                      <option value="Tunai">Tunai</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tanggal Pembayaran</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.tanggalBayar}
                      onChange={(e) => setFormData({ ...formData, tanggalBayar: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Transaksi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    placeholder="Contoh: Transfer a.n Bambang Nugraha"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPayment(null);
                  }}
                  className="rb-btn rb-btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="rb-btn rb-btn-orange">
                  <Check size={16} />
                  <span>{editingPayment ? 'Simpan Perubahan' : 'Catat Transaksi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Kwitansi Resmi Ruang Belajarku */}
      {receiptPayment && (
        <div className="modal-overlay">
          <div className="modal-dialog receipt-box" style={{ maxWidth: 640 }}>
            <div className="modal-header print-hide">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Receipt size={18} color="var(--orange-500)" />
                <span>Kwitansi Bukti Pembayaran Resmi</span>
              </div>
              <button
                onClick={() => setReceiptPayment(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Official Receipt Body */}
            <div className="modal-body" style={{ padding: '32px 36px', backgroundColor: '#ffffff' }}>
              {/* Receipt Top Header with Logo */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid var(--navy-900)',
                  paddingBottom: 18,
                  marginBottom: 24,
                }}
              >
                <div>
                  <img
                    src="/logo.png"
                    alt="Ruang Belajarku Logo"
                    style={{ maxHeight: 52, width: 'auto', display: 'block' }}
                  />
                  <div style={{ fontSize: 11.5, color: 'var(--slate-500)', marginTop: 6 }}>
                    Lembaga Bimbingan Belajar & Persiapan Masuk PTN Favorit
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: 'var(--navy-900)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Kwitansi Pembayaran
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange-600)', marginTop: 2 }}>
                    {receiptPayment.nomorTransaksi}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--slate-400)', marginTop: 2 }}>
                    Tgl: {receiptPayment.tanggalBayar || 'Belum Lunas'}
                  </div>
                </div>
              </div>

              {/* Receipt Info */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 16,
                  marginBottom: 24,
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ color: 'var(--slate-500)', fontSize: 11, fontWeight: 700 }}>DITERIMA DARI:</div>
                  <div style={{ fontWeight: 800, color: 'var(--navy-900)', fontSize: 15, marginTop: 2 }}>
                    {receiptPayment.studentName}
                  </div>
                  <div style={{ color: 'var(--slate-600)', fontSize: 12 }}>
                    Program: {receiptPayment.className || 'Bimbingan Belajar'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--slate-500)', fontSize: 11, fontWeight: 700 }}>METODE PEMBAYARAN:</div>
                  <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: 14, marginTop: 2 }}>
                    {receiptPayment.metodePembayaran || '-'}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span
                      className={`rb-badge ${
                        receiptPayment.status === 'Lunas' ? 'badge-lunas' : 'badge-belum-lunas'
                      }`}
                      style={{ fontSize: 13, padding: '4px 12px' }}
                    >
                      {receiptPayment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--navy-900)' }}>
                        Keterangan Rincian Pembayaran
                      </th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--navy-900)' }}>
                        Periode
                      </th>
                      <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--navy-900)' }}>
                        Jumlah
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '14px', borderBottom: '1px solid var(--slate-100)' }}>
                        <strong>{receiptPayment.jenisPembayaran}</strong>
                        {receiptPayment.catatan && (
                          <div style={{ fontSize: 11.5, color: 'var(--slate-500)', marginTop: 2 }}>
                            {receiptPayment.catatan}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px', borderBottom: '1px solid var(--slate-100)', color: 'var(--slate-600)' }}>
                        {receiptPayment.bulanTagihan}
                      </td>
                      <td style={{ padding: '14px', borderBottom: '1px solid var(--slate-100)', textAlign: 'right', fontWeight: 700 }}>
                        Rp {receiptPayment.jumlahBiaya.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--slate-50)' }}>
                      <td colSpan={2} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--navy-900)' }}>
                        TOTAL DIBAYARKAN:
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, fontSize: 16, color: 'var(--orange-600)' }}>
                        Rp {receiptPayment.jumlahBiaya.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures & Stamp */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 36, fontSize: 12 }}>
                <div>
                  <div style={{ color: 'var(--slate-500)', fontSize: 11 }}>Catatan:</div>
                  <div style={{ color: 'var(--slate-500)', fontSize: 11, maxWidth: 280 }}>
                    Kwitansi ini adalah bukti pembayaran yang sah dari Ruang Belajarku dan dihasilkan secara elektronik oleh sistem.
                  </div>
                </div>

                <div style={{ textAlign: 'center', width: 180 }}>
                  <div style={{ color: 'var(--slate-500)', fontSize: 11.5, marginBottom: 50 }}>
                    Bagian Keuangan & Kasir,
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--navy-900)', borderBottom: '1px solid var(--slate-400)', paddingBottom: 2 }}>
                    Ibu Ratna Dewi
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 2 }}>
                    Ruang Belajarku
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer print-hide">
              <button
                type="button"
                onClick={() => setReceiptPayment(null)}
                className="rb-btn rb-btn-secondary"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="rb-btn rb-btn-orange"
              >
                <Printer size={16} />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Pembayaran */}
      {deletingPayment && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: 'var(--rose-600)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} />
                <span>Hapus Catatan Pembayaran</span>
              </div>
              <button
                onClick={() => setDeletingPayment(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: 14, color: 'var(--slate-700)', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus kwitansi transaksi <strong>{deletingPayment.nomorTransaksi}</strong> a.n. {deletingPayment.studentName}?
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeletingPayment(null)}
                className="rb-btn rb-btn-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePayment(deletingPayment.id);
                  setDeletingPayment(null);
                }}
                className="rb-btn rb-btn-danger"
              >
                <Trash2 size={15} />
                <span>Hapus Transaksi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
