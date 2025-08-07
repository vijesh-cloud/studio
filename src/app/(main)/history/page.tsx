
'use client';

import { useDataStore } from '@/hooks/use-data-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Trash2, Inbox, CheckCircle, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HistoryPage() {
  const { user, submissions, deleteSubmission } = useDataStore();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);
  
  const userSubmissions = submissions
    .filter(s => s.userId === user?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const claimedItems = submissions
    .filter(s => s.claimedByUserId === user?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleDelete = (subId: string) => {
    const submission = submissions.find(s => s.id === subId);
    if (!submission) return;

    deleteSubmission(subId);

    toast({
      title: "Item Deleted",
      description: `"${submission.itemType}" has been removed.`,
      action: (
        <Button variant="secondary" onClick={() => console.log('Undo not implemented yet')}>
          Undo
        </Button>
      ),
    });
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
             <div className="flex items-center gap-2">
                <Package className="text-primary"/>
                <span>My Activity</span>
            </div>
          </CardTitle>
          <CardDescription>View items you have submitted or claimed.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="submitted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submitted"><Upload className="w-4 h-4 mr-1 inline-block"/> Submitted ({userSubmissions.length})</TabsTrigger>
          <TabsTrigger value="claimed"><ShoppingCart className="w-4 h-4 mr-1 inline-block"/> Claimed ({claimedItems.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="submitted" className="mt-4">
           {userSubmissions.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-4 pr-4">
                {userSubmissions.map(sub => (
                  <Card key={sub.id} className={cn("flex items-center p-3 gap-4", sub.status === 'Sold' && 'bg-accent/50')}>
                    <Image src={sub.photo} alt={sub.itemType} width={64} height={64} className="rounded-md object-cover w-16 h-16" />
                    <div className="flex-grow">
                        <p className="font-bold capitalize">{sub.itemType}</p>
                        <p className="text-xs text-muted-foreground">{new Date(sub.timestamp).toLocaleDateString()}</p>
                        {sub.status === 'Sold' ? (
                            <div className="text-sm font-semibold text-primary flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                <span>Sold (+{sub.points} pts)</span>
                            </div>
                        ) : (
                            <p className="text-sm font-semibold text-muted-foreground">+{sub.points} pts on sale</p>
                        )}
                    </div>
                    {sub.status !== 'Sold' && (
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(sub.id)}>
                            <Trash2 className="w-4 h-4"/>
                        </Button>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground pt-16">
              <Inbox className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold">No Products Submitted</h3>
              <p className="mt-1 text-sm">Recycle an item to see it here!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="claimed" className="mt-4">
          {claimedItems.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-4 pr-4">
                  {claimedItems.map(sub => (
                    <Card key={`claimed-${sub.id}`} className="flex items-center p-3 gap-4 bg-accent/30">
                      <Image src={sub.photo} alt={sub.itemType} width={64} height={64} className="rounded-md object-cover w-16 h-16" />
                      <div className="flex-grow">
                          <p className="font-bold capitalize">{sub.itemType}</p>
                          <p className="text-xs text-muted-foreground">Claimed on: {new Date(sub.timestamp).toLocaleDateString()}</p>
                           <div className="text-sm font-semibold text-primary flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              <span>Claimed (+10 pts)</span>
                          </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center text-muted-foreground pt-16">
                <ShoppingCart className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">No Items Claimed</h3>
                <p className="mt-1 text-sm">Claim an item from the marketplace to see it here!</p>
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
