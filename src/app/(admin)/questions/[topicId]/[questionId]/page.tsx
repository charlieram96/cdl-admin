import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mapQuestionRow, mapTopicRow } from '@/lib/utils';
import { QuestionForm } from '@/components/question-form';

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ topicId: string; questionId: string }>;
}) {
  const { topicId, questionId } = await params;
  const supabase = await createClient();

  const [{ data: topicRow }, { data: questionRow }] = await Promise.all([
    supabase.from('topics').select('*').eq('id', topicId).single(),
    supabase.from('questions').select('*').eq('id', questionId).single(),
  ]);

  if (!questionRow) notFound();

  const topic = topicRow ? mapTopicRow(topicRow) : null;
  const question = mapQuestionRow(questionRow);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/questions" className="hover:text-foreground">
          Questions
        </Link>
        <span>/</span>
        <Link
          href={`/questions/${topicId}`}
          className="hover:text-foreground"
        >
          {topic?.nameByLanguage.en ?? topicId}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Edit</span>
      </div>
      <h1 className="text-2xl font-bold">Edit Question</h1>
      <QuestionForm topicId={topicId} question={question} />
    </div>
  );
}
