import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const identifiant = dto.identifiant.trim();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifiant.toLowerCase() },
          { matricule: identifiant },
        ],
      },
    });

    const GENERIQUE = 'Identifiants invalides.';
    if (!user) {
      throw new UnauthorizedException(GENERIQUE);
    }

    const ok = await bcrypt.compare(dto.motDePasse, user.motDePasseHash);

    if (!ok) {
      throw new UnauthorizedException(GENERIQUE);
    }

    if (!user.actif) {
      throw new UnauthorizedException('Compte désactivé.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { derniereConnexion: new Date() },
    });

    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        matricule: user.matricule,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        creId: user.creId,
        etablissementId: user.etablissementId,
        doitChangerMdp: user.doitChangerMdp,
      },
    };
  }

  async changePassword(dto: ChangePasswordDto) {
    const identifiant = dto.identifiant.trim();
    const nouveauMotDePasse = dto.nouveauMotDePasse;

    if (!identifiant) {
      throw new BadRequestException('Identifiant requis.');
    }

    if (nouveauMotDePasse.length < 8) {
      throw new BadRequestException('Le mot de passe doit comporter au moins 8 caractères.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifiant.toLowerCase() },
          { matricule: identifiant },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException('Compte introuvable.');
    }

    if (!user.actif) {
      throw new UnauthorizedException('Compte désactivé.');
    }

    const motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        motDePasseHash,
        doitChangerMdp: false,
      },
    });

    return {
      success: true,
      message: 'Votre mot de passe a été mis à jour.',
    };
  }
}
