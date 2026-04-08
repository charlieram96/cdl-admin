# Public Sign Up — Design Spec

## Summary

Add public self-registration to CDL Admin. New users sign up with email/password but do not receive admin access — the existing Supabase trigger creates a `profiles` row with `is_admin = false`. An admin grants access manually.

## Changes

### 1. Homepage (`src/app/page.tsx`)

Convert from a redirect-only page to a server component that checks auth:

- **Authenticated users**: redirect to `/questions` (unchanged)
- **Unauthenticated users**: render a centered card (matching login page styling) with:
  - "CDLingo Admin" heading
  - "Sign Up" button (link to `/signup`)
  - "Sign In" link (link to `/login`)

### 2. Sign Up Page (`src/app/(auth)/signup/page.tsx`)

Client component mirroring the login page structure:

- Email + password + confirm password form
- Calls `supabase.auth.signUp({ email, password })` on submit
- On success: display a success message ("Check your email to confirm your account") and link back to login
- On error: inline error message (same styling as login page errors)
- "Already have an account? Sign In" link at the bottom

### 3. Middleware Update (`src/lib/supabase/middleware.ts`)

Allow unauthenticated access to both `/login` and `/signup`:

- Change the auth bypass check from `pathname === '/login'` to also include `/signup`
- Also allow unauthenticated access to `/` (the homepage)

### 4. No Changes To

- **Admin layout** — already checks `is_admin` and rejects non-admins
- **Supabase trigger** — already creates `profiles` row with `is_admin = false`
- **Login page** — no modifications needed (optionally add "Sign Up" link, but not required)

## Files Modified

| File | Action |
|------|--------|
| `src/app/page.tsx` | Rewrite: auth check + landing card |
| `src/app/(auth)/signup/page.tsx` | New: sign up form |
| `src/lib/supabase/middleware.ts` | Update: allow `/signup` and `/` for unauth users |
