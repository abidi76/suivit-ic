import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CloturerTicketDto {
  /** Règle 14.2 : numéro de série obligatoire pour la clôture */
  @IsString()
  @IsNotEmpty({ message: 'Le numero de serie est obligatoire pour clôturer un ticket.' })
  numeroSerie!: string;

  /** Règle 14.2 : note de satisfaction de 1 à 5 */
  @IsInt()
  @Min(1, { message: 'La note doit être entre 1 et 5.' })
  @Max(5, { message: 'La note doit être entre 1 et 5.' })
  noteSatisfaction!: number;

  @IsString()
  @IsOptional()
  commentaireCloture?: string;
}