import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEtablissementDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  nomFr!: string;

  @IsString()
  @IsNotEmpty()
  nomAr!: string;

  @IsString()
  @IsNotEmpty()
  delegationId!: string;

  // Le creId est normalement déduit du gouvernorat,
  // mais on peut le fournir explicitement (pour performance)
  @IsString()
  @IsOptional()
  creId?: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}