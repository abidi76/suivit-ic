import { PrismaClient, Role, EquipmentState } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Debut du seed...');

  // ==========================================================================
  // 1. GEOGRAPHIE
  // ==========================================================================

  const cre = await prisma.cre.upsert({
    where: { code: 'CRE-TUNIS' },
    update: {},
    create: {
      code: 'CRE-TUNIS',
      designationFr: 'CRE Tunis',
      designationAr: 'CRE تونس',
      actif: true,
    },
  });
  console.log('✅ CRE:', cre.designationFr);

  const gouvernorat = await prisma.gouvernorat.upsert({
    where: { code: 'TUN' },
    update: {},
    create: {
      code: 'TUN',
      nomFr: 'Tunis',
      nomAr: 'تونس',
      creId: cre.id,
      actif: true,
    },
  });
  console.log('✅ Gouvernorat:', gouvernorat.nomFr);

  const delegation = await prisma.delegation.upsert({
    where: { code: 'TUN-MED' },
    update: {},
    create: {
      code: 'TUN-MED',
      nomFr: 'Medina',
      nomAr: 'المدينة',
      gouvernoratId: gouvernorat.id,
      actif: true,
    },
  });
  console.log('✅ Delegation:', delegation.nomFr);

  const etablissement = await prisma.etablissement.upsert({
    where: { code: 'LYC-001' },
    update: {},
    create: {
      code: 'LYC-001',
      nomFr: 'Lycee Test',
      nomAr: 'معهد اختبار',
      delegationId: delegation.id,
      creId: cre.id,
      actif: true,
    },
  });
  console.log('✅ Etablissement:', etablissement.nomFr);

  const labo = await prisma.labo.upsert({
    where: {
      etablissementId_nom: {
        etablissementId: etablissement.id,
        nom: 'Labo Informatique 1',
      },
    },
    update: {},
    create: {
      nom: 'Labo Informatique 1',
      etablissementId: etablissement.id,
      actif: true,
    },
  });
  console.log('✅ Labo:', labo.nom);

  // ==========================================================================
  // 2. REFERENTIELS EQUIPEMENT
  // ==========================================================================

  const typesData = [
    'PC Fixe',
    'Laptop',
    'Imprimante',
    'Ecran',
    'Souris',
    'Clavier',
    'Switch',
    'Materiel Reseau',
    'Flybox',
  ];

  const types: Record<string, any> = {};
  for (const nom of typesData) {
    const t = await prisma.typeEquipement.upsert({
      where: { nom },
      update: {},
      create: { nom, actif: true },
    });
    types[nom] = t;
  }
  console.log('✅ Types equipement:', Object.keys(types).length);

  const marquesData = ['Dell', 'HP', 'Lenovo', 'Cisco', 'TP-Link'];
  const marques: Record<string, any> = {};
  for (const nom of marquesData) {
    const m = await prisma.marque.upsert({
      where: { nom },
      update: {},
      create: { nom, actif: true },
    });
    marques[nom] = m;
  }
  console.log('✅ Marques:', Object.keys(marques).length);

  const modelesData = [
    { nom: 'OptiPlex 7010', marque: 'Dell', type: 'PC Fixe' },
    { nom: 'Latitude 5540', marque: 'Dell', type: 'Laptop' },
    { nom: 'EliteDesk 800', marque: 'HP', type: 'PC Fixe' },
    { nom: 'ProBook 450', marque: 'HP', type: 'Laptop' },
    { nom: 'ThinkCentre M70', marque: 'Lenovo', type: 'PC Fixe' },
    { nom: 'ThinkPad T14', marque: 'Lenovo', type: 'Laptop' },
    { nom: 'Catalyst 2960', marque: 'Cisco', type: 'Switch' },
    { nom: 'TL-SG108', marque: 'TP-Link', type: 'Switch' },
  ];

  const modeles: Record<string, any> = {};
  for (const m of modelesData) {
    const marque = marques[m.marque];
    const type = types[m.type];
    const modele = await prisma.modele.upsert({
      where: {
        nom_marqueId_typeId: {
          nom: m.nom,
          marqueId: marque.id,
          typeId: type.id,
        },
      },
      update: {},
      create: {
        nom: m.nom,
        marqueId: marque.id,
        typeId: type.id,
        actif: true,
      },
    });
    modeles[m.nom] = modele;
  }
  console.log('✅ Modeles:', Object.keys(modeles).length);

  // ==========================================================================
  // 3. APPEL D'OFFRES + LOT
  // ==========================================================================

  const ao = await prisma.appelOffres.upsert({
    where: { numero: 'AO-2026-001' },
    update: {},
    create: {
      numero: 'AO-2026-001',
      objet: 'Acquisition materiel informatique 2026',
      dateDebut: new Date('2026-01-01'),
      dateFin: new Date('2026-12-31'),
      actif: true,
    },
  });
  console.log('✅ Appel offres:', ao.numero);

  const lot = await prisma.lot.upsert({
    where: {
      appelOffresId_numero: {
        appelOffresId: ao.id,
        numero: 'Lot 1',
      },
    },
    update: {},
    create: {
      appelOffresId: ao.id,
      numero: 'Lot 1',
      description: 'Materiel informatique',
      quantiteMax: 100,
      actif: true,
    },
  });
  console.log('✅ Lot:', lot.numero);

  // ==========================================================================
  // 4. ACTIONS DE MAINTENANCE
  // ==========================================================================

  const actionsData = [
    { code: 'NETTOYAGE', libelle: 'Nettoyage preventif' },
    { code: 'CHGT_PIECE', libelle: 'Changement de piece' },
    { code: 'CABLAGE', libelle: 'Cablage reseau' },
    { code: 'INSTALL_SYS', libelle: 'Installation systeme' },
    { code: 'ENTRETIEN', libelle: 'Entretien general' },
    { code: 'MAJ', libelle: 'Mise a jour' },
  ];

  for (const a of actionsData) {
    await prisma.actionMaintenance.upsert({
      where: { code: a.code },
      update: {},
      create: { code: a.code, libelle: a.libelle, actif: true },
    });
  }
  console.log('✅ Actions maintenance:', actionsData.length);

  // ==========================================================================
  // 5. TYPES DE PANNE
  // ==========================================================================

  const pannesData = [
    { code: 'MATERIEL', libelle: 'Panne materielle' },
    { code: 'LOGICIEL', libelle: 'Panne logicielle' },
    { code: 'RESEAU', libelle: 'Panne reseau' },
    { code: 'ALIM', libelle: 'Panne alimentation' },
  ];

  for (const p of pannesData) {
    await prisma.typePanne.upsert({
      where: { code: p.code },
      update: {},
      create: { code: p.code, libelle: p.libelle, actif: true },
    });
  }
  console.log('✅ Types panne:', pannesData.length);

  // ==========================================================================
  // 6. UTILISATEURS DE TEST
  // ==========================================================================

  const hashDirecteur = await bcrypt.hash('Directeur123!', 10);
  const hashTechnicien = await bcrypt.hash('Technicien123!', 10);
  const hashProf = await bcrypt.hash('Prof123!', 10);

  await prisma.user.upsert({
    where: { email: 'directeur@edunet.tn' },
    update: {
      etablissementId: etablissement.id,
      creId: cre.id,
    },
    create: {
      email: 'directeur@edunet.tn',
      emailVerifie: true,
      matricule: 'DIR-001',
      nom: 'Ben Ali',
      prenom: 'Mohamed',
      motDePasseHash: hashDirecteur,
      doitChangerMdp: false,
      role: Role.DIRECTEUR_ETABLISSEMENT,
      actif: true,
      telephone: '20000001',
      creId: cre.id,
      etablissementId: etablissement.id,
    },
  });
  console.log('✅ Directeur: directeur@edunet.tn / Directeur123!');

  await prisma.user.upsert({
    where: { email: 'technicien@edunet.tn' },
    update: { creId: cre.id },
    create: {
      email: 'technicien@edunet.tn',
      emailVerifie: true,
      matricule: 'TEC-001',
      nom: 'Trabelsi',
      prenom: 'Ali',
      motDePasseHash: hashTechnicien,
      doitChangerMdp: false,
      role: Role.TECHNICIEN_INTERNE,
      actif: true,
      telephone: '20000002',
      creId: cre.id,
    },
  });
  console.log('✅ Technicien: technicien@edunet.tn / Technicien123!');

  await prisma.user.upsert({
    where: { email: 'prof@edunet.tn' },
    update: {
      etablissementId: etablissement.id,
      laboId: labo.id,
    },
    create: {
      email: 'prof@edunet.tn',
      emailVerifie: true,
      matricule: 'PROF-001',
      nom: 'Gharbi',
      prenom: 'Sami',
      motDePasseHash: hashProf,
      doitChangerMdp: false,
      role: Role.PROF_RESPONSABLE,
      actif: true,
      telephone: '20000003',
      etablissementId: etablissement.id,
      laboId: labo.id,
    },
  });
  console.log('✅ Prof: prof@edunet.tn / Prof123!');

  // ==========================================================================
  // 7. EQUIPEMENTS DE TEST
  // ==========================================================================

  const equipementsData = [
    {
      numeroSerie: 'PC-001',
      marque: 'Dell',
      modele: 'OptiPlex 7010',
      type: 'PC Fixe',
    },
    {
      numeroSerie: 'PC-002',
      marque: 'HP',
      modele: 'EliteDesk 800',
      type: 'PC Fixe',
    },
    {
      numeroSerie: 'SW-001',
      marque: 'Cisco',
      modele: 'Catalyst 2960',
      type: 'Switch',
    },
  ];

  for (const e of equipementsData) {
    await prisma.equipment.upsert({
      where: { numeroSerie: e.numeroSerie },
      update: {},
      create: {
        numeroSerie: e.numeroSerie,
        marqueId: marques[e.marque].id,
        modeleId: modeles[e.modele].id,
        typeId: types[e.type].id,
        appelOffresId: ao.id,
        lotId: lot.id,
        etablissementId: etablissement.id,
        laboId: labo.id,
        etat: EquipmentState.FONCTIONNEL,
        dateReception: new Date(),
      },
    });
  }
  console.log('✅ Equipements:', equipementsData.length);

  console.log('');
  console.log('🎉 Seed termine avec succes !');
  console.log('');
  console.log('Comptes de test :');
  console.log('  - Admin      : admin@edunet.tn       / SuiviTic@2026!');
  console.log('  - Directeur  : directeur@edunet.tn   / Directeur123!');
  console.log('  - Technicien : technicien@edunet.tn  / Technicien123!');
  console.log('  - Prof       : prof@edunet.tn        / Prof123!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });