'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  Check,
  Shield,
  Key,
  Globe,
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const {
    isSupabaseConnected,
    supabaseConfig,
    updateSupabaseCredentials,
    disconnectSupabase,
    resetToInitialData,
    addToast,
  } = useApp();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(url.trim(), anonKey.trim());
    onClose();
  };

  const handleCopySchemaNotice = () => {
    setCopiedSql(true);
    navigator.clipboard?.writeText(
      `-- Jalankan file supabase/schema.sql pada Supabase SQL Editor Anda`
    );
    addToast({
      type: 'info',
      title: 'Skema SQL Siap',
      message: 'File SQL lengkap tersedia di supabase/schema.sql dalam repositori.',
    });
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={20} color="var(--orange-500)" />
            <span>Koneksi Database & Autentikasi Supabase</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Status banner */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 12,
              backgroundColor: isSupabaseConnected ? '#ecfdf5' : '#fffbeb',
              border: isSupabaseConnected
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isSupabaseConnected ? (
                <CheckCircle2 size={24} color="#059669" />
              ) : (
                <AlertCircle size={24} color="#d97706" />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: isSupabaseConnected ? '#065f46' : '#92400e' }}>
                  {isSupabaseConnected ? 'Supabase Aktif & Terhubung' : 'Mode Penyimpanan Lokal Interaktif (Bawaan)'}
                </div>
                <div style={{ fontSize: 12.5, color: isSupabaseConnected ? '#047857' : '#b45309', marginTop: 2 }}>
                  {isSupabaseConnected
                    ? 'Aplikasi terhubung ke PostgreSQL Supabase Anda.'
                    : 'Aplikasi beroperasi penuh dengan mock database & penyimpanan lokal tanpa perlu konfigurasi tambahan.'}
                </div>
              </div>
            </div>

            {isSupabaseConnected && (
              <button
                type="button"
                onClick={disconnectSupabase}
                className="rb-btn rb-btn-sm rb-btn-danger"
              >
                Putus Koneksi
              </button>
            )}
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe size={14} />
                <span>Supabase Project URL (NEXT_PUBLIC_SUPABASE_URL)</span>
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <div style={{ fontSize: 11.5, color: 'var(--slate-400)', marginTop: 4 }}>
                Buka Supabase Dashboard -&gt; Project Settings -&gt; API -&gt; Project URL
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Key size={14} />
                <span>Supabase Anon Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
              />
              <div style={{ fontSize: 11.5, color: 'var(--slate-400)', marginTop: 4 }}>
                Buka Supabase Dashboard -&gt; Project Settings -&gt; API -&gt; Project API keys -&gt; anon public
              </div>
            </div>

            <button type="submit" className="rb-btn rb-btn-orange" style={{ width: '100%', marginTop: 8 }}>
              <Check size={16} />
              <span>Simpan & Hubungkan ke Supabase</span>
            </button>
          </form>

          {/* Setup Guide */}
          <div
            style={{
              marginTop: 24,
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 20,
            }}
          >
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 10 }}>
              Panduan Pembuatan Database Supabase:
            </h4>
            <ol style={{ fontSize: 12.5, color: 'var(--slate-600)', paddingLeft: 18, lineHeight: 1.8 }}>
              <li>
                Buat proyek baru gratis di <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--orange-600)', fontWeight: 600 }}>supabase.com</a>.
              </li>
              <li>
                Buka menu <strong>SQL Editor</strong> di dashboard Supabase Anda.
              </li>
              <li>
                Buka dan salin seluruh isi file <code>supabase/schema.sql</code> yang telah kami sediakan di dalam repositori ini, lalu klik <strong>Run</strong>.
              </li>
              <li>
                Salin Project URL & Anon Key dari menu <strong>Project Settings -&gt; API</strong> lalu masukkan pada form di atas.
              </li>
            </ol>

            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={handleCopySchemaNotice}
                className="rb-btn rb-btn-secondary rb-btn-sm"
              >
                <Copy size={14} />
                <span>{copiedSql ? 'Tersalin!' : 'Info Lokasi schema.sql'}</span>
              </button>

              <button
                type="button"
                onClick={resetToInitialData}
                className="rb-btn rb-btn-secondary rb-btn-sm"
                title="Kembalikan semua siswa, pengajar, dan jadwal ke sample default"
              >
                <RefreshCw size={14} />
                <span>Reset Data Awal Default</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="rb-btn rb-btn-primary">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
