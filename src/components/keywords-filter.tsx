'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { KEYWORD_TYPES } from '@/types';

interface Props {
  currentSearch?: string;
  currentType?: string;
}

const ALL_TYPES = ['all', ...KEYWORD_TYPES] as const;

export function KeywordsFilter({ currentSearch, currentType }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch ?? '');

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/keywords?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams('search', search);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearchSubmit} className="max-w-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search keywords..."
          onBlur={() => updateParams('search', search)}
        />
      </form>
      <div className="flex flex-wrap gap-2">
        {ALL_TYPES.map((t) => (
          <Badge
            key={t}
            variant={(currentType ?? 'all') === t ? 'default' : 'outline'}
            className="cursor-pointer select-none capitalize"
            onClick={() => updateParams('type', t)}
          >
            {t}
          </Badge>
        ))}
      </div>
    </div>
  );
}
