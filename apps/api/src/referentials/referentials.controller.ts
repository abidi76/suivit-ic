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
import { CreateDirectionDto } from './dto/create-direction.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateTypeEquipementDto } from './dto/create-type-equipement.dto';
import { CreateMarqueDto } from './dto/create-marque.dto';
import { CreateModeleDto } from './dto/create-modele.dto';
import { CreateAppelOffresDto } from './dto/create-appel-offres.dto';
import { CreateLotDto } from './dto/create-lot.dto';
import { CreateActionMaintenanceDto } from './dto/create-action-maintenance.dto';
import { CreateTypePanneDto } from './dto/create-type-panne.dto';
import { CreateTypeJustificatifPerteDto } from './dto/create-type-justificatif-perte.dto';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { CreateSocieteDto } from './dto/create-societe.dto';
import { CreateMarcheDto } from './dto/create-marche.dto';
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
    // ==========================================
  // DIRECTION
  // ==========================================

  @Get('direction')
  findAllDirection() {
    return this.service.findAllDirection();
  }

  @Get('direction/:id')
  findOneDirection(@Param('id') id: string) {
    return this.service.findOneDirection(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('direction')
  createDirection(@Body() dto: CreateDirectionDto) {
    return this.service.createDirection(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('direction/:id')
  updateDirection(@Param('id') id: string, @Body() dto: Partial<CreateDirectionDto>) {
    return this.service.updateDirection(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('direction/:id')
  desactiverDirection(@Param('id') id: string) {
    return this.service.desactiverDirection(id);
  }

  // ==========================================
  // SERVICE
  // ==========================================

  @Get('service')
  findAllService() {
    return this.service.findAllService();
  }

  @Get('service/:id')
  findOneService(@Param('id') id: string) {
    return this.service.findOneService(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('service')
  createService(@Body() dto: CreateServiceDto) {
    return this.service.createService(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('service/:id')
  updateService(@Param('id') id: string, @Body() dto: Partial<CreateServiceDto>) {
    return this.service.updateService(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('service/:id')
  desactiverService(@Param('id') id: string) {
    return this.service.desactiverService(id);
  }

  // ==========================================
  // TYPE EQUIPEMENT
  // ==========================================

  @Get('type-equipement')
  findAllTypeEquipement() {
    return this.service.findAllTypeEquipement();
  }

  @Get('type-equipement/:id')
  findOneTypeEquipement(@Param('id') id: string) {
    return this.service.findOneTypeEquipement(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('type-equipement')
  createTypeEquipement(@Body() dto: CreateTypeEquipementDto) {
    return this.service.createTypeEquipement(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('type-equipement/:id')
  updateTypeEquipement(@Param('id') id: string, @Body() dto: Partial<CreateTypeEquipementDto>) {
    return this.service.updateTypeEquipement(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('type-equipement/:id')
  desactiverTypeEquipement(@Param('id') id: string) {
    return this.service.desactiverTypeEquipement(id);
  }

  // ==========================================
  // MARQUE
  // ==========================================

  @Get('marque')
  findAllMarque() {
    return this.service.findAllMarque();
  }

  @Get('marque/:id')
  findOneMarque(@Param('id') id: string) {
    return this.service.findOneMarque(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('marque')
  createMarque(@Body() dto: CreateMarqueDto) {
    return this.service.createMarque(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('marque/:id')
  updateMarque(@Param('id') id: string, @Body() dto: Partial<CreateMarqueDto>) {
    return this.service.updateMarque(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('marque/:id')
  desactiverMarque(@Param('id') id: string) {
    return this.service.desactiverMarque(id);
  }

  // ==========================================
  // MODELE
  // ==========================================

  @Get('modele')
  findAllModele() {
    return this.service.findAllModele();
  }

  @Get('modele/:id')
  findOneModele(@Param('id') id: string) {
    return this.service.findOneModele(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('modele')
  createModele(@Body() dto: CreateModeleDto) {
    return this.service.createModele(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('modele/:id')
  updateModele(@Param('id') id: string, @Body() dto: Partial<CreateModeleDto>) {
    return this.service.updateModele(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('modele/:id')
  desactiverModele(@Param('id') id: string) {
    return this.service.desactiverModele(id);
  }
    // ==========================================
  // APPEL D'OFFRES
  // ==========================================

  @Get('appel-offres')
  findAllAppelOffres() {
    return this.service.findAllAppelOffres();
  }

  @Get('appel-offres/:id')
  findOneAppelOffres(@Param('id') id: string) {
    return this.service.findOneAppelOffres(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('appel-offres')
  createAppelOffres(@Body() dto: CreateAppelOffresDto) {
    return this.service.createAppelOffres(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('appel-offres/:id')
  updateAppelOffres(@Param('id') id: string, @Body() dto: Partial<CreateAppelOffresDto>) {
    return this.service.updateAppelOffres(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('appel-offres/:id')
  desactiverAppelOffres(@Param('id') id: string) {
    return this.service.desactiverAppelOffres(id);
  }

  // ==========================================
  // LOT
  // ==========================================

  @Get('lot')
  findAllLot() {
    return this.service.findAllLot();
  }

  @Get('lot/:id')
  findOneLot(@Param('id') id: string) {
    return this.service.findOneLot(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('lot')
  createLot(@Body() dto: CreateLotDto) {
    return this.service.createLot(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('lot/:id')
  updateLot(@Param('id') id: string, @Body() dto: Partial<CreateLotDto>) {
    return this.service.updateLot(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('lot/:id')
  desactiverLot(@Param('id') id: string) {
    return this.service.desactiverLot(id);
  }

  // ==========================================
  // ACTION MAINTENANCE
  // ==========================================

  @Get('action-maintenance')
  findAllActionMaintenance() {
    return this.service.findAllActionMaintenance();
  }

  @Get('action-maintenance/:id')
  findOneActionMaintenance(@Param('id') id: string) {
    return this.service.findOneActionMaintenance(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('action-maintenance')
  createActionMaintenance(@Body() dto: CreateActionMaintenanceDto) {
    return this.service.createActionMaintenance(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('action-maintenance/:id')
  updateActionMaintenance(@Param('id') id: string, @Body() dto: Partial<CreateActionMaintenanceDto>) {
    return this.service.updateActionMaintenance(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('action-maintenance/:id')
  desactiverActionMaintenance(@Param('id') id: string) {
    return this.service.desactiverActionMaintenance(id);
  }

  // ==========================================
  // TYPE PANNE
  // ==========================================

  @Get('type-panne')
  findAllTypePanne() {
    return this.service.findAllTypePanne();
  }

  @Get('type-panne/:id')
  findOneTypePanne(@Param('id') id: string) {
    return this.service.findOneTypePanne(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('type-panne')
  createTypePanne(@Body() dto: CreateTypePanneDto) {
    return this.service.createTypePanne(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('type-panne/:id')
  updateTypePanne(@Param('id') id: string, @Body() dto: Partial<CreateTypePanneDto>) {
    return this.service.updateTypePanne(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('type-panne/:id')
  desactiverTypePanne(@Param('id') id: string) {
    return this.service.desactiverTypePanne(id);
  }

  // ==========================================
  // TYPE JUSTIFICATIF PERTE
  // ==========================================

  @Get('type-justificatif-perte')
  findAllTypeJustificatifPerte() {
    return this.service.findAllTypeJustificatifPerte();
  }

  @Get('type-justificatif-perte/:id')
  findOneTypeJustificatifPerte(@Param('id') id: string) {
    return this.service.findOneTypeJustificatifPerte(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('type-justificatif-perte')
  createTypeJustificatifPerte(@Body() dto: CreateTypeJustificatifPerteDto) {
    return this.service.createTypeJustificatifPerte(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('type-justificatif-perte/:id')
  updateTypeJustificatifPerte(@Param('id') id: string, @Body() dto: Partial<CreateTypeJustificatifPerteDto>) {
    return this.service.updateTypeJustificatifPerte(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('type-justificatif-perte/:id')
  desactiverTypeJustificatifPerte(@Param('id') id: string) {
    return this.service.desactiverTypeJustificatifPerte(id);
  }

  // ==========================================
  // FOURNISSEUR
  // ==========================================

  @Get('fournisseur')
  findAllFournisseur() {
    return this.service.findAllFournisseur();
  }

  @Get('fournisseur/:id')
  findOneFournisseur(@Param('id') id: string) {
    return this.service.findOneFournisseur(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('fournisseur')
  createFournisseur(@Body() dto: CreateFournisseurDto) {
    return this.service.createFournisseur(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('fournisseur/:id')
  updateFournisseur(@Param('id') id: string, @Body() dto: Partial<CreateFournisseurDto>) {
    return this.service.updateFournisseur(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('fournisseur/:id')
  desactiverFournisseur(@Param('id') id: string) {
    return this.service.desactiverFournisseur(id);
  }

  // ==========================================
  // SOCIETE
  // ==========================================

  @Get('societe')
  findAllSociete() {
    return this.service.findAllSociete();
  }

  @Get('societe/:id')
  findOneSociete(@Param('id') id: string) {
    return this.service.findOneSociete(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('societe')
  createSociete(@Body() dto: CreateSocieteDto) {
    return this.service.createSociete(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('societe/:id')
  updateSociete(@Param('id') id: string, @Body() dto: Partial<CreateSocieteDto>) {
    return this.service.updateSociete(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('societe/:id')
  desactiverSociete(@Param('id') id: string) {
    return this.service.desactiverSociete(id);
  }

  // ==========================================
  // MARCHE
  // ==========================================

  @Get('marche')
  findAllMarche() {
    return this.service.findAllMarche();
  }

  @Get('marche/:id')
  findOneMarche(@Param('id') id: string) {
    return this.service.findOneMarche(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('marche')
  createMarche(@Body() dto: CreateMarcheDto) {
    return this.service.createMarche(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('marche/:id')
  updateMarche(@Param('id') id: string, @Body() dto: Partial<CreateMarcheDto>) {
    return this.service.updateMarche(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('marche/:id')
  desactiverMarche(@Param('id') id: string) {
    return this.service.desactiverMarche(id);
  }
}