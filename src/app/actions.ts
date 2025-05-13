
"use server";

import { generateEnemyStats, type GenerateEnemyStatsInput } from "@/ai/flows/generate-enemy-stats";
import { assignAbilitiesAndActions, type AssignAbilitiesAndActionsInput } from "@/ai/flows/assign-abilities-and-actions";
import type { Enemy } from "@/lib/types";
import { z } from "zod";

const generateEncounterSchema = z.object({
  enemyType: z.string().min(1, "Enemy type is required."),
  numberOfCreatures: z.coerce.number().min(1).max(20),
  difficulty: z.enum(["easy", "medium", "hard", "random"]),
});

export async function handleGenerateEncounter(
  input: z.infer<typeof generateEncounterSchema>
): Promise<Enemy[]> {
  const validatedInput = generateEncounterSchema.parse(input);
  const { enemyType, numberOfCreatures, difficulty } = validatedInput;

  const enemies: Enemy[] = [];

  // Generate base stats and abilities once for the given type and difficulty
  // The AI prompts are designed to consider numberOfCreatures for scaling if applicable.
  const baseStats = await generateEnemyStats({ enemyType, numberOfCreatures, difficulty });
  const baseAbilities = await assignAbilitiesAndActions({ enemyType, difficulty });

  for (let i = 0; i < numberOfCreatures; i++) {
    enemies.push({
      id: `${enemyType}-${difficulty}-${Date.now()}-${i}`, // Unique ID for React keys
      name: numberOfCreatures > 1 ? `${enemyType} ${i + 1}` : enemyType,
      armorClass: baseStats.armorClass,
      hitPoints: baseStats.hitPoints, // HP can be further randomized per creature if desired
      speed: baseStats.speed,
      abilities: baseAbilities.abilities,
      specialActions: baseAbilities.specialActions,
    });
  }

  return enemies;
}

// For random enemy generation
const PREDEFINED_ENEMY_TYPES = ["Goblin Scout", "Orc Warrior", "Undead Skeleton", "Giant Spider", "Cult Fanatic", "Dire Wolf", "Bandit Captain"];
const PREDEFINED_DIFFICULTIES: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];

export async function handleRandomEnemy(): Promise<{ enemies: Enemy[], encounterName: string }> {
  const randomEnemyType = PREDEFINED_ENEMY_TYPES[Math.floor(Math.random() * PREDEFINED_ENEMY_TYPES.length)];
  // For a single random enemy, difficulty can also be random.
  const randomDifficulty = PREDEFINED_DIFFICULTIES[Math.floor(Math.random() * PREDEFINED_DIFFICULTIES.length)];
  
  const statsInput: GenerateEnemyStatsInput = { 
    enemyType: randomEnemyType, 
    numberOfCreatures: 1, // Always 1 for a single random enemy
    difficulty: randomDifficulty 
  };
  const abilitiesInput: AssignAbilitiesAndActionsInput = { 
    enemyType: randomEnemyType, 
    difficulty: randomDifficulty 
  };

  const stats = await generateEnemyStats(statsInput);
  const abilities = await assignAbilitiesAndActions(abilitiesInput);

  const enemy: Enemy = {
    id: `${randomEnemyType}-${randomDifficulty}-${Date.now()}-0`,
    name: randomEnemyType,
    armorClass: stats.armorClass,
    hitPoints: stats.hitPoints,
    speed: stats.speed,
    abilities: abilities.abilities,
    specialActions: abilities.specialActions,
  };

  return { enemies: [enemy], encounterName: `A Wild ${randomEnemyType} Appears!` };
}
