
'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically populating abilities and special actions for a given enemy based on its type and difficulty.
 * It also generates a localized name for the enemy.
 *
 * - assignAbilitiesAndActions - A function that handles the assignment of abilities and actions.
 * - AssignAbilitiesAndActionsInput - The input type for the assignAbilitiesAndActions function.
 * - AssignAbilitiesAndActionsOutput - The return type for the assignAbilitiesAndActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssignAbilitiesAndActionsInputSchema = z.object({
  enemyType: z.string().describe('The type of the enemy (e.g., goblin, dragon, or ogre). This could be in any language provided by the user.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard', 'random'])
    .describe('The difficulty level of the enemy.'),
  targetLanguage: z.string().min(2).max(5).describe('The target language for the generated content (e.g., "en", "ru"). Default is "en".').optional().default('en'),
});
export type AssignAbilitiesAndActionsInput = z.infer<typeof AssignAbilitiesAndActionsInputSchema>;

const AssignAbilitiesAndActionsOutputSchema = z.object({
  localizedName: z.string().describe('The name of the enemy, localized to the targetLanguage. This should be the base name (e.g., "Goblin", "Гоблин").'),
  abilities: z.array(z.string()).describe('A list of abilities for the enemy, in the targetLanguage.'),
  specialActions: z.array(z.string()).describe('A list of special actions for the enemy, in the targetLanguage.'),
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
  prompt: `You are a Dungeon Master with expertise in D&D 5e.
Based on the provided enemy type, difficulty, and target language, you will generate:
1. A localized name for the enemy. This should be the common name for this type of creature in the specified language. For example, if enemyType is "Goblin" and targetLanguage is "ru", the localizedName should be "Гоблин". If enemyType is "Red Dragon Wyrmling" and targetLanguage is "en", localizedName should be "Red Dragon Wyrmling".
2. A list of relevant abilities for the enemy.
3. A list of special actions for the enemy.

All generated text for the localized name, abilities, and special actions MUST be in the language specified by targetLanguage: {{{targetLanguage}}}.

Enemy Type (user input, interpret as best as possible): {{{enemyType}}}
Difficulty: {{{difficulty}}}
Target Language: {{{targetLanguage}}}

Output format should follow the schema.
Localized Name:
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
