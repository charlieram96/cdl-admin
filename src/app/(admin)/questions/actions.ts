'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { questionToRow } from '@/lib/utils';
import type { Question } from '@/types';

export async function createQuestion(
  question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
) {
  const supabase = await createClient();

  const row = {
    ...questionToRow(question),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('questions')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/questions');
  return { success: true, id: data.id };
}

export async function updateQuestion(
  id: string,
  question: Partial<Question>
) {
  const supabase = await createClient();

  const row = {
    ...questionToRow(question),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('questions')
    .update(row)
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/questions');
  return { success: true };
}

export async function deleteQuestion(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('questions').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/questions');
  return { success: true };
}
