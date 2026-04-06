import Link from 'next/link';

export type VectorTabItem = {
  label: string;
  href?: string;
  selected?: boolean;
  disabled?: boolean;
};

type Props = {
  /** Onglets « espaces de noms » (Accueil, Article, Aide…) */
  namespaceTabs: VectorTabItem[];
  /** Onglets « affichages » (Lire, Historique…) */
  viewTabs: VectorTabItem[];
};

function TabItem({ item }: { item: VectorTabItem }) {
  const cls = item.selected ? 'vector-tab vector-tab--selected' : 'vector-tab';
  if (item.disabled) {
    return (
      <span className={`${cls} vector-tab--disabled`} tabIndex={-1}>
        {item.label}
      </span>
    );
  }
  if (item.selected) {
    return (
      <span className={cls} aria-current="page">
        {item.label}
      </span>
    );
  }
  return (
    <Link href={item.href ?? '/'} className={cls}>
      {item.label}
    </Link>
  );
}

export function VectorToolbar({ namespaceTabs, viewTabs }: Props) {
  return (
    <div className="vector-page-toolbar">
      <div className="vector-page-toolbar-inner">
        <nav className="vector-namespaces" aria-label="Espaces de noms">
          <ul className="vector-tabs-list">
            {namespaceTabs.map((t) => (
              <li key={t.label}>
                <TabItem item={t} />
              </li>
            ))}
          </ul>
        </nav>
        <nav className="vector-views" aria-label="Affichages">
          <ul className="vector-tabs-list vector-tabs-list--end">
            {viewTabs.map((t) => (
              <li key={t.label}>
                <TabItem item={t} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
