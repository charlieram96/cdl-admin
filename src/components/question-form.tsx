'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { WordDataEditor } from '@/components/word-data-editor';
import { KeywordInspector } from '@/components/keyword-inspector';
import { VideoUploader } from '@/components/video-uploader';
import { createQuestion, updateQuestion } from '@/app/(admin)/questions/actions';
import type { Question, QuestionType, WordData } from '@/types';
import { QUESTION_TYPES } from '@/types';

interface Props {
  topicId: string;
  question?: Question;
}

export function QuestionForm({ topicId, question }: Props) {
  const router = useRouter();
  const isEdit = !!question;

  const [englishText, setEnglishText] = useState(question?.englishText ?? '');
  const [type, setType] = useState<QuestionType>(question?.type ?? 'multiple_choice');
  const [correctAnswerText, setCorrectAnswerText] = useState(
    question?.correctAnswerText ?? ''
  );
  const [choices, setChoices] = useState<string[]>(
    question?.choices ?? ['', '', '', '']
  );
  const [wordData, setWordData] = useState<WordData[]>(question?.wordData ?? []);
  const [questionTranslation, setQuestionTranslation] = useState(
    question?.questionTranslationByLanguage?.es ?? ''
  );
  const [explanation, setExplanation] = useState(
    question?.explanationByLanguage?.es ?? ''
  );
  const [keywords, setKeywords] = useState<string[]>(question?.keywords ?? []);
  const [videoUrl, setVideoUrl] = useState<string | null>(question?.videoUrl ?? null);
  const [explanationVideoUrl, setExplanationVideoUrl] = useState<string | null>(
    question?.explanationVideoUrl ?? null
  );
  const [saving, setSaving] = useState(false);

  // For T/F, correctAnswerText is "true" or "false"
  const isTrueFalse = type === 'true_false';
  const isMultipleChoice = type === 'multiple_choice';

  function addChoice() {
    if (choices.length < 6) setChoices([...choices, '']);
  }

  function removeChoice(index: number) {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== index));
    }
  }

  function updateChoice(index: number, value: string) {
    const updated = [...choices];
    updated[index] = value;
    setChoices(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const data = {
      englishText,
      phoneticText: '',
      topicId,
      type,
      correctAnswerText: isTrueFalse ? correctAnswerText : correctAnswerText,
      choices: isMultipleChoice ? choices.filter((c) => c.trim()) : null,
      wordData,
      questionTranslationByLanguage: questionTranslation
        ? { es: questionTranslation }
        : ({} as Record<string, string>),
      explanationByLanguage: explanation
        ? { es: explanation }
        : ({} as Record<string, string>),
      literalTranslationByLanguage: {} as Record<string, string>,
      keywords,
      visualAssetIds: question?.visualAssetIds ?? [],
      videoUrl,
      explanationVideoUrl,
    };

    const result = isEdit
      ? await updateQuestion(question.id, data)
      : await createQuestion(data);

    if (result.success) {
      toast.success(isEdit ? 'Question updated' : 'Question created');
      router.push(`/questions/${topicId}`);
      router.refresh();
    } else {
      toast.error(result.error ?? 'Something went wrong');
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* English Text */}
      <div className="space-y-2">
        <Label htmlFor="englishText">English Text</Label>
        <Textarea
          id="englishText"
          value={englishText}
          onChange={(e) => setEnglishText(e.target.value)}
          rows={3}
          required
          placeholder="Enter the question text in English..."
        />
      </div>

      {/* Question Type */}
      <div className="space-y-2">
        <Label>Question Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((qt) => (
              <SelectItem key={qt.value} value={qt.value}>
                {qt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Correct Answer */}
      <div className="space-y-2">
        <Label htmlFor="correctAnswer">Correct Answer</Label>
        {isTrueFalse ? (
          <div className="flex items-center gap-3">
            <span className={correctAnswerText !== 'true' ? 'font-medium' : 'text-muted-foreground'}>
              False
            </span>
            <Switch
              checked={correctAnswerText === 'true'}
              onCheckedChange={(checked) =>
                setCorrectAnswerText(checked ? 'true' : 'false')
              }
            />
            <span className={correctAnswerText === 'true' ? 'font-medium' : 'text-muted-foreground'}>
              True
            </span>
          </div>
        ) : (
          <Input
            id="correctAnswer"
            value={correctAnswerText}
            onChange={(e) => setCorrectAnswerText(e.target.value)}
            required
            placeholder="Enter the correct answer..."
          />
        )}
      </div>

      {/* Choices (MC only) */}
      {isMultipleChoice && (
        <div className="space-y-3">
          <Label>Answer Choices</Label>
          {choices.map((choice, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-sm text-muted-foreground">
                {String.fromCharCode(65 + i)}.
              </span>
              <Input
                value={choice}
                onChange={(e) => updateChoice(i, e.target.value)}
                placeholder={`Choice ${String.fromCharCode(65 + i)}`}
              />
              {choices.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeChoice(i)}
                  className="text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          {choices.length < 6 && (
            <Button type="button" variant="outline" size="sm" onClick={addChoice}>
              Add Choice
            </Button>
          )}
        </div>
      )}

      <Separator />

      {/* Word Data */}
      <div className="space-y-2">
        <Label>Word Data</Label>
        <p className="text-sm text-muted-foreground">
          Per-word phonetics and Spanish literals. Auto-generated from English text.
        </p>
        <WordDataEditor
          englishText={englishText}
          wordData={wordData}
          onChange={setWordData}
        />
      </div>

      <Separator />

      {/* Translations */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="translation">Question Translation (Spanish)</Label>
          <Textarea
            id="translation"
            value={questionTranslation}
            onChange={(e) => setQuestionTranslation(e.target.value)}
            rows={3}
            placeholder="Spanish translation of the question..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="explanation">Explanation (Spanish)</Label>
          <Textarea
            id="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
            placeholder="Explanation in Spanish..."
          />
        </div>
      </div>

      <Separator />

      {/* Keywords */}
      <div className="space-y-2">
        <Label>Keywords</Label>
        <KeywordInspector
          englishText={englishText}
          selectedKeywordIds={keywords}
          onKeywordsChange={setKeywords}
        />
      </div>

      <Separator />

      {/* Hint Video */}
      <div className="space-y-2">
        <Label>Hint Video</Label>
        <p className="text-sm text-muted-foreground">
          Shown via the video icon while viewing the question.
        </p>
        <VideoUploader videoUrl={videoUrl} onVideoChange={setVideoUrl} />
      </div>

      {/* Explanation Video */}
      <div className="space-y-2">
        <Label>Explanation Video</Label>
        <p className="text-sm text-muted-foreground">
          Auto-plays after the question is answered in study mode.
        </p>
        <VideoUploader videoUrl={explanationVideoUrl} onVideoChange={setExplanationVideoUrl} />
      </div>

      <Separator />

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update Question' : 'Create Question'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
