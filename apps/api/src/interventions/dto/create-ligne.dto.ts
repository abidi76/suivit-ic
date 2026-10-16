import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateLigneDto {
  @IsUUID()
  equipmentId: string;

  @IsUUID()
  actionId: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
}