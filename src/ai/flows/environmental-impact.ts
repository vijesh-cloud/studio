'use server';

/**
 * @fileOverview Calculates the environmental impact of recycling a specific item.
 *
 * - getEnvironmentalImpact - A function that returns the calculated impact.
 * - EnvironmentalImpactInput - The input type for the getEnvironmentalImpact function.
 * - EnvironmentalImpactOutput - The return type for the getEnvironmentalImpact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnvironmentalImpactInputSchema = z.object({
  itemType: z.string().describe('The type of item being recycled (e.g., plastic bottle, aluminum can).'),
});
export type EnvironmentalImpactInput = z.infer<typeof EnvironmentalImpactInputSchema>;

const EnvironmentalImpactOutputSchema = z.object({
  co2Saved: z.number().describe('Estimated kilograms of CO2 saved.'),
  waterSaved: z.number().describe('Estimated liters of water saved.'),
  volumeSaved: z.number().describe('Estimated cubic meters of landfill volume saved.'),
  treesEquivalent: z.number().describe('Equivalent number of trees saved for one year.'),
});
export type EnvironmentalImpactOutput = z.infer<typeof EnvironmentalImpactOutputSchema>;

export async function getEnvironmentalImpact(
  input: EnvironmentalImpactInput
): Promise<EnvironmentalImpactOutput> {
  return environmentalImpactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'environmentalImpactPrompt',
  input: {schema: EnvironmentalImpactInputSchema},
  output: {schema: EnvironmentalImpactOutputSchema},
  prompt: `You are an environmental science expert. Based on established recycling facts, provide a realistic estimate of the environmental impact saved by recycling one of the following items. Provide only the numerical data requested in the output schema.

  Item: {{{itemType}}}
  
  Provide realistic, non-zero estimates for a single item of the given type. For example, for a 'plastic bottle', the values should be small.
  `,
});

const environmentalImpactFlow = ai.defineFlow(
  {
    name: 'environmentalImpactFlow',
    inputSchema: EnvironmentalImpactInputSchema,
    outputSchema: EnvironmentalImpactOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
