import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { BugStatus } from '../common/bug-status';
import { Request } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { BugsService } from '../bugs/bugs.service';

/**
 * Webhook GitHub : issues + pull_request (MVP).
 * Nécessite `rawBody: true` dans NestFactory (voir main.ts) pour valider la signature.
 */
@Controller('webhooks')
export class GithubWebhookController {
  constructor(private readonly bugs: BugsService) {}

  @Post('github')
  async handle(
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Headers('x-github-event') event: string | undefined,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    const raw = req.rawBody;
    if (secret && raw) {
      if (!signature?.startsWith('sha256=')) {
        throw new BadRequestException('Signature manquante');
      }
      const expected = createHmac('sha256', secret).update(raw).digest('hex');
      const actual = signature.slice('sha256='.length);
      const a = Buffer.from(expected, 'utf8');
      const b = Buffer.from(actual, 'utf8');
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        throw new BadRequestException('Signature invalide');
      }
    }

    const payload = req.body as Record<string, unknown>;
    if (event === 'issues') {
      await this.handleIssue(payload);
    }
    if (event === 'pull_request') {
      await this.handlePullRequest(payload);
    }
    return { ok: true };
  }

  private async handleIssue(payload: Record<string, unknown>) {
    const action = payload.action as string | undefined;
    const issue = payload.issue as { number?: number; state?: string } | undefined;
    const repo = payload.repository as { full_name?: string } | undefined;
    if (!issue?.number || !repo?.full_name) {
      return;
    }
    const issueNumber = BigInt(issue.number);
    if (action === 'closed' || issue.state === 'closed') {
      await this.bugs.updateStatusByGithubIssue(repo.full_name, issueNumber, BugStatus.closed);
    }
    if (action === 'reopened') {
      await this.bugs.updateStatusByGithubIssue(repo.full_name, issueNumber, BugStatus.open);
    }
  }

  private async handlePullRequest(payload: Record<string, unknown>) {
    const action = payload.action as string | undefined;
    if (action !== 'closed') {
      return;
    }
    const pr = payload.pull_request as { merged?: boolean; number?: number } | undefined;
    const repo = payload.repository as { full_name?: string } | undefined;
    if (!pr?.merged || !pr.number || !repo?.full_name) {
      return;
    }
    // Point d’extension : lier PR -> solution / statut bug via parsing du corps de PR.
  }
}
