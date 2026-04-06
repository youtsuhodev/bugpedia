import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { MysqlService } from '../database/mysql.service';

@Controller('users')
export class UsersController {
  constructor(private readonly db: MysqlService) {}

  @Get(':id')
  async profile(@Param('id') id: string) {
    const users = await this.db.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    if (!users.length) {
      throw new NotFoundException(`Utilisateur ${id} introuvable`);
    }
    const u = users[0];

    const cntRows = await this.db.query<RowDataPacket[]>(
      `SELECT
         (SELECT COUNT(*) FROM solutions WHERE author_user_id = ?) AS solutions,
         (SELECT COUNT(*) FROM bugs WHERE author_user_id = ?) AS reported_bugs,
         (SELECT COUNT(*) FROM votes WHERE user_id = ?) AS votes`,
      [id, id, id],
    );
    const c = cntRows[0];

    return {
      id: u.id,
      githubUsername: u.github_username,
      reputation: Number(u.reputation),
      contributions: Number(u.contributions),
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      _count: {
        solutions: Number(c.solutions),
        reportedBugs: Number(c.reported_bugs),
        votes: Number(c.votes),
      },
    };
  }
}
