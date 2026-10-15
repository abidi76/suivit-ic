import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArrivalItemDto {
  @IsString()
  @IsNotEmpty()
  numeroSerie!: string;

  @IsString()
  @IsNotEmpty()
  marqueId!: string;

  @IsString()
  @IsNotEmpty()
  modeleId!: string;

  @IsString()
  @IsNotEmpty()
  typeId!: string;

  @IsString()
  @IsNotEmpty()
  appelOffresId!: string;

  @IsString()
  @IsOptional()
  lotId?: string;
}

export class CreateArrivalDto {
  @IsString()
  @IsNotEmpty()
  designation!: string;

  @IsString()
  @IsOptional()
  bonLivraison?: string;

  @IsString()
  @IsNotEmpty()
  etablissementId!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Au moins un equipement est requis.' })
  @ValidateNested({ each: true })
  @Type(() => CreateArrivalItemDto)
  items!: CreateArrivalItemDto[];
}