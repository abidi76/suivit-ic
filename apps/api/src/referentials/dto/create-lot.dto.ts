import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLotDto {
  @IsString()
  @IsNotEmpty()
  appelOffresId!: string;

  @IsString()
  @IsNotEmpty()
  numero!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  quantiteMax?: number;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}