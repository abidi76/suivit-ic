import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Liste tous les utilisateurs (sans le hash du mot de passe).
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        emailVerifie: true,
        matricule: true,
        nom: true,
        prenom: true,
        role: true,
        actif: true,
        telephone: true,
        creId: true,
        etablissementId: true,
        laboId: true,
        societeId: true,
        marcheId: true,
        derniereConnexion: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Détail d'un utilisateur.
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        emailVerifie: true,
        matricule: true,
        nom: true,
        prenom: true,
        role: true,
        actif: true,
        telephone: true,
        creId: true,
        etablissementId: true,
        laboId: true,
        societeId: true,
        marcheId: true,
        derniereConnexion: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user;
  }

  /**
   * Créer un utilisateur.
   */
  async create(dto: CreateUserDto) {
    // Vérifier que l'email n'existe pas déjà
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new BadRequestException('Cet email est déjà utilisé.');
    }

    // Vérifier le matricule unique (si fourni)
    if (dto.matricule) {
      const existingMatricule = await this.prisma.user.findUnique({
        where: { matricule: dto.matricule.trim() },
      });
      if (existingMatricule) {
        throw new BadRequestException('Ce matricule est déjà utilisé.');
      }
    }

    // Hasher le mot de passe
    const motDePasseHash = await bcrypt.hash(dto.motDePasse, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        nom: dto.nom,
        prenom: dto.prenom,
        matricule: dto.matricule?.trim() || null,
        telephone: dto.telephone || null,
        role: dto.role,
        motDePasseHash,
        doitChangerMdp: true,
        actif: true,
        emailVerifie: false,
        creId: dto.creId || null,
        etablissementId: dto.etablissementId || null,
        laboId: dto.laboId || null,
        societeId: dto.societeId || null,
        marcheId: dto.marcheId || null,
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        actif: true,
        matricule: true,
        creId: true,
        etablissementId: true,
        laboId: true,
        societeId: true,
        marcheId: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Modifier un utilisateur.
   */
  async update(id: string, dto: UpdateUserDto) {
    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    const data: any = {};

    if (dto.email) {
      const normalized = dto.email.toLowerCase().trim();
      if (normalized !== user.email) {
        const existing = await this.prisma.user.findUnique({
          where: { email: normalized },
        });
        if (existing) throw new BadRequestException('Cet email est déjà utilisé.');
        data.email = normalized;
      }
    }

    if (dto.matricule) {
      const trimmed = dto.matricule.trim();
      if (trimmed !== user.matricule) {
        const existing = await this.prisma.user.findUnique({
          where: { matricule: trimmed },
        });
        if (existing) throw new BadRequestException('Ce matricule est déjà utilisé.');
        data.matricule = trimmed;
      }
    }

    if (dto.motDePasse) {
      data.motDePasseHash = await bcrypt.hash(dto.motDePasse, 10);
      data.doitChangerMdp = true;
    }

    if (dto.nom !== undefined) data.nom = dto.nom;
    if (dto.prenom !== undefined) data.prenom = dto.prenom;
    if (dto.telephone !== undefined) data.telephone = dto.telephone;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.creId !== undefined) data.creId = dto.creId;
    if (dto.etablissementId !== undefined) data.etablissementId = dto.etablissementId;
    if (dto.laboId !== undefined) data.laboId = dto.laboId;
    if (dto.societeId !== undefined) data.societeId = dto.societeId;
    if (dto.marcheId !== undefined) data.marcheId = dto.marcheId;

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        actif: true,
        matricule: true,
        creId: true,
        etablissementId: true,
        laboId: true,
        societeId: true,
        marcheId: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Désactiver un utilisateur (on ne supprime jamais).
   */
  async desactiver(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    return this.prisma.user.update({
      where: { id },
      data: { actif: false },
      select: {
        id: true,
        email: true,
        actif: true,
      },
    });
  }

  /**
   * Réactiver un utilisateur.
   */
  async reactiver(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    return this.prisma.user.update({
      where: { id },
      data: { actif: true },
      select: {
        id: true,
        email: true,
        actif: true,
      },
    });
  }
}