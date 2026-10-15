import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CascadesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cascade localisation : CRE → Gouvernorat → Délégation → Établissement → Labo
   */
  async localisation() {
    const cre = await this.prisma.cre.findMany({
      where: { actif: true },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        designationFr: true,
        designationAr: true,
        actif: true,
        gouvernorats: {
          where: { actif: true },
          orderBy: { code: 'asc' },
          select: {
            id: true,
            code: true,
            nomFr: true,
            nomAr: true,
            actif: true,
            creId: true,
            delegations: {
              where: { actif: true },
              orderBy: { code: 'asc' },
              select: {
                id: true,
                code: true,
                nomFr: true,
                nomAr: true,
                actif: true,
                gouvernoratId: true,
                etablissements: {
                  where: { actif: true },
                  orderBy: { code: 'asc' },
                  select: {
                    id: true,
                    code: true,
                    nomFr: true,
                    nomAr: true,
                    actif: true,
                    delegationId: true,
                    creId: true,
                    labos: {
                      where: { actif: true },
                      orderBy: { nom: 'asc' },
                      select: {
                        id: true,
                        nom: true,
                        actif: true,
                        etablissementId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return { cre };
  }

  /**
   * Cascade organisation : Direction → Service
   */
  async organisation() {
    const directions = await this.prisma.direction.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        nom: true,
        actif: true,
        services: {
          where: { actif: true },
          orderBy: { nom: 'asc' },
          select: {
            id: true,
            nom: true,
            actif: true,
            directionId: true,
          },
        },
      },
    });

    return { directions };
  }

  /**
   * Cascade équipement : Type → Marque → Modèle
   */
  async equipement() {
    const [types, marques, modeles] = await Promise.all([
      this.prisma.typeEquipement.findMany({
        where: { actif: true },
        orderBy: { nom: 'asc' },
        select: { id: true, nom: true, actif: true },
      }),
      this.prisma.marque.findMany({
        where: { actif: true },
        orderBy: { nom: 'asc' },
        select: { id: true, nom: true, actif: true },
      }),
      this.prisma.modele.findMany({
        where: { actif: true },
        orderBy: { nom: 'asc' },
        select: {
          id: true,
          nom: true,
          marqueId: true,
          typeId: true,
          actif: true,
        },
      }),
    ]);

    return { types, marques, modeles };
  }

  /**
   * Cascade achats : AppelOffres → Lot
   */
  async achats() {
    const appelsOffres = await this.prisma.appelOffres.findMany({
      where: { actif: true },
      orderBy: { numero: 'asc' },
      select: {
        id: true,
        numero: true,
        objet: true,
        dateDebut: true,
        dateFin: true,
        actif: true,
        lots: {
          where: { actif: true },
          orderBy: { numero: 'asc' },
          select: {
            id: true,
            numero: true,
            description: true,
            quantiteMax: true,
            actif: true,
            appelOffresId: true,
          },
        },
      },
    });

    return { appelsOffres };
  }

  /**
   * Cascade intervention : Établissement → Labo → Équipement
   */
  async intervention() {
    const etablissements = await this.prisma.etablissement.findMany({
      where: { actif: true },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        nomFr: true,
        nomAr: true,
        creId: true,
        actif: true,
        labos: {
          where: { actif: true },
          orderBy: { nom: 'asc' },
          select: {
            id: true,
            nom: true,
            actif: true,
            equipements: {
              where: { etat: { not: 'REFORME' } },
              orderBy: { numeroSerie: 'asc' },
              select: {
                id: true,
                numeroSerie: true,
                etat: true,
                marqueId: true,
                modeleId: true,
                typeId: true,
              },
            },
          },
        },
      },
    });

    return { etablissements };
  }

  /**
   * Cascade pièces : Type de pièce → Marque → Désignation
   */
  async pieces() {
    const pieces = await this.prisma.piece.findMany({
      where: { actif: true },
      orderBy: [{ typePiece: 'asc' }, { designation: 'asc' }],
      select: {
        id: true,
        numeroSerie: true,
        designation: true,
        typePiece: true,
        marqueId: true,
        actif: true,
      },
    });

    return { pieces };
  }
}