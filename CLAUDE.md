# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

**Rio für Deutsche** is a German-language membership platform for a Rio de Janeiro tour guide. It uses a freemium model: one free guide chapter, rest locked behind premium.

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

### Contact Info (phone, WhatsApp, email, social)

Never hardcode contact info anywhere in the app — it must always come from the admin's contact settings (edited under `/admin/configuracoes`, stored in Supabase, exposed to Server Components via `getSettings()` + `buildContactUrls()` in `src/lib/settings.ts`). This applies to any new page, component, or feature that shows a WhatsApp/phone/email/social link (proposal pages, tour pages, forms, emails, etc.).

- `getSettings()` reads `public_contact_info` (public view) and `site_settings` (admin-only, RLS).
- `buildContactUrls(settings)` returns ready-to-use hrefs: `whatsappHref`, `phoneHref`, `emailHref`, `instagramHref`, `youtubeHref`, `facebookHref`, `telegramHref`.
- Usage pattern: call both in the Server Component/page (`const { whatsappHref, emailHref } = buildContactUrls(await getSettings())`), then pass the href down or use directly in JSX. Client components that need it (e.g. `Footer.tsx`) take `contact: ContactUrls` as a prop from a server wrapper (see `FooterServer.tsx`, `NavbarServer.tsx`) — they keep a `FALLBACK` constant only as a prop default, never as the primary source.
- A hardcoded `wa.me/...` or `mailto:...` literal outside `src/lib/settings.ts` and the `FALLBACK` constants is a bug — this happened once already in `src/components/proposal/ProposalPage.tsx` (stale WhatsApp number/email baked into the JSX) and was fixed by wiring it to `getSettings()`/`buildContactUrls()` like everywhere else.

### Review System

- Public submission at `/bewertung-schreiben` with honeypot spam protection and optional photo upload
- Admin moderation at `/admin/bewertungen`
- NPS feedback token generated per user, collected at `/nps`
- Supabase Edge Function `supabase/functions/notify-new-review` triggers on insert (Deno runtime)
