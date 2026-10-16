import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CloturerTicketDto } from './dto/cloturer-ticket.dto';
import { AssignerTicketDto } from './dto/assigner-ticket.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { Criticite, Role, TicketStatut } from '../../generated/prisma/client';

@Controller('tickets')
export class TicketsController {
  constructor(private service: TicketsService) {}

  /**
   * POST /tickets
   * Regle 14.1 : declaration par l'etablissement.
   */
  @Post()
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: JwtUser) {
    return this.service.create(dto, user.id);
  }

  /**
   * GET /tickets
   * Liste avec filtres.
   */
  @Get()
  findAll(
    @Query('etablissementId') etablissementId?: string,
    @Query('statut') statut?: TicketStatut,
    @Query('bacPratique') bacPratique?: string,
    @Query('criticite') criticite?: Criticite,
    @Query('declarantId') declarantId?: string,
    @Query('technicienId') technicienId?: string,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.service.findAll(
      {
        etablissementId,
        statut,
        bacPratique: bacPratique !== undefined ? bacPratique === 'true' : undefined,
        criticite,
        declarantId,
        technicienId,
      },
      user!.role as Role,
      user!.creId,
      user!.etablissementId,
      user!.id,
    );
  }

  /**
   * GET /tickets/stats
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
   * GET /tickets/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * PATCH /tickets/:id
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.update(id, dto, user.role as Role);
  }

  /**
   * POST /tickets/:id/cloturer
   * Regle 14.2 : cloture avec numero de serie + note 1-5.
   */
  @Roles(Role.ADMIN_CENTRAL, Role.DIRECTEUR_ETABLISSEMENT)
  @Post(':id/cloturer')
  cloturer(
    @Param('id') id: string,
    @Body() dto: CloturerTicketDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.cloturer(id, dto, user.id, user.role as Role);
  }

  /**
   * POST /tickets/:id/assigner
   */
  @Roles(Role.ADMIN_CENTRAL, Role.SOUS_DIRECTEUR_TIC, Role.TECHNICIEN_INTERNE)
  @Post(':id/assigner')
  assigner(
    @Param('id') id: string,
    @Body() dto: AssignerTicketDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.assigner(id, dto, user.id, user.role as Role);
  }

  /**
   * POST /tickets/:id/annuler
   */
  @Roles(Role.ADMIN_CENTRAL)
  @Post(':id/annuler')
  annuler(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.annuler(id, user.role as Role);
  }
}