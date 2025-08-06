
'use client';

import { useDataStore } from '@/hooks/use-data-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Share2, Award, Recycle, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LEVELS } from '@/lib/constants';
import { AchievementBadge } from '@/components/AchievementBadge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function ProfilePage() {
  const { user, getBadges, logout } = useDataStore();
  const router = useRouter();

  if (!user) {
    // router.push('/') would cause infinite loop if user not set up
    return <div className="p-4 text-center">Loading user profile...</div>;
  }
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const allBadges = getBadges();

  const currentLevel = LEVELS.find(l => l.level === user.level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === user.level + 1);
  const levelProgress = nextLevel
    ? ((user.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;
        
  const chartData = [
    { name: 'CO2 Saved (kg)', value: (user.impactStats.co2Saved || 0).toFixed(2), fill: 'var(--color-co2)' },
    { name: 'Water Saved (L)', value: (user.impactStats.waterSaved || 0).toFixed(2), fill: 'var(--color-water)' },
    { name: 'Volume (m³)', value: (user.impactStats.volumeSaved || 0).toFixed(3), fill: 'var(--color-volume)' },
    { name: 'Trees', value: (user.impactStats.treesEquivalent || 0).toFixed(3), fill: 'var(--color-trees)' },
  ];

  const chartConfig = {
    value: { label: 'Value' },
    co2: { label: 'CO2', color: 'hsl(var(--chart-2))' },
    water: { label: 'Water', color: 'hsl(var(--chart-1))' },
    volume: { label: 'Volume', color: 'hsl(var(--chart-4))' },
    trees: { label: 'Trees', color: 'hsl(var(--chart-5))' },
  } satisfies ChartConfig;

  return (
    <div className="p-4 space-y-6">
      <Card className="text-center p-6 shadow-lg">
        <Avatar className="w-24 h-24 mx-auto border-4 border-primary">
          <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar" />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-2xl font-bold">{user.name}</h1>
        <p className="text-muted-foreground">{currentLevel.name}</p>
        
        <div className="mt-4">
            <div className="flex justify-between items-center text-sm mb-1">
                <span>Level {user.level}</span>
                {nextLevel && <span>{user.points}/{nextLevel.minPoints} pts</span>}
            </div>
            <Progress value={levelProgress} />
            {nextLevel && <p className="text-xs text-muted-foreground mt-1">{nextLevel.minPoints - user.points} points to Level {nextLevel.level}</p>}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Card>
            <CardContent className="p-3">
                <Recycle className="mx-auto h-6 w-6 mb-1 text-primary"/>
                <p className="font-bold text-lg">{user.totalItems}</p>
                <p className="text-xs text-muted-foreground">Items Recycled</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-3">
                <Flame className="mx-auto h-6 w-6 mb-1 text-orange-500"/>
                <p className="font-bold text-lg">{user.streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
        </Card>
         <Card>
            <CardContent className="p-3">
                <Award className="mx-auto h-6 w-6 mb-1 text-yellow-500"/>
                <p className="font-bold text-lg">{user.badges.length}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {allBadges.map(badge => (
            <AchievementBadge key={badge.id} badge={badge} unlocked={user.badges.includes(badge.id)} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environmental Impact</CardTitle>
        </CardHeader>
        <CardContent>
           <ChartContainer config={chartConfig} className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={100} />
                        <XAxis type="number" hide />
                        <RechartsTooltip cursor={{fill: 'hsl(var(--accent) / 0.3)'}} content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={5} />
                    </BarChart>
                </ResponsiveContainer>
           </ChartContainer>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Button variant="outline" className="w-full"><Share2 className="mr-2 h-4 w-4"/> Share Profile</Button>
        <Button variant="ghost" className="w-full"><Settings className="mr-2 h-4 w-4"/> Settings</Button>
        <Button variant="destructive" className="w-full" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
      </div>

    </div>
  );
}
