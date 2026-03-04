import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateModuleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  sortOrder?: number;
}
