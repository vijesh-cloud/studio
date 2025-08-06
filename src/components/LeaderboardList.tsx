'use client';

import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardListProps {
  users: User[];
  currentUser: User;
  category: string;
}

export function LeaderboardList({ users, currentUser, category }: LeaderboardListProps) {
    const sortedUsers = [...users].sort((a,b) => b.points - a.points);
  
    return (
        <div className="space-y-3">
          {sortedUsers.length > 0 ? sortedUsers.map((user, index) => {
            const isCurrentUser = user.id === currentUser.id;
            const rank = index + 1;
            let rankIcon = <span className="font-bold w-6 text-center">{rank}</span>;
            if (rank === 1) rankIcon = <Award className="h-6 w-6 text-yellow-400" />;
            if (rank === 2) rankIcon = <Award className="h-6 w-6 text-gray-400" />;
            if (rank === 3) rankIcon = <Award className="h-6 w-6 text-orange-400" />;
  
            return (
              <Card key={user.id} className={cn("transition-all", isCurrentUser && "border-2 border-primary shadow-lg")}>
                <CardContent className="p-3 flex items-center gap-4">
                  <div className="flex items-center gap-2 w-10">
                    {rankIcon}
                  </div>
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar"/>
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className={cn("font-semibold", isCurrentUser && "text-primary")}>{user.name}</p>
                    <p className="text-sm text-muted-foreground">Level {user.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{user.points} pts</p>
                    <div className="flex items-center justify-end text-sm text-muted-foreground">
                      <Flame className="h-4 w-4 text-orange-500 mr-1"/> {user.streak}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="text-center py-10 text-muted-foreground">
                <p>No users found for {category}.</p>
                <p className="text-sm">Start recycling to appear on the leaderboard!</p>
            </div>
          )}
        </div>
    );
}
