Launch hardening notes
=====================

This pass moved the project from scaffold auth to seeded email/password authentication.

Completed in this pass
----------------------
- Replaced one-click scaffold login with real email/password sign-in.
- Added password hashing and verification using Node scrypt.
- Seed now creates an admin user with a hashed password from env values.
- Added env validation/warnings for placeholder secrets and admin password setup.
- Kept signed cookie sessions, but now sessions are created only after credential verification.

Current launch posture
----------------------
- Suitable for controlled launch/testing and much closer to real deployment.
- Still not full enterprise auth or multi-user provisioning.
- No password reset, invite flow, or MFA yet.

Recommended next production hardening
-------------------------------------
1. Add password reset.
2. Add user management UI and role-based admin controls.
3. Add CSRF review and stricter cookie policy if cross-domain deployment is planned.
4. Add optional MFA for higher-security deployments.
5. Add password reset and invite flow.

- Added login throttling and auth audit logging models for safer controlled launch.
- Added server-enforced session expiry instead of relying only on the browser cookie lifetime.


## Additional launch hardening pass
- Added production security headers in middleware (CSP, frame, nosniff, referrer, permissions).
- Invalid session cookies are now cleared on redirect to login.
- Protected-route redirects now preserve the original path through `next=` so login returns users to the requested page.
- Production env validation is stricter: `APP_URL` format is checked, `AUTH_SESSION_SECRET` must be at least 32 chars, and `SEED_ADMIN_PASSWORD` must be at least 12 chars.
- `getSessionSecret()` now refuses to fall back to a weak dev secret in production.
- Render build/start commands now run `npm run check:env` so bad config fails earlier.


## Launch hardening pass 4

Additional launch-safety fixes included in this build:

- Tightened middleware public-route matching so lookalike paths such as `/login-help` are no longer treated as public.
- Preserved the full requested path and query string in auth redirects so users land back on the exact page they originally tried to open after login.
- Updated the login page so already-signed-in users honor the sanitized `next` target instead of always being forced to `/dashboard`.
- Added explicit cookie expiry and high priority to the auth session cookie.
- Strengthened env validation for auth/session values so bad TTL and lockout values fail early.
- Added middleware tests for query-string preservation and public-route boundary behavior.
