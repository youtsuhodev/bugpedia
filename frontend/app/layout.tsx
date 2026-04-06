import type { Metadata } from 'next';
import { VectorFooter } from '@/components/vector/VectorFooter';
import { VectorHeader } from '@/components/vector/VectorHeader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bugpedia',
  description: 'L’encyclopédie libre des bugs logiciels et de leurs solutions',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a href="#bodyContent" className="vector-skip-link">
          Aller au contenu
        </a>
        <VectorHeader />
        <div className="wiki-page vector-page-shell">{children}</div>
        <VectorFooter />
      </body>
    </html>
  );
}
