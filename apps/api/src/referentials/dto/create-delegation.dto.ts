import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDelegationDto {
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
  gouvernoratId!: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}