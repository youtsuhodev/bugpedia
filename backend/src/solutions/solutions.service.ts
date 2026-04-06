import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { RowDataPacket } from 'mysql2/promise';
import { MysqlService } from '../database/mysql.service';
import { CreateSolutionDto } from './dto/create-solution.dto';

function mapSolutionRow(r: RowDataPacket) {
  return {
    id: r.id as string,
    bugId: r.bug_id as string,
    content: r.content as string,
    authorUserId: r.author_user_id != null ? String(r.author_user_id) : null,
    authorDisplay: r.author_display != null ? String(r.author_display) : null,
    isVerified: Boolean(r.is_verified),
    verificationCount: Number(r.verification_count),
    githubPrLink: r.github_pr_link != null ? String(r.github_pr_link) : null,
    createdAt: r.created_at as Date,
    updatedAt: r.updated_at as Date,
  };
}

@Injectable()
export class SolutionsService {
  constructor(private readonly db: MysqlService) {}

  async createForBug(bugId: string, dto: CreateSolutionDto, authorUserId: string) {
    const bugs = await this.db.query<RowDataPacket[]>('SELECT id FROM bugs WHERE id = ? LIMIT 1', [bugId]);
    if (!bugs.length) {
      throw new NotFoundException(`Bug ${bugId} introuvable`);
    }
    const id = randomUUID();
    await this.db.execute(
      `INSERT INTO solutions (id, bug_id, content, author_user_id, author_display, github_pr_link, is_verified, verification_count)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
      [id, bugId, dto.content, authorUserId, dto.author ?? null, dto.githubPrLink ?? null],
    );
    const rows = await this.db.query<RowDataPacket[]>('SELECT * FROM solutions WHERE id = ?', [id]);
    return mapSolutionRow(rows[0]);
  }

  /**
   * Incrémente verification_count ; à partir de 3, marque cette solution vérifiée
   * et retire le flag des autres solutions du même bug (règle métier unique).
   */
  async verify(solutionId: string, verifierUserId: string) {
    const before = await this.db.query<RowDataPacket[]>(
      'SELECT id, bug_id FROM solutions WHERE id = ? LIMIT 1',
      [solutionId],
    );
    if (!before.length) {
      throw new NotFoundException(`Solution ${solutionId} introuvable`);
    }
    const bugId = before[0].bug_id as string;

    const conn = await this.db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(
        'UPDATE solutions SET verification_count = verification_count + 1 WHERE id = ?',
        [solutionId],
      );

      const [afterPacket] = await conn.execute(
        'SELECT verification_count, is_verified FROM solutions WHERE id = ? LIMIT 1',
        [solutionId],
      );
      const afterRows = afterPacket as RowDataPacket[];
      const after = afterRows[0];
      const count = Number(after.verification_count);

      if (count < 3) {
        await conn.commit();
        const out = await this.db.query<RowDataPacket[]>('SELECT * FROM solutions WHERE id = ?', [solutionId]);
        return mapSolutionRow(out[0]);
      }

      await conn.execute(
        'UPDATE solutions SET is_verified = 0 WHERE bug_id = ? AND id <> ?',
        [bugId, solutionId],
      );
      await conn.execute('UPDATE solutions SET is_verified = 1 WHERE id = ?', [solutionId]);

      if (count === 3) {
        await conn.execute(
          'UPDATE users SET reputation = reputation + 2, contributions = contributions + 1 WHERE id = ?',
          [verifierUserId],
        );
      }

      await conn.commit();

      const out = await this.db.query<RowDataPacket[]>('SELECT * FROM solutions WHERE id = ?', [solutionId]);
      return mapSolutionRow(out[0]);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
}
