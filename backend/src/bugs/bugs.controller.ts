import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import type { UserEntity } from '../types/user.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { GithubAuthGuard } from '../auth/github-auth.guard';
import { BugsService } from './bugs.service';
import { SolutionsService } from '../solutions/solutions.service';
import { CreateSolutionDto } from '../solutions/dto/create-solution.dto';
import { CreateBugDto } from './dto/create-bug.dto';
import { ListBugsQueryDto } from './dto/list-bugs-query.dto';

@Controller('bugs')
export class BugsController {
  constructor(
    private readonly bugs: BugsService,
    private readonly solutions: SolutionsService,
  ) {}

  @Get()
  list(@Query() query: ListBugsQueryDto) {
    return this.bugs.list(query);
  }

  /** Route statique avant :id pour éviter que « similar » soit pris comme UUID. */
  @Get(':id/similar')
  similar(@Param('id') id: string) {
    return this.bugs.similar(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bugs.findOne(id);
  }

  @Post()
  @UseGuards(GithubAuthGuard)
  create(@Body() dto: CreateBugDto, @CurrentUser() user: UserEntity) {
    return this.bugs.create(dto, user.id);
  }

  @Post(':id/solutions')
  @UseGuards(GithubAuthGuard)
  addSolution(
    @Param('id') bugId: string,
    @Body() dto: CreateSolutionDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.solutions.createForBug(bugId, dto, user.id);
  }
}
