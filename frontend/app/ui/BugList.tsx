import Link from 'next/link';
import type { BugListItem } from '@/lib/api';

export function BugList({ bugs }: { bugs: BugListItem[] }) {
  if (!bugs.length) {
    return <p className="muted">Aucun bug pour ces critères.</p>;
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {bugs.map((b) => (
        <li key={b.id} className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <Link href={`/bugs/${b.id}`}>
              <strong>{b.title}</strong>
            </Link>
            <span className="badge">{b.status}</span>
          </div>
          <p className="muted" style={{ margin: '0.5rem 0 0' }}>
            {b.library}@{b.version}
          </p>
        </li>
      ))}
    </ul>
  );
}
