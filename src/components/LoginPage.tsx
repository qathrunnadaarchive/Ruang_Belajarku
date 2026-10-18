'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle,
  Database,
  Building,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithSupabase, isSupabaseConnected } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Mohon isi email dan kata sandi Anda.');
      return;
    }
    setIsLoading(true);
    const res = await loginWithSupabase(email, password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Login gagal. Periksa kembali email dan password.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        backgroundColor: '#09182b',
        color: '#ffffff',
        fontFamily: 'inherit',
        overflow: 'hidden',
      }}
    >
      {/* Left Column: Visual Showcase & Brand Story */}
      <div
        className="login-hero-side"
        style={{
          flex: 1.2,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          background: 'linear-gradient(145deg, #071424 0%, #0d2849 50%, #163864 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Glow decoration effects matching logo colors */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 124, 0, 0.25) 0%, rgba(245, 124, 0, 0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(50, 112, 191, 0.2) 0%, rgba(50, 112, 191, 0) 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        {/* Top: Bimbel Badge */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#fb923c',
            }}
          >
            <Sparkles size={14} />
            <span>Sistem Informasi Bimbingan Belajar Terpadu</span>
          </div>
        </div>

        {/* Middle: Prominent Official Logo Card & Tagline */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 520, margin: '40px 0' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 20,
              padding: '24px 32px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), 0 0 40px rgba(245, 124, 0, 0.25)',
              marginBottom: 32,
              border: '2px solid rgba(251, 146, 60, 0.3)',
            }}
          >
            <img
              src="/logo.png"
              alt="Ruang Belajarku Logo Asli"
              style={{
                maxHeight: 72,
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
            />
          </div>

          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#ffffff',
              letterSpacing: '-0.5px',
              marginBottom: 16,
            }}
          >
            Membimbing Generasi Cerdas & Berprestasi Menuju Masa Depan.
          </h1>

          <p
            style={{
              fontSize: 15,
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            Platform all-in-one untuk administrasi siswa, manajemen kelas & kurikulum, data pengajar, jadwal belajar presisi, presensi kehadiran real-time, dan tata kelola pembayaran SPP.
          </p>

          {/* Value points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#e2e8f0' }}>
              <CheckCircle size={18} color="#f57c00" />
              <span>Pencatatan Presensi & Kehadiran Kelas 1-Klik</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#e2e8f0' }}>
              <CheckCircle size={18} color="#f57c00" />
              <span>Pengelolaan Jadwal Anti-Bentrok & Cetak Kwitansi Resmi</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#e2e8f0' }}>
              <CheckCircle size={18} color="#f57c00" />
              <span>Database PostgreSQL Supabase & Akses Real-Time</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            fontSize: 12.5,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>© 2026 Ruang Belajarku. Seluruh hak cipta dilindungi.</span>
          <span style={{ color: '#94a3b8' }}>Sistem Manajemen Bimbingan Belajar</span>
        </div>
      </div>

      {/* Right Column: Clean Login Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 36px',
          backgroundColor: '#0c1e34',
          position: 'relative',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Header in Form */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Masuk ke Dashboard
            </h2>
            <p style={{ fontSize: 13.5, color: '#94a3b8', marginTop: 6 }}>
              Masuk menggunakan email dan kata sandi akun Anda.
            </p>
          </div>

          {/* Error alert */}
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'rgba(225, 29, 72, 0.15)',
                border: '1px solid rgba(225, 29, 72, 0.4)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: '#fecdd3',
                marginBottom: 20,
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                Alamat Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    borderRadius: 8,
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    fontSize: 13.5,
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#f57c00')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                Kata Sandi
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    borderRadius: 8,
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    fontSize: 13.5,
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#f57c00')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: 8,
                background: 'linear-gradient(135deg, #f57c00 0%, #ea580c 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 15px rgba(245, 124, 0, 0.4)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>{isLoading ? 'Memproses...' : 'Masuk ke Sistem'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Database Info Card */}
          <div
            style={{
              marginTop: 24,
              padding: '12px 16px',
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
              <Database size={15} color={isSupabaseConnected ? '#10b981' : '#f59e0b'} />
              <span>
                Status DB:{' '}
                <strong style={{ color: isSupabaseConnected ? '#34d399' : '#fbbf24' }}>
                  {isSupabaseConnected ? 'Supabase Terhubung' : 'Penyimpanan Lokal'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
