import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreDto } from './dto/create-cre.dto';
import { CreateGouvernoratDto } from './dto/create-gouvernorat.dto';
import { CreateDelegationDto } from './dto/create-delegation.dto';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { CreateLaboDto } from './dto/create-labo.dto';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateTypeEquipementDto } from './dto/create-type-equipement.dto';
import { CreateMarqueDto } from './dto/create-marque.dto';
import { CreateModeleDto } from './dto/create-modele.dto';

@Injectable()
export class ReferentialsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CRE
  // ==========================================

  async findAllCre() {
    return this.prisma.cre.findMany({
      where: { actif: true },
      orderBy: { code: 'asc' },
    });
  }

  async findOneCre(id: string) {
    const cre = await this.prisma.cre.findUnique({
      where: { id },
      include: { gouvernorats: true },
    });
    if (!cre) throw new NotFoundException('CRE introuvable.');
    return cre;
  }

  async createCre(dto: CreateCreDto) {
    const existing = await this.prisma.cre.findUnique({
      where: { code: dto.code.trim() },
    });
    if (existing) throw new BadRequestException('Ce code CRE existe déjà.');

    return this.prisma.cre.create({
      data: {
        code: dto.code.trim(),
        designationFr: dto.designationFr,
        designationAr: dto.designationAr,
        actif: dto.actif ?? true,
      },
    });
  }

  async updateCre(id: string, dto: Partial<CreateCreDto>) {
    await this.findOneCre(id);
    return this.prisma.cre.update({
      where: { id },
      data: dto,
    });
  }

  async desactiverCre(id: string) {
    await this.findOneCre(id);
    return this.prisma.cre.update({
      where: { id },
      data: { actif: false },
    });
  }

  // ==========================================
  // GOUVERNORAT
  // ==========================================

  async findAllGouvernorat() {
    return this.prisma.gouvernorat.findMany({
      where: { actif: true },
      include: { cre: true },
      orderBy: { code: 'asc' },
    });
  }

  async findOneGouvernorat(id: string) {
    const g = await this.prisma.gouvernorat.findUnique({
      where: { id },
      include: { cre: true, delegations: true },
    });
    if (!g) throw new NotFoundException('Gouvernorat introuvable.');
    return g;
  }

  async createGouvernorat(dto: CreateGouvernoratDto) {
    // Vérifier que le CRE existe
    const cre = await this.prisma.cre.findUnique({
      where: { id: dto.creId },
    });
    if (!cre) throw new BadRequestException('CRE introuvable.');

    // Vérifier le code unique
    const existing = await this.prisma.gouvernorat.findUnique({
      where: { code: dto.code.trim() },
    });
    if (existing) throw new BadRequestException('Ce code gouvernorat existe déjà.');

    return this.prisma.gouvernorat.create({
      data: {
        code: dto.code.trim(),
        nomFr: dto.nomFr,
        nomAr: dto.nomAr,
        creId: dto.creId,
        actif: dto.actif ?? true,
      },
      include: { cre: true },
    });
  }

  async updateGouvernorat(id: string, dto: Partial<CreateGouvernoratDto>) {
    await this.findOneGouvernorat(id);

    if (dto.creId) {
      const cre = await this.prisma.cre.findUnique({ where: { id: dto.creId } });
      if (!cre) throw new BadRequestException('CRE introuvable.');
    }

    return this.prisma.gouvernorat.update({
      where: { id },
      data: dto,
      include: { cre: true },
    });
  }

  async desactiverGouvernorat(id: string) {
    await this.findOneGouvernorat(id);
    return this.prisma.gouvernorat.update({
      where: { id },
      data: { actif: false },
    });
  }
    // ==========================================
  // DÉLÉGATION
  // ==========================================

  async findAllDelegation() {
    return this.prisma.delegation.findMany({
      where: { actif: true },
      include: {
        gouvernorat: {
          include: { cre: true },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOneDelegation(id: string) {
    const d = await this.prisma.delegation.findUnique({
      where: { id },
      include: {
        gouvernorat: { include: { cre: true } },
        etablissements: true,
      },
    });
    if (!d) throw new NotFoundException('Délégation introuvable.');
    return d;
  }

  async createDelegation(dto: CreateDelegationDto) {
    // Vérifier que le gouvernorat existe
    const gouvernorat = await this.prisma.gouvernorat.findUnique({
      where: { id: dto.gouvernoratId },
    });
    if (!gouvernorat) throw new BadRequestException('Gouvernorat introuvable.');

    // Vérifier le code unique
    const existing = await this.prisma.delegation.findUnique({
      where: { code: dto.code.trim() },
    });
    if (existing) throw new BadRequestException('Ce code délégation existe déjà.');

    return this.prisma.delegation.create({
      data: {
        code: dto.code.trim(),
        nomFr: dto.nomFr,
        nomAr: dto.nomAr,
        gouvernoratId: dto.gouvernoratId,
        actif: dto.actif ?? true,
      },
      include: {
        gouvernorat: { include: { cre: true } },
      },
    });
  }

  async updateDelegation(id: string, dto: Partial<CreateDelegationDto>) {
    await this.findOneDelegation(id);

    if (dto.gouvernoratId) {
      const g = await this.prisma.gouvernorat.findUnique({ where: { id: dto.gouvernoratId } });
      if (!g) throw new BadRequestException('Gouvernorat introuvable.');
    }

    return this.prisma.delegation.update({
      where: { id },
      data: dto,
      include: { gouvernorat: { include: { cre: true } } },
    });
  }

  async desactiverDelegation(id: string) {
    await this.findOneDelegation(id);
    return this.prisma.delegation.update({
      where: { id },
      data: { actif: false },
    });
  }

  // ==========================================
  // ÉTABLISSEMENT
  // ==========================================

  async findAllEtablissement() {
    return this.prisma.etablissement.findMany({
      where: { actif: true },
      include: {
        delegation: { include: { gouvernorat: true } },
        cre: true,
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOneEtablissement(id: string) {
    const e = await this.prisma.etablissement.findUnique({
      where: { id },
      include: {
        delegation: { include: { gouvernorat: true } },
        cre: true,
        labos: true,
      },
    });
    if (!e) throw new NotFoundException('Établissement introuvable.');
    return e;
  }

  async createEtablissement(dto: CreateEtablissementDto) {
    // Vérifier que la délégation existe
    const delegation = await this.prisma.delegation.findUnique({
      where: { id: dto.delegationId },
      include: { gouvernorat: true },
    });
    if (!delegation) throw new BadRequestException('Délégation introuvable.');

    // Déduire le creId : soit fourni, soit celui du gouvernorat
    const creId = dto.creId || delegation.gouvernorat.creId;

    // Vérification de cohérence : le creId doit correspondre
    if (creId !== delegation.gouvernorat.creId) {
      throw new BadRequestException(
        "Incohérence : le creId ne correspond pas au CRE du gouvernorat de la délégation.",
      );
    }

    // Vérifier le code unique
    const existing = await this.prisma.etablissement.findUnique({
      where: { code: dto.code.trim() },
    });
    if (existing) throw new BadRequestException('Ce code établissement existe déjà.');

    return this.prisma.etablissement.create({
      data: {
        code: dto.code.trim(),
        nomFr: dto.nomFr,
        nomAr: dto.nomAr,
        delegationId: dto.delegationId,
        creId,
        actif: dto.actif ?? true,
      },
      include: {
        delegation: { include: { gouvernorat: true } },
        cre: true,
      },
    });
  }

  async updateEtablissement(id: string, dto: Partial<CreateEtablissementDto>) {
    await this.findOneEtablissement(id);

    if (dto.delegationId) {
      const delegation = await this.prisma.delegation.findUnique({
        where: { id: dto.delegationId },
        include: { gouvernorat: true },
      });
      if (!delegation) throw new BadRequestException('Délégation introuvable.');

      // Le creId doit être mis à jour aussi
      dto.creId = delegation.gouvernorat.creId;
    }

    return this.prisma.etablissement.update({
      where: { id },
      data: dto,
      include: {
        delegation: { include: { gouvernorat: true } },
        cre: true,
      },
    });
  }

  async desactiverEtablissement(id: string) {
    await this.findOneEtablissement(id);
    return this.prisma.etablissement.update({
      where: { id },
      data: { actif: false },
    });
  }

  // ==========================================
  // LABO
  // ==========================================

  async findAllLabo() {
    return this.prisma.labo.findMany({
      where: { actif: true },
      include: {
        etablissement: {
          include: { delegation: true, cre: true },
        },
      },
      orderBy: { nom: 'asc' },
    });
  }

  async findOneLabo(id: string) {
    const l = await this.prisma.labo.findUnique({
      where: { id },
      include: {
        etablissement: {
          include: { delegation: true, cre: true },
        },
        users: {
          select: { id: true, nom: true, prenom: true, email: true, role: true },
        },
      },
    });
    if (!l) throw new NotFoundException('Labo introuvable.');
    return l;
  }

  async createLabo(dto: CreateLaboDto) {
    // Vérifier que l'établissement existe
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id: dto.etablissementId },
    });
    if (!etablissement) throw new BadRequestException('Établissement introuvable.');

    // Vérifier l'unicité (nom + établissement)
    const existing = await this.prisma.labo.findFirst({
      where: {
        nom: dto.nom.trim(),
        etablissementId: dto.etablissementId,
      },
    });
    if (existing) throw new BadRequestException('Ce labo existe déjà dans cet établissement.');

    return this.prisma.labo.create({
      data: {
        nom: dto.nom.trim(),
        etablissementId: dto.etablissementId,
        actif: dto.actif ?? true,
      },
      include: {
        etablissement: { include: { delegation: true, cre: true } },
      },
    });
  }

  async updateLabo(id: string, dto: Partial<CreateLaboDto>) {
    await this.findOneLabo(id);
    return this.prisma.labo.update({
      where: { id },
      data: dto,
      include: {
        etablissement: { include: { delegation: true, cre: true } },
      },
    });
  }

  async desactiverLabo(id: string) {
    await this.findOneLabo(id);
    return this.prisma.labo.update({
      where: { id },
      data: { actif: false },
    });
  }
    // ==========================================
  // DIRECTION
  // ==========================================

  async findAllDirection() {
    return this.prisma.direction.findMany({
      where: { actif: true },
      include: { services: { where: { actif: true } } },
      orderBy: { nom: 'asc' },
    });
  }

  async findOneDirection(id: string) {
    const d = await this.prisma.direction.findUnique({
      where: { id },
      include: { services: true },
    });
    if (!d) throw new NotFoundException('Direction introuvable.');
    return d;
  }

  async createDirection(dto: CreateDirectionDto) {
    return this.prisma.direction.create({
      data: {
        nom: dto.nom.trim(),
        actif: dto.actif ?? true,
      },
    });
  }

  async updateDirection(id: string, dto: Partial<CreateDirectionDto>) {
    await this.findOneDirection(id);
    return this.prisma.direction.update({
      where: { id },
      data: dto,
    });
  }

  async desactiverDirection(id: string) {
    await this.findOneDirection(id);
    return this.prisma.direction.update({
      where: { id },
      data: { actif: false },
    });
  }

  // ==========================================
  // SERVICE
  // ==========================================

  async findAllService() {
    return this.prisma.service.findMany({
      where: { actif: true },
      include: { direction: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findOneService(id: string) {
    const s = await this.prisma.service.findUnique({
      where: { id },
      include: { direction: true },
    });
    if (!s) throw new NotFoundException('Service introuvable.');
    return s;
  }

  async createService(dto: CreateServiceDto) {
    const direction = await this.prisma.direction.findUnique({
      where: { id: dto.directionId },
    });
    if (!direction) throw new BadRequestException('Direction introuvable.');

    return this.prisma.service.create({
      data: {
        nom: dto.nom.trim(),
        directionId: dto.directionId,
        actif: dto.actif ?? true,
      },
      include: { direction: true },
    });
  }

  async updateService(id: string, dto: Partial<CreateServiceDto>) {
    await this.findOneService(id);

    if (dto.directionId) {
      const d = await this.prisma.direction.findUnique({ where: { id: dto.directionId } });
      if (!d) throw new BadRequestException('Direction introuvable.');
    }

    return this.prisma.service.update({
      where: { id },
      data: dto,
      include: { direction: true },
    });
  }

  async desactiverService(id: string) {
    await this.findOneService(id);
    return this.prisma.service.update({
      where: { id },
      data: { actif: false },
    });
  }

  // ==========================================
  // TYPE EQUIPEMENT
  // ==========================================

  async findAllTypeEquipement() {
    return this.prisma.typeEquipement.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findOneTypeEquipement(id: string) {
    const t = await this.prisma.typeEquipement.findUnique({
      where: { id },
      include: { modeles: true },
    });
    if (!t) throw new NotFoundException('Type équipement introuvable.');
    return t;
  }

  async createTypeEquipement(dto: CreateTypeEquipementDto) {
    const existing = await this.prisma.typeEquipement.findUnique({
      where: { nom: dto.nom.trim() },
    });
    if (existing) throw new BadRequestException('Ce type existe déjà.');

    return this.prisma.typeEquipement.create({
      data: {
        nom: dto.nom.trim(),
        actif: dto.actif ?? true,
      },
    });
  }

  async updateTypeEquipement(id: string, dto: Partial<CreateTypeEquipementDto>) {
    await this.findOneTypeEquipement(id);
    return this.prisma.typeEquipement.update({
      where: { id },
      data: dto,
    });
  }

  async desactiverTypeEquipement(id: string) {
    await this.findOneTypeEquipement(id);
    return this.prisma.typeEquipement.update({
      where: { id },
      data: { actif: false },
    });
  }

  // ==========================================
  // MARQUE
  // ==========================================

  async findAllMarque() {
    return this.prisma.marque.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findOneMarque(id: string) {
    const m = await this.prisma.marque.findUnique({
      where: { id },
      include: { modeles: true },
    });
    if (!m) throw new NotFoundException('Marque introuvable.');
    return m;
  }

  async createMarque(dto: CreateMarqueDto) {
    const existing = await this.prisma.marque.findUnique({
      where: { nom: dto.nom.trim() },
    });
    if (existing) throw new BadRequestException('Cette marque existe déjà.');

    return this.prisma.marque.create({
      data: {
        nom: dto.nom.trim(),
        actif: dto.actif ?? true,
      },
    });
  }

  async updateMarque(id: string, dto: Partial<CreateMarqueDto>) {
    await this.findOneMarque(id);
    return this.prisma.marque.update({
      where: { id },
      data: dto,
    });
  }

  async desactiverMarque(id: string) {
    await this.findOneMarque(id);
    return this.prisma.marque.update({
      where: { id },
      data: { actif: false },
    });
  }

  // ==========================================
  // MODELE
  // ==========================================

  async findAllModele() {
    return this.prisma.modele.findMany({
      where: { actif: true },
      include: { marque: true, type: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findOneModele(id: string) {
    const m = await this.prisma.modele.findUnique({
      where: { id },
      include: { marque: true, type: true },
    });
    if (!m) throw new NotFoundException('Modèle introuvable.');
    return m;
  }

  async createModele(dto: CreateModeleDto) {
    const marque = await this.prisma.marque.findUnique({ where: { id: dto.marqueId } });
    if (!marque) throw new BadRequestException('Marque introuvable.');

    const type = await this.prisma.typeEquipement.findUnique({ where: { id: dto.typeId } });
    if (!type) throw new BadRequestException('Type équipement introuvable.');

    const existing = await this.prisma.modele.findFirst({
      where: {
        nom: dto.nom.trim(),
        marqueId: dto.marqueId,
        typeId: dto.typeId,
      },
    });
    if (existing) throw new BadRequestException('Ce modèle existe déjà pour cette marque et ce type.');

    return this.prisma.modele.create({
      data: {
        nom: dto.nom.trim(),
        marqueId: dto.marqueId,
        typeId: dto.typeId,
        actif: dto.actif ?? true,
      },
      include: { marque: true, type: true },
    });
  }

  async updateModele(id: string, dto: Partial<CreateModeleDto>) {
    await this.findOneModele(id);
    return this.prisma.modele.update({
      where: { id },
      data: dto,
      include: { marque: true, type: true },
    });
  }

  async desactiverModele(id: string) {
    await this.findOneModele(id);
    return this.prisma.modele.update({
      where: { id },
      data: { actif: false },
    });
  }
}