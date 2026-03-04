import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  questionnaireId: string;

  @IsUUID()
  questionId: string;

  @IsUUID()
  @IsOptional()
  selectedOptionId?: string;

  @IsString()
  @IsOptional()
  answerText?: string;
}
