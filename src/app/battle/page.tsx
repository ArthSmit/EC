
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BattleEnemyCard from "@/components/BattleEnemyCard";
import type { Enemy, BattleEnemy } from "@/lib/types";
import { useAppTranslations } from "@/lib/i18n";
import { Loader2, Home } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function BattlePage() {
  const [battleEnemies, setBattleEnemies] = useState<BattleEnemy[]>([]);
  const [encounterTitle, setEncounterTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useAppTranslations();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const storedEnemiesString = localStorage.getItem('battleEnemies');
      const storedEncounterName = localStorage.getItem('battleEncounterName');
      
      if (storedEnemiesString) {
        try {
          const parsedEnemies: Enemy[] = JSON.parse(storedEnemiesString);
          setBattleEnemies(parsedEnemies.map(enemy => ({ ...enemy, currentHp: enemy.hitPoints })));
        } catch (error) {
          console.error("Failed to parse enemies from localStorage:", error);
          setBattleEnemies([]); // Set to empty if parsing fails
        }
      } else {
         setBattleEnemies([]); // Set to empty if no enemies in localStorage
      }

      if (storedEncounterName) {
        setEncounterTitle(storedEncounterName);
      } else {
        setEncounterTitle(t('battlePage.defaultTitle'));
      }
      setIsLoading(false);
    }
  }, [isMounted, t]);

  const handleDamageApplied = useCallback((enemyId: string, damage: number) => {
    setBattleEnemies(prevEnemies =>
      prevEnemies.map(enemy =>
        enemy.id === enemyId
          ? { ...enemy, currentHp: Math.max(0, enemy.currentHp - damage) }
          : enemy
      )
    );
  }, []);

  const handleFinishBattle = () => {
    // Optionally clear localStorage if battle state shouldn't persist after finishing
    // localStorage.removeItem('battleEnemies');
    // localStorage.removeItem('battleEncounterName');
    router.push('/');
  };

  if (!isMounted || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-accent" />
        <p className="mt-4 text-xl font-serif">{t('homePage.loader.text')}</p>
      </div>
    );
  }

  if (battleEnemies.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center text-center">
          <Image
            src="https://picsum.photos/seed/battleempty/400/250"
            alt={t('battlePage.noEnemies.title')}
            width={400}
            height={250}
            className="rounded-lg shadow-lg mb-8"
            data-ai-hint="empty battlefield"
          />
          <h2 className="text-3xl font-bold text-accent mb-4">{t('battlePage.noEnemies.title')}</h2>
          <p className="text-lg text-muted-foreground mb-6">{t('battlePage.noEnemies.message')}</p>
          <Button onClick={() => router.push('/')} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            {t('battlePage.buttons.returnToForge')}
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
            <h1 className="text-4xl font-bold text-center text-accent">{encounterTitle || t('battlePage.title')}</h1>
            <Button 
                onClick={handleFinishBattle} 
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                size="lg"
            >
                <Home className="mr-2 h-5 w-5" />
                {t('battlePage.buttons.finishBattle')}
            </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {battleEnemies.map(enemy => (
            <BattleEnemyCard 
              key={enemy.id} 
              enemy={enemy} 
              onDamageApplied={handleDamageApplied} 
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
