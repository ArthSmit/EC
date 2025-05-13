// use server'
'use server';

/**
 * @fileOverview Generates enemy stats based on type, number, and difficulty.
 *
 * - generateEnemyStats - A function that handles the enemy stat generation process.
 * - GenerateEnemyStatsInput - The input type for the generateEnemyStats function.
 * - GenerateEnemyStatsOutput - The return type for the generateEnemyStats function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEnemyStatsInputSchema = z.object({
  enemyType: z.string().describe('The type of enemy (e.g., Goblin, Orc, Dragon).'),
  numberOfCreatures: z
    .number()
    .min(1)
    .max(20)
    .describe('The number of creatures in the encounter (1-20).'),
  difficulty: z
    .enum(['easy', 'medium', 'hard', 'random'])
    .describe('The difficulty level of the encounter.'),
});
export type GenerateEnemyStatsInput = z.infer<typeof GenerateEnemyStatsInputSchema>;

const GenerateEnemyStatsOutputSchema = z.object({
  armorClass: z.number().describe('The Armor Class (AC) of the enemy.'),
  hitPoints: z.number().describe('The Hit Points (HP) of the enemy.'),
  speed: z.number().describe('The Speed of the enemy (in feet).'),
});
export type GenerateEnemyStatsOutput = z.infer<typeof GenerateEnemyStatsOutputSchema>;

export async function generateEnemyStats(input: GenerateEnemyStatsInput): Promise<GenerateEnemyStatsOutput> {
  return generateEnemyStatsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEnemyStatsPrompt',
  input: {schema: GenerateEnemyStatsInputSchema},
  output: {schema: GenerateEnemyStatsOutputSchema},
  prompt: `You are a D&D game master assisting in encounter creation.

  Based on the enemy type, number of creatures, and difficulty, generate appropriate stats for the enemy.

  Enemy Type: {{{enemyType}}}
  Number of Creatures: {{{numberOfCreatures}}}
  Difficulty: {{{difficulty}}}

  Consider the difficulty when assigning stats.
  - Easy: Lower stats.
  - Medium: Moderate stats.
  - Hard: Higher stats.
  - Random: Stats should be determined randomly within reasonable bounds.

  Ensure the output is a valid JSON object.
  `,
});

const generateEnemyStatsFlow = ai.defineFlow(
  {
    name: 'generateEnemyStatsFlow',
    inputSchema: GenerateEnemyStatsInputSchema,
    outputSchema: GenerateEnemyStatsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
