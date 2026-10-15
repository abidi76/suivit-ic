import { Controller, Get } from '@nestjs/common';
import { CascadesService } from './cascades.service';

@Controller('referentials/cascades')
export class CascadesController {
  constructor(private service: CascadesService) {}

  /**
   * GET /referentials/cascades/localisation
   * Cascade : CRE → Gouvernorat → Délégation → Établissement → Labo
   */
  @Get('localisation')
  localisation() {
    return this.service.localisation();
  }

  /**
   * GET /referentials/cascades/organisation
   * Cascade : Direction → Service
   */
  @Get('organisation')
  organisation() {
    return this.service.organisation();
  }

  /**
   * GET /referentials/cascades/equipement
   * Cascade : Type → Marque → Modèle
   */
  @Get('equipement')
  equipement() {
    return this.service.equipement();
  }

  /**
   * GET /referentials/cascades/achats
   * Cascade : AppelOffres → Lot
   */
  @Get('achats')
  achats() {
    return this.service.achats();
  }

  /**
   * GET /referentials/cascades/intervention
   * Cascade : Établissement → Labo → Équipement
   */
  @Get('intervention')
  intervention() {
    return this.service.intervention();
  }

  /**
   * GET /referentials/cascades/pieces
   * Cascade : Type de pièce → Marque → Désignation
   */
  @Get('pieces')
  pieces() {
    return this.service.pieces();
  }
}