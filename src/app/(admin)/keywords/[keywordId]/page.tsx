import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mapKeywordRow } from '@/lib/utils';
import { KeywordForm } from '@/components/keyword-form';

export default async function EditKeywordPage({
  params,
}: {
  params: Promise<{ keywordId: string }>;
}) {
  const { keywordId } = await params;
  const supabase = await createClient();

  const { data: keywordRow } = await supabase
    .from('keywords')
    .select('*')
    .eq('id', keywordId)
    .single();

  if (!keywordRow) notFound();

  const keyword = mapKeywordRow(keywordRow);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/keywords" className="hover:text-foreground">
          Keywords
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{keyword.englishWord}</span>
      </div>
      <h1 className="text-2xl font-bold">Edit Keyword</h1>
      <KeywordForm keyword={keyword} />
    </div>
  );
}
