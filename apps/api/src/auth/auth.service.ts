import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const { identifiant, motDePasse } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifiant.toLowerCase().trim() },
          { matricule: identifiant.trim() },
        ],
      },
    });

    const GENERIQUE = 'Identifiants invalides.';
    if (!user) {
      throw new UnauthorizedException(GENERIQUE);
    }

    const ok = await bcrypt.compare(motDePasse, user.motDePasseHash);

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
}
