import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CourseStatus } from '@prisma/client';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;
}
