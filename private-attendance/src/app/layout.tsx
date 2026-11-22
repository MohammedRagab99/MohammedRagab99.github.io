import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AttendanceApp - نظام الحضور والانصراف',
  description: 'تطبيق شامل لإدارة الحضور والانصراف والإجازات والأوفر تايم',
  keywords: ['الحضور', 'الانصراف', 'الإجازات', 'الأوفر تايم', 'تقارير', 'إدارة الموظفين'],
  authors: [{ name: 'AttendanceApp' }],
  creator: 'AttendanceApp',
  publisher: 'AttendanceApp',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'AttendanceApp - نظام الحضور والانصراف',
    description: 'تطبيق شامل لإدارة الحضور والانصراف والإجازات والأوفر تايم',
    type: 'website',
    locale: 'ar_EG',
    siteName: 'AttendanceApp',
  },
};

export const viewport: Viewport = {
  themeColor: '#2E7D32',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-arabic antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
