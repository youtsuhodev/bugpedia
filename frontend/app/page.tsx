import Link from 'next/link';
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
    <main>
      <h1>Bugpedia</h1>
      <p className="muted">
        Documenter, relier et résoudre des bugs — recherche plein texte, filtres par stack, solutions
        validées par la communauté.
      </p>

      <BugFilters initial={{ q, library, version, environmentContains }} />

      {error ? (
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      ) : (
        <>
          <h2>Bugs récents</h2>
          <BugList bugs={bugs} />
          <p className="muted" style={{ marginTop: '1rem' }}>
            {bugs.length} résultat(s). Ouvrez un bug pour voir les solutions vérifiées et le graphe
            « similaires ».
          </p>
        </>
      )}
      <p style={{ marginTop: '2rem' }}>
        <Link href="/docs-auth">Flux GitHub OAuth — notes MVP</Link>
      </p>
    </main>
  );
}
