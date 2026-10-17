import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReclamationDto {
  @IsUUID()
  @IsNotEmpty()
  circuitId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}