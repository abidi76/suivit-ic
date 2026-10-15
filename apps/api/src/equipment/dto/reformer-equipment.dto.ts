import { IsNotEmpty, IsString } from 'class-validator';

export class ReformerEquipmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Le motif de reforme est obligatoire.' })
  motif!: string;
}