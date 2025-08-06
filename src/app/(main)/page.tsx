
'use client';

import { useEffect, useState } from 'react';
import { useDataStore } from '@/hooks/use-data-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Droplets, Leaf, Recycle, Flame, BarChart, History, Gift, ThumbsUp, Box, ShoppingBag } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { LEVELS } from '@/lib/constants';
import { getTipsAction } from '@/app/actions';
import { LocationService } from '@/lib/location';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, submissions } = useDataStore();
  const [tips, setTips] = useState('');
  const [locationCity, setLocationCity] = useState('your city');
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      if (!user) {
        router.push('/login');
      }
    };
    // Delay check to allow store hydration
    const timer = setTimeout(checkUser, 100);
    return () => clearTimeout(timer);
  }, [user, router]);

  useEffect(() => {
    async function fetchLocationAndTips() {
      if(user) {
        try {
          const { lat, lng } = await LocationService.getCurrentPosition();
          const { city } = LocationService.getAddress(lat, lng);
          setLocationCity(city);

          const recyclingHistory = submissions.slice(0, 5).map(s => s.itemType).join(', ') || 'No items recycled yet.';
          const tipsResult = await getTipsAction({ location: city, recyclingHistory });
          setTips(tipsResult.tips);
        } catch (error) {
          setTips('Remember to rinse containers before recycling!');
        }
      }
    }
    fetchLocationAndTips();
  }, [user, submissions]);

  if (!user) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Recycle className="mx-auto h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-lg">Loading EcoVerse...</p>
          </div>
        </div>
    );
  }

  const currentLevel = LEVELS.find(l => l.level === user.level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === user.level + 1);
  const levelProgress = nextLevel
    ? ((user.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  return (
    <div className="p-4 space-y-6">
      <Link href="/profile">
        <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground border-none shadow-xl hover:shadow-2xl transition-shadow">
          <CardHeader>
            <CardTitle>Hello, {user.name}!</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Ready to make {locationCity} greener today?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                  <span>{currentLevel.name} (Lvl {user.level})</span>
                  {nextLevel && <span>{user.points}/{nextLevel.minPoints}</span>}
              </div>
              <Progress value={levelProgress} className="w-full [&>div]:bg-accent" />
          </CardContent>
        </Card>
      </Link>

      <div className="grid gap-4 md:grid-cols-2 grid-cols-2">
        <StatCard icon={Award} title="Total Points" value={user.points} />
        <StatCard icon={Flame} title="Streak" value={`${user.streak} days`} />
      </div>
      
      <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Leaf className="text-primary" />
                <span>Environmental Impact</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4 text-center">
              <div>
                  <Droplets className="mx-auto h-8 w-8 text-blue-500"/>
                  <p className="font-bold text-lg">{user.impactStats.waterSaved.toFixed(1)}L</p>
                  <p className="text-xs text-muted-foreground">Water Saved</p>
              </div>
              <div>
                  <Recycle className="mx-auto h-8 w-8 text-gray-500"/>
                  <p className="font-bold text-lg">{user.impactStats.co2Saved.toFixed(1)}kg</p>
                  <p className="text-xs text-muted-foreground">CO2 Reduced</p>
              </div>
               <div>
                  <Box className="mx-auto h-8 w-8 text-yellow-600"/>
                  <p className="font-bold text-lg">{(user.impactStats.volumeSaved || 0).toFixed(3)}m³</p>
                  <p className="text-xs text-muted-foreground">Volume Saved</p>
              </div>
              <div>
                  <Leaf className="mx-auto h-8 w-8 text-green-500"/>
                  <p className="font-bold text-lg">{user.impactStats.treesEquivalent.toFixed(3)}</p>
                  <p className="text-xs text-muted-foreground">Trees Saved</p>
              </div>
          </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-2">
        <Link href="/camera">
            <Button className="w-full h-16 text-lg" size="lg"><Recycle className="mr-2"/> Recycle Now</Button>
        </Link>
        <Link href="/market">
            <Button variant="outline" className="w-full h-16 text-lg" size="lg"><ShoppingBag className="mr-2"/> Marketplace</Button>
        </Link>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Gift className="text-primary" />
              <span>Eco-Tips & Challenges</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm italic text-muted-foreground">{tips || "Loading tips..."}</p>
            <Card className="mt-4 p-4 bg-accent/30">
                <p className="font-bold">Weekly Challenge</p>
                <p className="text-sm">Recycle 5 different item types to earn a bonus 50 points!</p>
            </Card>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <History className="text-primary" />
              <span>Recent Activity</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full">
             {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.slice(0, 5).map(sub => (
                    <div key={sub.id} className="flex items-center gap-4">
                       <Image src={sub.photo} alt={sub.itemType} width={40} height={40} className="rounded-md object-cover w-10 h-10" />
                      <div className="flex-grow">
                        <p className="font-semibold">You recycled a <span className="capitalize text-primary">{sub.itemType}</span>.</p>
                        <p className="text-xs text-muted-foreground">{new Date(sub.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                          <p className="font-bold text-primary">+{sub.points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <ThumbsUp className="mx-auto h-8 w-8"/>
                    <p className="mt-2">No activity yet. Let's get recycling!</p>
                </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

    </div>
  );
}
