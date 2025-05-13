
'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically populating abilities and special actions for a given enemy based on its type and difficulty.
 * It also generates a localized name for the enemy. All text output is in the specified target language. Abilities and actions should be descriptive.
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
  localizedName: z.string().describe('The name of the enemy, localized to the targetLanguage. This should be the common, translatable base name (e.g., "Goblin", "Гоблин", "Orc", "Орк").'),
  abilities: z.array(z.string()).describe('A list of descriptive abilities for the enemy, in the targetLanguage. Each string should clearly explain the ability.'),
  specialActions: z.array(z.string()).describe('A list of descriptive special actions for the enemy, in the targetLanguage. Each string should clearly explain the special action.'),
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
Based on the provided enemy type, difficulty, and target language, you will generate the following for a single enemy:

1.  **Localized Name (localizedName)**:
    *   The common name for this type of creature, accurately translated into the specified \`targetLanguage\`.
    *   For example, if \`enemyType\` is "Goblin" and \`targetLanguage\` is "ru", \`localizedName\` should be "Гоблин".
    *   If \`enemyType\` is "Red Dragon Wyrmling" and \`targetLanguage\` is "en", \`localizedName\` should be "Red Dragon Wyrmling".

2.  **Abilities (abilities)**:
    *   A list of relevant abilities for the enemy.
    *   Each ability in the list MUST be a descriptive string in the \`targetLanguage\`, explaining what the ability does.
    *   Example (for English): "Pack Tactics: The goblin has advantage on an attack roll against a creature if at least one of the goblin's allies is within 5 feet of the creature and the ally isn't incapacitated." (This entire string should be translated to \`targetLanguage\`).
    *   Provide 2-4 distinct abilities appropriate for the enemy type and difficulty.

3.  **Special Actions (specialActions)**:
    *   A list of special actions the enemy can take.
    *   Each special action in the list MUST be a descriptive string in the \`targetLanguage\`, explaining the action.
    *   Example (for English): "Scimitar. Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage." (This entire string should be translated to \`targetLanguage\`).
    *   Include details like attack bonuses, reach, targets, damage, and any special effects.
    *   Provide 1-3 distinct special actions.

**Input Parameters**:
*   Enemy Type (user input, interpret as best as possible even if not a standard D&D creature name): {{{enemyType}}}
*   Difficulty: {{{difficulty}}}
*   Target Language: {{{targetLanguage}}}

**Crucial Instructions**:
*   ALL generated text for \`localizedName\`, all strings in \`abilities\`, and all strings in \`specialActions\` MUST be in the language specified by \`targetLanguage\`.
*   If you are generating for multiple creatures of the same type and difficulty in sequence (implied if this prompt is called multiple times for an encounter), try to provide slight variations in the abilities and special actions for each creature to make them distinct, while staying true to the enemy type and difficulty. Pick different (but appropriate) abilities/actions or phrase them slightly differently. Avoid exact repetition.
*   Ensure the output is a valid JSON object strictly adhering to the output schema.
`,
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

