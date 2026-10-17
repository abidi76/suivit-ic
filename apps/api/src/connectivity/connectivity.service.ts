import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTypeConnexionDto } from './dto/create-type-connexion.dto';
import { UpdateTypeConnexionDto } from './dto/update-type-connexion.dto';
import { CreateCircuitReseauDto } from './dto/create-circuit-reseau.dto';
import { UpdateCircuitReseauDto } from './dto/update-circuit-reseau.dto';

@Injectable()
export class ConnectivityService {
  constructor(private prisma: PrismaService) {}

  // --- TYPES DE CONNEXION ---

  async createTypeConnexion(dto: CreateTypeConnexionDto) {
    return this.prisma.typeConnexion.create({ data: dto });
  }

  async findAllTypesConnexion() {
    return this.prisma.typeConnexion.findMany({
      where: { actif: true },
      orderBy: { libelle: 'asc' },
    });
  }

  async updateTypeConnexion(id: string, dto: UpdateTypeConnexionDto) {
    await this.getTypeConnexion(id);
    return this.prisma.typeConnexion.update({ where: { id }, data: dto });
  }

  async getTypeConnexion(id: string) {
    const type = await this.prisma.typeConnexion.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('Type de connexion introuvable.');
    return type;
  }

  // --- CIRCUITS RÉSEAU ---

  async createCircuit(dto: CreateCircuitReseauDto) {
    // Vérifier l'établissement
    const etab = await this.prisma.etablissement.findUnique({ where: { id: dto.etablissementId } });
    if (!etab) throw new BadRequestException('Établissement introuvable.');

    // Vérifier le type de connexion
    await this.getTypeConnexion(dto.typeConnexionId);

    return this.prisma.circuitReseau.create({
      data: {
        ...dto,
        dateActivation: dto.dateActivation ? new Date(dto.dateActivation) : null,
        dateFin: dto.dateFin ? new Date(dto.dateFin) : null,
      },
      include: { typeConnexion: true, etablissement: true },
    });
  }

  async findAllCircuits(etablissementId?: string) {
    return this.prisma.circuitReseau.findMany({
      where: {
        actif: true,
        ...(etablissementId && { etablissementId }),
      },
      include: { typeConnexion: true, etablissement: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneCircuit(id: string) {
    const circuit = await this.prisma.circuitReseau.findUnique({
      where: { id },
      include: { typeConnexion: true, etablissement: true, reclamations: true },
    });
    if (!circuit) throw new NotFoundException('Circuit introuvable.');
    return circuit;
  }

  async updateCircuit(id: string, dto: UpdateCircuitReseauDto) {
    await this.findOneCircuit(id);
    return this.prisma.circuitReseau.update({
      where: { id },
      data: {
        ...dto,
        dateActivation: dto.dateActivation ? new Date(dto.dateActivation) : undefined,
        dateFin: dto.dateFin ? new Date(dto.dateFin) : undefined,
      },
      include: { typeConnexion: true, etablissement: true },
    });
  }

  async removeCircuit(id: string) {
    await this.findOneCircuit(id);
    // Désactivation (pas de suppression physique)
    return this.prisma.circuitReseau.update({
      where: { id },
      data: { actif: false },
    });
  }
}