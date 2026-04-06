import { BugStatus } from '../../common/bug-status';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBugDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsString()
  @MaxLength(255)
  library!: string;

  @IsString()
  @MaxLength(100)
  version!: string;

  @IsObject()
  environment!: Record<string, unknown>;

  @IsOptional()
  @IsEnum(BugStatus)
  status?: BugStatus;
}
