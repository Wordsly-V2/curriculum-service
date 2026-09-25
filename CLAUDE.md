# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Wordsly curriculum microservice (NestJS + Prisma + PostgreSQL, port 3004, database `curriculum`). Owns **Wordsly Path**, the public CEFR curriculum (Pre-A1 → C1) that every user can see and learn:
- the content: stages, units, lessons, steps, learn items, dialogues and checkpoints, with draft/publish releases
- per-learner progression: enrollment, lesson completion, unlocking, placement
- the admin authoring API

The design and the task tracker live in the workspace: `../../docs/wordsly-path/` (read `PROGRESS.md` first). Decisions already taken are in `DECISIONS.md` there; don't re-debate them.

**Spaced repetition is not here.** Items get FSRS cards in learning-service (`WordProgress.source = PATH`). learning-service asks this service which item ids are published (`POST /path/items/filter-published`), forwarding the learner's own token.

## Commands

```bash
npm run start:dev          # watch mode on PORT (default 3004)
npm run build              # prisma generate + nest build
npm run lint               # eslint --fix
npm run test               # jest (rootDir=src, *.spec.ts)
npx prisma migrate dev     # create/apply migrations
```

## Auth

The global guards in `src/auth/jwt/` are copied verbatim from learning-service and vocabulary-service. Keep them identical.

| Guard | Behaviour |
|---|---|
| `AccessGuard` | Deny-by-default. Admits a request only with `@Public()` or a valid RS256 access token verified against `AUTH_JWKS_URI`. |
| `RolesGuard` | Enforces `@Roles('admin')` using the token's `roles` claim. Put it on every admin controller at class level. |
| `UserScopeGuard` | Rejects any path or query parameter naming a user. |

The learner is always `@CurrentUser()` (the token's `sub`).

## Layout

| Module | Role |
|---|---|
| `path-content/` | Learner reads under `/path` (the gateway routes `/path` and `/admin/path` here). |
| `cache/` | Redis. Prefix `curr`. `getOrSetGlobal` for published content, which is the same for everyone; `getOrSet` + `invalidateUser` for learner state. |
| `messaging/` | Kafka producer only. `PATH_ITEMS_RETIRED_TOPIC` tells learning-service to drop progress for archived items. It no-ops without `KAFKA_BROKERS`. |
| `config/`, `health/`, `prisma/`, `common/` | Same patterns as vocabulary-service. |

## Invariants

- Content ids are `uuidv5(namespace, slug)`, stable across environments and re-seeds, because learning-service keys FSRS cards by them. Never hand-assign or regenerate them.
- Published items are never hard-deleted, only archived with a retire event, or learners' review cards would point at nothing.
- Learners read only the active release snapshot. Admin edits touch the working copy and become visible only when published.

## Conventions

- Path alias `@/*` → `src/*`.
- Controllers are thin and logic lives in services. Pure logic goes in `*.logic.ts` with a spec.
- DTOs use class-validator.
- Folders are kebab-case. Indent is 4 spaces, with single quotes.
