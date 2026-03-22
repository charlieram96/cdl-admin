import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mapGlossaryRow } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeleteGlossaryButton } from '@/components/delete-glossary-button';

export default async function GlossaryPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from('glossary_entries')
    .select('*')
    .order('sort_order');

  const entries = (rows ?? []).map(mapGlossaryRow);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Glossary</h1>
        <Link href="/glossary/new">
          <Button>New Entry</Button>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}
      </p>

      {entries.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No glossary entries yet.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term (EN)</TableHead>
                <TableHead>Term (ES)</TableHead>
                <TableHead>Definition (EN)</TableHead>
                <TableHead className="w-[60px]">Order</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Link
                      href={`/glossary/${entry.id}`}
                      className="font-medium hover:underline"
                    >
                      {entry.termByLanguage.en ?? '—'}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.termByLanguage.es ?? '—'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {entry.definitionByLanguage.en ?? '—'}
                  </TableCell>
                  <TableCell>{entry.sortOrder}</TableCell>
                  <TableCell>
                    <DeleteGlossaryButton entryId={entry.id} />
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
