import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EquipmentService, EquipmentFilters } from './equipment.service';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { ReformerEquipmentDto } from './dto/reformer-equipment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { EquipmentState, Role } from '../generated/prisma/client';

@Controller('equipment')
export class EquipmentController {
  constructor(private service: EquipmentService) {}

  /**
   * GET /equipment
   * Liste les equipements avec filtres.
   */
  @Get()
  findAll(
    @Query('etablissementId') etablissementId?: string,
    @Query('laboId') laboId?: string,
    @Query('typeId') typeId?: string,
    @Query('marqueId') marqueId?: string,
    @Query('etat') etat?: EquipmentState,
    @Query('proprietaireId') proprietaireId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: JwtUser,
  ) {
    const filters: EquipmentFilters = {
      etablissementId,
      laboId,
      typeId,
      marqueId,
      etat,
      proprietaireId,
      search,
    };

    return this.service.findAll(
      filters,
      user!.role as Role,
      user!.creId,
      user!.etablissementId,
      user!.laboId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  /**
   * GET /equipment/stats
   * Statistiques par etat, type, marque.
   */
  @Get('stats')
  stats(@CurrentUser() user: JwtUser) {
    return this.service.stats(
      user.role as Role,
      user.creId,
      user.etablissementId,
    );
  }

  /**
   * GET /equipment/by-serial/:numeroSerie
   * Recherche par numero de serie.
   */
  @Get('by-serial/:numeroSerie')
  findByNumeroSerie(@Param('numeroSerie') numeroSerie: string) {
    return this.service.findByNumeroSerie(numeroSerie);
  }

  /**
   * GET /equipment/:id
   * Fiche detaillee.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * PATCH /equipment/:id
   * Modifier (etat, labo, motif reforme).
   */
  @Roles(Role.ADMIN_CENTRAL, Role.SOUS_DIRECTEUR_TIC, Role.TECHNICIEN_INTERNE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEquipmentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.update(id, dto, user.role as Role);
  }

  /**
   * POST /equipment/:id/reformer
   * Reforme un equipement (admin central uniquement).
   */
  @Roles(Role.ADMIN_CENTRAL)
  @Post(':id/reformer')
  reformer(
    @Param('id') id: string,
    @Body() dto: ReformerEquipmentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.reformer(id, dto, user.role as Role);
  }
}