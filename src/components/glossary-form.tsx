'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  createGlossaryEntry,
  updateGlossaryEntry,
} from '@/app/(admin)/glossary/actions';
import type { GlossaryEntry } from '@/types';

interface Props {
  entry?: GlossaryEntry;
}

export function GlossaryForm({ entry }: Props) {
  const router = useRouter();
  const isEdit = !!entry;

  const [termEn, setTermEn] = useState(entry?.termByLanguage?.en ?? '');
  const [termEs, setTermEs] = useState(entry?.termByLanguage?.es ?? '');
  const [defEn, setDefEn] = useState(entry?.definitionByLanguage?.en ?? '');
  const [defEs, setDefEs] = useState(entry?.definitionByLanguage?.es ?? '');
  const [exampleEn, setExampleEn] = useState(entry?.exampleByLanguage?.en ?? '');
  const [exampleEs, setExampleEs] = useState(entry?.exampleByLanguage?.es ?? '');
  const [sortOrder, setSortOrder] = useState(entry?.sortOrder ?? 0);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const data = {
      termByLanguage: { en: termEn, es: termEs },
      definitionByLanguage: { en: defEn, es: defEs },
      exampleByLanguage:
        exampleEn || exampleEs ? { en: exampleEn, es: exampleEs } : null,
      sortOrder,
    };

    const result = isEdit
      ? await updateGlossaryEntry(entry.id, data)
      : await createGlossaryEntry(data);

    if (result.success) {
      toast.success(isEdit ? 'Entry updated' : 'Entry created');
      router.push('/glossary');
      router.refresh();
    } else {
      toast.error(result.error ?? 'Something went wrong');
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="termEn">Term (English)</Label>
          <Input
            id="termEn"
            value={termEn}
            onChange={(e) => setTermEn(e.target.value)}
            required
            placeholder="English term..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="termEs">Term (Spanish)</Label>
          <Input
            id="termEs"
            value={termEs}
            onChange={(e) => setTermEs(e.target.value)}
            placeholder="Spanish term..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="defEn">Definition (English)</Label>
          <Textarea
            id="defEn"
            value={defEn}
            onChange={(e) => setDefEn(e.target.value)}
            rows={3}
            placeholder="English definition..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defEs">Definition (Spanish)</Label>
          <Textarea
            id="defEs"
            value={defEs}
            onChange={(e) => setDefEs(e.target.value)}
            rows={3}
            placeholder="Spanish definition..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="exampleEn">Example (English, optional)</Label>
          <Textarea
            id="exampleEn"
            value={exampleEn}
            onChange={(e) => setExampleEn(e.target.value)}
            rows={2}
            placeholder="Example sentence..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exampleEs">Example (Spanish, optional)</Label>
          <Textarea
            id="exampleEs"
            value={exampleEs}
            onChange={(e) => setExampleEs(e.target.value)}
            rows={2}
            placeholder="Example sentence..."
          />
        </div>
      </div>

      <div className="space-y-2 max-w-[120px]">
        <Label htmlFor="sortOrder">Sort Order</Label>
        <Input
          id="sortOrder"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update Entry' : 'Create Entry'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
