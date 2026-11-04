# Camino Seguro — Frontend

Base del monorepo frontend para la plataforma Camino Seguro. El repositorio se organiza por roles de usuario y por paquetes compartidos de dominio y contratos.

## Estructura del repositorio

```text
frontend/
├─ apps/
│  ├─ portal/
│  │  ├─ app/
│  │  ├─ src/
│  │  ├─ package.json
│  │  ├─ next.config.mjs
│  │  ├─ tsconfig.json
│  │  └─ tailwind.config.ts
│  │
│  ├─ acudiente/
│  │  ├─ app/
│  │  ├─ src/
│  │  ├─ package.json
│  │  ├─ app.config.ts
│  │  ├─ app.json
│  │  └─ tsconfig.json
│  │
│  └─ monitora/
│     ├─ app/
│     ├─ src/
│     ├─ package.json
│     ├─ app.config.ts
│     ├─ app.json
│     └─ tsconfig.json
│
├─ packages/
│  ├─ config/
│  │  └─ package.json
│  │
│  ├─ contracts/
│  │  ├─ src/
│  │  └─ package.json
│  │
│  ├─ domain/
│  │  ├─ src/
│  │  └─ package.json
│  │
│  └─ ui/
│     ├─ src/
│     └─ package.json
│
├─ .editorconfig
├─ .env.example
├─ .gitattributes
├─ .gitignore
├─ .nvmrc
├─ package.json
├─ pnpm-workspace.yaml
├─ pnpm-lock.yaml
├─ turbo.json
├─ README.md
└─ .git
```

## Qué contiene cada nivel

### `apps/portal`
Aplicación web para administración operativa: rutas, matrículas, expedientes, reportes y coordinación.

### `apps/acudiente`
Aplicación móvil para acudientes: seguimiento del recorrido, notificaciones y estado del menor.

### `apps/monitora`
Aplicación móvil para monitoras: asistencia, QR, custodia, entregas, alertas y trabajo offline.

### `packages/contracts`
Contratos con el backend: DTOs, tipos, eventos y modelos compartidos.

### `packages/domain`
Lógica de negocio: estados, validaciones, reglas de capacidad, restricciones y denegaciones.

### `packages/ui`
Primitivas visuales reutilizables para todas las apps.

### `packages/config`
Configuración base de TypeScript, linting y tooling compartido.

## Stack base

- Node 20 LTS
- pnpm 10
- Turborepo
- TypeScript
- Next.js para la app web
- Expo + React Native para apps móviles

## Configuración inicial

```bash
cd frontend
pnpm install --frozen-lockfile
```

## Comandos básicos

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Convención de arquitectura

- Cada app está orientada a un rol o usuario concreto.
- Los paquetes compartidos resuelven dominio, contratos y UI.
- La lógica de negocio vive en `packages/domain` y no en la capa visual.
- La UI no debe depender de transporte ni infraestructura concreta.

## Cómo contribuir

1. Crear o trabajar dentro de la app correcta según el rol.
2. Mantener la lógica de negocio en `packages/domain`.
3. Usar `packages/contracts` para cualquier cambio de API o evento.
4. Reutilizar `packages/ui` en lugar de duplicar componentes.
5. Ejecutar lint, typecheck y tests antes de cerrar cambios.

## Estado actual

Este README representa la base técnica del repositorio y no un producto final cerrado. La intención es mantener una estructura clara y escalable para el frontend de Camino Seguro.

- `apps/portal`: portal web para coordinación, rutas, matrículas y gestión operativa.
- `apps/acudiente`: app móvil del acudiente para seguimiento y comunicación.
- `apps/monitora`: app móvil de la monitora para abordaje, custodia y entregas.
- `packages/contracts`: tipos, DTOs y eventos compartidos entre apps y backend.
- `packages/domain`: reglas de negocio, estados, transiciones y validaciones puras.
- `packages/ui`: componentes reutilizables sin lógica de negocio.
- `packages/config`: configuración centralizada de lint, TypeScript y tooling del monorepo.

La dirección de dependencias es: `apps/* -> packages/*`. Nunca al revés.

## Stack base

- Node 20 LTS
- pnpm 10
- Turborepo
- TypeScript
- Next.js para portal
- Expo + React Native para apps móviles
- arquitectura por paquetes compartidos

## Requisitos

- Node 20
- pnpm 10

## Comandos básicos

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Convenciones de trabajo

- El frontend consume la API del backend; no la implementa.
- La lógica de negocio se centraliza en `packages/domain`.
- Los contratos se comparten desde `packages/contracts`.
- La UI no debe depender directamente de transporte ni infraestructura concreta.
- La base del proyecto debe mantenerse pequeña, clara y alineada con el SRS.

## Estado actual

Este README describe la base técnica del repositorio y no la implementación final del producto. La intención es mantener una estructura limpia y alineada con el stack del SRS: monorepo, apps por rol y paquetes compartidos.
