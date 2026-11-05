import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PWAProvider } from '@/components/pwa/PWAProvider';

export const metadata: Metadata = {
  title: 'Aplikasi Management Keuangan Navi - Multi-User Rumah Tangga',
  description:
    'Aplikasi pengatur keuangan keluarga modern & ringan. Sinkronisasi real-time multi-user untuk HP Suami & Istri, quick input transaksi, budgeting guard, dan checklist tagihan rutin.',
  applicationName: 'Navi Keuangan',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Navi Keuangan',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#059669',
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
        <PWAProvider>{children}</PWAProvider>
      </body>
    </html>
  );
}
