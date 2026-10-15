#!/bin/sh
set -e

mkdir -p /data /app/public/uploads

echo "Aplicando migraciones Prisma..."
npx prisma migrate deploy

if [ "${RUN_SEED}" = "true" ]; then
  echo "Ejecutando seed..."
  npx prisma db seed
fi

exec "$@"
