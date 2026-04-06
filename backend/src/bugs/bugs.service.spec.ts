import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BugStatus } from '../common/bug-status';
import { MysqlService } from '../database/mysql.service';
import { BugsService } from './bugs.service';

describe('BugsService', () => {
  let service: BugsService;
  const mysql = {
    query: jest.fn(),
    execute: jest.fn(),
    getConnection: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        BugsService,
        { provide: MysqlService, useValue: mysql },
      ],
    }).compile();
    service = moduleRef.get(BugsService);
  });

  it('list interroge la table bugs avec LIMIT/OFFSET', async () => {
    mysql.query.mockResolvedValue([]);
    await service.list({ library: 'react', q: 'leak', limit: 10, offset: 0 });
    expect(mysql.query).toHaveBeenCalledWith(
      expect.stringMatching(/FROM bugs b/),
      expect.arrayContaining(['react', '%leak%', '%leak%', 10, 0]),
    );
  });

  it('findOne lève NotFoundException si absent', async () => {
    mysql.query.mockResolvedValueOnce([]);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create insère puis relit le bug', async () => {
    mysql.execute.mockResolvedValue({ affectedRows: 1 });
    mysql.query.mockImplementation(async (sql: string, params: unknown[]) => {
      if (String(sql).includes('SELECT * FROM bugs WHERE id = ?')) {
        const id = params[0] as string;
        return [
          {
            id,
            title: 't',
            description: 'd'.repeat(15),
            library: 'react',
            version: '18',
            environment: '{}',
            status: BugStatus.open,
            author_user_id: 'user-1',
            github_issue_id: null,
            github_repo_full_name: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];
      }
      return [];
    });
    const dto = {
      title: 't',
      description: 'd'.repeat(15),
      library: 'react',
      version: '18',
      environment: { os: 'linux' },
    };
    const out = await service.create(dto as never, 'user-1');
    expect(out.title).toBe('t');
    expect(mysql.execute).toHaveBeenCalled();
  });
});
