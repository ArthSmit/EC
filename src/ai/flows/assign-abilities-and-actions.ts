'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically populating abilities and special actions for a given enemy based on its type and difficulty.
 *
 * - assignAbilitiesAndActions - A function that handles the assignment of abilities and actions.
 * - AssignAbilitiesAndActionsInput - The input type for the assignAbilitiesAndActions function.
 * - AssignAbilitiesAndActionsOutput - The return type for the assignAbilitiesAndActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssignAbilitiesAndActionsInputSchema = z.object({
  enemyType: z.string().describe('The type of the enemy (e.g., goblin, dragon, or ogre).'),
  difficulty: z
    .enum(['easy', 'medium', 'hard', 'random'])
    .describe('The difficulty level of the enemy.'),
});
export type AssignAbilitiesAndActionsInput = z.infer<typeof AssignAbilitiesAndActionsInputSchema>;

const AssignAbilitiesAndActionsOutputSchema = z.object({
  abilities: z.array(z.string()).describe('A list of abilities for the enemy.'),
  specialActions: z.array(z.string()).describe('A list of special actions for the enemy.'),
});
export type AssignAbilitiesAndActionsOutput = z.infer<typeof AssignAbilitiesAndActionsOutputSchema>;

export async function assignAbilitiesAndActions(
  input: AssignAbilitiesAndActionsInput
): Promise<AssignAbilitiesAndActionsOutput> {
  return assignAbilitiesAndActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assignAbilitiesAndActionsPrompt',
  input: {schema: AssignAbilitiesAndActionsInputSchema},
  output: {schema: AssignAbilitiesAndActionsOutputSchema},
  prompt: `You are a Dungeon Master with expertise in D&D 5e. Based on the enemy type and difficulty, you will generate a list of relevant abilities and special actions for the enemy.

Enemy Type: {{{enemyType}}}
Difficulty: {{{difficulty}}}

Abilities:
Special Actions:`,
});

const assignAbilitiesAndActionsFlow = ai.defineFlow(
  {
    name: 'assignAbilitiesAndActionsFlow',
    inputSchema: AssignAbilitiesAndActionsInputSchema,
    outputSchema: AssignAbilitiesAndActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
