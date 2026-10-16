import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Criticite, TicketStatut } from '../../../generated/prisma/client';

export class UpdateTicketDto {
  @IsEnum(TicketStatut)
  @IsOptional()
  statut?: TicketStatut;

  @IsEnum(Criticite)
  @IsOptional()
  criticite?: Criticite;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  equipmentId?: string;

  @IsString()
  @IsOptional()
  laboId?: string;
}