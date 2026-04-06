import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { RowDataPacket } from 'mysql2/promise';
import { MysqlService } from '../database/mysql.service';
import type { UserEntity } from '../types/user.entity';

/** Utilisateur résolu depuis GitHub OAuth (token) ou mode dev. */
export type ResolvedUser = UserEntity;

function mapUser(r: RowDataPacket): UserEntity {
  return {
    id: r.id as string,
    githubUsername: r.github_username as string,
    reputation: Number(r.reputation),
    contributions: Number(r.contributions),
    createdAt: r.created_at as Date,
    updatedAt: r.updated_at as Date,
  };
}

@Injectable()
export class AuthService {
  constructor(private readonly db: MysqlService) {}

  private async findByGithubUsername(username: string): Promise<UserEntity | null> {
    const rows = await this.db.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE github_username = ? LIMIT 1',
      [username],
    );
    return rows.length ? mapUser(rows[0]) : null;
  }

  private async ensureUser(githubUsername: string): Promise<UserEntity> {
    let user = await this.findByGithubUsername(githubUsername);
    if (user) {
      return user;
    }
    const id = randomUUID();
    await this.db.execute(
      'INSERT INTO users (id, github_username, reputation, contributions) VALUES (?, ?, 0, 0)',
      [id, githubUsername],
    );
    user = await this.findByGithubUsername(githubUsername);
    if (!user) {
      throw new Error('Impossible de créer ou relire l’utilisateur');
    }
    return user;
  }

  /**
   * Résout l’utilisateur à partir de l’en-tête Authorization: Bearer <token_github>.
   * En dev, DEV_SKIP_AUTH=true crée / réutilise un utilisateur fictif.
   */
  async resolveUser(authorizationHeader?: string): Promise<ResolvedUser | null> {
    if (process.env.DEV_SKIP_AUTH === 'true') {
      const username = process.env.DEV_GITHUB_USERNAME || 'dev-local';
      return this.ensureUser(username);
    }

    if (!authorizationHeader?.startsWith('Bearer ')) {
      return null;
    }
    const token = authorizationHeader.slice('Bearer '.length).trim();
    if (!token) {
      return null;
    }

    const res = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!res.ok) {
      throw new UnauthorizedException('Token GitHub invalide ou expiré');
    }

    const body = (await res.json()) as { login: string };
    return this.ensureUser(body.login);
  }

  async requireUser(authorizationHeader?: string): Promise<ResolvedUser> {
    const user = await this.resolveUser(authorizationHeader);
    if (!user) {
      throw new UnauthorizedException('Authentification GitHub requise');
    }
    return user;
  }
}
