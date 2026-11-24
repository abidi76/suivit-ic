import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  const user = {
    id: 'user-1',
    email: 'personne@example.tn',
    matricule: 'MAT-001',
    nom: 'Nom',
    prenom: 'Prénom',
    role: 'ADMIN_CENTRAL',
    creId: null,
    etablissementId: null,
    actif: true,
    motDePasseHash: 'stored-hash',
    doitChangerMdp: false,
  };

  const prisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const jwt = { sign: jest.fn().mockReturnValue('signed-token') };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma as never, jwt as never);
  });

  it('authentifie par email/matricule sans retourner le hash', async () => {
    prisma.user.findFirst.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prisma.user.update.mockResolvedValue(user);

    const result = await service.login({ identifiant: ' MAT-001 ', motDePasse: 'correct' });

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { OR: [{ email: 'mat-001' }, { matricule: 'MAT-001' }] },
    });
    expect(result.accessToken).toBe('signed-token');
    expect(result.user).not.toHaveProperty('motDePasseHash');
    expect(result.user).not.toHaveProperty('motDePasse');
  });

  it('rejette des identifiants invalides avec une réponse générique', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(service.login({ identifiant: 'absent', motDePasse: 'incorrect' }))
      .rejects.toThrow(new UnauthorizedException('Identifiants invalides.'));
  });

  it('change le mot de passe après vérification de l’ancien et stocke seulement le hash', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    prisma.user.update.mockResolvedValue(user);

    const result = await service.changePassword('user-1', {
      ancienMotDePasse: 'current-password',
      nouveauMotDePasse: 'new-password-123',
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { motDePasseHash: 'new-hash', doitChangerMdp: false },
    });
    expect(result.success).toBe(true);
  });

  it('rejette un ancien mot de passe incorrect sans modifier l’utilisateur', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.changePassword('user-1', {
      ancienMotDePasse: 'incorrect',
      nouveauMotDePasse: 'new-password-123',
    })).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
