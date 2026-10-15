import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCreDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  designationFr!: string;

  @IsString()
  @IsNotEmpty()
  designationAr!: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}