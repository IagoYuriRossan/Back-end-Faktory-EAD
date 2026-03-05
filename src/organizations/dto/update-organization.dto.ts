import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { OrganizationStatus } from '@prisma/client';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  licensesTotal?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  licensesUsed?: number;
}
