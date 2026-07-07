import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/providers/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'RxNXT — Digital Prescription Platform',
    template: '%s | RxNXT',
  },
  description:
    'RxNXT is a modern digital prescription and drug management platform for clinics and doctors. Generate professional prescriptions in seconds.',
  keywords: ['prescription', 'digital health', 'clinic management', 'EMR', 'healthcare'],
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
      </body>
    </html>
  );
}
