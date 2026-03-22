'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createKeyword, updateKeyword } from '@/app/(admin)/keywords/actions';
import type { Keyword, KeywordType } from '@/types';
import { KEYWORD_TYPES } from '@/types';

interface Props {
  keyword?: Keyword;
}

export function KeywordForm({ keyword }: Props) {
  const router = useRouter();
  const isEdit = !!keyword;

  const [englishWord, setEnglishWord] = useState(keyword?.englishWord ?? '');
  const [phoneticWord, setPhoneticWord] = useState(keyword?.phoneticWord ?? '');
  const [type, setType] = useState<KeywordType>(keyword?.type ?? 'general');
  const [definition, setDefinition] = useState(
    keyword?.definitionByLanguage?.es ?? ''
  );
  const [translation, setTranslation] = useState(
    keyword?.translationByLanguage?.es ?? ''
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const data = {
      englishWord: englishWord.toLowerCase().trim(),
      phoneticWord: phoneticWord || null,
      ttsLocale: 'en-US',
      type,
      definitionByLanguage: definition ? { es: definition } : ({} as Record<string, string>),
      translationByLanguage: translation ? { es: translation } : null,
      imageAssetIds: keyword?.imageAssetIds ?? [],
    };

    const result = isEdit
      ? await updateKeyword(keyword.id, data)
      : await createKeyword(data);

    if (result.success) {
      toast.success(isEdit ? 'Keyword updated' : 'Keyword created');
      router.push('/keywords');
      router.refresh();
    } else {
      toast.error(result.error ?? 'Something went wrong');
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div className="space-y-2">
        <Label htmlFor="englishWord">English Word</Label>
        <Input
          id="englishWord"
          value={englishWord}
          onChange={(e) => setEnglishWord(e.target.value)}
          required
          placeholder="e.g. brake"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneticWord">Phonetic (optional)</Label>
        <Input
          id="phoneticWord"
          value={phoneticWord}
          onChange={(e) => setPhoneticWord(e.target.value)}
          placeholder="e.g. breyk"
        />
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as KeywordType)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KEYWORD_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="definition">Spanish Definition</Label>
        <Textarea
          id="definition"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          rows={3}
          placeholder="Definition in Spanish..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="translation">Spanish Translation (optional)</Label>
        <Input
          id="translation"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          placeholder="Direct translation..."
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update Keyword' : 'Create Keyword'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
