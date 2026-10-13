-- CreateTable
CREATE TABLE "PiezaFichaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordenId" TEXT NOT NULL,
    "piezaTipo" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "marcado" BOOLEAN NOT NULL DEFAULT false,
    "marcadoPor" TEXT,
    "marcadoEn" DATETIME,
    CONSTRAINT "PiezaFichaItem_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PiezaFichaItem_ordenId_piezaTipo_itemId_key" ON "PiezaFichaItem"("ordenId", "piezaTipo", "itemId");

-- CreateIndex
CREATE INDEX "PiezaFichaItem_ordenId_piezaTipo_idx" ON "PiezaFichaItem"("ordenId", "piezaTipo");
