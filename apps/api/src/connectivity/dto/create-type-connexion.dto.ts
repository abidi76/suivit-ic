import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTypeConnexionDto {
  @IsString()
  code: string; // ex: FIBRE, ADSL, FLYBOX

  @IsString()
  libelle: string; // ex: Fibre optique

  @IsOptional()
  @IsString()
  formatIdentifiant?: string; // ex: FO/AAAA/NNNN

  @IsOptional()
  @IsString()
  exempleIdentifiant?: string; // ex: FO/2023/2958

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}