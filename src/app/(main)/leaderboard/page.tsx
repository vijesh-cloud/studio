
'use client';

import { useDataStore } from '@/hooks/use-data-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { LeaderboardList } from '@/components/LeaderboardList';
import { Gift, Users, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LeaderboardPage() {
  const { user, leaderboard, submissions, updateLeaderboardPoints } = useDataStore();
  const router = useRouter();
  const [currentUserCity, setCurrentUserCity] = useState('Global');

  useEffect(() => {
     if (!user) {
        router.push('/');
        return;
      }
      if(submissions.length > 0) {
          setCurrentUserCity(submissions[0].location.city);
      }
  }, [user, router, submissions]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateLeaderboardPoints();
    }, 5000); // Update points every 5 seconds

    return () => clearInterval(interval);
  }, [updateLeaderboardPoints]);

  if (!user) {
    return <div className="p-4 text-center">Loading leaderboard...</div>;
  }
  
  // Neighborhood: A smaller, more stable group including the current user
  const currentUserIndex = leaderboard.findIndex(u => u.id === user.id);
  const start = Math.max(0, currentUserIndex - 4);
  const end = Math.min(leaderboard.length, start + 8);
  const neighborhoodUsers = leaderboard.slice(start, end);
  if (!neighborhoodUsers.some(u => u.id === user.id)) {
      neighborhoodUsers.push(user);
  }

  // City & Global are the full list, which will be dynamic
  const cityUsers = leaderboard;
  const globalUsers = leaderboard;


  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>See how you rank against other Eco-Warriors!</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="bg-accent/30">
        <CardHeader className="p-4">
          <CardTitle>
            <div className="flex items-center gap-2 text-base">
              <Gift className="text-primary" />
              <span>Weekly Challenge</span>
            </div>
          </CardTitle>
            <CardDescription className="text-sm">Recycle 3 plastic bottles and 2 paper items this week for a 100 point bonus!</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="neighborhood" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="neighborhood"><Users className="w-4 h-4 mr-1 inline-block"/> Neighborhood</TabsTrigger>
          <TabsTrigger value="city"><Users className="w-4 h-4 mr-1 inline-block"/> {currentUserCity}</TabsTrigger>
          <TabsTrigger value="global"><Globe className="w-4 h-4 mr-1 inline-block"/> Global</TabsTrigger>
        </TabsList>
        <TabsContent value="neighborhood" className="mt-4">
            <LeaderboardList users={neighborhoodUsers} currentUser={user} category="your neighborhood"/>
        </TabsContent>
        <TabsContent value="city" className="mt-4">
            <LeaderboardList users={cityUsers} currentUser={user} category={currentUserCity}/>
        </TabsContent>
        <TabsContent value="global" className="mt-4">
            <LeaderboardList users={globalUsers} currentUser={user} category="the world"/>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
