import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDirectionDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}