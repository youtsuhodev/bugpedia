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
    <form className="card stack" action="/" method="get" style={{ marginTop: '1.5rem' }}>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <label className="stack" style={{ flex: '1 1 200px' }}>
          <span className="muted">Recherche</span>
          <input name="q" type="search" placeholder="titre ou description" defaultValue={initial.q} />
        </label>
        <label className="stack" style={{ flex: '1 1 140px' }}>
          <span className="muted">Librairie</span>
          <input name="library" placeholder="react" defaultValue={initial.library} />
        </label>
        <label className="stack" style={{ flex: '1 1 120px' }}>
          <span className="muted">Version</span>
          <input name="version" placeholder="18.2.0" defaultValue={initial.version} />
        </label>
        <label className="stack" style={{ flex: '1 1 180px' }}>
          <span className="muted">Environnement (texte)</span>
          <input name="env" placeholder="Safari, Linux…" defaultValue={initial.environmentContains} />
        </label>
      </div>
      <div className="row">
        <button type="submit" className="primary">
          Filtrer
        </button>
      </div>
    </form>
  );
}
