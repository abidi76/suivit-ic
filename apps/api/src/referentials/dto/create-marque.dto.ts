import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMarqueDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}