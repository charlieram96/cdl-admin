'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { mapKeywordRow, stripPunctuation } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Keyword, KeywordType } from '@/types';
import { KEYWORD_TYPES } from '@/types';

interface ChipState {
  word: string;
  isSelected: boolean;
  existingKeyword: Keyword | null;
  type: KeywordType;
  definition: string;
}

interface Props {
  englishText: string;
  selectedKeywordIds: string[];
  onKeywordsChange: (ids: string[]) => void;
}

export function KeywordInspector({
  englishText,
  selectedKeywordIds,
  onKeywordsChange,
}: Props) {
  const [chips, setChips] = useState<ChipState[]>([]);
  const [inspecting, setInspecting] = useState(false);
  const [inspected, setInspected] = useState(false);

  async function handleInspect() {
    if (!englishText.trim()) return;
    setInspecting(true);

    const words = [
      ...new Set(
        englishText
          .split(/\s+/)
          .map(stripPunctuation)
          .filter((w) => w.length > 0)
      ),
    ];

    const supabase = createClient();
    const { data: keywordRows } = await supabase
      .from('keywords')
      .select('*')
      .in('english_word', words);

    const existingKeywords = (keywordRows ?? []).map(mapKeywordRow);
    const keywordMap = new Map(existingKeywords.map((k) => [k.englishWord.toLowerCase(), k]));

    const newChips: ChipState[] = words.map((word) => {
      const existing = keywordMap.get(word);
      return {
        word,
        isSelected: existing
          ? selectedKeywordIds.includes(existing.id)
          : false,
        existingKeyword: existing ?? null,
        type: existing?.type ?? 'general',
        definition: existing?.definitionByLanguage?.es ?? '',
      };
    });

    setChips(newChips);
    setInspected(true);
    setInspecting(false);
  }

  function toggleChip(index: number) {
    const updated = [...chips];
    updated[index] = { ...updated[index], isSelected: !updated[index].isSelected };
    setChips(updated);
    syncKeywordIds(updated);
  }

  function updateChipType(index: number, type: KeywordType) {
    const updated = [...chips];
    updated[index] = { ...updated[index], type };
    setChips(updated);
  }

  function updateChipDefinition(index: number, definition: string) {
    const updated = [...chips];
    updated[index] = { ...updated[index], definition };
    setChips(updated);
  }

  function syncKeywordIds(chipList: ChipState[]) {
    const ids = chipList
      .filter((c) => c.isSelected && c.existingKeyword)
      .map((c) => c.existingKeyword!.id);
    onKeywordsChange(ids);
  }

  async function saveNewKeywords() {
    const supabase = createClient();
    const newChips = chips.filter(
      (c) => c.isSelected && !c.existingKeyword && c.definition.trim()
    );

    const updatedChips = [...chips];

    for (const chip of newChips) {
      const { data, error } = await supabase
        .from('keywords')
        .insert({
          english_word: chip.word,
          type: chip.type,
          definition_by_language: { es: chip.definition },
          tts_locale: 'en-US',
          image_asset_ids: [],
        })
        .select('*')
        .single();

      if (!error && data) {
        const keyword = mapKeywordRow(data);
        const idx = updatedChips.findIndex((c) => c.word === chip.word);
        if (idx >= 0) {
          updatedChips[idx] = {
            ...updatedChips[idx],
            existingKeyword: keyword,
          };
        }
      }
    }

    // Also update changed existing keywords
    const changedExisting = chips.filter(
      (c) =>
        c.isSelected &&
        c.existingKeyword &&
        (c.type !== c.existingKeyword.type ||
          c.definition !== (c.existingKeyword.definitionByLanguage?.es ?? ''))
    );

    for (const chip of changedExisting) {
      await supabase
        .from('keywords')
        .update({
          type: chip.type,
          definition_by_language: { es: chip.definition },
        })
        .eq('id', chip.existingKeyword!.id);
    }

    setChips(updatedChips);
    syncKeywordIds(updatedChips);
    toast('Keywords saved');
  }

  const hasNewSelected = chips.some(
    (c) => c.isSelected && !c.existingKeyword && c.definition.trim()
  );
  const hasChanges = chips.some(
    (c) =>
      c.isSelected &&
      c.existingKeyword &&
      (c.type !== c.existingKeyword.type ||
        c.definition !== (c.existingKeyword.definitionByLanguage?.es ?? ''))
  );

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        onClick={handleInspect}
        disabled={inspecting || !englishText.trim()}
      >
        {inspecting ? 'Inspecting...' : 'Inspect Keywords'}
      </Button>

      {inspected && chips.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {chips.map((chip, i) => (
              <Badge
                key={chip.word}
                variant={chip.isSelected ? 'default' : 'outline'}
                className="cursor-pointer select-none"
                onClick={() => toggleChip(i)}
              >
                {chip.existingKeyword ? '~' : '+'} {chip.word}
              </Badge>
            ))}
          </div>

          {/* Inline editors for selected chips */}
          {chips
            .filter((c) => c.isSelected)
            .map((chip) => {
              const chipIndex = chips.findIndex((c) => c.word === chip.word);
              return (
                <div
                  key={chip.word}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <span className="min-w-[100px] text-sm font-medium">
                    {chip.word}
                  </span>
                  <Select
                    value={chip.type}
                    onValueChange={(v) =>
                      updateChipType(chipIndex, v as KeywordType)
                    }
                  >
                    <SelectTrigger className="w-36 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KEYWORD_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={chip.definition}
                    onChange={(e) =>
                      updateChipDefinition(chipIndex, e.target.value)
                    }
                    placeholder="Spanish definition..."
                    className="h-8 flex-1"
                  />
                </div>
              );
            })}

          {(hasNewSelected || hasChanges) && (
            <Button type="button" variant="secondary" onClick={saveNewKeywords}>
              Save Keyword Changes
            </Button>
          )}
        </>
      )}

      {inspected && chips.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No words found to inspect.
        </p>
      )}
    </div>
  );
}
