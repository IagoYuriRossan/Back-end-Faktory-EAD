import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  sortOrder?: number;

  @IsString()
  @IsOptional()
  videoUrl?: string;
}
