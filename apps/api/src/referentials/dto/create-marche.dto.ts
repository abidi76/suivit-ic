import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMarcheDto {
  @IsString()
  @IsNotEmpty()
  numero!: string;

  @IsString()
  @IsNotEmpty()
  societeId!: string;

  @IsOptional()
  dateDebut?: string | Date;

  @IsOptional()
  dateFin?: string | Date;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}