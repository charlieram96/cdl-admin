'use client';

import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { stripPunctuation } from '@/lib/utils';
import type { WordData } from '@/types';

interface Props {
  englishText: string;
  wordData: WordData[];
  onChange: (data: WordData[]) => void;
}

export function WordDataEditor({ englishText, wordData, onChange }: Props) {
  const prevTextRef = useRef(englishText);

  useEffect(() => {
    if (englishText === prevTextRef.current) return;
    prevTextRef.current = englishText;

    const words = englishText
      .split(/\s+/)
      .map((w) => w.trim())
      .filter(Boolean);

    const newData = words.map((rawWord) => {
      const cleaned = stripPunctuation(rawWord);
      const existing = wordData.find(
        (wd) => wd.word.toLowerCase() === cleaned
      );
      return (
        existing ?? {
          word: cleaned,
          phonetic: '',
          literals: {},
        }
      );
    });

    onChange(newData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [englishText]);

  function updateField(
    index: number,
    field: 'word' | 'phonetic',
    value: string
  ) {
    const updated = [...wordData];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  function updateLiteral(index: number, value: string) {
    const updated = [...wordData];
    updated[index] = {
      ...updated[index],
      literals: { ...updated[index].literals, es: value },
    };
    onChange(updated);
  }

  function removeWord(index: number) {
    onChange(wordData.filter((_, i) => i !== index));
  }

  if (wordData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Type question text above to generate word data.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Word</TableHead>
            <TableHead>Phonetic</TableHead>
            <TableHead>Spanish Literal</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {wordData.map((wd, i) => (
            <TableRow key={i}>
              <TableCell>
                <Input
                  value={wd.word}
                  onChange={(e) => updateField(i, 'word', e.target.value)}
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={wd.phonetic}
                  onChange={(e) => updateField(i, 'phonetic', e.target.value)}
                  className="h-8"
                  placeholder="phonetic..."
                />
              </TableCell>
              <TableCell>
                <Input
                  value={wd.literals.es ?? ''}
                  onChange={(e) => updateLiteral(i, e.target.value)}
                  className="h-8"
                  placeholder="spanish..."
                />
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeWord(i)}
                  className="h-7 w-7 p-0 text-destructive"
                >
                  x
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
