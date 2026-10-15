import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ConfirmArrivalDto {
  @IsBoolean()
  @IsOptional()
  avecReserve?: boolean;

  @IsString()
  @IsOptional()
  motif?: string;
}