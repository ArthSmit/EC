
export interface Enemy {
  id: string;
  name: string;
  armorClass: number;
  hitPoints: number;
  speed: number;
  abilities: string[];
  specialActions: string[];
}

export interface BattleEnemy extends Enemy {
  currentHp: number;
}
