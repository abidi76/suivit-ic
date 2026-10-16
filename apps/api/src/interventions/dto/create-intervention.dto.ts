import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsBoolean,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInterventionPieceDto {
  @IsString()
  numeroSerie: string;

  @IsString()
  designation: string;

  @IsOptional()
  @IsUUID()
  pieceId?: string;

  @IsBoolean()
  ajoutee: boolean;
}

export class CreateInterventionLigneDto {
  @IsUUID()
  equipmentId: string;

  @IsUUID()
  actionId: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInterventionPieceDto)
  pieces?: CreateInterventionPieceDto[];
}

export class CreateInterventionDto {
  @IsUUID()
  etablissementId: string;

  @IsOptional()
  @IsUUID()
  ticketId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInterventionLigneDto)
  lignes: CreateInterventionLigneDto[];
}