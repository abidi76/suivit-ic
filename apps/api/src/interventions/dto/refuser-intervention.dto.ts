import { IsString, MinLength } from 'class-validator';

export class RefuserInterventionDto {
  @IsString()
  @MinLength(3)
  motif: string;
}