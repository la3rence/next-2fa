# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js app-router pages, layouts, and API routes (auth, dashboard, login, register). `app/globals.css` sets global Tailwind layers.
- `components/`: Reusable UI blocks (Radix/Tailwind driven). Prefer new shared UI here instead of duplicating inside routes.
- `hooks/` and `lib/`: Client utilities (React hooks, data helpers, Supabase/TOTP helpers).
- `styles/`: Tailwind config helpers; `public/` holds static assets (e.g., `preview.png`, favicons).
- Config roots: `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `components.json`.

## Build, Test, and Development Commands
- `pnpm install` to sync dependencies (pnpm is preferred; lockfile is present).
- `pnpm dev` starts the Next.js dev server with hot reload.
- `pnpm build` produces the production bundle; use before release to catch type/route issues.
- `pnpm start` runs the built app.
- `pnpm lint` runs Next.js/ESLint/Tailwind rules; fix warnings before opening a PR.

## Coding Style & Naming Conventions
- TypeScript-first; keep strict types and narrow `any` usage. Use 2-space indentation and consistent single quotes where applicable.
- Components: PascalCase files/exports in `components/`; hooks: `useX` in `hooks/`; route segments follow Next.js folder casing.
- Favor server components unless client interactivity is required; add `"use client"` sparingly.
- Tailwind for styling; prefer utility classes over custom CSS unless shared styles belong in `globals.css`.
- Run `pnpm lint` after changes; rely on built-in Next.js ESLint config and Tailwind plugin.

## Testing Guidelines
- No automated tests currently; at minimum run `pnpm lint` and exercise critical flows (login/register/dashboard) locally.
- When adding tests, prefer `*.test.ts(x)` colocated with the subject or under `__tests__/`, and aim to cover auth flows and OTP handling edge cases.

## Commit & Pull Request Guidelines
- Follow conventional commit prefixes seen in history (`init:`, `chore:`, `fix:`). Keep scopes concise (e.g., `fix(auth): handle otp refresh`).
- PRs should include: clear summary of behavior change, linked issue (if any), screenshots/GIFs for UI changes, and steps to verify (commands run, flows exercised).
- Keep diffs focused; refactors and feature work should be separate PRs when possible.

## Security & Configuration Tips
- Copy `.env.example` to `.env` and fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; never commit secrets.
- If recording UI media, scrub any real accounts or codes. Rotate keys if they were exposed during debugging.
