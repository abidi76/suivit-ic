/*
  Warnings:

  - You are about to drop the column `actionId` on the `Intervention` table. All the data in the column will be lost.
  - You are about to drop the column `equipmentId` on the `Intervention` table. All the data in the column will be lost.
  - You are about to drop the column `interventionId` on the `InterventionPiece` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference]` on the table `Intervention` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `etablissementId` to the `Intervention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `Intervention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interventionLigneId` to the `InterventionPiece` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Intervention" DROP CONSTRAINT "Intervention_actionId_fkey";

-- DropForeignKey
ALTER TABLE "Intervention" DROP CONSTRAINT "Intervention_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "InterventionPiece" DROP CONSTRAINT "InterventionPiece_interventionId_fkey";

-- DropIndex
DROP INDEX "Intervention_equipmentId_statut_idx";

-- DropIndex
DROP INDEX "InterventionPiece_interventionId_idx";

-- AlterTable
ALTER TABLE "Intervention" DROP COLUMN "actionId",
DROP COLUMN "equipmentId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "etablissementId" TEXT NOT NULL,
ADD COLUMN     "reference" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InterventionPiece" DROP COLUMN "interventionId",
ADD COLUMN     "interventionLigneId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "InterventionLigne" (
    "id" TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "commentaire" TEXT,

    CONSTRAINT "InterventionLigne_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterventionLigne_interventionId_idx" ON "InterventionLigne"("interventionId");

-- CreateIndex
CREATE INDEX "InterventionLigne_equipmentId_idx" ON "InterventionLigne"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Intervention_reference_key" ON "Intervention"("reference");

-- CreateIndex
CREATE INDEX "Intervention_etablissementId_statut_idx" ON "Intervention"("etablissementId", "statut");

-- CreateIndex
CREATE INDEX "InterventionPiece_interventionLigneId_idx" ON "InterventionPiece"("interventionLigneId");

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionLigne" ADD CONSTRAINT "InterventionLigne_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionLigne" ADD CONSTRAINT "InterventionLigne_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionLigne" ADD CONSTRAINT "InterventionLigne_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ActionMaintenance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionPiece" ADD CONSTRAINT "InterventionPiece_interventionLigneId_fkey" FOREIGN KEY ("interventionLigneId") REFERENCES "InterventionLigne"("id") ON DELETE CASCADE ON UPDATE CASCADE;
