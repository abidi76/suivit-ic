import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TrajetMotif } from '../../generated/prisma/client';

export class TrajetDestinationDto {
  @IsUUID()
  @IsNotEmpty()
  etablissementId!: string;

  @IsInt()
  @IsNotEmpty()
  ordre!: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  reclamationIds?: string[];
}

export class CreateTrajetDto {
  @IsEnum(TrajetMotif)
  @IsNotEmpty()
  motif!: TrajetMotif;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  dateDepart!: string;

  @IsOptional()
  @IsDateString()
  dateRetour?: string;

  @IsOptional()
  @IsInt()
  dureeEstimee?: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  technicienIds!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrajetDestinationDto)
  @IsNotEmpty()
  destinations!: TrajetDestinationDto[];
}