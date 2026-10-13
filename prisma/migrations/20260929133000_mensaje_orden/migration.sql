-- CreateTable
CREATE TABLE "MensajeOrden" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordenId" TEXT NOT NULL,
    "autorId" TEXT,
    "tipo" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "meta" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MensajeOrden_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MensajeOrden_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MensajeOrden_ordenId_creadoEn_idx" ON "MensajeOrden"("ordenId", "creadoEn");
