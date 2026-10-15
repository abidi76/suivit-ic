import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTypeJustificatifPerteDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  libelle!: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}