import Layout from '@/components/layout';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='h-full'>
      <body className='dark antialiased'>
        <Providers>
          <Layout>{children}</Layout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
