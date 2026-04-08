import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
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
          <Link href="/signup" className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80">
            Sign Up
          </Link>
          <Link href="/login" className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted hover:text-foreground">
            Sign In
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
