import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
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
          <Link href="/signup" className={buttonVariants({ className: "w-full" })}>
            Sign Up
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "outline", className: "w-full" })}>
            Sign In
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
