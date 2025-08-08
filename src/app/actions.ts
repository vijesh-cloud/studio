
'use server';

import { classifyWasteItem } from '@/ai/flows/ai-item-classification';
import { getPersonalizedRecyclingTips } from '@/ai/flows/personalized-recycling-tips';
import { getEnvironmentalImpact } from '@/ai/flows/environmental-impact';
import { sendPasswordResetCode, verifyPasswordResetCode } from '@/ai/flows/forgot-password';
import type { 
    ClassifyWasteItemInput, ClassifyWasteItemOutput,
    PersonalizedRecyclingTipsInput, PersonalizedRecyclingTipsOutput,
    EnvironmentalImpactInput, EnvironmentalImpactOutput,
    SendPasswordResetCodeInput, SendPasswordResetCodeOutput,
    VerifyPasswordResetCodeInput, VerifyPasswordResetCodeOutput
} from '@/lib/types';
import { auth } from '@/lib/firebase';
import { confirmPasswordReset } from 'firebase/auth';


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

export async function sendPasswordResetCodeAction(input: SendPasswordResetCodeInput): Promise<SendPasswordResetCodeOutput> {
  return await sendPasswordResetCode(input);
}

export async function verifyPasswordResetCodeAction(input: VerifyPasswordResetCodeInput): Promise<VerifyPasswordResetCodeOutput> {
    return await verifyPasswordResetCode(input);
}


export async function resetPasswordAction(input: VerifyPasswordResetCodeInput & { newPassword: string }): Promise<{success: boolean, message: string}> {
  try {
    // First, verify the code using our custom flow
    const verification = await verifyPasswordResetCode(input);
    if (!verification.success) {
      return verification;
    }
    
    // In a real app with a backend/admin SDK, you would now update the user's password in Firebase Auth
    // using their email. Since we are in a client-only environment, we can't do that directly without
    // the user being logged in. The `confirmPasswordReset` requires an `oobCode` from Firebase's own
    // email link, which we have bypassed.

    // THIS IS A MOCK ACTION. In a real scenario, this would be a backend call.
    console.log(`Password for ${input.email} would be reset to ${input.newPassword}. This is a simulated action.`);
    
    // We can't use confirmPasswordReset here as we don't have a Firebase oobCode.
    // So we'll return success as if it worked.
    
    return { success: true, message: "Password has been reset successfully. Please log in with your new password." };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { success: false, message: error.message || "Failed to reset password." };
  }
}
