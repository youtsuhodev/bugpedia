/** Statuts bug (SQLite : stockés en TEXT ; PostgreSQL peut utiliser un ENUM SQL). */
export enum BugStatus {
  open = 'open',
  closed = 'closed',
  duplicate = 'duplicate',
}
