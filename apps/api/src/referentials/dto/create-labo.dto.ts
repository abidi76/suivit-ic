import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLaboDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsString()
  @IsNotEmpty()
  etablissementId!: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}