'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { glossaryEntryToRow } from '@/lib/utils';
import type { GlossaryEntry } from '@/types';

export async function createGlossaryEntry(
  entry: Omit<GlossaryEntry, 'id' | 'createdAt' | 'updatedAt'>
) {
  const supabase = await createClient();

  const row = {
    ...glossaryEntryToRow(entry),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('glossary_entries')
    .insert(row)
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/glossary');
  return { success: true, id: data.id };
}

export async function updateGlossaryEntry(
  id: string,
  entry: Partial<GlossaryEntry>
) {
  const supabase = await createClient();

  const row = {
    ...glossaryEntryToRow(entry),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('glossary_entries')
    .update(row)
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/glossary');
  return { success: true };
}

export async function deleteGlossaryEntry(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('glossary_entries').delete().eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/glossary');
  return { success: true };
}
