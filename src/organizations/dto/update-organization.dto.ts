import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrganizationStatus } from '@prisma/client';

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(OrganizationStatus)
  @IsOptional()
  status?: OrganizationStatus;
}
