import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import type { UserEntity } from '../types/user.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { GithubAuthGuard } from '../auth/github-auth.guard';
import { SolutionsService } from './solutions.service';

@Controller('solutions')
export class SolutionsController {
  constructor(private readonly solutions: SolutionsService) {}

  @Post(':id/verify')
  @UseGuards(GithubAuthGuard)
  verify(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.solutions.verify(id, user.id);
  }
}
