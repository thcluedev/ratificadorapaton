import { PrismaClient, Rol, CategoriaTrabajo } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

const PIN = hashSync("1234", 10);

const catalogo: {
  categoria: CategoriaTrabajo;
  descripcion: string;
  precioSugerido: number;
  orden: number;
}[] = [
  { categoria: "BLOCK", descripcion: "Rectificar cilindros", precioSugerido: 45000, orden: 1 },
  { categoria: "BLOCK", descripcion: "Encamisar", precioSugerido: 80000, orden: 2 },
  { categoria: "BLOCK", descripcion: "Planear block", precioSugerido: 35000, orden: 3 },
  { categoria: "BLOCK", descripcion: "Mandrilar bancada", precioSugerido: 40000, orden: 4 },
  { categoria: "BLOCK", descripcion: "Prueba hidráulica", precioSugerido: 15000, orden: 5 },

  { categoria: "CIGUENAL", descripcion: "Rectificar bancada y biela", precioSugerido: 55000, orden: 1 },
  { categoria: "CIGUENAL", descripcion: "Pulir", precioSugerido: 18000, orden: 2 },
  { categoria: "CIGUENAL", descripcion: "Balancear", precioSugerido: 25000, orden: 3 },
  { categoria: "CIGUENAL", descripcion: "Rectificar puntas", precioSugerido: 20000, orden: 4 },

  { categoria: "ARBOL_LEVAS", descripcion: "Rectificar levas", precioSugerido: 30000, orden: 1 },
  { categoria: "ARBOL_LEVAS", descripcion: "Rectificar apoyos", precioSugerido: 28000, orden: 2 },
  { categoria: "ARBOL_LEVAS", descripcion: "Enderezar", precioSugerido: 22000, orden: 3 },

  { categoria: "TAPA_CILINDRO", descripcion: "Planear tapa", precioSugerido: 25000, orden: 1 },
  { categoria: "TAPA_CILINDRO", descripcion: "Asentar válvulas", precioSugerido: 30000, orden: 2 },
  { categoria: "TAPA_CILINDRO", descripcion: "Cambiar guías", precioSugerido: 20000, orden: 3 },
  { categoria: "TAPA_CILINDRO", descripcion: "Prueba hidráulica", precioSugerido: 15000, orden: 4 },
  { categoria: "TAPA_CILINDRO", descripcion: "Armado de tapa", precioSugerido: 35000, orden: 5 },

  { categoria: "VARIOS", descripcion: "Juego de juntas", precioSugerido: 18000, orden: 1 },
  { categoria: "VARIOS", descripcion: "Lavado de piezas", precioSugerido: 8000, orden: 2 },
  { categoria: "VARIOS", descripcion: "Armado de motor", precioSugerido: 50000, orden: 3 },
  { categoria: "VARIOS", descripcion: "Repuestos", precioSugerido: 10000, orden: 4 },
];

async function main() {
  await prisma.trabajo.deleteMany();
  await prisma.piezaFichaItem.deleteMany();
  await prisma.mensajeOrden.deleteMany();
  await prisma.archivo.deleteMany();
  await prisma.medicion.deleteMany();
  await prisma.pieza.deleteMany();
  await prisma.orden.deleteMany();
  await prisma.catalogoTrabajo.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { nombre: "Roberto Patón", rol: Rol.ADMIN, pin: PIN, activo: true },
      { nombre: "Diego Fernández", rol: Rol.OPERARIO, pin: PIN, activo: true },
    ],
  });

  await prisma.catalogoTrabajo.createMany({ data: catalogo });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
