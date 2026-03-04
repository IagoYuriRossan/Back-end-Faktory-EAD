import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsPositive()
  sortOrder: number;

  @IsString()
  @IsNotEmpty()
  videoUrl: string;
}
