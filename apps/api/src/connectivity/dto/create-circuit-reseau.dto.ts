import { IsString, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { CircuitStatut } from '../../generated/prisma/client';

export class CreateCircuitReseauDto {
  @IsUUID()
  etablissementId: string;

  @IsUUID()
  typeConnexionId: string;

  @IsString()
  identifiant: string; // Numéro FO, numéro de tel, ou numéro de série Flybox

  @IsOptional()
  @IsEnum(CircuitStatut)
  statut?: CircuitStatut;

  @IsOptional()
  @IsString()
  fournisseur?: string;

  @IsOptional()
  @IsString()
  debit?: string;

  @IsOptional()
  @IsDateString()
  dateActivation?: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @IsOptional()
  @IsUUID()
  proprietaireEtablissementId?: string;
}