import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFournisseurDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}