import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/providers/AuthProvider';
import PwaRegister from '@/components/pwa/PwaRegister';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'RxNXT™ — Zero-Typing Faster Digital Prescription Generator',
    template: '%s | RxNXT™',
  },
  description:
    'RxNXT™ is India’s premier Zero-Typing faster digital prescription generator for doctors. Prescribe complete, compliant OPD prescriptions in under 20 seconds with 1-click intelligent chips.',
  keywords: ['zero typing prescription', 'faster digital prescription generator', 'digital prescription', 'clinic management', 'EMR', 'healthcare', 'RxNXT'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RxNXT™ Cloud',
  },
  icons: {
    icon: '/Logo.png',
    apple: '/Logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
