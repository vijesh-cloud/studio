// src/ai/flows/personalized-recycling-tips.ts
'use server';

/**
 * @fileOverview Provides personalized recycling tips to users based on their location and recycling history.
 *
 * - getPersonalizedRecyclingTips - A function that retrieves personalized recycling tips.
 * - PersonalizedRecyclingTipsInput - The input type for the getPersonalizedRecyclingTips function.
 * - PersonalizedRecyclingTipsOutput - The return type for the getPersonalizedRecyclingTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecyclingTipsInputSchema = z.object({
  location: z.string().describe('The user\u2019s current location.'),
  recyclingHistory: z
    .string()
    .describe('A summary of the user\u2019s past recycling activities.'),
});
export type PersonalizedRecyclingTipsInput = z.infer<
  typeof PersonalizedRecyclingTipsInputSchema
>;

const PersonalizedRecyclingTipsOutputSchema = z.object({
  tips: z
    .string()
    .describe(
      'A list of personalized recycling tips based on the user\u2019s location and recycling history.'
    ),
});
export type PersonalizedRecyclingTipsOutput = z.infer<
  typeof PersonalizedRecyclingTipsOutputSchema
>;

export async function getPersonalizedRecyclingTips(
  input: PersonalizedRecyclingTipsInput
): Promise<PersonalizedRecyclingTipsOutput> {
  return personalizedRecyclingTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecyclingTipsPrompt',
  input: {schema: PersonalizedRecyclingTipsInputSchema},
  output: {schema: PersonalizedRecyclingTipsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized recycling tips to users based on their location and recycling history.

  Location: {{{location}}}
  Recycling History: {{{recyclingHistory}}}

  Based on this information, provide a few tailored tips to help the user improve their recycling habits and reduce their environmental impact. Consider local recycling programs and common recycling mistakes.
  Tips:`,
});

const personalizedRecyclingTipsFlow = ai.defineFlow(
  {
    name: 'personalizedRecyclingTipsFlow',
    inputSchema: PersonalizedRecyclingTipsInputSchema,
    outputSchema: PersonalizedRecyclingTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
