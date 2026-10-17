import { IsEnum, IsNotEmpty } from 'class-validator';
import { TrajetStatut } from '../../generated/prisma/client';

export class UpdateStatusTrajetDto {
  @IsEnum(TrajetStatut)
  @IsNotEmpty()
  statut!: TrajetStatut; // EN_COURS, TERMINE, ANNULE
}