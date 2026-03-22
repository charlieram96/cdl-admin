// Content types — mirrored from mobile app's src/models/types.ts

export interface Topic {
  id: string;
  nameByLanguage: Record<string, string>;
  descriptionByLanguage: Record<string, string>;
  icon: string;
  sortOrder: number;
  totalQuestions: number;
  examRelevanceWeight: number;
}

export interface ExamCategory {
  id: string;
  nameByLanguage: Record<string, string>;
  parentId: string | null;
  type: 'class' | 'subtest' | 'endorsement';
  sortOrder: number;
}

export type KeywordType = 'safety' | 'vehicle' | 'regulation' | 'procedure' | 'hazmat' | 'road' | 'signs' | 'general';

export const KEYWORD_TYPES: KeywordType[] = ['safety', 'vehicle', 'regulation', 'procedure', 'hazmat', 'road', 'signs', 'general'];

export interface WordData {
  word: string;
  phonetic: string;
  literals: Record<string, string>;
}

export interface Keyword {
  id: string;
  englishWord: string;
  phoneticWord: string | null;
  ttsLocale: string;
  definitionByLanguage: Record<string, string>;
  translationByLanguage: Record<string, string> | null;
  imageAssetIds: string[];
  type: KeywordType;
}

export interface Question {
  id: string;
  englishText: string;
  phoneticText: string;
  topicId: string;
  type: 'multiple_choice' | 'fill_in_the_blank' | 'true_false';
  correctAnswerText: string;
  choices: string[] | null;
  explanationByLanguage: Record<string, string>;
  literalTranslationByLanguage: Record<string, string>;
  wordData: WordData[];
  questionTranslationByLanguage: Record<string, string>;
  keywords: string[];
  visualAssetIds: string[];
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type QuestionType = Question['type'];

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'fill_in_the_blank', label: 'Fill in the Blank' },
  { value: 'true_false', label: 'True / False' },
];

export interface Profile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  preferredLanguage: 'en' | 'es';
  isAdmin: boolean;
}
