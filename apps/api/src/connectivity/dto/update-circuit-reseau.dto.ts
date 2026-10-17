import { PartialType } from '@nestjs/mapped-types';
import { CreateCircuitReseauDto } from './create-circuit-reseau.dto';

export class UpdateCircuitReseauDto extends PartialType(CreateCircuitReseauDto) {}