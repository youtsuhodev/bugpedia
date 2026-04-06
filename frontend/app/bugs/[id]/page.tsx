import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBug, fetchSimilarBugs } from '@/lib/api';
import { ProposeSolutionForm } from '@/app/ui/ProposeSolutionForm';

type Props = { params: { id: string } };

export default async function BugDetailPage({ params }: Props) {
  let bug: Awaited<ReturnType<typeof fetchBug>>;
  try {
    bug = await fetchBug(params.id);
  } catch {
    notFound();
  }
  const similar = await fetchSimilarBugs(params.id);

  const sortedSolutions = [...bug.solutions].sort(
    (a, b) => b.verificationCount - a.verificationCount,
  );

  return (
    <main>
      <p>
        <Link href="/">← Retour</Link>
      </p>
      <article className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ margin: 0 }}>{bug.title}</h1>
          <span className="badge">{bug.status}</span>
        </div>
        <p className="muted">
          {bug.library}@{bug.version}
          {bug.author ? ` · signalé par @${bug.author.githubUsername}` : ''}
        </p>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            margin: '1rem 0 0',
          }}
        >
          {bug.description}
        </pre>
        <h2 style={{ marginTop: '1.25rem' }}>Environnement</h2>
        <pre
          className="muted"
          style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', margin: 0 }}
        >
          {JSON.stringify(bug.environment, null, 2)}
        </pre>
      </article>

      <h2>Solutions</h2>
      {sortedSolutions.length === 0 ? (
        <p className="muted">Pas encore de proposition.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sortedSolutions.map((s) => {
            const upvotes = s.votes.filter((v) => v.isUpvote).length;
            return (
              <li key={s.id} className="card">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span>
                    {s.authorDisplay || s.author?.githubUsername || 'Anonyme'}
                    {s.author ? (
                      <span className="muted"> · réputation {s.author.reputation}</span>
                    ) : null}
                  </span>
                  {s.isVerified ? (
                    <span className="badge verified">
                      ✅ Vérifié · {s.verificationCount} validations
                    </span>
                  ) : (
                    <span className="badge">{s.verificationCount} validations</span>
                  )}
                </div>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    margin: '0.75rem 0 0',
                  }}
                >
                  {s.content}
                </pre>
                {s.githubPrLink ? (
                  <p style={{ marginTop: '0.75rem' }}>
                    <a href={s.githubPrLink} target="_blank" rel="noreferrer">
                      Lien PR GitHub
                    </a>
                  </p>
                ) : null}
                <p className="muted" style={{ marginBottom: 0 }}>
                  {upvotes} vote(s) positifs
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <ProposeSolutionForm bugId={bug.id} />

      <h2>Bugs similaires (graphe)</h2>
      {similar.length === 0 ? (
        <p className="muted">Aucune arête enregistrée pour ce bug.</p>
      ) : (
        <ul>
          {similar.map((b) => (
            <li key={b.id}>
              <Link href={`/bugs/${b.id}`}>{b.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
