# Public Sign Up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow public users to register via email/password from the homepage, with a new sign up page and updated middleware.

**Architecture:** The homepage becomes an async server component that checks auth and either redirects (authenticated) or renders a landing card (unauthenticated). A new `/signup` client page mirrors the login form structure. Middleware is updated to allow unauthenticated access to `/` and `/signup`.

**Tech Stack:** Next.js 16 (App Router), Supabase Auth (`@supabase/ssr`), shadcn/ui (Card, Button, Input, Label), Tailwind CSS v4

---

### Task 1: Update Middleware to Allow Public Routes

**Files:**
- Modify: `src/lib/supabase/middleware.ts:32-37`

- [ ] **Step 1: Update the auth bypass check**

In `src/lib/supabase/middleware.ts`, replace the single login page check with a check for all public routes:

```typescript
// Replace this:
const isLoginPage = request.nextUrl.pathname === '/login';

if (!user && !isLoginPage) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

if (user && isLoginPage) {
  const url = request.nextUrl.clone();
  url.pathname = '/questions';
  return NextResponse.redirect(url);
}

// With this:
const publicPaths = ['/', '/login', '/signup'];
const isPublicPage = publicPaths.includes(request.nextUrl.pathname);

if (!user && !isPublicPage) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

if (user && isPublicPage) {
  const url = request.nextUrl.clone();
  url.pathname = '/questions';
  return NextResponse.redirect(url);
}
```

- [ ] **Step 2: Verify the dev server starts without errors**

Run: `npm run dev`
Expected: Server starts without errors on localhost:3000.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/middleware.ts
git commit -m "feat: allow unauthenticated access to / and /signup routes"
```

---

### Task 2: Rewrite the Homepage as a Landing Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Rewrite the homepage**

Replace the contents of `src/app/page.tsx` with:

```tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/questions');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">CDLingo Admin</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage CDL test prep questions and keywords
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`
Visit: `http://localhost:3000` (unauthenticated)
Expected: See a centered card with "CDLingo Admin" heading, "Sign Up" button, and "Sign In" button. Clicking "Sign In" navigates to `/login`.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add landing page with sign up and sign in buttons"
```

---

### Task 3: Create the Sign Up Page

**Files:**
- Create: `src/app/(auth)/signup/page.tsx`

- [ ] **Step 1: Create the sign up page**

Create `src/app/(auth)/signup/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to <strong>{email}</strong>. Click the
              link to activate your account.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign up to get started with CDLingo Admin
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/80">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Visit: `http://localhost:3000/signup`
Expected: See a centered card with "Create an Account" heading, email/password/confirm-password fields, a "Sign Up" button, and a "Sign In" link.

- [ ] **Step 3: Test the form validation**

1. Enter mismatched passwords and submit — expect "Passwords do not match." error
2. Enter a valid email and matching passwords and submit — expect success screen with "Check Your Email" message

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/signup/page.tsx
git commit -m "feat: add public sign up page with email/password registration"
```

---

### Task 4: Add Sign Up Link to Login Page

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Add a sign up link below the login form**

In `src/app/(auth)/login/page.tsx`, add a Link import at the top:

```tsx
import Link from 'next/link';
```

Then add this paragraph after the closing `</form>` tag and before the closing `</CardContent>`:

```tsx
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary underline underline-offset-4 hover:text-primary/80">
              Sign Up
            </Link>
          </p>
```

- [ ] **Step 2: Verify in browser**

Visit: `http://localhost:3000/login`
Expected: See "Don't have an account? Sign Up" below the sign-in form. Clicking "Sign Up" navigates to `/signup`.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/login/page.tsx
git commit -m "feat: add sign up link to login page"
```
