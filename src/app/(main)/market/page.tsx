
'use client';

import { useDataStore } from '@/hooks/use-data-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingBag, Coins } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function MarketPage() {
  const { user, submissions, claimItem } = useDataStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleClaim = (itemId: string, itemType: string) => {
    claimItem(itemId);
    toast({
        title: "Item Claimed!",
        description: `You've claimed the ${itemType} and earned 10 Green Coins!`,
        className: 'bg-primary text-primary-foreground'
    });
  }
  
  const communitySubmissions = submissions.filter(s => s.userId !== user?.id && s.status !== 'Sold');

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
                <ShoppingBag className="text-primary"/>
                <span>Marketplace</span>
            </div>
          </CardTitle>
          <CardDescription>Browse items recycled by the community. Give them a new life for free!</CardDescription>
        </CardHeader>
      </Card>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-4">
          {communitySubmissions.map(item => (
            <Card key={item.id} className="overflow-hidden">
                <div className="relative w-full h-32">
                    <Image src={item.photo} alt={item.itemType} layout="fill" objectFit="cover" />
                </div>
                <CardContent className="p-3">
                    <h3 className="font-semibold capitalize truncate">{item.itemType}</h3>
                    <p className="text-xs text-muted-foreground">{item.location.city}</p>
                    <Button className="w-full mt-2" size="sm" onClick={() => handleClaim(item.id, item.itemType)}>Claim Item</Button>
                </CardContent>
            </Card>
          ))}
        </div>
        {communitySubmissions.length === 0 && (
            <div className="text-center text-muted-foreground pt-16">
                <ShoppingBag className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Market is Empty</h3>
                <p className="mt-1 text-sm">Community items will appear here!</p>
            </div>
        )}
      </ScrollArea>
    </div>
  );
}
