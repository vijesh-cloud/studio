
'use server';

import { classifyWasteItem } from '@/ai/flows/ai-item-classification';
import { getPersonalizedRecyclingTips } from '@/ai/flows/personalized-recycling-tips';
import { getEnvironmentalImpact } from '@/ai/flows/environmental-impact';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

import type { 
    ClassifyWasteItemInput, ClassifyWasteItemOutput,
    PersonalizedRecyclingTipsInput, PersonalizedRecyclingTipsOutput,
    EnvironmentalImpactInput, EnvironmentalImpactOutput,
} from '@/lib/types';


export async function classifyItemAction(
  input: ClassifyWasteItemInput
): Promise<ClassifyWasteItemOutput> {
  try {
    const result = await classifyWasteItem(input);
    return result;
  } catch (error) {
    console.error("Error in classifyItemAction:", error);
    // Return a structured error to the client
    return {
      isValid: false,
      itemType: 'unknown',
      recyclingSuggestion: 'Could not classify item. Please try again.',
      confidence: 0,
      funnyAIRoast: 'The AI is taking a nap. Maybe it got tired of your trash talk?',
    };
  }
}

export async function getTipsAction(
  input: PersonalizedRecyclingTipsInput
): Promise<PersonalizedRecyclingTipsOutput> {
  try {
    const result = await getPersonalizedRecyclingTips(input);
    return result;
  } catch (error) {
    console.error("Error in getTipsAction:", error);
    return {
      tips: 'Could not fetch tips at the moment. Remember to separate plastics and paper!',
    };
  }
}

export async function getImpactAction(
  input: EnvironmentalImpactInput
): Promise<EnvironmentalImpactOutput> {
    try {
        const result = await getEnvironmentalImpact(input);
        return result;
    } catch (error) {
        console.error("Error in getImpactAction:", error);
        return {
            co2Saved: 0,
            waterSaved: 0,
            treesEquivalent: 0
        };
    }
}


export async function sendPasswordResetAction(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    // The actionCodeSettings object is not strictly needed for this to work
    // but it's good practice. The URL would be configured in the Firebase Console.
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent successfully. Please check your inbox.' };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    return { success: false, message: error.message || 'Failed to send password reset email.' };
  }
}

export async function resetPasswordAction(
    oobCode: string,
    newPassword: string
): Promise<{ success: boolean; message: string; }> {
     if (!oobCode || !newPassword) {
        return { success: false, message: 'Invalid request. Code and new password are required.' };
    }
    try {
        // Verify the code is valid first. This will throw an error if invalid.
        await verifyPasswordResetCode(auth, oobCode);
        
        // If the code is valid, proceed to reset the password.
        await confirmPasswordReset(auth, oobCode, newPassword);
        
        return { success: true, message: 'Your password has been successfully reset. Please log in.' };
    } catch (error: any) {
        console.error('Error resetting password:', error);
        if (error.code === 'auth/invalid-action-code') {
            return { success: false, message: 'The password reset link is invalid or has expired. Please request a new one.' };
        }
        return { success: false, message: error.message || 'Failed to reset password.' };
    }
}
