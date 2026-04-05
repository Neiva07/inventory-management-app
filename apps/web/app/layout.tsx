import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations';
import Navbar from './navbar';

export const metadata = {
  title: 'Stockify',
  description:
    'Gerencie seu estoque com facilidade e precisão. Stockify é sua solução completa para controle de inventário, com insights inteligentes e gestão simplificada para seu negócio.',
  icons: {
    icon: '/logo_purple_blue.svg',
    shortcut: '/logo_purple_blue.svg',
    apple: '/logo_purple_blue.svg',
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={ptBR}>
    <html lang="pt-BR" className="h-full bg-gray-50">
      <body className="h-full">
        <Suspense>
          <Navbar />
        </Suspense>
        {children}
        <Analytics />
      </body>
    </html>
    </ClerkProvider>
  );
}
