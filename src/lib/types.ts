
import { z } from 'genkit';

export interface EnvironmentalImpact {
  co2Saved: number; // in kg
  waterSaved: number; // in liters
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
    username?: string;
    password?: string;
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
  claimedByUserId?: string;
  deliveryAddress?: string;
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

// AI Flow Schemas and Types

// AI Item Classification
export const ClassifyWasteItemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a waste item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifyWasteItemInput = z.infer<typeof ClassifyWasteItemInputSchema>;

export const ClassifyWasteItemOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the image contains a valid, recyclable item. Should be false for things that are not items, like a photo of a hand.'),
  itemType: z.string().describe('The classified type of the waste item (e.g., plastic bottle, paper, e-waste). Set to "invalid" if not a valid item.'),
  recyclingSuggestion: z.string().describe('A suggestion on how to properly recycle the item.'),
  confidence: z.number().describe('The confidence level of the classification (0-1).'),
  funnyAIRoast: z.string().optional().describe('A funny comment about the waste item.'),
});
export type ClassifyWasteItemOutput = z.infer<typeof ClassifyWasteItemOutputSchema>;

// Environmental Impact
export const EnvironmentalImpactInputSchema = z.object({
  itemType: z.string().describe('The type of item being recycled (e.g., plastic bottle, aluminum can).'),
});
export type EnvironmentalImpactInput = z.infer<typeof EnvironmentalImpactInputSchema>;

export const EnvironmentalImpactOutputSchema = z.object({
  co2Saved: z.number().describe('Estimated kilograms of CO2 saved.'),
  waterSaved: z.number().describe('Estimated liters of water saved.'),
  treesEquivalent: z.number().describe('Equivalent number of trees saved for one year.'),
});
export type EnvironmentalImpactOutput = z.infer<typeof EnvironmentalImpactOutputSchema>;

// Forgot Password
export const SendPasswordResetCodeInputSchema = z.object({
  email: z.string().email().describe('The user\'s email address.'),
});
export type SendPasswordResetCodeInput = z.infer<typeof SendPasswordResetCodeInputSchema>;

export const SendPasswordResetCodeOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendPasswordResetCodeOutput = z.infer<typeof SendPasswordResetCodeOutputSchema>;

export const VerifyPasswordResetCodeInputSchema = z.object({
  email: z.string().email(),
  code: z.string(), // Can be the oobCode from Firebase
});
export type VerifyPasswordResetCodeInput = z.infer<typeof VerifyPasswordResetCodeInputSchema>;

export const VerifyPasswordResetCodeOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type VerifyPasswordResetCodeOutput = z.infer<typeof VerifyPasswordResetCodeOutputSchema>;

// Personalized Recycling Tips
export const PersonalizedRecyclingTipsInputSchema = z.object({
  location: z.string().describe('The user’s current location.'),
  recyclingHistory: z
    .string()
    .describe('A summary of the user’s past recycling activities.'),
});
export type PersonalizedRecyclingTipsInput = z.infer<
  typeof PersonalizedRecyclingTipsInputSchema
>;

export const PersonalizedRecyclingTipsOutputSchema = z.object({
  tips: z
    .string()
    .describe(
      'A list of personalized recycling tips based on the user’s location and recycling history.'
    ),
});
export type PersonalizedRecyclingTipsOutput = z.infer<
  typeof PersonalizedRecyclingTipsOutputSchema
>;
