'use server';

import { classifyWasteItem, type ClassifyWasteItemInput, type ClassifyWasteItemOutput } from '@/ai/flows/ai-item-classification';
import { getPersonalizedRecyclingTips, type PersonalizedRecyclingTipsInput, type PersonalizedRecyclingTipsOutput } from '@/ai/flows/personalized-recycling-tips';
import { getEnvironmentalImpact, type EnvironmentalImpactInput, type EnvironmentalImpactOutput } from '@/ai/flows/environmental-impact';

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
