-- AlterTable
ALTER TABLE "Archivo" ADD COLUMN "fichaItemId" TEXT;

-- CreateIndex
CREATE INDEX "Archivo_ordenId_piezaTipo_fichaItemId_idx" ON "Archivo"("ordenId", "piezaTipo", "fichaItemId");
