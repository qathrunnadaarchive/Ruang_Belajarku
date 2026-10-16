'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Database,
  Calendar,
  UserPlus,
  CalendarCheck,
  CreditCard,
  BookPlus,
  Sparkles,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebarMobile: () => void;
  onOpenSupabaseModal: () => void;
  onOpenQuickAddStudent: () => void;
  onOpenQuickAddPayment: () => void;
  onOpenQuickAddClass: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebarMobile,
  onOpenSupabaseModal,
  onOpenQuickAddStudent,
  onOpenQuickAddPayment,
  onOpenQuickAddClass,
}) => {
  const {
    currentUser,
    globalSearch,
    setGlobalSearch,
    isSupabaseConnected,
    setActiveTab,
    payments,
    refreshFromSupabase,
    isSyncing,
    lastSyncTime,
  } = useApp();

  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingPayments = payments.filter((p) => p.status !== 'Lunas');

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header
      className="app-header"
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left: Mobile hamburger + Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 520 }}>
        <button
          onClick={onToggleSidebarMobile}
          className="mobile-only-btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--navy-900)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Menu size={22} />
        </button>

        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--slate-400)',
            }}
          />
          <input
            type="text"
            placeholder="Cari siswa, NIP pengajar, kelas, atau invoice..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 16px 9px 40px',
              fontSize: 13.5,
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--slate-200)',
              backgroundColor: 'var(--slate-50)',
              outline: 'none',
              transition: 'all 0.15s ease',
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = 'var(--orange-500)';
              e.target.style.boxShadow = '0 0 0 3px rgba(245, 124, 0, 0.12)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'var(--slate-50)';
              e.target.style.borderColor = 'var(--slate-200)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Right: Date, Quick Add, Supabase indicator, Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Date badge (Desktop) */}
        <div
          className="header-date-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            fontWeight: 600,
            color: 'var(--slate-600)',
            backgroundColor: 'var(--slate-100)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <Calendar size={14} color="var(--orange-500)" />
          <span>{todayStr}</span>
        </div>

        {/* Supabase Status Pill & Sync Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={onOpenSupabaseModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              backgroundColor: isSupabaseConnected ? '#ecfdf5' : '#fffbeb',
              border: isSupabaseConnected
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: isSupabaseConnected ? '#065f46' : '#92400e',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Klik untuk konfigurasi koneksi Supabase"
          >
            <Database size={13} color={isSupabaseConnected ? '#059669' : '#d97706'} />
            <span>{isSupabaseConnected ? 'Supabase Terhubung' : 'Penyimpanan Lokal'}</span>
            {lastSyncTime && (
              <span style={{ fontSize: 10.5, opacity: 0.75, fontWeight: 500 }}>
                • {lastSyncTime}
              </span>
            )}
          </button>

          <button
            onClick={() => refreshFromSupabase()}
            disabled={isSyncing}
            className="rb-btn-icon rb-btn-secondary"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              color: 'var(--navy-800)',
            }}
            title="Sinkronkan ulang data langsung dari Supabase"
          >
            <RefreshCw
              size={14}
              style={{
                animation: isSyncing ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>
        </div>

        {/* Quick Action Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
            className="rb-btn rb-btn-orange"
            style={{
              padding: '8px 14px',
              fontSize: 13,
              borderRadius: 'var(--radius-full)',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah</span>
            <ChevronDown size={14} />
          </button>

          {showQuickAddMenu && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                backgroundColor: '#ffffff',
                boxShadow: 'var(--shadow-lg), 0 10px 20px rgba(0,0,0,0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                width: 220,
                padding: '6px',
                zIndex: 100,
                animation: 'fadeIn 0.15s ease',
              }}
            >
              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  onOpenQuickAddStudent();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--slate-700)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <UserPlus size={16} color="var(--navy-700)" />
                <span>Siswa Baru</span>
              </button>

              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  onOpenQuickAddClass();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--slate-700)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <BookPlus size={16} color="var(--orange-500)" />
                <span>Buka Kelas Baru</span>
              </button>

              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  onOpenQuickAddPayment();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--slate-700)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <CreditCard size={16} color="var(--emerald-600)" />
                <span>Catat Pembayaran SPP</span>
              </button>

              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  setActiveTab('attendance');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--slate-700)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <CalendarCheck size={16} color="var(--indigo-600)" />
                <span>Pencatatan Presensi</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="rb-btn-icon rb-btn-secondary"
            style={{ borderRadius: 'var(--radius-full)', position: 'relative' }}
            title="Pemberitahuan"
          >
            <Bell size={18} />
            {pendingPayments.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#e11d48',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                backgroundColor: '#ffffff',
                boxShadow: 'var(--shadow-lg), 0 10px 25px rgba(0,0,0,0.1)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                width: 320,
                padding: '14px',
                zIndex: 100,
                animation: 'fadeIn 0.15s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: 8,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy-900)' }}>
                  Pemberitahuan
                </span>
                <span style={{ fontSize: 11, color: 'var(--slate-500)' }}>
                  {pendingPayments.length} tagihan aktif
                </span>
              </div>

              {pendingPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 8px', color: 'var(--slate-500)', fontSize: 12.5 }}>
                  Tidak ada pemberitahuan baru. Semua beres!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {pendingPayments.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('payments');
                      }}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: 'var(--slate-50)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        borderLeft: '3px solid var(--orange-500)',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                        {p.nomorTransaksi} - {p.studentName}
                      </div>
                      <div style={{ color: 'var(--slate-500)', marginTop: 2 }}>
                        {p.jenisPembayaran} ({p.bulanTagihan}): Rp {p.jumlahBiaya.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
