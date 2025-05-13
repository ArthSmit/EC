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
  enemyType: z.string().describe('The type of enemy (e.g., Goblin, Orc, Dragon). This can be in any language provided by the user.'),
  numberOfCreatures: z
    .number()
    .min(1)
    .max(20)
    .describe('The number of creatures in the encounter (1-20). This is informational for context; the flow generates stats for one creature at a time.'),
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

  Based on the enemy type and difficulty, generate appropriate core stats (Armor Class, Hit Points, Speed) for a single enemy.
  The 'numberOfCreatures' parameter is for context if you are being called multiple times for the same encounter, use it to introduce slight variations.

  Enemy Type: {{{enemyType}}}
  Difficulty: {{{difficulty}}}
  (Context: part of an encounter with {{{numberOfCreatures}}} creatures)

  Consider the difficulty when assigning stats:
  - Easy: Lower stats.
  - Medium: Moderate stats.
  - Hard: Higher stats.
  - Random: Stats should be determined randomly within reasonable bounds for the enemy type.

  IMPORTANT: If you are asked to generate stats for multiple creatures of the same type sequentially (implied if this prompt is called multiple times with the same enemyType and difficulty for an encounter with numberOfCreatures > 1), ensure there is slight variation in Armor Class, Hit Points, and Speed for each creature instance to make them feel distinct, while remaining appropriate for the specified difficulty and enemy type.

  Ensure the output is a valid JSON object strictly adhering to the output schema.
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

