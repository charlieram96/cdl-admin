'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { keywordToRow } from '@/lib/utils';
import type { Keyword } from '@/types';

export async function createKeyword(
  keyword: Omit<Keyword, 'id'>
) {
  const supabase = await createClient();

  const row = keywordToRow(keyword);

  const { data, error } = await supabase
    .from('keywords')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/keywords');
  return { success: true, id: data.id };
}

export async function updateKeyword(
  id: string,
  keyword: Partial<Keyword>
) {
  const supabase = await createClient();

  const row = keywordToRow(keyword);

  const { error } = await supabase
    .from('keywords')
    .update(row)
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/keywords');
  return { success: true };
}

export async function deleteKeyword(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('keywords').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/keywords');
  return { success: true };
}
