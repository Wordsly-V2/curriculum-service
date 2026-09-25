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
npm run content:import     # load content/ into the working copy (idempotent)
npm run content:import -- --dry-run | --publish | --force <slug|kind:slug> | --dir <path>
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
| `path-content/` | Content reads under `/path` (the gateway routes `/path` and `/admin/path` here): `GET /path` (tree), `POST /path/items/filter-published` (learning-service calls it with the learner's token), `POST /path/items/hydrate`. `PublishedContentService` reads one release's snapshot, cached under keys that carry the release id (never invalidated). |
| `path-progress/` | The learner's own state under `/path`: `me`, `enroll`, `units/:id`, `lessons/:id` (403 while locked), `lessons/:id/complete` (idempotent per `clientRequestId`), `units/:id/checkpoint` (questions without answers, 403 while locked) and `…/checkpoint/submit` (`CheckpointService`: graded on the server by `checkpoint.logic.ts`, every attempt kept, idempotent per `clientRequestId`, 409 when the client's `releaseId` is no longer active; answers are revealed only on a pass). Unlocking is `unit.logic.ts` (pure); the learner view is cached per user and release and dropped on every write. |
| `content/` | Seed format and rules: `content.schema.ts` (zod + the allowed values of every enumerated column; the admin API reuses it), `content-refs.logic.ts` (cross-record rules), `content-records.ts` (`toSeedRecords`: the canonical seed shape that is hashed), `content-rows.ts` (record ⇄ row, `rowsToCorpus` validates rows like a seed), `content-id.ts` (uuidv5), `content-hash.ts`, `content-loader.ts` (reads `<repo>/content`). |
| `content-import/` | `content-import.logic.ts` plans insert/update/skip/conflict from hashes; `content-import.service.ts` applies the plan in one transaction. Driven by `scripts/import-content.ts`, and at boot when `CONTENT_IMPORT_ON_BOOT=true` (dev compose; imports, then publishes if anything changed, then polls `content/` every second and does the same on each save, so an edited unit is live without a restart). |
| `release/` | `ReleaseService.publish` (advisory-locked transaction: validate every non-archived row with `rowsToCorpus`, DRAFT → PUBLISHED, write the snapshot, move `PathState`), `activate` (rollback), `activeRelease` (cached pointer, 30 s TTL + delete on change). `release.logic.ts` builds the snapshot: tree, one payload per lesson and checkpoint, item id set, with every slug reference turned into an id. |
| `cache/` | Redis. Prefix `curr`. `getOrSetGlobal` for published content, which is the same for everyone; `getOrSet` + `invalidateUser` for learner state. |
| `messaging/` | Kafka producer only. `PATH_ITEMS_RETIRED_TOPIC` tells learning-service to drop progress for archived items. It no-ops without `KAFKA_BROKERS`. |
| `config/`, `health/`, `prisma/`, `common/` | Same patterns as vocabulary-service. |

## Content seed

`content/stages.json` and `content/units/<stage-slug>/<unit-slug>.json` (the folder must be the unit's stage, the file name its slug). Records reference each other by slug only. Lesson and step order is array order. Step payloads carry `schemaVersion: 1`.

`content/COVERAGE.md` tracks what has been authored (units, item counts by type, patterns, grammar points). Update it with every content change. Item slugs are global: reuse an existing item with `RECYCLE` rather than defining it again.

Import rules, per row: new → insert as DRAFT; untouched since the last import (`contentHash == seedHash`) → take the seed; edited by an admin → keep the edit, and report a conflict if the seed changed too (`--force` lets the seed win). The importer never deletes and never changes `status`. A lesson row owns its steps and item links: they are hashed and rewritten together.

## Invariants

- Content ids are `contentId(kind, slug)` = uuidv5 of `<kind>:<slug>` under a fixed namespace (steps: `step:<lessonSlug>#<index>`), stable across environments and re-seeds, because learning-service keys FSRS cards by them. Never hand-assign them, and never change the namespace or name format. Renaming a slug makes a new item.
- `contentHash` is sha256 of the stable-stringified record **in seed shape** (references by slug; see `toSeedRecords`). Admin writes must hash that same shape, or every edit looks like a conflict.
- Published items are never hard-deleted, only archived with a retire event, or learners' review cards would point at nothing.
- Learners read only the active release snapshot (`PublishedTree`, `PublishedLesson`, `PublishedCheckpoint`, `PublishedItem` of `PathState.activeReleaseId`). Admin edits touch the working copy and become visible only when published. Snapshots are never edited.
- Publishing is all or nothing: the whole non-archived working copy must pass the seed rules, so a lesson still linking an archived item blocks the publish.
- `PublishedCheckpoint` holds the answers: never send it to a client as is. Learners get `learnerQuestions()` (order questions carry their words sorted, as `tiles`), and a failed attempt's results say only right or wrong.
- Typed answers are compared with `normalizeAnswer` in `checkpoint.logic.ts`, which must match the frontend's `lib/path/quiz.ts`.

## Conventions

- Path alias `@/*` → `src/*`.
- Controllers are thin and logic lives in services. Pure logic goes in `*.logic.ts` with a spec.
- DTOs use class-validator.
- Folders are kebab-case. Indent is 4 spaces, with single quotes.

## Database rules

- **Never use database enums** (workspace-wide rule, see `../../CLAUDE.md`): no Prisma `enum`, no `CREATE TYPE … AS ENUM`. Use `String` columns; the allowed values live in code as an `as const` list + union type and are validated at the boundary.
