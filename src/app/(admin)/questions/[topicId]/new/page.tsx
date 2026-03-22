import { createClient } from '@/lib/supabase/server';
import { mapTopicRow } from '@/lib/utils';
import { QuestionForm } from '@/components/question-form';
import Link from 'next/link';

export default async function NewQuestionPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const supabase = await createClient();

  const { data: topicRow } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single();

  const topic = topicRow ? mapTopicRow(topicRow) : null;

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
        <span className="text-foreground font-medium">New Question</span>
      </div>
      <h1 className="text-2xl font-bold">Create Question</h1>
      <QuestionForm topicId={topicId} />
    </div>
  );
}
