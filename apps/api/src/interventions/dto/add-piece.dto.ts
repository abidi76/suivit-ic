import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class AddPieceDto {
  @IsString()
  numeroSerie: string;

  @IsString()
  designation: string;

  @IsOptional()
  @IsUUID()
  pieceId?: string;

  @IsBoolean()
  ajoutee: boolean;
}