import Link from 'next/link';

export default function DocsAuthPage() {
  return (
    <main>
      <h1>Authentification GitHub (MVP)</h1>
      <ol className="muted">
        <li>
          Créez une GitHub OAuth App : callback vers votre front (ex.{' '}
          <code>http://localhost:3000/auth/callback</code>).
        </li>
        <li>
          Échangez le <code>code</code> contre un access token (flux standard OAuth2) — à brancher
          dans le frontend ou un route handler Next.
        </li>
        <li>
          Appelez l’API Nest avec <code>Authorization: Bearer &lt;token&gt;</code> sur{' '}
          <code>POST /bugs</code> et <code>POST /bugs/:id/solutions</code>.
        </li>
        <li>
          En local sans OAuth : <code>DEV_SKIP_AUTH=true</code> dans le backend (voir{' '}
          <code>backend/.env.example</code>).
        </li>
      </ol>
      <p>
        <Link href="/">← Accueil</Link>
      </p>
    </main>
  );
}
