import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifiant!: string;

  @IsString()
  @IsNotEmpty()
  motDePasse!: string;
}