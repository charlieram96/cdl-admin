import Link from 'next/link';
import { GlossaryForm } from '@/components/glossary-form';

export default function NewGlossaryEntryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/glossary" className="hover:text-foreground">
          Glossary
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">New Entry</span>
      </div>
      <h1 className="text-2xl font-bold">Create Glossary Entry</h1>
      <GlossaryForm />
    </div>
  );
}
