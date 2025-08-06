'use client';

import { useDataStore } from '@/hooks/use-data-store';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HistoryItem } from '@/components/HistoryItem';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Inbox } from 'lucide-react';

export default function HistoryPage() {
  const { user, submissions } = useDataStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return <div className="p-4 text-center">Loading history...</div>;
  }
  
  const sortedSubmissions = [...submissions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>Track the journey of your recycled items.</CardDescription>
        </CardHeader>
      </Card>

      {sortedSubmissions.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-15rem)]">
          <div className="space-y-4 pr-4">
            {sortedSubmissions.map(sub => (
              <HistoryItem key={sub.id} submission={sub} />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center text-muted-foreground pt-16">
          <Inbox className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">No Submissions Yet</h3>
          <p className="mt-1 text-sm">Tap the camera button to start recycling!</p>
        </div>
      )}
    </div>
  );
}
