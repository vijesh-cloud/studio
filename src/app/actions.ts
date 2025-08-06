'use server';

import { classifyWasteItem, type ClassifyWasteItemInput, type ClassifyWasteItemOutput } from '@/ai/flows/ai-item-classification';
import { getPersonalizedRecyclingTips, type PersonalizedRecyclingTipsInput, type PersonalizedRecyclingTipsOutput } from '@/ai/flows/personalized-recycling-tips';

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
