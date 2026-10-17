import { Body, Controller, Get, Param, Post, Patch, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/client';
import { TrajetsService } from './trajets.service';
import { CreateTrajetDto } from './dto/create-trajet.dto';
import { ValidateTrajetDto } from './dto/validate-trajet.dto';
import { UpdateStatusTrajetDto } from './dto/update-status-trajet.dto';

@ApiTags('Trajets')
@ApiBearerAuth()
@Controller('trajets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrajetsController {
  constructor(private readonly service: TrajetsService) {}

  private actor(req: any) {
    return { userId: req.user.id, role: req.user.role };
  }

  @Post()
  @Roles(Role.SOUS_DIRECTEUR_TIC, Role.ADMIN_CENTRAL)
  @ApiOperation({ summary: 'Créer un nouveau trajet' })
  create(@Body() dto: CreateTrajetDto, @Req() req: any) {
    return this.service.create(dto, this.actor(req));
  }

  @Get()
  @Roles(Role.ADMIN_CENTRAL, Role.SOUS_DIRECTEUR_TIC, Role.SUPERVISEUR_LOCAL, Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE)
  @ApiOperation({ summary: 'Lister les trajets' })
  findAll(@Req() req: any) {
    return this.service.findAll(this.actor(req));
  }

  @Get(':id')
  @Roles(Role.ADMIN_CENTRAL, Role.SOUS_DIRECTEUR_TIC, Role.SUPERVISEUR_LOCAL, Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE)
  @ApiOperation({ summary: 'Obtenir les détails d\'un trajet' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/validate')
  @Roles(Role.SUPERVISEUR_LOCAL, Role.ADMIN_CENTRAL)
  @ApiOperation({ summary: 'Valider/Refuser un trajet (SD-Bâtiment)' })
  validate(@Param('id') id: string, @Body() dto: ValidateTrajetDto, @Req() req: any) {
    return this.service.validate(id, dto, this.actor(req));
  }

  @Patch(':id/status')
  @Roles(Role.SOUS_DIRECTEUR_TIC, Role.ADMIN_CENTRAL)
  @ApiOperation({ summary: 'Changer le statut du trajet (Démarrer, Terminer, Annuler)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusTrajetDto, @Req() req: any) {
    return this.service.updateStatus(id, dto, this.actor(req));
  }

  @Get(':id/pdf')
  @Roles(Role.SOUS_DIRECTEUR_TIC, Role.ADMIN_CENTRAL, Role.TECHNICIEN_INTERNE, Role.TECHNICIEN_PRESTATAIRE)
  @ApiOperation({ summary: 'Générer et télécharger le PDF de l\'ordre de mission' })
  generatePdf(@Param('id') id: string, @Res() res: Response) {
    // On utilise @Res() de Express pour forcer NestJS à renvoyer un fichier au lieu de JSON
    return this.service.generatePdf(id, res);
  }
}