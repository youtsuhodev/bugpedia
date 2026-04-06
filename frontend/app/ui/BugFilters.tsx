export function BugFilters({
  initial,
}: {
  initial: {
    q?: string;
    library?: string;
    version?: string;
    environmentContains?: string;
  };
}) {
  return (
    <form className="wiki-fieldset" action="/" method="get">
      <legend>Rechercher dans Bugpedia</legend>
      <div className="wiki-form-grid">
        <label className="wiki-label">
          Texte (titre ou description)
          <input name="q" type="search" placeholder="ex. memory leak Safari" defaultValue={initial.q} />
        </label>
        <label className="wiki-label">
          Librairie
          <input name="library" placeholder="react" defaultValue={initial.library} />
        </label>
        <label className="wiki-label">
          Version
          <input name="version" placeholder="18.2.0" defaultValue={initial.version} />
        </label>
        <label className="wiki-label">
          Environnement (texte libre)
          <input name="env" placeholder="Safari, Linux…" defaultValue={initial.environmentContains} />
        </label>
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        <button type="submit" className="primary">
          Lancer la recherche
        </button>
      </div>
    </form>
  );
}
