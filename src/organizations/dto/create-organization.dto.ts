import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Matches(/^[0-9]{14}$|^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2}$/, {
    message: 'CNPJ deve estar no formato 00000000000000 ou 00.000.000/0000-00.',
  })
  cnpj: string;
}
