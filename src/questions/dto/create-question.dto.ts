import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';

export class CreateOptionDto {
  @IsString()
  @IsNotEmpty()
  optionText: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsInt()
  @IsPositive()
  sortOrder: number;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @IsInt()
  @IsPositive()
  sortOrder: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  points?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}
