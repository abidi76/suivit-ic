import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  ancienMotDePasse!: string;

  @IsString()
  @MinLength(8)
  nouveauMotDePasse!: string;
}
