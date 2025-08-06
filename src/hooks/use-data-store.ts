
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Submission, Location } from '@/lib/types';
import { LEVELS, BADGES, POINTS_MAP } from '@/lib/constants';
import { differenceInCalendarDays, isToday } from 'date-fns';

interface EcoVerseState {
  user: User | null;
  submissions: Submission[];
  leaderboard: User[];
  setUser: (name: string) => void;
  addSubmission: (submissionData: Omit<Submission, 'id' | 'userId' | 'timestamp' | 'organizerId' | 'status'>, location: Location) => void;
  updateSubmissionStatus: (id: string, status: Submission['status']) => void;
  updateLeaderboardPoints: () => void;
  getBadges: () => typeof BADGES;
}

const getLevel = (points: number) => {
  return LEVELS.slice().reverse().find(l => points >= l.minPoints) || LEVELS[0];
};

const generateFakeUsers = (count: number): User[] => {
  const names = ['Aarav', 'Sanya', 'Vikram', 'Priya', 'Rohan', 'Isha', 'Arjun', 'Diya'];
  const cities = ['New Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai'];
  return Array.from({ length: count }, (_, i) => {
    const points = Math.floor(Math.random() * 1500);
    const levelData = getLevel(points);
    return {
      id: `user-fake-${i}`,
      name: `${names[Math.floor(Math.random() * names.length)]} ${String.fromCharCode(65 + i)}`,
      avatar: `https://placehold.co/100x100.png`,
      points,
      level: levelData.level,
      streak: Math.floor(Math.random() * 20),
      lastRecycled: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
      badges: ['first_timer'],
      totalItems: Math.floor(Math.random() * 50),
      impactStats: {
        co2Saved: Math.random() * 5,
        waterSaved: Math.random() * 20,
        treesEquivalent: Math.random() * 0.5,
      },
    };
  });
};


export const useDataStore = create<EcoVerseState>()(
  persist(
    (set, get) => ({
      user: null,
      submissions: [],
      leaderboard: [],
      setUser: (name) => {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          avatar: `https://placehold.co/100x100.png`,
          points: 0,
          level: 1,
          streak: 0,
          lastRecycled: null,
          badges: [],
          totalItems: 0,
          impactStats: { co2Saved: 0, waterSaved: 0, treesEquivalent: 0 },
        };
        set({ user: newUser, leaderboard: [...generateFakeUsers(49), newUser] });
      },
      addSubmission: (submissionData, location) => {
        const user = get().user;
        if (!user) return;

        const newSubmission: Submission = {
          ...submissionData,
          id: `sub-${Date.now()}`,
          userId: user.id,
          timestamp: new Date().toISOString(),
          organizerId: `org-${Math.floor(Math.random() * 10)}`,
          status: 'Submitted',
          location,
        };

        const now = new Date();
        let newStreak = user.streak;
        if (user.lastRecycled) {
          const lastDate = new Date(user.lastRecycled);
          if (!isToday(lastDate)) {
            const daysDiff = differenceInCalendarDays(now, lastDate);
            if (daysDiff === 1) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
          }
        } else {
          newStreak = 1;
        }

        const newPoints = user.points + (POINTS_MAP[submissionData.itemType] || 1);
        const newLevel = getLevel(newPoints).level;
        
        const newSubmissions = [newSubmission, ...get().submissions];

        const newBadges = BADGES.filter(b => b.condition({ ...user, streak: newStreak }, newSubmissions)).map(b => b.id);

        const updatedUser: User = {
          ...user,
          points: newPoints,
          level: newLevel,
          streak: newStreak,
          lastRecycled: now.toISOString(),
          totalItems: user.totalItems + 1,
          impactStats: {
            co2Saved: user.impactStats.co2Saved + (POINTS_MAP[submissionData.itemType] / 50),
            waterSaved: user.impactStats.waterSaved + (POINTS_MAP[submissionData.itemType] / 2),
            treesEquivalent: user.impactStats.treesEquivalent + (POINTS_MAP[submissionData.itemType] / 1000),
          },
          badges: [...new Set([...user.badges, ...newBadges])],
        };
        
        set((state) => ({
          user: updatedUser,
          submissions: newSubmissions,
          leaderboard: state.leaderboard.map(u => u.id === updatedUser.id ? updatedUser : u)
        }));
      },
      updateSubmissionStatus: (id, status) => {
        set(state => ({
            submissions: state.submissions.map(s => s.id === id ? {...s, status} : s)
        }));
      },
      updateLeaderboardPoints: () => {
        set(state => {
          const { user, leaderboard } = state;
          if (!user) return {};
          
          const newLeaderboard = leaderboard.map(u => {
            if (u.id === user.id) {
              return u; // Don't change the real user's points
            }
            // Add a small random amount to each fake user's points
            const newPoints = u.points + Math.floor(Math.random() * 5);
            const newLevel = getLevel(newPoints).level;
            return { ...u, points: newPoints, level: newLevel };
          });
          
          return { leaderboard: newLeaderboard };
        });
      },
      getBadges: () => BADGES,
    }),
    {
      name: 'ecoverse-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
