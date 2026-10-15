import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGouvernoratDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  nomFr!: string;

  @IsString()
  @IsNotEmpty()
  nomAr!: string;

  @IsString()
  @IsNotEmpty()
  creId!: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}