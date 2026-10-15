import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTypeEquipementDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}