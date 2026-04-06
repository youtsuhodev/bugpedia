import Link from 'next/link';
import { VectorToolbar } from '@/components/vector/VectorToolbar';

export default function DocsAuthPage() {
  return (
    <>
      <VectorToolbar
        namespaceTabs={[
          { href: '/', label: 'Accueil' },
          { href: '/docs-auth', label: 'Aide', selected: true },
        ]}
        viewTabs={[
          { label: 'Lire', selected: true },
          { href: '/', label: 'Accueil Bugpedia' },
        ]}
      />
      <main id="bodyContent" className="wiki-content mw-body">
        <header className="mw-body-header">
          <div id="siteSub" className="mw-site-sub noprint">
            Une page d&apos;aide de Bugpedia.
          </div>
          <h1 id="firstHeading" className="firstHeading wiki-article-title">
            Aide : authentification
          </h1>
        </header>
      <p className="wiki-hatnote">
        Page d’aide — équivalent d’une <strong>page de projet</strong> sur une encyclopédie : elle
        décrit comment les contributeurs se connectent.
      </p>

      <h2 className="wiki-h2">Compte GitHub (OAuth)</h2>
      <ol className="wiki-ol">
        <li>
          Créez une application OAuth sur GitHub ; URL de callback du type{' '}
          <code>http://localhost:3000/auth/callback</code>.
        </li>
        <li>
          Échangez le <code>code</code> de redirection contre un jeton d’accès (flux OAuth2 standard),
          via un route handler Next ou votre backend.
        </li>
        <li>
          Appelez l’API avec <code>Authorization: Bearer &lt;token&gt;</code> pour{' '}
          <code>POST /bugs</code> et <code>POST /bugs/:id/solutions</code>.
        </li>
        <li>
          En développement sans OAuth : <code>DEV_SKIP_AUTH=true</code> dans le backend (voir{' '}
          <code>backend/.env.example</code>).
        </li>
      </ol>

      <h2 className="wiki-h2">Voir aussi</h2>
      <ul className="wiki-ul">
        <li>
          <Link href="/">Accueil de Bugpedia</Link>
        </li>
      </ul>
      </main>
    </>
  );
}
