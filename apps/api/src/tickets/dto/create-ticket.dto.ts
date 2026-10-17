import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Criticite } from '../../generated/prisma/client';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  etablissementId!: string;

  @IsString()
  @IsOptional()
  laboId?: string;

  @IsString()
  @IsOptional()
  equipmentId?: string;

  @IsString()
  @IsNotEmpty()
  typePanneId!: string;

  @IsEnum(Criticite, { message: 'Criticite invalide.' })
  @IsOptional()
  criticite?: Criticite;

  @IsBoolean()
  @IsOptional()
  bacPratique?: boolean;

  @IsString()
  @IsNotEmpty()
  description!: string;
}