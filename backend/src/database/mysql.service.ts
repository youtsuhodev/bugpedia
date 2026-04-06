import { Injectable, OnModuleDestroy } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { createPool } from 'mysql2/promise';

/** Valeurs acceptées par `mysql2` pour les placeholders `?`. */
export type SqlValue = string | number | bigint | boolean | Date | Buffer | null;
export type SqlParams = ReadonlyArray<SqlValue>;

@Injectable()
export class MysqlService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    this.pool = createPool({
      host: process.env.MYSQL_HOST ?? '127.0.0.1',
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: process.env.MYSQL_DATABASE ?? 'bugpedia',
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10),
      namedPlaceholders: false,
    });
  }

  /** SELECT et requêtes renvoyant des lignes. */
  async query<T extends RowDataPacket[]>(sql: string, params: SqlParams = []): Promise<T> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(sql, [...params]);
    return rows as T;
  }

  /** INSERT / UPDATE / DELETE — entête de résultat. */
  async execute(sql: string, params: SqlParams = []): Promise<ResultSetHeader> {
    const [res] = await this.pool.execute<ResultSetHeader>(sql, [...params]);
    return res;
  }

  async getConnection() {
    return this.pool.getConnection();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
