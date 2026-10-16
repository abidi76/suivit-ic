import { IsNotEmpty, IsString } from 'class-validator';

export class AssignerTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'Le technicien est obligatoire.' })
  technicienId!: string;
}