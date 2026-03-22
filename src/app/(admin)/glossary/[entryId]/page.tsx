import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mapGlossaryRow } from '@/lib/utils';
import { GlossaryForm } from '@/components/glossary-form';

export default async function EditGlossaryEntryPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from('glossary_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (!row) notFound();

  const entry = mapGlossaryRow(row);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/glossary" className="hover:text-foreground">
          Glossary
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          {entry.termByLanguage.en ?? 'Edit'}
        </span>
      </div>
      <h1 className="text-2xl font-bold">Edit Glossary Entry</h1>
      <GlossaryForm entry={entry} />
    </div>
  );
}
