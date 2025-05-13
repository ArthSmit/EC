
"use server";

import { generateEnemyStats, type GenerateEnemyStatsInput } from "@/ai/flows/generate-enemy-stats";
import { assignAbilitiesAndActions, type AssignAbilitiesAndActionsInput, type AssignAbilitiesAndActionsOutput } from "@/ai/flows/assign-abilities-and-actions";
import type { Enemy } from "@/lib/types";
import { z } from "zod";
import type { Language } from '@/lib/i18n/types';


const generateEncounterSchema = z.object({
  enemyType: z.string().min(1, "Enemy type is required."),
  numberOfCreatures: z.coerce.number().min(1).max(20),
  difficulty: z.enum(["easy", "medium", "hard", "random"]),
  language: z.string().min(2).max(5) as z.ZodType<Language>,
});

export async function handleGenerateEncounter(
  input: z.infer<typeof generateEncounterSchema>
): Promise<{enemies: Enemy[], encounterBaseName: string}> {
  const validatedInput = generateEncounterSchema.parse(input);
  const { enemyType, numberOfCreatures, difficulty, language } = validatedInput;

  const enemies: Enemy[] = [];
  let encounterBaseNameForDisplay = enemyType; // Fallback, will be updated

  for (let i = 0; i < numberOfCreatures; i++) {
    // Generate unique stats for each enemy
    // Pass the original numberOfCreatures for context to the AI, but it generates for one.
    const individualStats = await generateEnemyStats({
      enemyType,
      numberOfCreatures: numberOfCreatures, // Context for AI if it needs to vary based on total
      difficulty
    });

    // Generate unique abilities, actions, and localized name for each enemy
    const individualAbilitiesAndName = await assignAbilitiesAndActions({
      enemyType,
      difficulty,
      targetLanguage: language,
    });

    // Use the localized name from the first generated enemy as the base for the encounter title
    if (i === 0) {
      encounterBaseNameForDisplay = individualAbilitiesAndName.localizedName;
    }
    
    const currentEnemyLocalizedName = individualAbilitiesAndName.localizedName;
    const enemyDisplayName = numberOfCreatures > 1 
        ? `${currentEnemyLocalizedName} ${i + 1}` 
        : currentEnemyLocalizedName;

    enemies.push({
      id: `${currentEnemyLocalizedName}-${difficulty}-${Date.now()}-${Math.random().toString(36).substring(7)}-${i}`, // Enhanced unique ID
      name: enemyDisplayName,
      armorClass: individualStats.armorClass,
      hitPoints: individualStats.hitPoints,
      speed: individualStats.speed,
      abilities: individualAbilitiesAndName.abilities,
      specialActions: individualAbilitiesAndName.specialActions,
    });
  }
  
  const finalEncounterDisplayName = numberOfCreatures > 1 
    ? `${encounterBaseNameForDisplay} x${numberOfCreatures}` 
    : encounterBaseNameForDisplay;

  return { enemies, encounterBaseName: finalEncounterDisplayName };
}

const randomEnemySchema = z.object({
  language: z.string().min(2).max(5) as z.ZodType<Language>,
});

const PREDEFINED_ENEMY_TYPES_FOR_RANDOM = ["Goblin Scout", "Orc Warrior", "Undead Skeleton", "Giant Spider", "Cult Fanatic", "Dire Wolf", "Bandit Captain"];
const PREDEFINED_DIFFICULTIES: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];

export async function handleRandomEnemy(input: z.infer<typeof randomEnemySchema>): Promise<{ enemies: Enemy[], localizedBaseName: string }> {
  const { language } = randomEnemySchema.parse(input);

  const randomEnemyTypeKey = PREDEFINED_ENEMY_TYPES_FOR_RANDOM[Math.floor(Math.random() * PREDEFINED_ENEMY_TYPES_FOR_RANDOM.length)];
  const randomDifficulty = PREDEFINED_DIFFICULTIES[Math.floor(Math.random() * PREDEFINED_DIFFICULTIES.length)];
  
  const statsInput: GenerateEnemyStatsInput = { 
    enemyType: randomEnemyTypeKey, 
    numberOfCreatures: 1, 
    difficulty: randomDifficulty 
  };
  const abilitiesInput: AssignAbilitiesAndActionsInput = { 
    enemyType: randomEnemyTypeKey, 
    difficulty: randomDifficulty,
    targetLanguage: language,
  };

  const stats = await generateEnemyStats(statsInput);
  const abilitiesAndName = await assignAbilitiesAndActions(abilitiesInput);

  const enemy: Enemy = {
    id: `${abilitiesAndName.localizedName}-${randomDifficulty}-${Date.now()}-rand-${Math.random().toString(36).substring(7)}`, // Enhanced unique ID
    name: abilitiesAndName.localizedName,
    armorClass: stats.armorClass,
    hitPoints: stats.hitPoints,
    speed: stats.speed,
    abilities: abilitiesAndName.abilities,
    specialActions: abilitiesAndName.specialActions,
  };

  return { enemies: [enemy], localizedBaseName: abilitiesAndName.localizedName };
}

