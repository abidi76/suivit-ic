import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReclamationStatut } from '../../generated/prisma/client';

export class DecisionSdTicDto {
  @IsEnum(ReclamationStatut)
  @IsNotEmpty()
  statut!: ReclamationStatut; // AJOURNEE, ANNULEE, ou CLOTUREE

  @IsOptional()
  @IsString()
  motifDecision?: string;
}