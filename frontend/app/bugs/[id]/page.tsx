import Link from 'next/link';
import { notFound } from 'next/navigation';
import { VectorToolbar } from '@/components/vector/VectorToolbar';
import { fetchBug, fetchSimilarBugs } from '@/lib/api';
import { ProposeSolutionForm } from '@/app/ui/ProposeSolutionForm';

type Props = { params: { id: string } };

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === 'open') return 'wiki-badge open';
  if (s === 'closed') return 'wiki-badge closed';
  if (s === 'duplicate') return 'wiki-badge duplicate';
  return 'wiki-badge';
}

function formatWikiDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

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
    <>
      <VectorToolbar
        namespaceTabs={[
          { href: `/bugs/${bug.id}`, label: 'Article', selected: true },
          { label: 'Discussion', disabled: true },
        ]}
        viewTabs={[
          { label: 'Lire', selected: true },
          { href: '/docs-auth', label: 'Contribuer' },
        ]}
      />
      <main id="bodyContent" className="wiki-content mw-body">
        <header className="mw-body-header">
          <div id="siteSub" className="mw-site-sub noprint">
            Une page de Bugpedia, l&apos;encyclopédie libre des bugs logiciels.
          </div>
          <h1 id="firstHeading" className="firstHeading wiki-article-title">
            {bug.title}
          </h1>
        </header>

      <table className="wiki-infobox" role="presentation">
        <caption>Fiche du bug</caption>
        <tbody>
          <tr>
            <th scope="row">Statut</th>
            <td>
              <span className={statusBadgeClass(bug.status)}>{bug.status}</span>
            </td>
          </tr>
          <tr>
            <th scope="row">Librairie</th>
            <td>
              <code>{bug.library}</code>
            </td>
          </tr>
          <tr>
            <th scope="row">Version</th>
            <td>
              <code>{bug.version}</code>
            </td>
          </tr>
          <tr>
            <th scope="row">Signalé par</th>
            <td>{bug.author ? `@${bug.author.githubUsername}` : '—'}</td>
          </tr>
          <tr>
            <th scope="row">Création</th>
            <td>{formatWikiDate(bug.createdAt)}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="wiki-h2">Description</h2>
      <div className="wiki-lead wiki-pre">{bug.description}</div>

      <h2 className="wiki-h2">Environnement</h2>
      <pre className="wiki-pre-block wiki-pre">{JSON.stringify(bug.environment, null, 2)}</pre>

      <div className="wiki-clear" />

      <h2 className="wiki-h2">Solutions proposées</h2>
      {sortedSolutions.length === 0 ? (
        <p className="muted">Cette page ne contient encore aucune solution.</p>
      ) : (
        sortedSolutions.map((s) => {
          const upvotes = s.votes.filter((v) => v.isUpvote).length;
          return (
            <div key={s.id} className="wiki-solution">
              <div className="wiki-solution-meta">
                <span>
                  <strong>Contribution</strong> :{' '}
                  {s.authorDisplay || s.author?.githubUsername || 'Anonyme'}
                  {s.author ? (
                    <span className="muted"> · réputation {s.author.reputation}</span>
                  ) : null}
                </span>
                {s.isVerified ? (
                  <span className="wiki-badge verified">
                    Solution vérifiée ({s.verificationCount} validations)
                  </span>
                ) : (
                  <span className="wiki-badge">{s.verificationCount} validation(s)</span>
                )}
                <span className="muted">{upvotes} vote(s) positifs</span>
              </div>
              <div className="wiki-pre">{s.content}</div>
              {s.githubPrLink ? (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem' }}>
                  <a href={s.githubPrLink} target="_blank" rel="noreferrer">
                    Lien vers une pull request externe
                  </a>
                </p>
              ) : null}
            </div>
          );
        })
      )}

      <ProposeSolutionForm bugId={bug.id} />

      <h2 className="wiki-h2">Articles connexes</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Bugs reliés dans le graphe de similarité (même cause, autre version, etc.).
      </p>
      {similar.length === 0 ? (
        <p className="muted">Aucun lien enregistré pour le moment.</p>
      ) : (
        <ul className="wiki-ul">
          {similar.map((b) => (
            <li key={b.id}>
              <Link href={`/bugs/${b.id}`}>{b.title}</Link>
              <span className="muted">
                {' '}
                — <code>{b.library}</code>@{b.version}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: '2rem', fontSize: '0.85rem' }}>
        <Link href="/">← Retour à l’accueil</Link>
      </p>
      </main>
    </>
  );
}
