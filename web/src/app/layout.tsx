import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata: Metadata = {
  title: 'TEKSHIR — IMEI orqali muddatli to‘lov (nasiya) holatini tekshirish',
  description: 'Ikkilamchi bozorda telefon sotib olishdan oldin IMEI orqali muddatli to‘lov va nasiya holatini tekshiring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen selection:bg-brand-500 selection:text-white bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
