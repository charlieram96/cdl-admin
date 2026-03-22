import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Question, Keyword, Topic, ExamCategory } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// snake_case DB row → camelCase model mappers

/* eslint-disable @typescript-eslint/no-explicit-any */

export function mapQuestionRow(row: any): Question {
  return {
    id: row.id,
    englishText: row.english_text,
    phoneticText: row.phonetic_text ?? '',
    topicId: row.topic_id,
    type: row.type,
    correctAnswerText: row.correct_answer_text,
    choices: row.choices,
    explanationByLanguage: row.explanation_by_language ?? {},
    literalTranslationByLanguage: row.literal_translation_by_language ?? {},
    wordData: row.word_data ?? [],
    questionTranslationByLanguage: row.question_translation_by_language ?? {},
    keywords: row.keywords ?? [],
    visualAssetIds: row.visual_asset_ids ?? [],
    videoUrl: row.video_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapKeywordRow(row: any): Keyword {
  return {
    id: row.id,
    englishWord: row.english_word,
    phoneticWord: row.phonetic_word,
    ttsLocale: row.tts_locale ?? 'en-US',
    definitionByLanguage: row.definition_by_language ?? {},
    translationByLanguage: row.translation_by_language,
    imageAssetIds: row.image_asset_ids ?? [],
    type: row.type,
  };
}

export function mapTopicRow(row: any): Topic {
  return {
    id: row.id,
    nameByLanguage: row.name_by_language ?? {},
    descriptionByLanguage: row.description_by_language ?? {},
    icon: row.icon ?? '',
    sortOrder: row.sort_order ?? 0,
    totalQuestions: row.total_questions ?? 0,
    examRelevanceWeight: row.exam_relevance_weight ?? 1,
  };
}

export function mapExamCategoryRow(row: any): ExamCategory {
  return {
    id: row.id,
    nameByLanguage: row.name_by_language ?? {},
    parentId: row.parent_id,
    type: row.type,
    sortOrder: row.sort_order ?? 0,
  };
}

export function questionToRow(q: Partial<Question>) {
  const row: Record<string, unknown> = {};
  if (q.englishText !== undefined) row.english_text = q.englishText;
  if (q.phoneticText !== undefined) row.phonetic_text = q.phoneticText;
  if (q.topicId !== undefined) row.topic_id = q.topicId;
  if (q.type !== undefined) row.type = q.type;
  if (q.correctAnswerText !== undefined) row.correct_answer_text = q.correctAnswerText;
  if (q.choices !== undefined) row.choices = q.choices;
  if (q.explanationByLanguage !== undefined) row.explanation_by_language = q.explanationByLanguage;
  if (q.literalTranslationByLanguage !== undefined) row.literal_translation_by_language = q.literalTranslationByLanguage;
  if (q.wordData !== undefined) row.word_data = q.wordData;
  if (q.questionTranslationByLanguage !== undefined) row.question_translation_by_language = q.questionTranslationByLanguage;
  if (q.keywords !== undefined) row.keywords = q.keywords;
  if (q.visualAssetIds !== undefined) row.visual_asset_ids = q.visualAssetIds;
  if (q.videoUrl !== undefined) row.video_url = q.videoUrl;
  return row;
}

export function keywordToRow(k: Partial<Keyword>) {
  const row: Record<string, unknown> = {};
  if (k.englishWord !== undefined) row.english_word = k.englishWord;
  if (k.phoneticWord !== undefined) row.phonetic_word = k.phoneticWord;
  if (k.ttsLocale !== undefined) row.tts_locale = k.ttsLocale;
  if (k.definitionByLanguage !== undefined) row.definition_by_language = k.definitionByLanguage;
  if (k.translationByLanguage !== undefined) row.translation_by_language = k.translationByLanguage;
  if (k.imageAssetIds !== undefined) row.image_asset_ids = k.imageAssetIds;
  if (k.type !== undefined) row.type = k.type;
  return row;
}

export function stripPunctuation(word: string): string {
  return word.replace(/[^a-zA-Z0-9'-]/g, '').toLowerCase();
}
