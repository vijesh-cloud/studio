'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-powered waste item classification.
 *
 * It allows users to upload a picture of a waste item and have the AI classify it, providing recycling suggestions.
 *
 * @exports classifyWasteItem - The main function to classify waste items.
 * @exports ClassifyWasteItemInput - The input type for the classifyWasteItem function.
 * @exports ClassifyWasteItemOutput - The output type for the classifyWasteItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const ClassifyWasteItemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a waste item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifyWasteItemInput = z.infer<typeof ClassifyWasteItemInputSchema>;

const ClassifyWasteItemOutputSchema = z.object({
  itemType: z.string().describe('The classified type of the waste item (e.g., plastic bottle, paper, e-waste).'),
  recyclingSuggestion: z.string().describe('A suggestion on how to properly recycle the item.'),
  confidence: z.number().describe('The confidence level of the classification (0-1).'),
  funnyAIRoast: z.string().optional().describe('A funny comment about the waste item.'),
});
export type ClassifyWasteItemOutput = z.infer<typeof ClassifyWasteItemOutputSchema>;


export async function classifyWasteItem(input: ClassifyWasteItemInput): Promise<ClassifyWasteItemOutput> {
  return classifyWasteItemFlow(input);
}

const classifyWasteItemPrompt = ai.definePrompt({
  name: 'classifyWasteItemPrompt',
  input: {schema: ClassifyWasteItemInputSchema},
  output: {schema: ClassifyWasteItemOutputSchema},
  prompt: `You are an AI waste classification expert. You will classify the waste item in the photo and provide a recycling suggestion.

  Analyze the following waste item and follow below intructions:
  1. Classify the item into one of the following categories: plastic bottle, paper, e-waste, metal can, glass, other.
  2. Provide a recycling suggestion based on the item type.
  3. provide confidence score based on detection of item
  4. (Optional) Include a funny AI roast about the waste item to encourage recycling.

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
