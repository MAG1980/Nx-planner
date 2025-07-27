import { ReactNode } from 'react';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './global.css';
import { RootProvider } from '@web/providers/RootProvider';
import { RootLayoutHeader } from '@web/components/RootLayoutHeader';

const inter = Inter({ subsets: ['latin', 'cyrillic', 'cyrillic-ext'] });
export const metadata: Metadata = {
  title: 'Приложение для аутентификации',
  description: 'Authentication app with Next.js and NestJS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootProvider>
          <div className="wrapper">
            <div className="container">
              <RootLayoutHeader />
              {children}
            </div>
          </div>
        </RootProvider>
      </body>
    </html>
  );
}
