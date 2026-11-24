import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(254)
  identifiant!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  motDePasse!: string;
}
