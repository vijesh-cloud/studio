
'use client';

import { useDataStore } from '@/hooks/use-data-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Trash2, Inbox } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HistoryPage() {
  const { user, submissions, deleteSubmission } = useDataStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);
  
  const userSubmissions = submissions.filter(s => s.userId === user?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
             <div className="flex items-center gap-2">
                <Package className="text-primary"/>
                <span>My History</span>
            </div>
          </CardTitle>
          <CardDescription>View and manage the items you have uploaded for recycling.</CardDescription>
        </CardHeader>
      </Card>

      {userSubmissions.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-4 pr-4">
            {userSubmissions.map(sub => (
              <Card key={sub.id} className="flex items-center p-3 gap-4">
                <Image src={sub.photo} alt={sub.itemType} width={64} height={64} className="rounded-md object-cover w-16 h-16" />
                <div className="flex-grow">
                    <p className="font-bold capitalize">{sub.itemType}</p>
                    <p className="text-xs text-muted-foreground">{new Date(sub.timestamp).toLocaleDateString()}</p>
                    <p className="text-sm font-semibold text-primary">+{sub.points} pts</p>
                </div>
                <Button variant="destructive" size="icon" onClick={() => deleteSubmission(sub.id)}>
                    <Trash2 className="w-4 h-4"/>
                </Button>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center text-muted-foreground pt-16">
          <Inbox className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">No Products Yet</h3>
          <p className="mt-1 text-sm">Recycle an item to see it here!</p>
        </div>
      )}
    </div>
  );
}
