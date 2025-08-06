
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Submission, Location, EnvironmentalImpact } from '@/lib/types';
import { LEVELS, BADGES, POINTS_MAP } from '@/lib/constants';
import { differenceInCalendarDays, isToday } from 'date-fns';
import { getImpactAction } from '@/app/actions';

interface EcoVerseState {
  user: User | null;
  submissions: Submission[];
  leaderboard: User[];
  setUser: (name: string) => void;
  addSubmission: (submissionData: Omit<Submission, 'id' | 'userId' | 'timestamp' | 'organizerId' | 'status' | 'impact'>, location: Location) => void;
  updateSubmissionStatus: (id: string, status: Submission['status']) => void;
  deleteSubmission: (id: string) => void;
  claimItem: (id: string) => void;
  updateLeaderboardPoints: () => void;
  getBadges: () => typeof BADGES;
  logout: () => void;
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
        volumeSaved: Math.random() * 0.1,
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
          impactStats: { co2Saved: 0, waterSaved: 0, volumeSaved: 0, treesEquivalent: 0 },
        };
        set({ user: newUser, leaderboard: [...generateFakeUsers(49), newUser] });
      },
      addSubmission: async (submissionData, location) => {
        const user = get().user;
        if (!user) return;
        
        const impact = await getImpactAction({ itemType: submissionData.itemType });

        const newSubmission: Submission = {
          ...submissionData,
          id: `sub-${Date.now()}`,
          userId: user.id,
          timestamp: new Date().toISOString(),
          organizerId: `org-${Math.floor(Math.random() * 10)}`,
          status: 'Submitted',
          location,
          impact,
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
            co2Saved: user.impactStats.co2Saved + impact.co2Saved,
            waterSaved: user.impactStats.waterSaved + impact.waterSaved,
            volumeSaved: (user.impactStats.volumeSaved || 0) + impact.volumeSaved,
            treesEquivalent: user.impactStats.treesEquivalent + impact.treesEquivalent,
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
      deleteSubmission: (id) => {
        set(state => {
            const user = state.user;
            if (!user) return {};

            const submissionToDelete = state.submissions.find(s => s.id === id);
            if (!submissionToDelete) return {};

            // Subtract points and impact stats
            const pointsToDeduct = submissionToDelete.points;
            const newPoints = user.points - pointsToDeduct;
            const newLevel = getLevel(newPoints).level;
            
            const newImpactStats: EnvironmentalImpact = {
                co2Saved: user.impactStats.co2Saved - submissionToDelete.impact.co2Saved,
                waterSaved: user.impactStats.waterSaved - submissionToDelete.impact.waterSaved,
                volumeSaved: (user.impactStats.volumeSaved || 0) - (submissionToDelete.impact.volumeSaved || 0),
                treesEquivalent: user.impactStats.treesEquivalent - submissionToDelete.impact.treesEquivalent,
            };

            const updatedUser: User = {
                ...user,
                points: newPoints,
                level: newLevel,
                totalItems: user.totalItems - 1,
                impactStats: newImpactStats,
            };
            
            const newSubmissions = state.submissions.filter(s => s.id !== id);

            return {
                user: updatedUser,
                submissions: newSubmissions,
                leaderboard: state.leaderboard.map(u => u.id === updatedUser.id ? updatedUser : u)
            }
        })
      },
      claimItem: (id: string) => {
        set(state => {
            const user = state.user;
            if (!user) return {};

            const submissionToClaim = state.submissions.find(s => s.id === id);
            if (!submissionToClaim) return {};
            
            // Award 10 points (Green Coins) to the user claiming the item
            const newPoints = user.points + 10;
            const newLevel = getLevel(newPoints).level;
            const updatedUser: User = {
                ...user,
                points: newPoints,
                level: newLevel,
            };
            
            // Remove the claimed item from the submissions list
            const newSubmissions = state.submissions.filter(s => s.id !== id);
            
            return {
                user: updatedUser,
                submissions: newSubmissions,
                leaderboard: state.leaderboard.map(u => u.id === updatedUser.id ? updatedUser : u)
            };
        });
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
      logout: () => {
        set({ user: null, submissions: [], leaderboard: [] });
      },
    }),
    {
      name: 'ecoverse-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
