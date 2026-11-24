import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(dto: LoginDto) {
    const identifiant = dto.identifiant.trim();
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifiant.toLowerCase() }, { matricule: identifiant }] },
    });

    const identifiantsInvalides = 'Identifiants invalides.';
    if (!user) throw new UnauthorizedException(identifiantsInvalides);

    const motDePasseValide = await bcrypt.compare(dto.motDePasse, user.motDePasseHash);
    if (!motDePasseValide) throw new UnauthorizedException(identifiantsInvalides);
    if (!user.actif) throw new UnauthorizedException('Compte désactivé.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { derniereConnexion: new Date() },
    });

    const accessToken = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });

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

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.nouveauMotDePasse.length < 8) {
      throw new BadRequestException('Le mot de passe doit comporter au moins 8 caractères.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.actif) {
      throw new UnauthorizedException('Utilisateur invalide ou désactivé.');
    }

    const ancienMotDePasseValide = await bcrypt.compare(dto.ancienMotDePasse, user.motDePasseHash);
    if (!ancienMotDePasseValide) {
      throw new UnauthorizedException('Mot de passe actuel incorrect.');
    }

    const motDePasseHash = await bcrypt.hash(dto.nouveauMotDePasse, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { motDePasseHash, doitChangerMdp: false },
    });

    return { success: true, message: 'Votre mot de passe a été mis à jour.' };
  }
}
