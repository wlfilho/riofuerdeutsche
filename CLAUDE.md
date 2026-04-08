# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Architecture Overview

**Rio für Deutsche** is a German-language membership platform for a Rio de Janeiro tour guide. It uses a freemium model: one free guide chapter, rest locked behind premium.

**Stack:** Next.js 16 (App Router) · TypeScript 5 · Tailwind CSS 4 · Supabase (auth + DB) · TipTap (WYSIWYG editor) · Framer Motion

### Route Structure & Access Control

| Route pattern | Access |
|---|---|
| `/`, `/touren/*`, `/bewertungen*` | Public |
| `/login`, `/signup` | Public (redirect to `/dashboard` if authenticated) |
| `/dashboard`, `/nps` | Authenticated |
| `/guide/sicherheit/*` | Authenticated (free chapter) |
| `/guide/[other]/*` | Premium or admin only |
| `/admin/*` | Admin only |

Middleware (`src/middleware.ts`) refreshes sessions via `updateSession()` from `src/utils/supabase/middleware.ts`. Unknown routes pass through (handled by the 404 page).

### Auth & Roles

Three roles: `user` | `premium` | `admin`, stored in `profiles.role`.

Use `getMembershipAccess()` from `src/lib/membership.ts` in Server Components to get `{ isAuthenticated, isAdmin, isPremium, hasLeadMagnet, role, guideEdition, firstName }`. This reads the `profiles` table via the server Supabase client.

### Supabase Clients

- `src/utils/supabase/client.ts` — browser client (public anon key)
- `src/utils/supabase/server.ts` — server client (reads cookies for session)
- `SUPABASE_SERVICE_ROLE_KEY` — used only in API routes for admin operations (user creation, membership upgrades)

### Guide Content

Guide chapters and pages are stored as **TipTap JSON** in the database (`guide_chapters`, `guide_pages`). Server-side HTML is generated via `contentToHtml()` in `src/lib/guideContent.ts`, which runs TipTap extensions (images, tables, YouTube, colors, text align) without a DOM. The admin editor (`src/components/admin/RichEditor.tsx`) is a full client-side TipTap instance.

### Key Database Tables

- `profiles` — user roles, premium_until, guide_edition, first_name
- `guide_chapters` / `guide_pages` — content (TipTap JSON), ordering
- `user_page_progress` — reading progress per user/page
- `reviews` — member reviews with approval workflow and photo support

### Membership Upgrade Flow

`POST /api/membership/upgrade` — webhook that validates `MEMBERSHIP_UPGRADE_SECRET`, then calls Supabase RPC `upgrade_to_premium` to update role, `premium_until`, and `guide_edition`.

### Review System

- Public submission at `/bewertung-schreiben` with honeypot spam protection and optional photo upload
- Admin moderation at `/admin/bewertungen`
- NPS feedback token generated per user, collected at `/nps`
- Supabase Edge Function `supabase/functions/notify-new-review` triggers on insert (Deno runtime)

### Image Domains

Remote images allowed from Unsplash and Pexels only (configured in `next.config.ts`).

### Path Alias

`@/*` maps to `./src/*`.
