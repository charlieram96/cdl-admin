import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mapQuestionRow, mapTopicRow } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeleteQuestionButton } from '@/components/delete-question-button';

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'MC',
  fill_in_the_blank: 'Fill',
  true_false: 'T/F',
};

export default async function TopicQuestionsPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const supabase = await createClient();

  // Fetch topic info
  const { data: topicRow } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single();

  const topic = topicRow ? mapTopicRow(topicRow) : null;

  // Fetch questions for topic
  const { data: questionRows } = await supabase
    .from('questions')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });

  const questions = (questionRows ?? []).map(mapQuestionRow);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/questions"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Questions
            </Link>
            <span className="text-sm text-muted-foreground">/</span>
            <h1 className="text-2xl font-bold">
              {topic?.icon} {topic?.nameByLanguage.en ?? topicId}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href={`/questions/${topicId}/new`}>
          <Button>New Question</Button>
        </Link>
      </div>

      {questions.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No questions yet. Create one to get started.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <Link
                      href={`/questions/${topicId}/${q.id}`}
                      className="hover:underline font-medium"
                    >
                      {q.englishText.length > 100
                        ? q.englishText.slice(0, 100) + '...'
                        : q.englishText}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {TYPE_LABELS[q.type] ?? q.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{q.keywords.length}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DeleteQuestionButton questionId={q.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
