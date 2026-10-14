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

    console.log('=== LOGIN DÉBUT ===');
    console.log('Identifiant reçu:', identifiant);
    console.log('Longueur motDePasse:', motDePasse.length);
    console.log('Codes:', [...motDePasse].map(c => c.charCodeAt(0)).join(','));
    console.log('Mot de passe reçu:', motDePasse);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifiant.toLowerCase().trim() },
          { matricule: identifiant.trim() },
        ],
      },
    });

    console.log('=== USER TROUVÉ ===');
    console.log('User:', user ? 'OUI' : 'NON');
    if (user) {
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Hash en base:', user.motDePasseHash);
      console.log('Actif:', user.actif);
    }

    const GENERIQUE = 'Identifiants invalides.';
    if (!user) {
      console.log('ERREUR: user non trouvé');
      throw new UnauthorizedException(GENERIQUE);
    }

    const ok = await bcrypt.compare(motDePasse, user.motDePasseHash);
    console.log('=== BCRYPT ===');
    console.log('Compare result:', ok);

    if (!ok) {
      console.log('ERREUR: mot de passe incorrect');
      throw new UnauthorizedException(GENERIQUE);
    }

    if (!user.actif) {
      console.log('ERREUR: compte désactivé');
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

    console.log('=== TOKEN GÉNÉRÉ ===');

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