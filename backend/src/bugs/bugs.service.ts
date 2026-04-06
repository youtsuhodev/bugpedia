import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { RowDataPacket } from 'mysql2/promise';
import { BugStatus } from '../common/bug-status';
import { MysqlService, type SqlValue } from '../database/mysql.service';
import type { BugDetailPublic, BugPublic, SolutionPublic } from '../types/bug.types';
import { CreateBugDto } from './dto/create-bug.dto';
import { ListBugsQueryDto } from './dto/list-bugs-query.dto';

function parseEnvironment(raw: unknown): Record<string, unknown> {
  if (raw == null) {
    return {};
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

function mapBugRow(r: RowDataPacket): BugPublic {
  return {
    id: r.id as string,
    title: r.title as string,
    description: r.description as string,
    library: r.library as string,
    version: r.version as string,
    environment: parseEnvironment(r.environment),
    status: r.status as string,
    authorUserId: r.author_user_id != null ? String(r.author_user_id) : null,
    githubIssueId: r.github_issue_id != null ? String(r.github_issue_id) : null,
    githubRepoFullName: r.github_repo_full_name != null ? String(r.github_repo_full_name) : null,
    createdAt: r.created_at as Date,
    updatedAt: r.updated_at as Date,
  };
}

@Injectable()
export class BugsService {
  constructor(private readonly db: MysqlService) {}

  async list(query: ListBugsQueryDto): Promise<BugPublic[]> {
    const conds: string[] = ['1=1'];
    const params: SqlValue[] = [];

    if (query.library) {
      conds.push('b.library = ?');
      params.push(query.library);
    }
    if (query.version) {
      conds.push('b.version = ?');
      params.push(query.version);
    }
    if (query.status) {
      conds.push('b.status = ?');
      params.push(query.status);
    }
    if (query.q) {
      conds.push('(b.title LIKE ? OR b.description LIKE ?)');
      const like = `%${query.q}%`;
      params.push(like, like);
    }
    if (query.environmentContains) {
      conds.push('CAST(b.environment AS CHAR) LIKE ?');
      params.push(`%${query.environmentContains}%`);
    }

    const take = Math.min(query.limit ?? 50, 100);
    const skip = query.offset ?? 0;

    const sql = `
      SELECT b.* FROM bugs b
      WHERE ${conds.join(' AND ')}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(take, skip);

    const rows = await this.db.query<RowDataPacket[]>(sql, params);
    return rows.map(mapBugRow);
  }

  async findOne(id: string): Promise<BugDetailPublic> {
    const bugs = await this.db.query<RowDataPacket[]>('SELECT * FROM bugs WHERE id = ? LIMIT 1', [id]);
    if (!bugs.length) {
      throw new NotFoundException(`Bug ${id} introuvable`);
    }
    const bug = mapBugRow(bugs[0]);

    let author: BugDetailPublic['author'] = null;
    if (bug.authorUserId) {
      const au = await this.db.query<RowDataPacket[]>(
        'SELECT id, github_username, reputation FROM users WHERE id = ? LIMIT 1',
        [bug.authorUserId],
      );
      if (au.length) {
        author = {
          id: au[0].id as string,
          githubUsername: au[0].github_username as string,
          reputation: Number(au[0].reputation),
        };
      }
    }

    const solRows = await this.db.query<RowDataPacket[]>(
      `SELECT s.*, u.github_username AS author_github_username, u.reputation AS author_reputation
       FROM solutions s
       LEFT JOIN users u ON u.id = s.author_user_id
       WHERE s.bug_id = ?
       ORDER BY s.is_verified DESC, s.verification_count DESC, s.created_at DESC`,
      [id],
    );

    const solutionIds = solRows.map((s) => s.id as string);
    const votesBySolution = new Map<string, { isUpvote: boolean }[]>();
    if (solutionIds.length) {
      const placeholders = solutionIds.map(() => '?').join(',');
      const voteRows = await this.db.query<RowDataPacket[]>(
        `SELECT solution_id, is_upvote FROM votes WHERE solution_id IN (${placeholders})`,
        solutionIds,
      );
      for (const v of voteRows) {
        const sid = v.solution_id as string;
        const list = votesBySolution.get(sid) ?? [];
        list.push({ isUpvote: Boolean(v.is_upvote) });
        votesBySolution.set(sid, list);
      }
    }

    const solutions: SolutionPublic[] = solRows.map((s) => ({
      id: s.id as string,
      bugId: s.bug_id as string,
      content: s.content as string,
      authorUserId: (s.author_user_id as string) ?? null,
      authorDisplay: (s.author_display as string) ?? null,
      isVerified: Boolean(s.is_verified),
      verificationCount: Number(s.verification_count),
      githubPrLink: (s.github_pr_link as string) ?? null,
      createdAt: s.created_at as Date,
      updatedAt: s.updated_at as Date,
      author:
        s.author_user_id && s.author_github_username
          ? {
              id: s.author_user_id as string,
              githubUsername: s.author_github_username as string,
              reputation: Number(s.author_reputation),
            }
          : null,
      votes: votesBySolution.get(s.id as string) ?? [],
    }));

    return { ...bug, author, solutions };
  }

  async create(dto: CreateBugDto, authorUserId: string): Promise<BugPublic> {
    const id = randomUUID();
    const envJson = JSON.stringify(dto.environment ?? {});
    const status = dto.status ?? BugStatus.open;
    await this.db.execute(
      `INSERT INTO bugs (id, title, description, library, version, environment, status, author_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dto.title, dto.description, dto.library, dto.version, envJson, status, authorUserId],
    );
    const rows = await this.db.query<RowDataPacket[]>('SELECT * FROM bugs WHERE id = ?', [id]);
    return mapBugRow(rows[0]);
  }

  /** Vérifie l’existence du bug (léger, pour le graphe). */
  private async assertBugExists(id: string): Promise<void> {
    const rows = await this.db.query<RowDataPacket[]>('SELECT id FROM bugs WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) {
      throw new NotFoundException(`Bug ${id} introuvable`);
    }
  }

  /** Voisins du graphe « similaires » (arêtes sortantes + entrantes). */
  async similar(id: string): Promise<BugPublic[]> {
    await this.assertBugExists(id);
    const rels = await this.db.query<RowDataPacket[]>(
      'SELECT from_bug_id, to_bug_id FROM bug_relations WHERE from_bug_id = ? OR to_bug_id = ?',
      [id, id],
    );
    const relatedIds = new Set<string>();
    for (const r of rels) {
      const from = r.from_bug_id as string;
      const to = r.to_bug_id as string;
      const other = from === id ? to : from;
      relatedIds.add(other);
    }
    if (!relatedIds.size) {
      return [];
    }
    const ids = [...relatedIds];
    const ph = ids.map(() => '?').join(',');
    const rows = await this.db.query<RowDataPacket[]>(`SELECT * FROM bugs WHERE id IN (${ph})`, ids);
    return rows.map(mapBugRow);
  }

  async updateStatusByGithubIssue(repoFullName: string, issueNumber: bigint, status: BugStatus) {
    await this.db.execute(
      'UPDATE bugs SET status = ? WHERE github_repo_full_name = ? AND github_issue_id = ?',
      [status, repoFullName, issueNumber],
    );
  }

  async linkGithubIssue(bugId: string, repoFullName: string, issueNumber: bigint): Promise<BugPublic> {
    await this.db.execute(
      'UPDATE bugs SET github_repo_full_name = ?, github_issue_id = ? WHERE id = ?',
      [repoFullName, issueNumber, bugId],
    );
    const rows = await this.db.query<RowDataPacket[]>('SELECT * FROM bugs WHERE id = ?', [bugId]);
    if (!rows.length) {
      throw new NotFoundException(`Bug ${bugId} introuvable`);
    }
    return mapBugRow(rows[0]);
  }
}
