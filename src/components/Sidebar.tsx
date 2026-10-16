'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  Clock,
  CreditCard,
  Database,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
  onOpenSupabaseModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  onOpenSupabaseModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    students,
    classes,
    teachers,
    payments,
    currentUser,
    logout,
    isSupabaseConnected,
  } = useApp();

  const unpaidCount = payments.filter((p) => p.status !== 'Lunas').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Ringkasan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'students',
      label: 'Data Siswa',
      icon: Users,
      badge: students.length,
      badgeColor: 'var(--navy-100)',
      badgeTextColor: 'var(--navy-800)',
    },
    {
      id: 'classes',
      label: 'Manajemen Kelas',
      icon: BookOpen,
      badge: classes.length,
      badgeColor: 'var(--orange-100)',
      badgeTextColor: 'var(--orange-600)',
    },
    {
      id: 'teachers',
      label: 'Data Pengajar',
      icon: GraduationCap,
      badge: teachers.length,
      badgeColor: 'var(--indigo-100)',
      badgeTextColor: 'var(--indigo-600)',
    },
    {
      id: 'attendance',
      label: 'Pencatatan Kehadiran',
      icon: CalendarCheck,
      badge: null,
    },
    {
      id: 'schedules',
      label: 'Jadwal Belajar',
      icon: Clock,
      badge: null,
    },
    {
      id: 'payments',
      label: 'Pembayaran Biaya',
      icon: CreditCard,
      badge: unpaidCount > 0 ? unpaidCount : null,
      badgeColor: 'var(--rose-100)',
      badgeTextColor: 'var(--rose-600)',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(8, 21, 38, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 40,
            display: 'block',
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#0c233f',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 50,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '4px 0 20px rgba(8, 21, 38, 0.15)',
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Logo Container */}
        <div
          style={{
            padding: '20px 18px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* The user's actual logo image */}
            <img
              src="/logo.png"
              alt="Ruang Belajarku Logo"
              style={{
                width: '100%',
                maxHeight: '44px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px 4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isSupabaseConnected ? '#10b981' : '#f59e0b',
                  display: 'inline-block',
                  boxShadow: isSupabaseConnected
                    ? '0 0 8px #10b981'
                    : '0 0 8px #f59e0b',
                }}
              />
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                {isSupabaseConnected ? 'Supabase Terhubung' : 'Penyimpanan Lokal Aktif'}
              </span>
            </div>
            <button
              onClick={onOpenSupabaseModal}
              title="Pengaturan Database Supabase"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fdba74',
                fontSize: 10.5,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Database size={11} />
              DB
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: '#64748b',
              padding: '6px 10px',
            }}
          >
            Menu Utama
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive
                    ? 'rgba(245, 124, 0, 0.16)'
                    : 'transparent',
                  color: isActive ? '#fb923c' : '#cbd5e1',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13.5,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive
                    ? '3px solid #f57c00'
                    : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#cbd5e1';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Icon
                    size={18}
                    color={isActive ? '#f57c00' : '#94a3b8'}
                    style={{ flexShrink: 0 }}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    style={{
                      backgroundColor: item.badgeColor || 'rgba(255,255,255,0.1)',
                      color: item.badgeTextColor || '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 10,
                      minWidth: 20,
                      textAlign: 'center',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div
            style={{
              fontSize: 10.5,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: '#64748b',
              padding: '18px 10px 6px',
            }}
          >
            Integrasi & Sistem
          </div>

          <button
            onClick={onOpenSupabaseModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: '#94a3b8',
              fontSize: 13,
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <Database size={17} color="#38bdf8" />
              <span>Koneksi Supabase</span>
            </div>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* User Card & Logout */}
        <div
          style={{
            padding: 14,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f57c00 0%, #d96302 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {currentUser?.fullName ? currentUser.fullName.charAt(0) : 'U'}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {currentUser?.fullName || 'Pengguna'}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#fb923c',
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ShieldCheck size={11} />
                  {currentUser?.role || 'Admin'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Keluar dari Akun"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(225, 29, 72, 0.2)';
                e.currentTarget.style.color = '#fb7185';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
