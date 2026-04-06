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
      setStatus('Votre modification a été enregistrée. Rechargez la page pour l’afficher.');
      setContent('');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="wiki-fieldset" style={{ marginTop: '1.5rem' }}>
      <legend>Améliorer l’article — proposer une solution</legend>
      <p className="muted" style={{ margin: '0.35rem 0 0.75rem', fontSize: '0.85rem' }}>
        Comme sur un wiki, toute contribution doit respecter les règles du projet. Token GitHub (
        <code>read:user</code>) ou mode <code>DEV_SKIP_AUTH</code> côté API en local.
      </p>
      <form className="stack" onSubmit={onSubmit} style={{ gap: '0.65rem' }}>
        <label className="wiki-label">
          Jeton d’accès (Bearer), si requis
          <input
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="gho_…"
          />
        </label>
        <label className="wiki-label">
          Texte de la solution (Markdown possible)
          <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} required />
        </label>
        <div>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Publication…' : 'Publier la solution'}
          </button>
        </div>
      </form>
      {status ? (
        <p className="wiki-hatnote" style={{ marginTop: '0.75rem' }}>
          {status}
        </p>
      ) : null}
    </section>
  );
}
