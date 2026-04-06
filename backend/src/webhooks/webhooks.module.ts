import { Module } from '@nestjs/common';
import { BugsModule } from '../bugs/bugs.module';
import { GithubWebhookController } from './github-webhook.controller';

@Module({
  imports: [BugsModule],
  controllers: [GithubWebhookController],
})
export class WebhooksModule {}
