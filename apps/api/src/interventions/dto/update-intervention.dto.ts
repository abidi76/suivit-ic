import { IsOptional, IsUUID, IsString } from 'class-validator';

export class UpdateInterventionDto {
  @IsOptional()
  @IsUUID()
  ticketId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}