import { IsOptional, IsUUID, IsString } from 'class-validator';

export class UpdateLigneDto {
  @IsOptional()
  @IsUUID()
  equipmentId?: string;

  @IsOptional()
  @IsUUID()
  actionId?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
}