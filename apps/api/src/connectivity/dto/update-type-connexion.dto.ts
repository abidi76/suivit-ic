import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeConnexionDto } from './create-type-connexion.dto';

export class UpdateTypeConnexionDto extends PartialType(CreateTypeConnexionDto) {}