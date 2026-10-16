import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';

export const metadata: Metadata = {
  title: 'Ruang Belajarku - Sistem Manajemen Bimbingan Belajar',
  description: 'Aplikasi manajemen bimbingan belajar Ruang Belajarku: administrasi siswa, kelas, pengajar, jadwal belajar, presensi kehadiran, dan pembayaran SPP terintegrasi Supabase.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
