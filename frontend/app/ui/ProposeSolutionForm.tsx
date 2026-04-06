'use client';

import { useState } from 'react';

const api = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function ProposeSolutionForm({ bugId }: { bugId: string }) {
  const [content, setContent] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token.trim()) {
        headers.Authorization = `Bearer ${token.trim()}`;
      }
      const res = await fetch(`${api()}/bugs/${bugId}/solutions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      setStatus('Solution envoyée. Rechargez la page.');
      setContent('');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card stack" style={{ marginTop: '1.5rem' }}>
      <h2 style={{ margin: 0 }}>Proposer une solution</h2>
      <p className="muted" style={{ margin: 0 }}>
        Collez un token OAuth GitHub (scope <code>read:user</code>) ou activez{' '}
        <code>DEV_SKIP_AUTH</code> côté API pour les essais locaux.
      </p>
      <form className="stack" onSubmit={onSubmit}>
        <label className="stack">
          <span className="muted">Token (Bearer)</span>
          <input
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="gho_…"
          />
        </label>
        <label className="stack">
          <span className="muted">Markdown</span>
          <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} required />
        </label>
        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Envoi…' : 'Publier'}
        </button>
      </form>
      {status ? <p className="muted">{status}</p> : null}
    </section>
  );
}
