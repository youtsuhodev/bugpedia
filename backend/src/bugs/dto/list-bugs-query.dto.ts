import { BugStatus } from '../../common/bug-status';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListBugsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  library?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  version?: string;

  /** Recherche plein texte simple (titre + description), sous-chaîne. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  /** Filtre JSON : chaîne présente dans la sérialisation de `environment` (MVP). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  environmentContains?: string;

  @IsOptional()
  @IsEnum(BugStatus)
  status?: BugStatus;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  offset?: number;
}
