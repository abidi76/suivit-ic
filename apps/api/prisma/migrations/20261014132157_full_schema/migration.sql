-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN_CENTRAL', 'ADMIN_ADJOINT', 'SOUS_DIRECTEUR_TIC', 'SUPERVISEUR_LOCAL', 'DIRECTEUR_ETABLISSEMENT', 'PROF_RESPONSABLE', 'TECHNICIEN_INTERNE', 'TECHNICIEN_PRESTATAIRE', 'CHEF_PARC');

-- CreateEnum
CREATE TYPE "EquipmentState" AS ENUM ('EN_ATTENTE_CONFIRMATION', 'FONCTIONNEL', 'EN_PANNE', 'PERDU', 'TOTALEMENT_ENDOMMAGE', 'REFORME', 'PRETE', 'EMPRUNTE', 'NON_DECLARE');

-- CreateEnum
CREATE TYPE "ArrivalStatut" AS ENUM ('EN_ATTENTE', 'CONFIRME', 'EN_LITIGE', 'RECTIFIE');

-- CreateEnum
CREATE TYPE "InventaireStatut" AS ENUM ('OUVERTE', 'CLOTUREE');

-- CreateEnum
CREATE TYPE "StatutDeclare" AS ENUM ('FONCTIONNEL', 'EN_PANNE', 'PERDU', 'NON_DECLARE');

-- CreateEnum
CREATE TYPE "PanneStatut" AS ENUM ('DECLAREE', 'EN_COURS', 'RESOLUE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "PerteStatut" AS ENUM ('DECLAREE', 'VALIDEE', 'REFUSEE');

-- CreateEnum
CREATE TYPE "DommageStatut" AS ENUM ('PROPOSE', 'VALIDE', 'REFUSE');

-- CreateEnum
CREATE TYPE "InterventionStatut" AS ENUM ('BROUILLON', 'EN_ATTENTE_VALIDATION', 'VALIDE', 'REFUSE');

-- CreateEnum
CREATE TYPE "FormatageStatut" AS ENUM ('DEMANDE', 'APPROUVE', 'REFUSE', 'EFFECTUE');

-- CreateEnum
CREATE TYPE "BacPratiqueStatut" AS ENUM ('BROUILLON', 'SOUMIS');

-- CreateEnum
CREATE TYPE "PretStatut" AS ENUM ('DEMANDE', 'ACCEPTE_SUPERVISEUR', 'ACCEPTE_ETABLISSEMENT', 'REFUSE', 'EN_COURS', 'RETOURNE', 'EN_RETARD');

-- CreateEnum
CREATE TYPE "TicketStatut" AS ENUM ('OUVERT', 'EN_COURS', 'EN_ATTENTE_VALIDATION', 'CLOTURE', 'ANNULE');

-- CreateEnum
CREATE TYPE "Criticite" AS ENUM ('BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE');

-- CreateEnum
CREATE TYPE "MissionStatut" AS ENUM ('DEMANDEE', 'VALIDEE', 'REFUSEE', 'EN_COURS', 'TERMINEE');

-- CreateEnum
CREATE TYPE "CircuitType" AS ENUM ('INTERNET', 'INTRANET', 'SECOURS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerifie" BOOLEAN NOT NULL DEFAULT false,
    "matricule" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "doitChangerMdp" BOOLEAN NOT NULL DEFAULT true,
    "role" "Role" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "telephone" TEXT,
    "creId" TEXT,
    "etablissementId" TEXT,
    "laboId" TEXT,
    "societeId" TEXT,
    "marcheId" TEXT,
    "emailVerifieAt" TIMESTAMP(3),
    "derniereConnexion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "identifiant" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "succes" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "SmsVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cre" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "designationFr" TEXT NOT NULL,
    "designationAr" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Cre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gouvernorat" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nomFr" TEXT NOT NULL,
    "nomAr" TEXT NOT NULL,
    "creId" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Gouvernorat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delegation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nomFr" TEXT NOT NULL,
    "nomAr" TEXT NOT NULL,
    "gouvernoratId" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Delegation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etablissement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nomFr" TEXT NOT NULL,
    "nomAr" TEXT NOT NULL,
    "delegationId" TEXT NOT NULL,
    "creId" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Etablissement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Labo" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Labo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Direction" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Direction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "directionId" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeEquipement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TypeEquipement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marque" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Marque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modele" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "marqueId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Modele_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppelOffres" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "objet" TEXT,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AppelOffres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" TEXT NOT NULL,
    "appelOffresId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "description" TEXT,
    "quantiteMax" INTEGER,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionMaintenance" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ActionMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypePanne" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TypePanne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeJustificatifPerte" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TypeJustificatifPerte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fournisseur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Fournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Societe" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "matricule" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Societe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marche" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "societeId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Marche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "marqueId" TEXT NOT NULL,
    "modeleId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "appelOffresId" TEXT NOT NULL,
    "lotId" TEXT,
    "etablissementId" TEXT NOT NULL,
    "laboId" TEXT NOT NULL,
    "etat" "EquipmentState" NOT NULL DEFAULT 'EN_ATTENTE_CONFIRMATION',
    "proprietaireId" TEXT,
    "dateReception" TIMESTAMP(3),
    "dateReforme" TIMESTAMP(3),
    "motifReforme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arrival" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "bonLivraison" TEXT,
    "etablissementId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "statut" "ArrivalStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateArrivee" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateConfirmation" TIMESTAMP(3),
    "dateEcheance" TIMESTAMP(3),
    "rectificatifDe" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arrival_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrivalItem" (
    "id" TEXT NOT NULL,
    "arrivalId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ArrivalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrivalConfirmation" (
    "id" TEXT NOT NULL,
    "arrivalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "avecReserve" BOOLEAN NOT NULL DEFAULT false,
    "motif" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArrivalConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrivalLitige" (
    "id" TEXT NOT NULL,
    "arrivalId" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "traite" BOOLEAN NOT NULL DEFAULT false,
    "traiteParId" TEXT,
    "traiteAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArrivalLitige_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampagneInventaire" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateLimite" TIMESTAMP(3) NOT NULL,
    "statut" "InventaireStatut" NOT NULL DEFAULT 'OUVERTE',
    "lanceParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampagneInventaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventaireLigne" (
    "id" TEXT NOT NULL,
    "campagneId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "laboId" TEXT NOT NULL,
    "declarantId" TEXT NOT NULL,
    "statut" "StatutDeclare" NOT NULL,
    "commentaire" TEXT,
    "dateDeclaration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventaireLigne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panne" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "typePanneId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "declarantId" TEXT NOT NULL,
    "statut" "PanneStatut" NOT NULL DEFAULT 'DECLAREE',
    "ticketId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateResolution" TIMESTAMP(3),

    CONSTRAINT "Panne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perte" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "typeJustifId" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "pdfSha256" TEXT NOT NULL,
    "motif" TEXT,
    "declarantId" TEXT NOT NULL,
    "statut" "PerteStatut" NOT NULL DEFAULT 'DECLAREE',
    "valideParId" TEXT,
    "valideAt" TIMESTAMP(3),
    "motifRefus" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Perte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DommageTotal" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "proposeParId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "DommageStatut" NOT NULL DEFAULT 'PROPOSE',
    "valideProfId" TEXT,
    "valideProfAt" TIMESTAMP(3),
    "valideDirId" TEXT,
    "valideDirAt" TIMESTAMP(3),
    "valideTechId" TEXT,
    "valideTechAt" TIMESTAMP(3),
    "avisPrestataireId" TEXT,
    "avisPrestataire" TEXT,
    "avisPrestataireAt" TIMESTAMP(3),
    "refusParId" TEXT,
    "refusAt" TIMESTAMP(3),
    "motifRefus" TEXT,

    CONSTRAINT "DommageTotal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "technicienId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "ticketId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bonPdfUrl" TEXT,
    "bonPdfSha256" TEXT,
    "statut" "InterventionStatut" NOT NULL DEFAULT 'BROUILLON',
    "valideParDirId" TEXT,
    "valideAt" TIMESTAMP(3),
    "motifRefus" TEXT,

    CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Piece" (
    "id" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "marqueId" TEXT,
    "typePiece" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Piece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterventionPiece" (
    "id" TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,
    "pieceId" TEXT,
    "numeroSerie" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "ajoutee" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterventionPiece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharteNumerique" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "contenuMd" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharteNumerique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcceptationCharte" (
    "id" TEXT NOT NULL,
    "charteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketId" TEXT,
    "interventionId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcceptationCharte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formatage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "equipementId" TEXT NOT NULL,
    "demandeParId" TEXT NOT NULL,
    "statut" "FormatageStatut" NOT NULL DEFAULT 'DEMANDE',
    "approuveParId" TEXT,
    "approuveAt" TIMESTAMP(3),
    "motifRefus" TEXT,
    "charteId" TEXT,
    "effectueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Formatage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacPratique" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "directeurId" TEXT NOT NULL,
    "anneeScolaire" TEXT NOT NULL,
    "statut" "BacPratiqueStatut" NOT NULL DEFAULT 'BROUILLON',
    "dateSoumission" TIMESTAMP(3),
    "etatConnexion" TEXT,
    "besoinFlybox" BOOLEAN NOT NULL DEFAULT false,
    "besoinSecours" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BacPratique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacPratiqueManque" (
    "id" TEXT NOT NULL,
    "bacPratiqueId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "BacPratiqueManque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacPratiqueDetail" (
    "id" TEXT NOT NULL,
    "bacPratiqueId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,

    CONSTRAINT "BacPratiqueDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pret" (
    "id" TEXT NOT NULL,
    "etablissementPreteurId" TEXT NOT NULL,
    "etablissementEmprunteurId" TEXT NOT NULL,
    "superviseurId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statut" "PretStatut" NOT NULL DEFAULT 'DEMANDE',
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "dateRetourEffective" TIMESTAMP(3),
    "motifRefus" TEXT,
    "accepteParPreteurId" TEXT,
    "accepteParPreteurAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PretItem" (
    "id" TEXT NOT NULL,
    "pretId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "retourne" BOOLEAN NOT NULL DEFAULT false,
    "retourneAt" TIMESTAMP(3),
    "confirmePreteurAt" TIMESTAMP(3),
    "confirmeEmprunteurAt" TIMESTAMP(3),

    CONSTRAINT "PretItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "laboId" TEXT,
    "equipmentId" TEXT,
    "declarantId" TEXT NOT NULL,
    "typePanneId" TEXT NOT NULL,
    "criticite" "Criticite" NOT NULL DEFAULT 'MOYENNE',
    "bacPratique" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "statut" "TicketStatut" NOT NULL DEFAULT 'OUVERT',
    "valideParId" TEXT,
    "valideAt" TIMESTAMP(3),
    "noteSatisfaction" INTEGER,
    "commentaireCloture" TEXT,
    "dateCloture" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompteNumerique" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "plateforme" TEXT NOT NULL,
    "anciennesTaches" TEXT,
    "anciensLieux" TEXT,
    "remarqueConfidentielle" TEXT,
    "transmisCnte" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompteNumerique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicule" (
    "id" TEXT NOT NULL,
    "immatricule" TEXT NOT NULL,
    "marque" TEXT,
    "modele" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Vehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chauffeur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Chauffeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "ticketId" TEXT,
    "vehiculeId" TEXT,
    "chauffeurId" TEXT,
    "dateDepart" TIMESTAMP(3) NOT NULL,
    "dateRetour" TIMESTAMP(3),
    "statut" "MissionStatut" NOT NULL DEFAULT 'DEMANDEE',
    "valideParId" TEXT,
    "valideAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "pdfSha256" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionAccompagnant" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MissionAccompagnant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CircuitReseau" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "type" "CircuitType" NOT NULL,
    "fournisseur" TEXT,
    "debit" TEXT,
    "dateActivation" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CircuitReseau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT NOT NULL,
    "avant" JSONB,
    "apres" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentArchive" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "taille" INTEGER,
    "mimeType" TEXT,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT NOT NULL,
    "deposeParId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_matricule_key" ON "User"("matricule");

-- CreateIndex
CREATE INDEX "User_role_creId_idx" ON "User"("role", "creId");

-- CreateIndex
CREATE INDEX "User_role_etablissementId_idx" ON "User"("role", "etablissementId");

-- CreateIndex
CREATE INDEX "User_actif_idx" ON "User"("actif");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshTokenHash_key" ON "Session"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_revokedAt_idx" ON "Session"("userId", "revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_createdAt_idx" ON "PasswordResetToken"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_identifiant_createdAt_idx" ON "LoginAttempt"("identifiant", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_ip_createdAt_idx" ON "LoginAttempt"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "SmsVerification_userId_createdAt_idx" ON "SmsVerification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Cre_code_key" ON "Cre"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Gouvernorat_code_key" ON "Gouvernorat"("code");

-- CreateIndex
CREATE INDEX "Gouvernorat_creId_idx" ON "Gouvernorat"("creId");

-- CreateIndex
CREATE UNIQUE INDEX "Delegation_code_key" ON "Delegation"("code");

-- CreateIndex
CREATE INDEX "Delegation_gouvernoratId_idx" ON "Delegation"("gouvernoratId");

-- CreateIndex
CREATE UNIQUE INDEX "Etablissement_code_key" ON "Etablissement"("code");

-- CreateIndex
CREATE INDEX "Etablissement_creId_idx" ON "Etablissement"("creId");

-- CreateIndex
CREATE INDEX "Etablissement_delegationId_idx" ON "Etablissement"("delegationId");

-- CreateIndex
CREATE UNIQUE INDEX "Labo_etablissementId_nom_key" ON "Labo"("etablissementId", "nom");

-- CreateIndex
CREATE UNIQUE INDEX "TypeEquipement_nom_key" ON "TypeEquipement"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Marque_nom_key" ON "Marque"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Modele_nom_marqueId_typeId_key" ON "Modele"("nom", "marqueId", "typeId");

-- CreateIndex
CREATE UNIQUE INDEX "AppelOffres_numero_key" ON "AppelOffres"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Lot_appelOffresId_numero_key" ON "Lot"("appelOffresId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "ActionMaintenance_code_key" ON "ActionMaintenance"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TypePanne_code_key" ON "TypePanne"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TypeJustificatifPerte_code_key" ON "TypeJustificatifPerte"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Fournisseur_nom_key" ON "Fournisseur"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Societe_nom_key" ON "Societe"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Societe_matricule_key" ON "Societe"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Marche_numero_key" ON "Marche"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_numeroSerie_key" ON "Equipment"("numeroSerie");

-- CreateIndex
CREATE INDEX "Equipment_etablissementId_etat_idx" ON "Equipment"("etablissementId", "etat");

-- CreateIndex
CREATE INDEX "Equipment_typeId_idx" ON "Equipment"("typeId");

-- CreateIndex
CREATE INDEX "Equipment_appelOffresId_idx" ON "Equipment"("appelOffresId");

-- CreateIndex
CREATE INDEX "Equipment_proprietaireId_idx" ON "Equipment"("proprietaireId");

-- CreateIndex
CREATE UNIQUE INDEX "Arrival_numero_key" ON "Arrival"("numero");

-- CreateIndex
CREATE INDEX "Arrival_etablissementId_statut_idx" ON "Arrival"("etablissementId", "statut");

-- CreateIndex
CREATE INDEX "Arrival_dateEcheance_idx" ON "Arrival"("dateEcheance");

-- CreateIndex
CREATE UNIQUE INDEX "ArrivalItem_equipmentId_key" ON "ArrivalItem"("equipmentId");

-- CreateIndex
CREATE INDEX "ArrivalConfirmation_arrivalId_role_idx" ON "ArrivalConfirmation"("arrivalId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "ArrivalConfirmation_arrivalId_userId_key" ON "ArrivalConfirmation"("arrivalId", "userId");

-- CreateIndex
CREATE INDEX "ArrivalLitige_arrivalId_traite_idx" ON "ArrivalLitige"("arrivalId", "traite");

-- CreateIndex
CREATE INDEX "CampagneInventaire_statut_dateLimite_idx" ON "CampagneInventaire"("statut", "dateLimite");

-- CreateIndex
CREATE INDEX "InventaireLigne_campagneId_statut_idx" ON "InventaireLigne"("campagneId", "statut");

-- CreateIndex
CREATE INDEX "InventaireLigne_etablissementId_idx" ON "InventaireLigne"("etablissementId");

-- CreateIndex
CREATE UNIQUE INDEX "InventaireLigne_campagneId_equipmentId_key" ON "InventaireLigne"("campagneId", "equipmentId");

-- CreateIndex
CREATE INDEX "Panne_equipmentId_statut_idx" ON "Panne"("equipmentId", "statut");

-- CreateIndex
CREATE INDEX "Perte_equipmentId_statut_idx" ON "Perte"("equipmentId", "statut");

-- CreateIndex
CREATE INDEX "DommageTotal_equipmentId_statut_idx" ON "DommageTotal"("equipmentId", "statut");

-- CreateIndex
CREATE INDEX "Intervention_equipmentId_statut_idx" ON "Intervention"("equipmentId", "statut");

-- CreateIndex
CREATE INDEX "Intervention_technicienId_statut_idx" ON "Intervention"("technicienId", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "Piece_numeroSerie_key" ON "Piece"("numeroSerie");

-- CreateIndex
CREATE INDEX "InterventionPiece_interventionId_idx" ON "InterventionPiece"("interventionId");

-- CreateIndex
CREATE UNIQUE INDEX "CharteNumerique_version_key" ON "CharteNumerique"("version");

-- CreateIndex
CREATE INDEX "AcceptationCharte_userId_date_idx" ON "AcceptationCharte"("userId", "date");

-- CreateIndex
CREATE INDEX "AcceptationCharte_ticketId_idx" ON "AcceptationCharte"("ticketId");

-- CreateIndex
CREATE INDEX "Formatage_ticketId_statut_idx" ON "Formatage"("ticketId", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "BacPratique_etablissementId_anneeScolaire_key" ON "BacPratique"("etablissementId", "anneeScolaire");

-- CreateIndex
CREATE UNIQUE INDEX "BacPratiqueManque_bacPratiqueId_typeId_key" ON "BacPratiqueManque"("bacPratiqueId", "typeId");

-- CreateIndex
CREATE UNIQUE INDEX "BacPratiqueDetail_bacPratiqueId_equipmentId_key" ON "BacPratiqueDetail"("bacPratiqueId", "equipmentId");

-- CreateIndex
CREATE INDEX "Pret_etablissementPreteurId_statut_idx" ON "Pret"("etablissementPreteurId", "statut");

-- CreateIndex
CREATE INDEX "Pret_etablissementEmprunteurId_statut_idx" ON "Pret"("etablissementEmprunteurId", "statut");

-- CreateIndex
CREATE INDEX "Pret_dateFin_idx" ON "Pret"("dateFin");

-- CreateIndex
CREATE UNIQUE INDEX "PretItem_equipmentId_key" ON "PretItem"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_numero_key" ON "Ticket"("numero");

-- CreateIndex
CREATE INDEX "Ticket_etablissementId_statut_idx" ON "Ticket"("etablissementId", "statut");

-- CreateIndex
CREATE INDEX "Ticket_bacPratique_idx" ON "Ticket"("bacPratique");

-- CreateIndex
CREATE INDEX "CompteNumerique_etablissementId_idx" ON "CompteNumerique"("etablissementId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_immatricule_key" ON "Vehicule"("immatricule");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_numero_key" ON "Mission"("numero");

-- CreateIndex
CREATE INDEX "Mission_dateDepart_statut_idx" ON "Mission"("dateDepart", "statut");

-- CreateIndex
CREATE INDEX "CircuitReseau_etablissementId_type_idx" ON "CircuitReseau"("etablissementId", "type");

-- CreateIndex
CREATE INDEX "CircuitReseau_dateFin_idx" ON "CircuitReseau"("dateFin");

-- CreateIndex
CREATE INDEX "AuditLog_entite_entiteId_idx" ON "AuditLog"("entite", "entiteId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_date_idx" ON "AuditLog"("userId", "date");

-- CreateIndex
CREATE INDEX "AuditLog_action_date_idx" ON "AuditLog"("action", "date");

-- CreateIndex
CREATE INDEX "DocumentArchive_entite_entiteId_idx" ON "DocumentArchive"("entite", "entiteId");

-- CreateIndex
CREATE INDEX "DocumentArchive_sha256_idx" ON "DocumentArchive"("sha256");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_creId_fkey" FOREIGN KEY ("creId") REFERENCES "Cre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_laboId_fkey" FOREIGN KEY ("laboId") REFERENCES "Labo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_societeId_fkey" FOREIGN KEY ("societeId") REFERENCES "Societe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_marcheId_fkey" FOREIGN KEY ("marcheId") REFERENCES "Marche"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gouvernorat" ADD CONSTRAINT "Gouvernorat_creId_fkey" FOREIGN KEY ("creId") REFERENCES "Cre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delegation" ADD CONSTRAINT "Delegation_gouvernoratId_fkey" FOREIGN KEY ("gouvernoratId") REFERENCES "Gouvernorat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etablissement" ADD CONSTRAINT "Etablissement_delegationId_fkey" FOREIGN KEY ("delegationId") REFERENCES "Delegation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etablissement" ADD CONSTRAINT "Etablissement_creId_fkey" FOREIGN KEY ("creId") REFERENCES "Cre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Labo" ADD CONSTRAINT "Labo_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_directionId_fkey" FOREIGN KEY ("directionId") REFERENCES "Direction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modele" ADD CONSTRAINT "Modele_marqueId_fkey" FOREIGN KEY ("marqueId") REFERENCES "Marque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modele" ADD CONSTRAINT "Modele_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TypeEquipement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_appelOffresId_fkey" FOREIGN KEY ("appelOffresId") REFERENCES "AppelOffres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marche" ADD CONSTRAINT "Marche_societeId_fkey" FOREIGN KEY ("societeId") REFERENCES "Societe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_laboId_fkey" FOREIGN KEY ("laboId") REFERENCES "Labo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_marqueId_fkey" FOREIGN KEY ("marqueId") REFERENCES "Marque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_modeleId_fkey" FOREIGN KEY ("modeleId") REFERENCES "Modele"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TypeEquipement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_appelOffresId_fkey" FOREIGN KEY ("appelOffresId") REFERENCES "AppelOffres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arrival" ADD CONSTRAINT "Arrival_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalItem" ADD CONSTRAINT "ArrivalItem_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "Arrival"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalItem" ADD CONSTRAINT "ArrivalItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalConfirmation" ADD CONSTRAINT "ArrivalConfirmation_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "Arrival"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalConfirmation" ADD CONSTRAINT "ArrivalConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalLitige" ADD CONSTRAINT "ArrivalLitige_arrivalId_fkey" FOREIGN KEY ("arrivalId") REFERENCES "Arrival"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventaireLigne" ADD CONSTRAINT "InventaireLigne_campagneId_fkey" FOREIGN KEY ("campagneId") REFERENCES "CampagneInventaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventaireLigne" ADD CONSTRAINT "InventaireLigne_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panne" ADD CONSTRAINT "Panne_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panne" ADD CONSTRAINT "Panne_typePanneId_fkey" FOREIGN KEY ("typePanneId") REFERENCES "TypePanne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panne" ADD CONSTRAINT "Panne_declarantId_fkey" FOREIGN KEY ("declarantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panne" ADD CONSTRAINT "Panne_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perte" ADD CONSTRAINT "Perte_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perte" ADD CONSTRAINT "Perte_typeJustifId_fkey" FOREIGN KEY ("typeJustifId") REFERENCES "TypeJustificatifPerte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perte" ADD CONSTRAINT "Perte_declarantId_fkey" FOREIGN KEY ("declarantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DommageTotal" ADD CONSTRAINT "DommageTotal_proposeParId_fkey" FOREIGN KEY ("proposeParId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DommageTotal" ADD CONSTRAINT "DommageTotal_valideProfId_fkey" FOREIGN KEY ("valideProfId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DommageTotal" ADD CONSTRAINT "DommageTotal_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ActionMaintenance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionPiece" ADD CONSTRAINT "InterventionPiece_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionPiece" ADD CONSTRAINT "InterventionPiece_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcceptationCharte" ADD CONSTRAINT "AcceptationCharte_charteId_fkey" FOREIGN KEY ("charteId") REFERENCES "CharteNumerique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formatage" ADD CONSTRAINT "Formatage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacPratique" ADD CONSTRAINT "BacPratique_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacPratiqueManque" ADD CONSTRAINT "BacPratiqueManque_bacPratiqueId_fkey" FOREIGN KEY ("bacPratiqueId") REFERENCES "BacPratique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacPratiqueManque" ADD CONSTRAINT "BacPratiqueManque_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TypeEquipement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacPratiqueDetail" ADD CONSTRAINT "BacPratiqueDetail_bacPratiqueId_fkey" FOREIGN KEY ("bacPratiqueId") REFERENCES "BacPratique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacPratiqueDetail" ADD CONSTRAINT "BacPratiqueDetail_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pret" ADD CONSTRAINT "Pret_etablissementPreteurId_fkey" FOREIGN KEY ("etablissementPreteurId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pret" ADD CONSTRAINT "Pret_etablissementEmprunteurId_fkey" FOREIGN KEY ("etablissementEmprunteurId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pret" ADD CONSTRAINT "Pret_superviseurId_fkey" FOREIGN KEY ("superviseurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PretItem" ADD CONSTRAINT "PretItem_pretId_fkey" FOREIGN KEY ("pretId") REFERENCES "Pret"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PretItem" ADD CONSTRAINT "PretItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_declarantId_fkey" FOREIGN KEY ("declarantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_valideParId_fkey" FOREIGN KEY ("valideParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_typePanneId_fkey" FOREIGN KEY ("typePanneId") REFERENCES "TypePanne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionAccompagnant" ADD CONSTRAINT "MissionAccompagnant_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
