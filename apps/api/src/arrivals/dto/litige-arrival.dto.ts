import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LitigeArrivalDto {
  @IsString()
  @IsNotEmpty()
  motif!: string;

  @IsString()
  @IsOptional()
  resolution?: string;
}