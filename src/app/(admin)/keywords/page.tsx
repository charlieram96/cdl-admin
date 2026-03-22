import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mapKeywordRow } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { KeywordsFilter } from '@/components/keywords-filter';
import { DeleteKeywordButton } from '@/components/delete-keyword-button';

export default async function KeywordsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>;
}) {
  const { search, type } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('keywords')
    .select('*')
    .order('english_word');

  if (type && type !== 'all') {
    query = query.eq('type', type);
  }

  if (search) {
    query = query.ilike('english_word', `%${search}%`);
  }

  const { data: keywordRows } = await query;
  const keywords = (keywordRows ?? []).map(mapKeywordRow);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Keywords</h1>
        <Link href="/keywords/new">
          <Button>New Keyword</Button>
        </Link>
      </div>

      <KeywordsFilter currentSearch={search} currentType={type} />

      <p className="text-sm text-muted-foreground">
        {keywords.length} keyword{keywords.length !== 1 ? 's' : ''}
      </p>

      {keywords.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No keywords found.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Word</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Spanish Definition</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((kw) => (
                <TableRow key={kw.id}>
                  <TableCell>
                    <Link
                      href={`/keywords/${kw.id}`}
                      className="font-medium hover:underline"
                    >
                      {kw.englishWord}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{kw.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {kw.definitionByLanguage?.es ?? '—'}
                  </TableCell>
                  <TableCell>
                    <DeleteKeywordButton keywordId={kw.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
