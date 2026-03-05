import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserRole } from '@prisma/client';
import { FrontendRole } from '../../common/utils/role-mapper';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(FrontendRole)
  role?: FrontendRole | UserRole | string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  avatar?: string;
}
