import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BugsModule } from './bugs/bugs.module';
import { DatabaseModule } from './database/database.module';
import { SolutionsModule } from './solutions/solutions.module';
import { UsersModule } from './users/users.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    BugsModule,
    SolutionsModule,
    UsersModule,
    WebhooksModule,
  ],
})
export class AppModule {}
