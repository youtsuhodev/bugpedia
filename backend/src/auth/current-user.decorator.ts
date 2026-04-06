import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import type { UserEntity } from '../types/user.entity';
import { BUGPEDIA_USER_KEY } from './github-auth.guard';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): UserEntity => {
  const req = ctx.switchToHttp().getRequest<Request & { [BUGPEDIA_USER_KEY]?: UserEntity }>();
  const user = req[BUGPEDIA_USER_KEY];
  if (!user) {
    throw new Error('CurrentUser utilisé sans GithubAuthGuard');
  }
  return user;
});
