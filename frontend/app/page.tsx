import Link from 'next/link';
import { VectorToolbar } from '@/components/vector/VectorToolbar';
import { fetchBugs } from '@/lib/api';
import { BugFilters } from './ui/BugFilters';
import { BugList } from './ui/BugList';

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

function param(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function HomePage({ searchParams }: Props) {
  const q = param(searchParams.q);
  const library = param(searchParams.library);
  const version = param(searchParams.version);
  const environmentContains = param(searchParams.env);

  let bugs: Awaited<ReturnType<typeof fetchBugs>> = [];
  let error: string | null = null;
  try {
    bugs = await fetchBugs({ q, library, version, environmentContains });
  } catch (e) {
    error = e instanceof Error ? e.message : 'Erreur réseau';
  }

  return (
    <>
      <VectorToolbar
        namespaceTabs={[
          { href: '/', label: 'Accueil', selected: true },
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
            Accueil
          </h1>
        </header>

        <p className="wiki-hatnote">
        Bienvenue sur <strong>Bugpedia</strong>, un projet visant à rassembler des{' '}
        <strong>bugs documentés</strong>, des liens entre incidents et des{' '}
        <strong>solutions vérifiées</strong> par la communauté des développeurs.
      </p>

      <p className="wiki-lead">
        Utilisez la recherche ci-dessous pour parcourir les entrées par titre, librairie, version ou
        environnement — comme une encyclopédie, chaque bug possède sa propre page détaillée.
      </p>

      <BugFilters initial={{ q, library, version, environmentContains }} />

      {error ? (
        <p className="text-danger" role="alert">
          {error}
        </p>
      ) : (
        <>
          <h2 className="wiki-h2">Liste des bugs</h2>
          <BugList bugs={bugs} />
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            <strong>{bugs.length}</strong> entrée(s) correspondant aux critères. Les pages bug
            incluent les solutions et les liens vers des entrées similaires.
          </p>
        </>
      )}

      <h2 className="wiki-h2">Voir aussi</h2>
      <ul className="wiki-ul">
        <li>
          <Link href="/docs-auth">Aide : authentification GitHub et contribution</Link>
        </li>
      </ul>
      </main>
    </>
  );
}
