'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { LoginPage } from '../components/LoginPage';
import { DashboardView } from '../components/DashboardView';
import { StudentsView } from '../components/StudentsView';
import { ClassesView } from '../components/ClassesView';
import { TeachersView } from '../components/TeachersView';
import { AttendanceView } from '../components/AttendanceView';
import { SchedulesView } from '../components/SchedulesView';
import { PaymentsView } from '../components/PaymentsView';
import { SupabaseModal } from '../components/SupabaseModal';
import { ToastContainer } from '../components/Toast';

export default function Home() {
  const { currentUser, isAuthLoading, activeTab, setActiveTab } = useApp();

  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Indikator memuat saat sesi Supabase sedang diverifikasi
  if (isAuthLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09182b',
          color: '#ffffff',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(245, 124, 0, 0.2)',
            borderTopColor: '#f57c00',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 500 }}>
          Memeriksa sesi login...
        </div>
      </div>
    );
  }

  // If user is not authenticated, show modern Ruang Belajarku login page
  if (!currentUser) {
    return (
      <>
        <LoginPage onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} />
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="app-shell">
      {/* Sidebar with Official Logo */}
      <Sidebar
        isOpen={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Header
          onToggleSidebarMobile={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onOpenQuickAddStudent={() => setActiveTab('students')}
          onOpenQuickAddPayment={() => setActiveTab('payments')}
          onOpenQuickAddClass={() => setActiveTab('classes')}
        />

        <main className="content-area">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenAddStudent={() => setActiveTab('students')}
              onOpenAddPayment={() => setActiveTab('payments')}
            />
          )}
          {activeTab === 'students' && <StudentsView />}
          {activeTab === 'classes' && <ClassesView />}
          {activeTab === 'teachers' && <TeachersView />}
          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'schedules' && <SchedulesView />}
          {activeTab === 'payments' && <PaymentsView />}
        </main>
      </div>

      {/* Supabase Connection Setup Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Interactive Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
