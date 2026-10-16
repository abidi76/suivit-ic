import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InterventionsService } from './interventions.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { CreateLigneDto } from './dto/create-ligne.dto';
import { UpdateLigneDto } from './dto/update-ligne.dto';
import { AddPieceDto } from './dto/add-piece.dto';
import { ValiderInterventionDto } from './dto/valider-intervention.dto';
import { RefuserInterventionDto } from './dto/refuser-intervention.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { InterventionStatut, Role } from '../../generated/prisma/client';

@Controller('interventions')
export class InterventionsController {
  constructor(private service: InterventionsService) {}

  /**
   * POST /interventions
   * Creer une fiche avec plusieurs lignes (equipement + action).
   */
  @Roles(Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE, Role.ADMIN_CENTRAL)
  @Post()
  create(@Body() dto: CreateInterventionDto, @CurrentUser() user: JwtUser) {
    return this.service.create(dto, user);
  }

  /**
   * GET /interventions
   */
  @Get()
  findAll(
    @Query('statut') statut?: InterventionStatut,
    @Query('technicienId') technicienId?: string,
    @Query('equipmentId') equipmentId?: string,
    @Query('ticketId') ticketId?: string,
    @Query('etablissementId') etablissementId?: string,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.service.findAll(
      { statut, technicienId, equipmentId, ticketId, etablissementId },
      user,
    );
  }

  /**
   * GET /interventions/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * PATCH /interventions/:id
   * Modifier les metadonnees (brouillon uniquement).
   */
  @Roles(Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE, Role.ADMIN_CENTRAL)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInterventionDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.update(id, dto, user.id);
  }

  /**
   * POST /interventions/:id/lignes
   * Ajouter une ligne (equipement + action).
   */
  @Roles(Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE, Role.ADMIN_CENTRAL)
  @Post(':id/lignes')
  addLigne(
    @Param('id') id: string,
    @Body() dto: CreateLigneDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.addLigne(id, dto, user.id);
  }

  /**
   * PATCH /interventions/lignes/:ligneId
   */
  @Roles(Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE, Role.ADMIN_CENTRAL)
  @Patch('lignes/:ligneId')
  updateLigne(
    @Param('ligneId') ligneId: string,
    @Body() dto: UpdateLigneDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.updateLigne(ligneId, dto, user.id);
  }

  /**
   * DELETE /interventions/lignes/:ligneId
   */
  @Roles(Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE, Role.ADMIN_CENTRAL)
  @Delete('lignes/:ligneId')
  removeLigne(@Param('ligneId') ligneId: string, @CurrentUser() user: JwtUser) {
    return this.service.removeLigne(ligneId, user.id);
  }

  /**
   * POST /interventions/lignes/:ligneId/pieces
   * Ajouter une piece a une ligne.
   */
  @Roles(Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE, Role.ADMIN_CENTRAL)
  @Post('lignes/:ligneId/pieces')
  addPiece(
    @Param('ligneId') ligneId: string,
    @Body() dto: AddPieceDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.addPiece(ligneId, dto, user.id);
  }

  /**
   * DELETE /interventions/pieces/:pieceId
   */
  @Roles(Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE, Role.ADMIN_CENTRAL)
  @Delete('pieces/:pieceId')
  removePiece(@Param('pieceId') pieceId: string, @CurrentUser() user: JwtUser) {
    return this.service.removePiece(pieceId, user.id);
  }

  /**
   * POST /interventions/:id/soumettre
   */
  @Roles(Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE, Role.ADMIN_CENTRAL)
  @Post(':id/soumettre')
  soumettre(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.soumettre(id, user.id);
  }

  /**
   * POST /interventions/:id/valider
   * Regle 7.7 : validation par le directeur de l'etablissement.
   */
  @Roles(Role.DIRECTEUR_ETABLISSEMENT, Role.ADMIN_CENTRAL)
  @Post(':id/valider')
  valider(
    @Param('id') id: string,
    @Body() dto: ValiderInterventionDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.valider(id, dto, user);
  }

  /**
   * POST /interventions/:id/refuser
   */
  @Roles(Role.DIRECTEUR_ETABLISSEMENT, Role.ADMIN_CENTRAL)
  @Post(':id/refuser')
  refuser(
    @Param('id') id: string,
    @Body() dto: RefuserInterventionDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.refuser(id, dto, user);
  }
}