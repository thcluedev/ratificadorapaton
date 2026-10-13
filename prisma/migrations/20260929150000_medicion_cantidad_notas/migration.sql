-- AlterTable
ALTER TABLE "PiezaFichaItem" ADD COLUMN "nota" TEXT;
ALTER TABLE "PiezaFichaItem" ADD COLUMN "cantidadActiva" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PiezaFichaItem" ADD COLUMN "cantidadNumero" TEXT;
ALTER TABLE "PiezaFichaItem" ADD COLUMN "cantidadTexto" TEXT;

-- AlterTable
ALTER TABLE "Medicion" ADD COLUMN "cantidadActiva" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Medicion" ADD COLUMN "cantidadNumero" TEXT;
ALTER TABLE "Medicion" ADD COLUMN "cantidadTexto" TEXT;
