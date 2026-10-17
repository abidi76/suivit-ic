import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/client';
import { ReclamationsService } from './reclamations.service';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { AssignTrajetDto } from './dto/assign-trajet.dto';
import { DiagnosticTechnicienDto } from './dto/diagnostic-technicien.dto';
import { DecisionSdTicDto } from './dto/decision-sd-tic.dto';

@Controller('reclamations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReclamationsController {
  constructor(private readonly service: ReclamationsService) {}

  private actor(req: any) {
    return { userId: req.user.id, role: req.user.role, etablissementId: req.user.etablissementId };
  }

  @Post()
  @Roles(Role.PROF_RESPONSABLE, Role.DIRECTEUR_ETABLISSEMENT, Role.SUPERVISEUR_LOCAL)
  create(@Body() dto: CreateReclamationDto, @Req() req: any) {
    return this.service.create(dto, this.actor(req));
  }

  @Get()
  @Roles(Role.ADMIN_CENTRAL, Role.SOUS_DIRECTEUR_TIC, Role.PROF_RESPONSABLE, Role.DIRECTEUR_ETABLISSEMENT, Role.TECHNICIEN_INTERNE)
  findAll(@Req() req: any) {
    return this.service.findAll(this.actor(req));
  }

  @Post(':id/assign-trajet')
  @Roles(Role.SOUS_DIRECTEUR_TIC, Role.ADMIN_CENTRAL)
  assignTrajet(@Param('id') id: string, @Body() dto: AssignTrajetDto, @Req() req: any) {
    return this.service.assignTrajet(id, dto, this.actor(req));
  }

  @Post(':id/diagnostic')
  @Roles(Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE)
  diagnostic(@Param('id') id: string, @Body() dto: DiagnosticTechnicienDto, @Req() req: any) {
    return this.service.diagnosticTechnicien(id, dto, this.actor(req));
  }

  @Post(':id/decision')
  @Roles(Role.SOUS_DIRECTEUR_TIC, Role.ADMIN_CENTRAL)
  decision(@Param('id') id: string, @Body() dto: DecisionSdTicDto, @Req() req: any) {
    return this.service.decisionSdTic(id, dto, this.actor(req));
  }
}