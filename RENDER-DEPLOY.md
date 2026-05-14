# Render deployment guide for LotPilot

This package is prepared for Render Blueprints.

## What changed

- `render.yaml` now uses a shared environment group for common settings and generated secrets.
- The worker copies required secret/env values from the web service instead of failing with an empty `AUTH_SESSION_SECRET`.
- `APP_URL` is no longer set to Render private `hostport`. You must provide the public app URL, such as `https://lotpilot-web.onrender.com`.
- The web health check now uses `/api/health/ready` instead of `/api/health/live`.
- Prisma migrations run in `preDeployCommand` for both web and worker so deploys fail before startup if migrations cannot apply.

## Deploy steps

1. Push this repo to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Select the GitHub repo.
4. During initial blueprint creation, enter values for every variable marked `sync: false` on the web service:
   - `APP_URL` = your public Render URL, for example `https://lotpilot-web.onrender.com`
   - `CAPTURE_API_TOKEN`
   - `EMAIL_INBOUND_TOKEN`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `OPENAI_API_KEY`
   - `SMTP_HOST`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `EMAIL_FROM_ADDRESS`
   - `EMAIL_REPLY_TO_ADDRESS`
5. After the services are created, open the `lotpilot-shared` environment group and change:
   - `SEED_ADMIN_PASSWORD`
6. Deploy.

## Recommended first deploy mode

For the first deploy, keep:
- `TWILIO_DEV_MODE=true`
- `EMAIL_DEV_MODE=true`
- `AI_PROVIDER=heuristic`

This lets the system boot without live provider traffic while you validate the UI, auth, DB, Redis, worker, and health checks.

## First checks after deploy

- Web service is healthy on `/api/health/ready`
- Worker is running without restart loops
- Login page loads
- Seed admin can log in
- Dashboard, leads, inbox, and appointments open
- One capture API request succeeds with `CAPTURE_API_TOKEN`
- Logs are clean on both services

## Important caveat

This package improves the Render deployment shape, but it does not replace a full live smoke test. You should still verify:
- database migration success
- seed/admin login
- worker queue processing
- provider callbacks in dev mode first
