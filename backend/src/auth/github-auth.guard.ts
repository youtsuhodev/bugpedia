import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

export const BUGPEDIA_USER_KEY = 'bugpediaUser';

@Injectable()
export class GithubAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = await this.auth.requireUser(req.headers.authorization);
    (req as Request & { [BUGPEDIA_USER_KEY]: unknown })[BUGPEDIA_USER_KEY] = user;
    return true;
  }
}

/** Si un Bearer est envoyé, résout l’utilisateur ; sinon laisse la requête passer. */
@Injectable()
export class GithubOptionalAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return true;
    }
    const user = await this.auth.resolveUser(header);
    (req as Request & { [BUGPEDIA_USER_KEY]?: unknown })[BUGPEDIA_USER_KEY] = user ?? undefined;
    return true;
  }
}
