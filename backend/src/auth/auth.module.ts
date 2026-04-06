import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GithubAuthGuard } from './github-auth.guard';

@Global()
@Module({
  providers: [AuthService, GithubAuthGuard],
  exports: [AuthService, GithubAuthGuard],
})
export class AuthModule {}
