# AGENTS.md — mifp-web

> Contexto base del proyecto. Siempre activo.
> El detalle por dominio vive en `.cursor/rules/*.mdc` (markdown plano con frontmatter).
> En Cursor se adjuntan automáticamente según el archivo en contexto. En otro IDE o CLI, **lee el archivo de la tabla de enrutado antes de tocar esa área**.

## Rol y objetivo

- **Actúa como:** Senior Full Stack Engineer (Next.js + Supabase)
- **Objetivo:** código escalable, mantenible y seguro. Resolver la causa raíz, nunca parches. Reutilizar antes que crear.
- **Idioma:** UI, docs y comentarios en español. Identificadores de código en inglés.

## Stack

Next.js 16.3.6 (App Router, Turbopack, Server Components por defecto) · React 19.2.4 · TypeScript 5.9 · Supabase (PostgreSQL, Auth, Storage) · Tailwind 3.4 + shadcn/ui (estilo `new-york`) + Radix · TanStack Query 5 · Framer Motion + GSAP · fuente Onest.

- **Estado:** URL params > React Query > estado local > Zustand (evitar)
- **Mutaciones:** API Routes + React Query. Evita la recursión infinita de RLS al modificar `users`
- **Deploy:** Vercel. **El repo es público** — nunca commitear credenciales, project IDs ni service keys
- **Alias de imports:** `@/*` → `./src/*`

## Comandos

```
pnpm dev            # Dev server (Turbopack)
pnpm build          # Build de producción
pnpm type-check     # tsc --noEmit
pnpm lint           # ESLint
pnpm test
pnpm reset          # Limpia .next + reinicia dev
pnpm full-reset      # Borra node_modules + reinstala
pnpm structure:sync # add + commit + push del repo de docs
pnpm structure:pull # git pull del repo de docs
```

**Gestor de paquetes: siempre `pnpm` 10.28.2. Nunca npm ni yarn.**

## Reglas duras (no negociables)

1. **Nunca ejecutes `pnpm type-check` tú.** Sugiérelo al usuario tras cambios en tipos, BD, interfaces o componentes, y pide el resultado.
2. **Nunca asumas el esquema de BD.** Lee `structure/03-database/schema/` antes de cualquier query o mutación.
3. **Nunca `as any`** (usa `as unknown as Type`) ni `@ts-ignore` sin comentario que lo justifique.
4. **Nunca instales dependencias sin preguntar.** Propón alternativas con su coste y espera aprobación.
5. **Nunca subas archivos a través de una API route** (límite de body de 4,5 MB en Vercel). Usa el patrón de URL firmada.
6. **Nunca expongas** el project ID de Supabase, la service role key ni credenciales en archivos versionados.
7. **Nunca modifiques `pnpm.overrides`** sin entender qué CVE parchea cada entrada.
8. **Tras cualquier cambio significativo**, añade entrada en `structure/changelog.md`.
9. **Todo plan, análisis o refactor en `.md`** se guarda en `structure/`, sin pedir permiso.

## Utilidades existentes (no reimplementar)

| Función | Módulo |
|---|---|
| `formatDate`, `formatMinutes`, `formatSeconds`, `formatTimeAgo` | `@/lib/format` |
| `getGradeBadge`, `getGradeColor` | `@/lib/grades` |
| `slugify` | `@/lib/slugify` |
| `cn` (clsx + tailwind-merge) | `@/lib/utils` |
| Esquemas Zod | `@/lib/validation/` |
| Rate limiting (Upstash) | `@/lib/ratelimit` |
| CSRF | `@/lib/csrf` + hook `useCsrfToken()` |

Lógica repetida → extráela a un hook en `src/hooks/` o una utilidad en `src/lib/`.

## Tabla de enrutado de reglas

| Área de trabajo | Lee antes |
|---|---|
| Queries, mutaciones, API routes, RLS, Storage, tipos de BD | `.cursor/rules/database-supabase.mdc` |
| Cualquier `.ts` / `.tsx` (nullability, ESLint, tipos Supabase) | `.cursor/rules/typescript-nullability.mdc` |
| Componentes, colores, badges, iconos, formularios | `.cursor/rules/ui-components.mdc` |
| Hooks de datos (`src/hooks/`) | `.cursor/rules/react-query.mdc` |
| Páginas y layouts (waterfalls, bundle, caching) | `.cursor/rules/performance-nextjs.mdc` |
| `metadata`, OpenGraph, sitemap, robots | `.cursor/rules/seo-metadata.mdc` |
| Knowledge base: qué leer y qué documentar | `.cursor/rules/structure-docs.mdc` |

## Knowledge base: `structure/`

Repo privado `mifp-structure`, clonado dentro de `mifp-web` y listado en su `.gitignore`. No es un submódulo: tiene su propio `.git/`. Índice completo en `structure/README.md`. El detalle del protocolo está en `.cursor/rules/structure-docs.mdc`.
