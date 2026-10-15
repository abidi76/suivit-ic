import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateModeleDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsString()
  @IsNotEmpty()
  marqueId!: string;

  @IsString()
  @IsNotEmpty()
  typeId!: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}