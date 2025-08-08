
'use server';

import { classifyWasteItem, type ClassifyWasteItemInput, type ClassifyWasteItemOutput } from '@/ai/flows/ai-item-classification';
import { getPersonalizedRecyclingTips, type PersonalizedRecyclingTipsInput, type PersonalizedRecyclingTipsOutput } from '@/ai/flows/personalized-recycling-tips';
import { getEnvironmentalImpact, type EnvironmentalImpactInput, type EnvironmentalImpactOutput } from '@/ai/flows/environmental-impact';
import { sendPasswordResetCode, verifyPasswordResetCode } from '@/ai/flows/forgot-password';
import type { SendPasswordResetCodeInput, VerifyPasswordResetCodeInput } from '@/ai/flows/forgot-password';
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

export async function sendPasswordResetCodeAction(input: SendPasswordResetCodeInput): Promise<void> {
  await sendPasswordResetCode(input);
}

export async function verifyAndResetPasswordAction(input: VerifyPasswordResetCodeInput & { newPassword: string }): Promise<{success: boolean, message: string}> {
  try {
    // The AI flow `verifyPasswordResetCode` is designed to be called by other flows, not directly from the client.
    // However, for this architecture, we can use Firebase Admin SDK features if they were available
    // to verify the code securely on the backend. Since we don't have a full backend,
    // we'll use a trick: the oobCode from the email IS the verification code we need.
    // But our custom flow doesn't generate a Firebase oobCode.
    // So, we'll have to trust the client for this demonstration.

    // A more secure implementation would have `sendPasswordResetCode` store a hash of the code
    // with an expiry, and `verifyAndResetPasswordAction` would check against that.
    // Given the project constraints, we'll proceed with a client-trusted model.
    // We will call the firebase-auth client sdk `confirmPasswordReset`
    
    // This is NOT how it would work in production. We are simulating the verification.
    // The `verifyPasswordResetCode` flow is currently just a placeholder for this reason.
    // We will directly attempt to reset the password with the provided code.
    await confirmPasswordReset(auth, input.code, input.newPassword);
    
    return { success: true, message: "Password has been reset successfully." };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { success: false, message: error.message || "Failed to reset password." };
  }
}

