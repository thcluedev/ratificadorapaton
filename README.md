# Rectificaciones Patón

Sistema táctil de taller para reemplazar las planillas de papel: ingreso de motor, medición con fotos y videos, y presupuesto.

Hecho para tablet en **1024×768 apaisado**. Textos grandes, botones de 78px, dos acciones por pantalla.

## Levantar en local

Hace falta Node 20+.

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

`prisma migrate dev` aplica la migración y corre el seed.

Abrí [http://localhost:3000](http://localhost:3000).

## Docker (frontend + SQLite hoy, Postgres después)

Hace falta Docker y Docker Compose v2.

### Desarrollo (hot reload)

```bash
cp .env.docker.example .env
docker compose up --build
# o: npm run docker:dev
```

Primera vez con usuarios y catálogo de prueba:

```bash
RUN_SEED=true docker compose up --build
# o: npm run docker:dev:seed
```

La app queda en [http://localhost:3000](http://localhost:3000). La base SQLite vive en el volumen `paton_sqlite` (`DATABASE_URL=file:/data/dev.db`). Las fotos van al volumen `paton_uploads`.

Al arrancar el contenedor se ejecuta `prisma migrate deploy` automáticamente.

### Producción (imagen optimizada)

```bash
cp .env.docker.example .env
# Definí SESSION_SECRET largo en .env
docker compose -f docker-compose.prod.yml up --build -d
# o: npm run docker:prod
```

### Postgres (futuro)

1. En `prisma/schema.prisma` cambiá `provider` de `sqlite` a `postgresql`.
2. Ajustá migraciones para Postgres (base nueva o `prisma migrate dev` en entorno limpio).
3. En `.env`:  
   `DATABASE_URL=postgresql://paton:paton@postgres:5432/ratificadora?schema=public`
4. Levantá app + Postgres:

```bash
docker compose --profile postgres -f docker-compose.yml -f docker-compose.postgres.yml up --build
```

El servicio `postgres` usa imagen `postgres:16-alpine` y volumen `paton_postgres`.

### Usuarios de prueba

| Rol            | Nombre            | PIN  |
| -------------- | ----------------- | ---- |
| Administrador  | Roberto Patón     | 1234 |
| Operario       | Diego Fernández   | 1234 |

El PIN se carga con el teclado en pantalla, no con el del sistema.

## Variables de entorno

Ver `.env.example`.

| Variable           | Local                                      | Vercel                                      |
| ------------------ | ------------------------------------------ | ------------------------------------------- |
| `DATABASE_URL`     | `file:./dev.db` (SQLite)                   | URL de Neon o Vercel Postgres               |
| `SESSION_SECRET`   | cualquier secreto largo                    | secreto largo, distinto al de local         |
| `BLOB_READ_WRITE_TOKEN` | no hace falta                         | cuando pases el storage a Vercel Blob       |

## Desplegar en Vercel

1. Subí el repo y conectalo a un proyecto de Vercel.
2. Creá una base **Postgres** (Neon o Vercel Postgres).
3. En el esquema Prisma cambiá solo el `provider` a `postgresql` (el resto del modelo es el mismo).
4. Configurá las variables:
   - `DATABASE_URL` = la URL de Postgres
   - `SESSION_SECRET` = un secreto de 32+ caracteres
5. En el build de Vercel: `prisma migrate deploy` (agregá `"postinstall": "prisma generate"` ya está) y un comando de release `npx prisma migrate deploy && npx prisma db seed` la primera vez, o corrélos a mano contra esa base.
6. Deploy. No hace falta cambiar código de pantallas ni de actions.

### Fotos y videos

Hoy `lib/storage.ts` guarda en `/public/uploads`. En Vercel eso no persiste.

Cuando quieras Blob, reemplazá **solo** el cuerpo de `saveFile()` en `lib/storage.ts` por el upload a Vercel Blob. El resto de la app sigue usando `{ url }`.

## Roles

- **Administrador**: ingreso, listado, presupuesto e impresión. Ve precios.
- **Operario**: solo medición y carga de fotos/videos. El servidor no le manda precios ni presupuestos.

Los cambios de estado salen de las acciones reales: primer archivo → En medición; “Terminé de medir” → Medida; imprimir presupuesto → Presupuesto entregado.
