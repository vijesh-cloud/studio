import {
  FirstTimerBadge,
  StreakMasterBadge,
  PaperSaverBadge,
  TechRecyclerBadge,
  SocialSharerBadge,
  CommunityLeaderBadge,
} from '@/components/icons';
import type { Level, Badge, DeliveryPartner } from '@/lib/types';

export const POINTS_MAP: { [key: string]: number } = {
  'plastic bottle': 10,
  'e-waste': 25,
  'paper': 5,
  'metal can': 15,
  'glass': 12,
  'other': 1,
};

export const LEVELS: Level[] = [
  { level: 1, name: 'Eco Rookie', minPoints: 0 },
  { level: 2, name: 'Green Starter', minPoints: 101 },
  { level: 3, name: 'Waste Warrior', minPoints: 251 },
  { level: 4, name: 'Planet Protector', minPoints: 501 },
  { level: 5, name: 'Eco Champion', minPoints: 1001 },
];

export const BADGES: Badge[] = [
  {
    id: 'first_timer',
    name: 'First Timer',
    description: 'Recycle your first item.',
    icon: FirstTimerBadge,
    condition: (user, submissions) => submissions.length > 0,
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 7-day recycling streak.',
    icon: StreakMasterBadge,
    condition: (user) => user.streak >= 7,
  },
  {
    id: 'paper_saver',
    name: 'Paper Saver',
    description: 'Recycle 10 paper items.',
    icon: PaperSaverBadge,
    condition: (user, submissions) => submissions.filter(s => s.itemType === 'paper').length >= 10,
  },
  {
    id: 'tech_recycler',
    name: 'Tech Recycler',
    description: 'Recycle 5 e-waste items.',
    icon: TechRecyclerBadge,
    condition: (user, submissions) => submissions.filter(s => s.itemType === 'e-waste').length >= 5,
  },
  {
    id: 'social_sharer',
    name: 'Social Sharer',
    description: 'Share your achievements 3 times.',
    icon: SocialSharerBadge,
    condition: () => false, // This would require tracking shares
  },
  {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Reach the top 10 in your neighborhood.',
    icon: CommunityLeaderBadge,
    condition: () => false, // This would require a real backend
  },
];

export const DELIVERY_PARTNERS: DeliveryPartner[] = [
    { id: 'dp-1', name: 'Ravi Kumar', photo: 'https://placehold.co/100x100.png', contact: '****-**-1234', vehicle: 'Bike - DL01 ABC', rating: 4.8 },
    { id: 'dp-2', name: 'Sunita Sharma', photo: 'https://placehold.co/100x100.png', contact: '****-**-5678', vehicle: 'Scooter - MH02 XYZ', rating: 4.9 },
    { id: 'dp-3', name: 'Amit Patel', photo: 'https://placehold.co/100x100.png', contact: '****-**-9012', vehicle: 'E-Rickshaw - KA03 LMN', rating: 4.7 },
];
