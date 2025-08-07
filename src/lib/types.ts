

export interface EnvironmentalImpact {
  co2Saved: number; // in kg
  waterSaved: number; // in liters
  volumeSaved: number; // in cubic meters
  treesEquivalent: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  streak: number;
  lastRecycled: string | null;
  badges: string[];
  totalItems: number;
  impactStats: EnvironmentalImpact;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  mapsURL: string;
}

export type DeliveryStatus = 'Confirmed' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type SubmissionStatus = 'Submitted' | 'Picked Up' | 'Recycled' | 'Failed' | 'Sold';

export interface DeliveryPartner {
    id: string;
    name: string;
    photo: string;
    contact: string;
    vehicle: string;
    rating: number;
}

export interface Submission {
  id: string;
  userId: string;
  photo: string; // base64 data URI
  itemType: string;
  location: Location;
  timestamp: string;
  status: SubmissionStatus;
  points: number;
  organizerId: string;
  funnyAIRoast?: string;
  recyclingSuggestion?: string;
  impact: EnvironmentalImpact;
  deliveryStatus?: DeliveryStatus;
  deliveryPartner?: DeliveryPartner;
  orderId?: string;
  otp?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  condition: (user: User, submissions: Submission[]) => boolean;
}

export interface Level {
  level: number;
  name: string;
  minPoints: number;
}
