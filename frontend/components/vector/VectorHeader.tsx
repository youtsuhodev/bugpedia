import Link from 'next/link';

/** Icône générique (pas le logo Wikipédia® — marque déposée Wikimedia). */
function LogoIcon() {
  return (
    <svg
      className="mw-logo-icon-svg"
      width={50}
      height={50}
      viewBox="0 0 50 50"
      aria-hidden
    >
      <circle cx="25" cy="25" r="23" fill="#eaf3ff" stroke="#3366cc" strokeWidth="1.5" />
      <path
        d="M25 8v34M12 25h26"
        stroke="#3366cc"
        strokeWidth="1.2"
        fill="none"
        opacity={0.5}
      />
      <circle cx="25" cy="25" r="4" fill="#3366cc" />
    </svg>
  );
}

export function VectorHeader() {
  return (
    <div className="vector-header-container">
      <header className="vector-header">
        <div className="vector-header-start">
          <button type="button" className="vector-main-menu-btn" aria-label="Menu principal">
            <span className="vector-menu-icon" aria-hidden />
          </button>
          <Link href="/" className="mw-logo">
            <span className="mw-logo-icon-wrap" aria-hidden>
              <LogoIcon />
            </span>
            <span className="mw-logo-container">
              <span className="mw-logo-wordmark">Bugpedia</span>
              <span className="mw-logo-tagline">L&apos;encyclopédie libre des bugs logiciels</span>
            </span>
          </Link>
        </div>
        <div className="vector-header-end">
          <form className="vector-search-form" action="/" method="get" role="search">
            <div className="vector-search-inner">
              <span className="vector-search-icon" aria-hidden />
              <input
                type="search"
                name="q"
                className="vector-search-input"
                placeholder="Rechercher dans Bugpedia"
                aria-label="Rechercher dans Bugpedia"
                autoComplete="off"
              />
            </div>
            <button type="submit" className="vector-search-submit">
              Rechercher
            </button>
          </form>
          <nav className="vector-user-links" aria-label="Outils personnels">
            <Link href="/docs-auth">Contribuer</Link>
            <span className="vector-user-sep" aria-hidden>
              |
            </span>
            <span className="vector-user-muted">Connexion (MVP)</span>
          </nav>
        </div>
      </header>
    </div>
  );
}
