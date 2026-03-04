import { IsOptional, IsString } from 'class-validator';

export class UpdateQuestionnaireDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
