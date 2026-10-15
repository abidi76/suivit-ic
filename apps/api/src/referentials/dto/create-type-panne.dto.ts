import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTypePanneDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  libelle!: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}