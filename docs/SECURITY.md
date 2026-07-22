# Security

## Implemented baseline

- Password hashing with bcrypt and a cost factor of 12.
- Password policy of 12-128 characters with uppercase, lowercase and digits.
- Opaque random session tokens; only their SHA-256 hashes are stored.
- Persistent, expiring and revocable database sessions.
- `HttpOnly`, `SameSite=Strict` session cookies and `Secure` cookies in production.
- Server-side authentication and role authorization.
- Helmet protections, production CSP and HSTS.
- Restricted CORS with credentials.
- API and authentication rate limits.
- Small configurable request bodies and centralized error handling.
- Input validation and automated security tests.
- Local databases and environment files excluded from version control.

## Production work still required

- Email verification and account recovery.
- Optional TOTP 2FA for trainers and administrators, including encrypted secrets and recovery codes.
- CSRF review if cross-site deployment requirements change.
- Deployment proxy and HTTPS configuration review.
- Versioned database migrations, encrypted backups and retention rules.
- Audit trail for sensitive administrative operations.
- Monitoring, alerting and a documented incident-response process.
- Secret management outside local `.env` files.

## Reporting a vulnerability

The repository owner is Javier López Díaz. A dedicated security contact and private reporting channel must be added before the repository or service is made public.

Do not disclose active vulnerabilities in a public issue when a private reporting channel is available.
