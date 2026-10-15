import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateActionMaintenanceDto {
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