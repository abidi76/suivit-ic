import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ReferentialsService } from './referentials.service';
import { CreateCreDto } from './dto/create-cre.dto';
import { CreateGouvernoratDto } from './dto/create-gouvernorat.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma/client';
import { CreateDelegationDto } from './dto/create-delegation.dto';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { CreateLaboDto } from './dto/create-labo.dto';

@Controller('referentials')
export class ReferentialsController {
  constructor(private service: ReferentialsService) {}

  // ==========================================
  // CRE
  // ==========================================

  @Get('cre')
  findAllCre() {
    return this.service.findAllCre();
  }

  @Get('cre/:id')
  findOneCre(@Param('id') id: string) {
    return this.service.findOneCre(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('cre')
  createCre(@Body() dto: CreateCreDto) {
    return this.service.createCre(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('cre/:id')
  updateCre(@Param('id') id: string, @Body() dto: Partial<CreateCreDto>) {
    return this.service.updateCre(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('cre/:id')
  desactiverCre(@Param('id') id: string) {
    return this.service.desactiverCre(id);
  }

  // ==========================================
  // GOUVERNORAT
  // ==========================================

  @Get('gouvernorat')
  findAllGouvernorat() {
    return this.service.findAllGouvernorat();
  }

  @Get('gouvernorat/:id')
  findOneGouvernorat(@Param('id') id: string) {
    return this.service.findOneGouvernorat(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('gouvernorat')
  createGouvernorat(@Body() dto: CreateGouvernoratDto) {
    return this.service.createGouvernorat(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('gouvernorat/:id')
  updateGouvernorat(@Param('id') id: string, @Body() dto: Partial<CreateGouvernoratDto>) {
    return this.service.updateGouvernorat(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('gouvernorat/:id')
  desactiverGouvernorat(@Param('id') id: string) {
    return this.service.desactiverGouvernorat(id);
  }
    // ==========================================
  // DÉLÉGATION
  // ==========================================

  @Get('delegation')
  findAllDelegation() {
    return this.service.findAllDelegation();
  }

  @Get('delegation/:id')
  findOneDelegation(@Param('id') id: string) {
    return this.service.findOneDelegation(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('delegation')
  createDelegation(@Body() dto: CreateDelegationDto) {
    return this.service.createDelegation(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('delegation/:id')
  updateDelegation(@Param('id') id: string, @Body() dto: Partial<CreateDelegationDto>) {
    return this.service.updateDelegation(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('delegation/:id')
  desactiverDelegation(@Param('id') id: string) {
    return this.service.desactiverDelegation(id);
  }

  // ==========================================
  // ÉTABLISSEMENT
  // ==========================================

  @Get('etablissement')
  findAllEtablissement() {
    return this.service.findAllEtablissement();
  }

  @Get('etablissement/:id')
  findOneEtablissement(@Param('id') id: string) {
    return this.service.findOneEtablissement(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('etablissement')
  createEtablissement(@Body() dto: CreateEtablissementDto) {
    return this.service.createEtablissement(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('etablissement/:id')
  updateEtablissement(@Param('id') id: string, @Body() dto: Partial<CreateEtablissementDto>) {
    return this.service.updateEtablissement(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('etablissement/:id')
  desactiverEtablissement(@Param('id') id: string) {
    return this.service.desactiverEtablissement(id);
  }

  // ==========================================
  // LABO
  // ==========================================

  @Get('labo')
  findAllLabo() {
    return this.service.findAllLabo();
  }

  @Get('labo/:id')
  findOneLabo(@Param('id') id: string) {
    return this.service.findOneLabo(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('labo')
  createLabo(@Body() dto: CreateLaboDto) {
    return this.service.createLabo(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('labo/:id')
  updateLabo(@Param('id') id: string, @Body() dto: Partial<CreateLaboDto>) {
    return this.service.updateLabo(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('labo/:id')
  desactiverLabo(@Param('id') id: string) {
    return this.service.desactiverLabo(id);
  }
}