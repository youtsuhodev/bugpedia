import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bugpedia',
  description: 'Base collaborative de bugs logiciels et solutions vérifiées',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <header
          style={{
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          <div
            style={{
              maxWidth: 960,
              margin: '0 auto',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <a href="/" style={{ fontWeight: 700, color: 'var(--text)' }}>
              Bugpedia
            </a>
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              MVP — Next.js + NestJS
            </span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
