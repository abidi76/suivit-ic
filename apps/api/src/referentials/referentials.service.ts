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
}