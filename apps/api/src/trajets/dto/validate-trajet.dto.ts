import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { TrajetStatut } from '../../generated/prisma/client';

export class ValidateTrajetDto {
  @IsEnum(TrajetStatut)
  @IsNotEmpty()
  statut!: TrajetStatut; // ACCEPTE ou REFUSE

  @IsOptional()
  @IsUUID()
  vehiculeId?: string;

  @IsOptional()
  @IsUUID()
  chauffeurId?: string;

  @IsOptional()
  @IsString()
  motifRefus?: string;
}