import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignTrajetDto {
  @IsUUID()
  @IsNotEmpty()
  trajetId!: string;

  @IsUUID()
  @IsNotEmpty()
  destinationId!: string;
}