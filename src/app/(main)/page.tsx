'use client';

import { useEffect, useState } from 'react';
import { useDataStore } from '@/hooks/use-data-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, Droplets, Leaf, Recycle, Flame, BarChart, History, Gift, ThumbsUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { LEVELS } from '@/lib/constants';
import { getTipsAction } from '@/app/actions';
import { LocationService } from '@/lib/location';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

export default function HomePage() {
  const { user, setUser, submissions } = useDataStore();
  const [name, setName] = useState('');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [tips, setTips] = useState('');
  const [locationCity, setLocationCity] = useState('your city');

  useEffect(() => {
    const checkUser = () => {
      if (!user) {
        setShowWelcomeDialog(true);
      }
    };
    // Delay check to allow store hydration
    const timer = setTimeout(checkUser, 100);
    return () => clearTimeout(timer);
  }, [user]);

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

  const handleUserSetup = () => {
    if (name.trim()) {
      setUser(name.trim());
      setShowWelcomeDialog(false);
    }
  };

  if (!user) {
    return (
      <>
        <Dialog open={showWelcomeDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Welcome to EcoVerse!</DialogTitle>
              <DialogDescription>Let's make recycling a habit. What should we call you?</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUserSetup}>Get Started</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Recycle className="mx-auto h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-lg">Loading EcoVerse...</p>
          </div>
        </div>
      </>
    );
  }

  const currentLevel = LEVELS.find(l => l.level === user.level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === user.level + 1);
  const levelProgress = nextLevel
    ? ((user.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  return (
    <div className="p-4 space-y-6">
      <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground border-none shadow-xl">
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

      <div className="grid gap-4 md:grid-cols-2 grid-cols-2">
        <StatCard icon={Award} title="Total Points" value={user.points} />
        <StatCard icon={Flame} title="Streak" value={`${user.streak} days`} />
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Leaf className="text-primary"/> Environmental Impact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
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
        <Link href="/leaderboard">
            <Button variant="outline" className="w-full h-16 text-lg" size="lg"><BarChart className="mr-2"/> Leaderboard</Button>
        </Link>
      </div>

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift className="text-primary"/> Eco-Tips & Challenges</CardTitle>
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
          <CardTitle className="flex items-center gap-2"><History className="text-primary"/> Recent Activity</CardTitle>
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
