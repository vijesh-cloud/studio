
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Submission, Location, EnvironmentalImpact, DeliveryPartner } from '@/lib/types';
import { LEVELS, BADGES, DELIVERY_PARTNERS } from '@/lib/constants';
import { differenceInCalendarDays, isToday } from 'date-fns';
import { getImpactAction } from '@/app/actions';

interface StoredUser extends User {
    email: string;
}
interface EcoVerseState {
  user: User | null;
  registeredUsers: StoredUser[];
  submissions: Submission[];
  leaderboard: User[];
  setUser: (name: string, email: string) => void;
  loginUser: (email: string) => boolean;
  registerUser: (name: string, email: string) => void;
  updateUser: (updatedData: Partial<User>) => void;
  addSubmission: (submissionData: Omit<Submission, 'id' | 'userId' | 'timestamp' | 'organizerId' | 'status' | 'impact'>, location: Location) => void;
  updateSubmissionStatus: (id: string, status: Submission['status']) => void;
  deleteSubmission: (id: string) => void;
  claimItem: (id: string) => void;
  confirmOrder: (itemId: string) => string | null;
  updateDeliveryStatus: (orderId: string, status: 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled') => void;
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
      registeredUsers: [],
      setUser: (name, email) => {
         const existingUser = get().registeredUsers.find(u => u.email === email);
         if (existingUser) {
            set({ user: existingUser });
            return;
         }
        const newUser: StoredUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          avatar: `https://placehold.co/100x100.png`,
          points: 0,
          level: 1,
          streak: 0,
          lastRecycled: null,
          badges: [],
          totalItems: 0,
          impactStats: { co2Saved: 0, waterSaved: 0, treesEquivalent: 0 },
        };
        set(state => ({ 
            user: newUser, 
            leaderboard: [...generateFakeUsers(49), newUser],
            registeredUsers: [...state.registeredUsers, newUser]
        }));
      },
      loginUser: (email: string): boolean => {
        const userToLogin = get().registeredUsers.find(u => u.email === email);
        if (userToLogin) {
            set({ user: userToLogin });
            return true;
        }
        return false;
      },
      registerUser: (name, email) => {
        const newUser: StoredUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          avatar: `https://placehold.co/100x100.png`,
          points: 0,
          level: 1,
          streak: 0,
          lastRecycled: null,
          badges: [],
          totalItems: 0,
          impactStats: { co2Saved: 0, waterSaved: 0, treesEquivalent: 0 },
        };
         set(state => ({ 
            user: newUser, 
            leaderboard: [...generateFakeUsers(49), newUser],
            registeredUsers: [...state.registeredUsers, newUser]
        }));
      },
      updateUser: (updatedData) => {
        set(state => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...updatedData };
          return {
            user: updatedUser,
            leaderboard: state.leaderboard.map(u => u.id === updatedUser.id ? updatedUser : u),
            registeredUsers: state.registeredUsers.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u)
          };
        });
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
          points: 10 // Potential points
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
        
        const newSubmissions = [newSubmission, ...get().submissions];

        const newBadges = BADGES.filter(b => b.condition({ ...user, streak: newStreak }, newSubmissions)).map(b => b.id);
        
        const updatedUser: User = {
          ...user,
          streak: newStreak,
          lastRecycled: now.toISOString(),
          totalItems: user.totalItems + 1,
          impactStats: {
            co2Saved: user.impactStats.co2Saved + impact.co2Saved,
            waterSaved: user.impactStats.waterSaved + impact.waterSaved,
            treesEquivalent: user.impactStats.treesEquivalent + impact.treesEquivalent,
          },
          badges: [...new Set([...user.badges, ...newBadges])],
        };
        
        set((state) => ({
          user: updatedUser,
          submissions: newSubmissions,
          leaderboard: state.leaderboard.map(u => u.id === updatedUser.id ? updatedUser : u),
          registeredUsers: state.registeredUsers.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u)
        }));
      },
      updateSubmissionStatus: (id, status) => {
        set(state => ({
            submissions: state.submissions.map(s => s.id === id ? {...s, status} : s)
        }));
      },
      deleteSubmission: (id: string) => {
        set(state => {
            const user = state.user;
            if (!user) {
                return state;
            }

            const submissionToDelete = state.submissions.find(s => s.id === id);
            if (!submissionToDelete) {
                return state;
            }
            
            // Revert points only if the item was not sold
            const pointsToRevert = submissionToDelete.status !== 'Sold' ? submissionToDelete.points : 0;
            const newPoints = Math.max(0, user.points - pointsToRevert);
            const newLevelData = getLevel(newPoints);

            // Revert environmental impact
            const impactToRevert = submissionToDelete.impact;
            const newImpactStats: EnvironmentalImpact = {
                co2Saved: Math.max(0, user.impactStats.co2Saved - (impactToRevert.co2Saved || 0)),
                waterSaved: Math.max(0, user.impactStats.waterSaved - (impactToRevert.waterSaved || 0)),
                treesEquivalent: Math.max(0, user.impactStats.treesEquivalent - (impactToRevert.treesEquivalent || 0)),
            };

            const updatedUser: User = {
                ...user,
                points: newPoints,
                level: newLevelData.level,
                totalItems: Math.max(0, user.totalItems - 1),
                impactStats: newImpactStats,
            };

            const newSubmissions = state.submissions.filter(s => s.id !== id);
            const newLeaderboard = state.leaderboard.map(u => u.id === updatedUser.id ? updatedUser : u);
            const newRegisteredUsers = state.registeredUsers.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);

            return {
                user: updatedUser,
                submissions: newSubmissions,
                leaderboard: newLeaderboard,
                registeredUsers: newRegisteredUsers,
            };
        });
      },
      claimItem: (id: string) => {
        set(state => {
            const buyer = state.user; // The user who is claiming the item
            if (!buyer) return {};

            const submissionToClaim = state.submissions.find(s => s.id === id);
            if (!submissionToClaim || submissionToClaim.status === 'Sold') return {};
            
            const sellerId = submissionToClaim.userId;
            const pointsAward = 10;
            let allUsers = [...state.leaderboard];
            let allRegisteredUsers = [...state.registeredUsers];

            // Update buyer
            const updatedBuyerPoints = buyer.points + pointsAward;
            const updatedBuyerLevel = getLevel(updatedBuyerPoints).level;
            const updatedBuyer = { ...buyer, points: updatedBuyerPoints, level: updatedBuyerLevel };
            
            allUsers = allUsers.map(u => u.id === updatedBuyer.id ? updatedBuyer : u);
            allRegisteredUsers = allRegisteredUsers.map(u => u.id === updatedBuyer.id ? { ...u, ...updatedBuyer } : u);

            // Update seller
            const seller = allUsers.find(u => u.id === sellerId);
            if (seller) {
                const updatedSellerPoints = seller.points + pointsAward;
                const updatedSellerLevel = getLevel(updatedSellerPoints).level;
                const updatedSeller = { ...seller, points: updatedSellerPoints, level: updatedSellerLevel };
                
                allUsers = allUsers.map(u => u.id === sellerId ? updatedSeller : u);
                allRegisteredUsers = allRegisteredUsers.map(u => u.id === sellerId ? { ...u, ...updatedSeller } : u);
            }
            
            const newSubmissions = state.submissions.map(s => {
                if (s.id === id) {
                    return { ...s, status: 'Sold' as const, points: pointsAward }; // Update points to awarded value
                }
                return s;
            });
            
            return {
                user: updatedBuyer,
                submissions: newSubmissions,
                leaderboard: allUsers,
                registeredUsers: allRegisteredUsers
            };
        });
      },
      confirmOrder: (itemId) => {
        let orderId: string | null = null;
        set(state => {
            const submission = state.submissions.find(s => s.id === itemId);
            if (!submission) return state;

            const partner = DELIVERY_PARTNERS[Math.floor(Math.random() * DELIVERY_PARTNERS.length)];
            const newOrderId = `ORD-${Date.now()}`;
            const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
            orderId = newOrderId;

            const newSubmissions = state.submissions.map(s => s.id === itemId ? {
                ...s,
                orderId: newOrderId,
                deliveryStatus: 'Confirmed' as const,
                deliveryPartner: partner,
                otp: newOtp
            } : s);

            return { submissions: newSubmissions };
        });
        return orderId;
      },
      updateDeliveryStatus: (orderId, status) => {
        set(state => {
            const newSubmissions = state.submissions.map(s => {
                if (s.orderId === orderId) {
                    const newState = { ...s, deliveryStatus: status };
                    // If delivered, mark as sold and award points
                    if (status === 'Delivered' && s.status !== 'Sold') {
                        get().claimItem(s.id);
                        return { ...newState, status: 'Sold' as const };
                    }
                    return newState;
                }
                return s;
            });
            return { submissions: newSubmissions };
        });
      },
      updateLeaderboardPoints: () => {
        set(state => {
          const { user, leaderboard } = state;
          if (!user) return {};
          
          const newLeaderboard = leaderboard.map(u => {
            if (u.id === user.id) {
              return u; 
            }
            const newPoints = u.points + Math.floor(Math.random() * 5);
            const newLevel = getLevel(newPoints).level;
            return { ...u, points: newPoints, level: newLevel };
          });
          
          return { leaderboard: newLeaderboard };
        });
      },
      getBadges: () => BADGES,
      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: 'ecoverse-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
