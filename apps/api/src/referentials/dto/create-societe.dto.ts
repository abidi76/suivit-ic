import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSocieteDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsString()
  @IsOptional()
  matricule?: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}