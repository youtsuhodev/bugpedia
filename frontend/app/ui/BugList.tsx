import Link from 'next/link';
import type { BugListItem } from '@/lib/api';

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === 'open') return 'wiki-badge open';
  if (s === 'closed') return 'wiki-badge closed';
  if (s === 'duplicate') return 'wiki-badge duplicate';
  return 'wiki-badge';
}

export function BugList({ bugs }: { bugs: BugListItem[] }) {
  if (!bugs.length) {
    return <p className="muted">Aucune entrée ne correspond à cette requête.</p>;
  }
  return (
    <div className="wiki-table-wrap">
      <table className="wiki-table">
        <thead>
          <tr>
            <th scope="col">Titre</th>
            <th scope="col">Stack</th>
            <th scope="col">Statut</th>
          </tr>
        </thead>
        <tbody>
          {bugs.map((b) => (
            <tr key={b.id}>
              <td>
                <Link href={`/bugs/${b.id}`}>{b.title}</Link>
              </td>
              <td className="muted">
                {b.library}@{b.version}
              </td>
              <td>
                <span className={statusBadgeClass(b.status)}>{b.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
