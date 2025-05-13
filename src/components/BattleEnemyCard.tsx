
"use client";

import React, { useState } from 'react';
import type { BattleEnemy } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Heart, Wind, Zap, Star, Sword } from "lucide-react";
import { useAppTranslations } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface BattleEnemyCardProps {
  enemy: BattleEnemy;
  onDamageApplied: (enemyId: string, damage: number) => void;
}

export default function BattleEnemyCard({ enemy, onDamageApplied }: BattleEnemyCardProps) {
  const [damageInput, setDamageInput] = useState<string>('');
  const { t } = useAppTranslations();
  const { toast } = useToast();
  const isDefeated = enemy.currentHp <= 0;

  const handleApplyDamage = () => {
    if (isDefeated) return;
    const damage = parseInt(damageInput, 10);
    if (isNaN(damage) || damage <= 0) {
      toast({
        variant: "destructive",
        title: t('battleEnemyCard.toast.invalidDamage.title'),
        description: t('battleEnemyCard.toast.invalidDamage.description'),
      });
      return;
    }
    onDamageApplied(enemy.id, damage);
    setDamageInput('');
  };

  return (
    <Card className={cn(
      "w-full max-w-md bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden transition-opacity duration-300",
      isDefeated && "opacity-50"
    )}>
      <CardHeader className="p-4 bg-secondary/30">
        <CardTitle className={cn(
          "text-2xl font-bold text-accent",
          isDefeated && "line-through"
        )}>
          {enemy.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center pb-3">
          <div className="flex flex-col items-center p-2 rounded-md bg-background/50">
            <Shield className="h-5 w-5 mb-1 text-primary" />
            <p className="font-semibold text-lg text-card-foreground">{enemy.armorClass}</p>
            <p className="text-xs text-muted-foreground">{t('statBlock.armorClass')}</p>
          </div>
          <div className={cn("flex flex-col items-center p-2 rounded-md bg-background/50", isDefeated && "relative")}>
            <Heart className="h-5 w-5 mb-1 text-primary" />
            <p className={cn("font-semibold text-lg text-card-foreground", isDefeated && "line-through")}>
              {enemy.currentHp} / {enemy.hitPoints}
            </p>
            <p className="text-xs text-muted-foreground">{t('statBlock.hitPoints')}</p>
            {isDefeated && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/70 ">
                    <span className="text-destructive font-bold text-xl transform -rotate-12">
                        {t('battleEnemyCard.defeated')}
                    </span>
                </div>
            )}
          </div>
          <div className="flex flex-col items-center p-2 rounded-md bg-background/50">
            <Wind className="h-5 w-5 mb-1 text-primary" />
            <p className="font-semibold text-lg text-card-foreground">{enemy.speed} ft.</p>
            <p className="text-xs text-muted-foreground">{t('statBlock.speed')}</p>
          </div>
        </div>

        {!isDefeated && (
          <>
            <Separator className="my-2 bg-border/50" />
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder={t('battleEnemyCard.damageAmountPlaceholder')}
                  value={damageInput}
                  onChange={(e) => setDamageInput(e.target.value)}
                  className="flex-grow text-base py-2 px-3"
                  min="1"
                  disabled={isDefeated}
                />
                <Button 
                  onClick={handleApplyDamage} 
                  variant="destructive" 
                  size="icon"
                  className="h-10 w-10"
                  disabled={isDefeated || !damageInput}
                  aria-label={t('battleEnemyCard.applyDamage')}
                >
                  <Sword className="h-5 w-5" />
                </Button>
              </div>
               <p className="text-xs text-muted-foreground text-center">{t('battleEnemyCard.applyDamageHint')}</p>
            </div>
          </>
        )}

        {(enemy.abilities.length > 0 || enemy.specialActions.length > 0) && !isDefeated && (
          <Separator className="my-2 bg-border/50" />
        )}

        {enemy.abilities.length > 0 && !isDefeated && (
          <div>
            <h4 className="font-semibold text-accent flex items-center gap-2 mb-1 text-lg">
              <Star className="h-5 w-5" />
              {t('statBlock.abilities')}
            </h4>
            <ul className="list-disc list-inside pl-2 space-y-0.5 text-sm text-card-foreground/90 max-h-20 overflow-y-auto">
              {enemy.abilities.map((ability, index) => (
                <li key={`ability-${index}`}>{ability}</li>
              ))}
            </ul>
          </div>
        )}

        {enemy.specialActions.length > 0 && !isDefeated && (
          <div>
            <h4 className="font-semibold text-accent flex items-center gap-2 mb-1 text-lg">
              <Zap className="h-5 w-5" />
              {t('statBlock.specialActions')}
            </h4>
            <ul className="list-disc list-inside pl-2 space-y-0.5 text-sm text-card-foreground/90 max-h-20 overflow-y-auto">
              {enemy.specialActions.map((action, index) => (
                <li key={`action-${index}`}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

