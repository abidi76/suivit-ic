import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreDto } from './dto/create-cre.dto';
import { CreateGouvernoratDto } from './dto/create-gouvernorat.dto';

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
}