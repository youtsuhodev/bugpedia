const base = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type BugListItem = {
  id: string;
  title: string;
  description: string;
  library: string;
  version: string;
  environment: Record<string, unknown>;
  status: string;
  createdAt: string;
};

export type SolutionItem = {
  id: string;
  content: string;
  isVerified: boolean;
  verificationCount: number;
  authorDisplay: string | null;
  githubPrLink: string | null;
  author: { githubUsername: string; reputation: number } | null;
  votes: { isUpvote: boolean }[];
};

export type BugDetail = BugListItem & {
  solutions: SolutionItem[];
  author: { githubUsername: string } | null;
};

export async function fetchBugs(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) {
      q.set(k, v);
    }
  });
  const res = await fetch(`${base()}/bugs?${q.toString()}`, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error('Impossible de charger les bugs');
  }
  return (await res.json()) as BugListItem[];
}

export async function fetchBug(id: string) {
  const res = await fetch(`${base()}/bugs/${id}`, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error('Bug introuvable');
  }
  return (await res.json()) as BugDetail;
}

export async function fetchSimilarBugs(id: string) {
  const res = await fetch(`${base()}/bugs/${id}/similar`, { next: { revalidate: 0 } });
  if (!res.ok) {
    return [];
  }
  return (await res.json()) as BugListItem[];
}
