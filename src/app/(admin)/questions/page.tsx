import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { mapExamCategoryRow, mapTopicRow } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ExamCategory, Topic } from '@/types';

interface TopicWithCount extends Topic {
  questionCount: number;
}

export default async function QuestionsPage() {
  const supabase = await createClient();

  // Fetch all exam categories
  const { data: catRows } = await supabase
    .from('exam_categories')
    .select('*')
    .order('sort_order');

  const categories = (catRows ?? []).map(mapExamCategoryRow);
  const topLevel = categories.filter((c) => c.parentId === null);

  // Fetch all topics
  const { data: topicRows } = await supabase
    .from('topics')
    .select('*')
    .order('sort_order');

  const topics = (topicRows ?? []).map(mapTopicRow);

  // Fetch exam_category_topics junction
  const { data: junctionRows } = await supabase
    .from('exam_category_topics')
    .select('exam_category_id, topic_id');

  const junction = junctionRows ?? [];

  // Fetch question counts per topic
  const { data: countRows } = await supabase
    .from('questions')
    .select('topic_id');

  const countMap = new Map<string, number>();
  (countRows ?? []).forEach((row: { topic_id: string }) => {
    countMap.set(row.topic_id, (countMap.get(row.topic_id) ?? 0) + 1);
  });

  // Build hierarchy: for each top-level class, find subtests and their topics
  function getTopicsForCategory(catId: string): TopicWithCount[] {
    // Direct topics
    const directTopicIds = junction
      .filter((j) => j.exam_category_id === catId)
      .map((j) => j.topic_id);

    // Child category topics
    const children = categories.filter((c) => c.parentId === catId);
    const childTopicIds = children.flatMap((child) =>
      junction
        .filter((j) => j.exam_category_id === child.id)
        .map((j) => j.topic_id)
    );

    const allTopicIds = [...new Set([...directTopicIds, ...childTopicIds])];

    return allTopicIds
      .map((tid) => {
        const topic = topics.find((t) => t.id === tid);
        if (!topic) return null;
        return { ...topic, questionCount: countMap.get(tid) ?? 0 };
      })
      .filter(Boolean) as TopicWithCount[];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Questions</h1>

      <Tabs defaultValue={topLevel[0]?.id}>
        <TabsList>
          {topLevel.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.nameByLanguage.en ?? cat.id}
            </TabsTrigger>
          ))}
        </TabsList>

        {topLevel.map((cat) => {
          const catTopics = getTopicsForCategory(cat.id);
          return (
            <TabsContent key={cat.id} value={cat.id}>
              {catTopics.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  No topics found for this category.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catTopics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/questions/${topic.id}`}
                    >
                      <Card className="transition-colors hover:bg-accent/50 cursor-pointer">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center justify-between text-base">
                            <span className="truncate">
                              {topic.icon} {topic.nameByLanguage.en ?? topic.id}
                            </span>
                            <Badge variant="secondary">
                              {topic.questionCount}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {topic.descriptionByLanguage.en ?? ''}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
