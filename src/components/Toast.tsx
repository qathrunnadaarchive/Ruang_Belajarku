'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 380,
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        let icon = <CheckCircle2 size={18} color="#059669" />;
        let borderLeft = '4px solid #059669';

        if (toast.type === 'error') {
          icon = <AlertCircle size={18} color="#e11d48" />;
          borderLeft = '4px solid #e11d48';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle size={18} color="#d97706" />;
          borderLeft = '4px solid #d97706';
        } else if (toast.type === 'info') {
          icon = <Info size={18} color="#2563eb" />;
          borderLeft = '4px solid #2563eb';
        }

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: '#ffffff',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
              borderRadius: 10,
              padding: '12px 16px',
              borderLeft,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ marginTop: 2, flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f243e' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: 12.5, color: '#475569', marginTop: 2, lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
