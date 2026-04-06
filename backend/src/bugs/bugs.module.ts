import { Module } from '@nestjs/common';
import { SolutionsModule } from '../solutions/solutions.module';
import { BugsController } from './bugs.controller';
import { BugsService } from './bugs.service';

@Module({
  imports: [SolutionsModule],
  controllers: [BugsController],
  providers: [BugsService],
  exports: [BugsService],
})
export class BugsModule {}
