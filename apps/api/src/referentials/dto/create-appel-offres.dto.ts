import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAppelOffresDto {
  @IsString()
  @IsNotEmpty()
  numero!: string;

  @IsString()
  @IsOptional()
  objet?: string;

  @IsOptional()
  dateDebut?: string | Date;

  @IsOptional()
  dateFin?: string | Date;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}