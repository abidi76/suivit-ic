import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ConnectivityService } from './connectivity.service';
import { CreateTypeConnexionDto } from './dto/create-type-connexion.dto';
import { UpdateTypeConnexionDto } from './dto/update-type-connexion.dto';
import { CreateCircuitReseauDto } from './dto/create-circuit-reseau.dto';
import { UpdateCircuitReseauDto } from './dto/update-circuit-reseau.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/client';

@Controller('connectivity')
export class ConnectivityController {
  constructor(private readonly connectivityService: ConnectivityService) {}

  // --- TYPES DE CONNEXION ---

  @Post('types-connexion')
  @Roles(Role.ADMIN_CENTRAL) // Seul l'admin central crée les référentiels
  createTypeConnexion(@Body() dto: CreateTypeConnexionDto) {
    return this.connectivityService.createTypeConnexion(dto);
  }

  @Get('types-connexion')
  findAllTypesConnexion() {
    return this.connectivityService.findAllTypesConnexion();
  }

  @Patch('types-connexion/:id')
  @Roles(Role.ADMIN_CENTRAL)
  updateTypeConnexion(@Param('id') id: string, @Body() dto: UpdateTypeConnexionDto) {
    return this.connectivityService.updateTypeConnexion(id, dto);
  }

  // --- CIRCUITS RÉSEAU ---

  @Post('circuits')
  @Roles(Role.ADMIN_CENTRAL, Role.SOUS_DIRECTEUR_TIC)
  createCircuit(@Body() dto: CreateCircuitReseauDto) {
    return this.connectivityService.createCircuit(dto);
  }

  @Get('circuits')
  findAllCircuits(@Query('etablissementId') etablissementId?: string) {
    return this.connectivityService.findAllCircuits(etablissementId);
  }

  @Get('circuits/:id')
  findOneCircuit(@Param('id') id: string) {
    return this.connectivityService.findOneCircuit(id);
  }

  @Patch('circuits/:id')
  @Roles(Role.ADMIN_CENTRAL, Role.SOUS_DIRECTEUR_TIC)
  updateCircuit(@Param('id') id: string, @Body() dto: UpdateCircuitReseauDto) {
    return this.connectivityService.updateCircuit(id, dto);
  }

  @Delete('circuits/:id')
  @Roles(Role.ADMIN_CENTRAL)
  removeCircuit(@Param('id') id: string) {
    return this.connectivityService.removeCircuit(id);
  }
}