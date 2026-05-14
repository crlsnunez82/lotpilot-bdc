# lotpilot-bdc

LotPilot BDC is a production-oriented AI BDC operating system for dealership lead intake, messaging, workflow orchestration, prospecting, operator guidance, and controlled automation.

This repo includes the completed Sprint 1 through Sprint 15 foundation.

## What the system does

LotPilot turns captured CRM/mining/service records into unified lead profiles, keeps SMS and email conversations in one place, helps reps work smart lists and follow-up tasks, and uses structured AI recommendations to guide next actions without removing human control.

The platform is designed to support:
- multi-source intake from VinSolutions, Automotive Mastermind, Affinitiv, and manual entry
- unified people, leads, conversations, messages, appointments, tasks, and agent decisions
- Twilio SMS send/receive and threaded inbound/outbound email
- workflow scheduling with BullMQ and Redis
- AI decisioning, safe drafting, personalization, safe auto-response, and call guidance
- source-aware prospect lists, operator shortcuts, and rep-friendly daily workflow surfaces

## Current feature set

Implemented through Sprint 15:

- Sprint 1: app shell, signed auth scaffold, Prisma models, leads CRUD, dashboard/settings shells, capture endpoint foundation
- Sprint 2: intake normalization, dedupe/upsert, source history, capture audit, unified lead profiles
- Sprint 3: Twilio SMS send/receive, message persistence, real inbox, manual texting
- Sprint 4: AI decision engine, structured reply classification, appointment recommendations, AI drafts, decision logging
- Sprint 5: BullMQ workflow jobs, follow-up scheduling, rescue/reminder logic, rep tasks, automation state
- Sprint 6: outbound email persistence, workflow modes, service-drive/mining workflow routing
- Sprint 7: agent control layer, multilingual controls, contact-window awareness, automation toggles, command bar
- Sprint 8: prospect intelligence, ranked smart lists, saved filters, command history chips
- Sprint 9: controlled personalization memory, rep feedback signals, adaptive draft preferences
- Sprint 10: safe auto-response controls, guardrails, audit logging, inbound email baseline
- Sprint 11: inbound email threading hardening, mixed-thread continuity, unified reply intelligence across SMS and email
- Sprint 12: task completion actions, outcome shortcuts, quick follow-up queueing from smart prospect lists
- Sprint 13: call-priority scoring, call scripts, objection cues, next-question prompts, call guidance
- Sprint 14: targeted test coverage for critical route/service/workflow behavior
- Sprint 15: release-readiness polish, setup clarity, env validation, deployment/handoff docs

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Redis
- BullMQ
- Twilio
- Nodemailer

## Required services

For full local functionality you will typically want:
- PostgreSQL
- Redis
- Node.js 20+
- npm

Optional providers:
- Twilio for real SMS sending/receiving
- SMTP credentials for real outbound email
- OpenAI API key for OpenAI-backed AI decisions/drafts


## Docker Desktop local install

This pass adds a Docker-first local runtime so the app can be started with Docker Desktop instead of manually installing PostgreSQL, Redis, and running separate processes.

### What is included

- Next.js app container
- PostgreSQL container
- Redis container
- workflow worker container
- startup scripts that wait for dependencies, generate Prisma client, apply migrations in production or schema push in local Docker, and seed sample data
- `.env.local.example` for the Docker Desktop local setup

### Docker startup

1. Copy the local Docker env file:
```bash
cp .env.local.example .env.local
```

2. Update `AUTH_SESSION_SECRET` in `.env.local`

3. Start everything:
```bash
docker compose up --build
```

4. Open the app:
```text
http://localhost:3000
```

The app container will:
- wait for Postgres and Redis
- run `prisma generate`
- run `prisma db push` for local Docker development
- seed the database when `RUN_SEED_ON_START="true"`

The worker container will:
- wait for Postgres and Redis
- run `prisma generate`
- start the BullMQ workflow worker

### Docker lifecycle commands

Start in background:
```bash
docker compose up --build -d
```

Stop:
```bash
docker compose down
```

Stop and remove database/cache volumes:
```bash
docker compose down -v
```

Re-seed on next start:
```bash
docker compose down -v
docker compose up --build
```

### Default local credentials / seed data

The seed creates one admin user using env values:
- Email: `SEED_ADMIN_EMAIL` (defaults to `admin@lotpilot.local`)
- Password: `SEED_ADMIN_PASSWORD` (defaults to `change-me-now` for local setup only)

Change both before any shared or production deployment. For a safer launch, use a seed admin password with at least 12 characters.

## Local setup

1. Copy env values:
```bash
cp .env.example .env
```

2. Review provider/dev-mode settings in `.env`

3. Install and initialize the app:
```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
```

Or use the shortcut:
```bash
npm run setup
```

4. Start the web app:
```bash
npm run dev
```

5. Start the workflow worker in a second terminal:
```bash
npm run worker:workflow
```

## Database and seed flow

Use these commands during development:
```bash
npm run prisma:generate
npm run prisma:push
npm run seed
```

Helpful shortcuts:
```bash
npm run db:setup
npm run db:reset
npm run prisma:studio
```

Migration option:
```bash
npm run prisma:migrate -- --name your_change_name
```

## Important runtime behavior

### Twilio SMS
- `TWILIO_DEV_MODE="true"` keeps the SMS flow safe for local/dev work.
- Set `TWILIO_DEV_MODE="false"` and provide Twilio credentials plus a real sending number for live SMS behavior.
- Inbound/status webhook URLs can be set explicitly or derived from `APP_URL`.

### Email
- `EMAIL_DEV_MODE="true"` keeps email delivery in safe dev mode while still persisting message/conversation state.
- Set `EMAIL_DEV_MODE="false"` and provide SMTP credentials for real outbound email delivery.
- Inbound email routing depends on your chosen provider sending requests into the inbound email route used by the app.

### AI
- `AI_PROVIDER="heuristic"` is the safest default for local/dev work.
- Set `AI_PROVIDER="openai"` and `OPENAI_API_KEY` to enable OpenAI-backed decision/drafting behavior.
- AI stays structured and human-in-the-loop unless a behavior is already explicitly safe-auto.

### Workflows and safe automation
- BullMQ scheduling depends on Redis and the workflow worker process.
- Contact-window awareness, workflow toggles, safe-auto settings, and escalation guardrails remain in force.
- The system is designed to be dealership-safe first, not fully autonomous.

## Most important commands

```bash
npm run dev
npm run worker:workflow
npm run check:env
npm run verify
npm run test
```

## Testing

Sprint 14 added lightweight, production-relevant tests using Node's built-in test runner through `tsx`.

Run all tests:
```bash
npm run test
```

Watch mode:
```bash
npm run test:watch
```

Preflight verification:
```bash
npm run verify
```

## Deployment notes

A production-like deployment usually needs:
- a PostgreSQL instance
- a Redis instance
- one web process running Next.js
- one worker process running `npm run worker:workflow`
- provider secrets for any live Twilio/SMTP/OpenAI usage
- `APP_URL` set to the externally reachable base URL (scheme-less host values are normalized to `https://...`)

Recommended release flow:
1. set production env vars
2. run `npm run check:env`
3. run `npm run prisma:generate`
4. run migrations or `prisma db push` according to your deployment policy
5. seed only if you want demo/bootstrap data
6. start web + worker processes
7. verify webhook URLs and dev-mode flags

Additional release docs:
- `docs/DEPLOYMENT.md`
- `docs/RELEASE_NOTES_SPRINT15.md`
- `docs/SHIP_CHECKLIST.md`

## Repo handoff notes

This codebase is intentionally modular:
- route handlers stay thin
- service/repository separation is preserved
- workflow orchestration stays in BullMQ-backed services
- AI decisions are structured and persisted
- operator-facing UI stays compact

For handoff, the most important files/folders are:
- `app/api/*` for route entry points
- `lib/server/services/*` for business logic
- `lib/server/repositories/*` for persistence seams
- `jobs/*` for worker execution
- `prisma/schema.prisma` for the domain model
- `tests/*` for critical behavior coverage

## Safety and scope notes

- No voice automation is included.
- No autonomous blasting is included.
- Financially sensitive, trade, credit, payoff, angry, manager-request, STOP, and not-interested cases are guarded/escalated.
- Human override remains part of the product model.

## License / internal use

No license file was added in this sprint. Add your dealership/company license policy before wider distribution.


## Auth hardening added

This release now includes:
- real seeded email/password login
- signed server-verified session expiry
- login throttling for repeated failed attempts
- auth audit events for login success, failure, and logout

For first launch, run:

```bash
npm run prisma:push
npm run seed
npm run dev
```

Then sign in at `/login` with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.


## Production database policy

Production deployments must use committed Prisma migrations and start with:

```bash
npm run prisma:deploy
```

The production startup script now refuses to launch if no migration directories are present under `prisma/migrations`.


## Render deployment

Render is the recommended hosted deployment target for this repo because it supports a web service, background worker, Postgres, Key Value, Blueprint infrastructure as code, and health checks in one platform.

Use the included `render.yaml` and follow `RENDER-DEPLOY.md`.

Important:
- Set `APP_URL` to the public Render URL, not a private `host:port` value.
- Shared secrets and common settings are defined through an environment group.
- Health checks should use `/api/health/ready`.
