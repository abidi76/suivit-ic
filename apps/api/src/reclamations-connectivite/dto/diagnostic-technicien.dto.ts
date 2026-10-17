import { IsBoolean, IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

export class DiagnosticTechnicienDto {
  @IsOptional()
  @IsString()
  commentaireTechnicien?: string;

  @IsOptional()
  @IsBoolean()
  clotureParTechnicien?: boolean;

  @IsOptional()
  @IsArray()
  actions?: { actionId?: string; description: string }[];

  @IsOptional()
  @IsArray()
  pieces?: { numeroSerie: string; designation: string; ajoutee: boolean }[];
}