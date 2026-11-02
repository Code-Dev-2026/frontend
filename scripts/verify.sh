#!/usr/bin/env bash
set -Eeuo pipefail

if [ ! -f package.json ]; then
  echo "ERROR: este repositorio frontend no tiene package.json; copia el bootstrap antes de iniciar."
  exit 1
fi

pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test -- --runInBand --passWithNoTests
pnpm build

bash scripts/check-invariants.sh

echo "Verificación frontend completada."
