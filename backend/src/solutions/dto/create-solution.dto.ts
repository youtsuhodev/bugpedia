import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSolutionDto {
  @IsString()
  @MinLength(5)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  author?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  githubPrLink?: string;
}
