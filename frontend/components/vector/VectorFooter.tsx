import Link from 'next/link';

export function VectorFooter() {
  return (
    <footer className="mw-footer">
      <div className="mw-footer-inner">
        <ul className="mw-footer-list">
          <li>
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr"
              target="_blank"
              rel="noreferrer"
            >
              Contenus sous licence Creative Commons BY-SA 4.0
            </a>{' '}
            (données publiques) — code sous{' '}
            <Link href="https://opensource.org/licenses/MIT">licence MIT</Link>.
          </li>
          <li className="mw-footer-disclaimer">
            <strong>Bugpedia</strong> est un projet indépendant. Il n&apos;est pas affilié à la{' '}
            <a href="https://wikimediafoundation.org/" target="_blank" rel="noreferrer">
              Wikimedia Foundation
            </a>
            . <span lang="en">Wikipedia®</span> est une marque déposée de la Wikimedia Foundation,
            Inc.
          </li>
        </ul>
        <ul className="mw-footer-places">
          <li>
            <Link href="/">Accueil</Link>
          </li>
          <li>
            <Link href="/docs-auth">Aide : authentification</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
