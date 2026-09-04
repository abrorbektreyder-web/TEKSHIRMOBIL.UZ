import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="uz">
      <body className="antialiased flex flex-col min-h-screen selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
