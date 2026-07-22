# Architecture

## Overview

HubFit is a TypeScript application with a React client, an Express API and a SQLite database accessed through Kysely.

```text
Browser
  -> React pages and components
  -> typed hooks and API client
  -> Express routes
  -> validation and authorization middleware
  -> domain services
  -> Kysely
  -> SQLite
```

Development uses a single launcher for Vite and Express. Production builds the client into `dist/public` and compiles the server as Node ESM.

## Main domains

- Authentication and persistent sessions.
- Users and role-based permissions.
- Gym classes and trainer assignments.
- Bookings, capacity and waitlist promotion.
- Activity and administrative analytics.
- Internationalized user interface.
- Public legal information.

## Roles

- `member`: browses classes, manages personal bookings and sees personal analytics.
- `trainer`: sees assigned classes, attendees, waitlists and trainer analytics.
- `admin`: manages users and classes and sees system-wide analytics.

Roles describe authorization. Authentication proves the current identity; server-side middleware decides which actions that identity may perform.

## Localization

`i18next` manages interface text and language selection. Browser `Intl` handles locale-sensitive dates and numbers. Spanish and English catalogues live in `client/src/i18n/locales`.

Known demo classes are localized at display time. User-created names and descriptions remain exactly as entered.

## Evolution boundaries

- Replace ad-hoc table initialization with migrations before production.
- Move from local SQLite to a production-grade database when concurrency and deployment require it.
- Treat payments, notifications, community features and Gaia integration as separate modules.
- Keep HubFit functional when optional integrations are unavailable.
