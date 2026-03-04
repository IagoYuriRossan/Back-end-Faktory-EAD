import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { QuestionType } from '@prisma/client';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  prompt?: string;

  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @IsInt()
  @IsPositive()
  @IsOptional()
  sortOrder?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  points?: number;
}
