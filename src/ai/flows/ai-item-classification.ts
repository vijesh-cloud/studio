'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-powered waste item classification.
 *
 * It allows users to upload a picture of a waste item and have the AI classify it, providing recycling suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  ClassifyWasteItemInputSchema,
  ClassifyWasteItemOutputSchema,
  type ClassifyWasteItemInput,
  type ClassifyWasteItemOutput
} from '@/lib/types';


export async function classifyWasteItem(input: ClassifyWasteItemInput): Promise<ClassifyWasteItemOutput> {
  return classifyWasteItemFlow(input);
}

const classifyWasteItemPrompt = ai.definePrompt({
  name: 'classifyWasteItemPrompt',
  input: {schema: ClassifyWasteItemInputSchema},
  output: {schema: ClassifyWasteItemOutputSchema},
  prompt: `You are an AI waste classification expert. You will classify the waste item in the photo and provide a recycling suggestion.

  Analyze the following waste item and follow below intructions:
  1. Determine if the image contains a real, recyclable item. If it does not (e.g., it's a photo of a person's hand, a drawing, or an empty scene), set 'isValid' to false. Otherwise, set it to true.
  2. If the item is not valid, set 'itemType' to 'invalid' and provide a reason in the 'recyclingSuggestion'.
  3. If the item is valid, classify it into one of the following categories: plastic bottle, paper, e-waste, metal can, glass, other.
  4. Provide a recycling suggestion based on the item type.
  5. Provide a confidence score based on the detection of the item.
  6. (Optional) Include a funny AI roast about the waste item to encourage recycling.

  Photo: {{media url=photoDataUri}}

  Make sure that the output is valid JSON matching the schema.
  `,
});

const classifyWasteItemFlow = ai.defineFlow(
  {
    name: 'classifyWasteItemFlow',
    inputSchema: ClassifyWasteItemInputSchema,
    outputSchema: ClassifyWasteItemOutputSchema,
  },
  async input => {
    const {output} = await classifyWasteItemPrompt(input);
    return output!;
  }
);
