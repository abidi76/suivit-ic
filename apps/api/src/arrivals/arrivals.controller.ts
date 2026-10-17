import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ArrivalsService } from './arrivals.service';
import { CreateArrivalDto } from './dto/create-arrival.dto';
import { ConfirmArrivalDto } from './dto/confirm-arrival.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../generated/prisma/client';

@Controller('arrivals')
export class ArrivalsController {
  constructor(private service: ArrivalsService) {}

  @Roles(Role.ADMIN_CENTRAL)
  @Post()
  create(@Body() dto: CreateArrivalDto, @CurrentUser() user: JwtUser) {
    return this.service.create(dto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: JwtUser) {
    return this.service.findAll(user.role as Role, user.creId, user.etablissementId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/confirm')
  confirmer(
    @Param('id') id: string,
    @Body() dto: ConfirmArrivalDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.confirmer(id, dto, user.id, user.role as Role);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post(':id/rectificatif')
  createRectificatif(
    @Param('id') id: string,
    @Body() dto: CreateArrivalDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.createRectificatif(id, dto, user.id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('litiges/:litigeId/traiter')
  traiterLitige(
    @Param('litigeId') litigeId: string,
    @Body('resolution') resolution: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.traiterLitige(litigeId, user.id, resolution);
  }
}