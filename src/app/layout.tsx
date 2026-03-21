import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TopMenu from '@/components/TopMenu';
import NextAuthProvider from '@/providers/NextAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Restaurant Reservation',
  description: 'Book your favorite restaurant easily',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 pt-8`}>
        <NextAuthProvider>
          <TopMenu />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}