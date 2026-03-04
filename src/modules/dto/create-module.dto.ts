import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsPositive()
  sortOrder: number;
}
