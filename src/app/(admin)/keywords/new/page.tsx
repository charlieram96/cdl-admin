import Link from 'next/link';
import { KeywordForm } from '@/components/keyword-form';

export default function NewKeywordPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/keywords" className="hover:text-foreground">
          Keywords
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">New Keyword</span>
      </div>
      <h1 className="text-2xl font-bold">Create Keyword</h1>
      <KeywordForm />
    </div>
  );
}
