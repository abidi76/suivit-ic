import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { EquipmentState } from '../../../generated/prisma/client';

export class UpdateEquipmentDto {
  @IsEnum(EquipmentState, { message: 'Etat invalide.' })
  @IsOptional()
  etat?: EquipmentState;

  @IsString()
  @IsOptional()
  laboId?: string;

  @IsString()
  @IsOptional()
  motifReforme?: string;
}