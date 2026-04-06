export type BugPublic = {
  id: string;
  title: string;
  description: string;
  library: string;
  version: string;
  environment: Record<string, unknown>;
  status: string;
  authorUserId: string | null;
  githubIssueId: string | null;
  githubRepoFullName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SolutionPublic = {
  id: string;
  bugId: string;
  content: string;
  authorUserId: string | null;
  authorDisplay: string | null;
  isVerified: boolean;
  verificationCount: number;
  githubPrLink: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; githubUsername: string; reputation: number } | null;
  votes: { isUpvote: boolean }[];
};

export type BugDetailPublic = BugPublic & {
  solutions: SolutionPublic[];
  author: { id: string; githubUsername: string; reputation: number } | null;
};
