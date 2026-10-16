import { IsOptional, IsString } from 'class-validator';

export class ValiderInterventionDto {
  @IsOptional()
  @IsString()
  commentaire?: string;
}