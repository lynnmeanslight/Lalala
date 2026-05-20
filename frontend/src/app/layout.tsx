import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { PrivyProviders } from '@/components/providers/PrivyProviders';
import { Navbar } from '@/components/Navbar';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Lalala — Shop safely on KUB Chain',
  description:
    'Thai marketplace with secure escrow on KUB Chain. Real reviews, 1.5% fee, instant settlement.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        <PrivyProviders>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-white py-6 text-center text-sm text-gray-400">
            © 2026 Lalala · Built on KUB Chain
          </footer>
        </PrivyProviders>
      </body>
    </html>
  );
}
