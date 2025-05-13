
"use client";

import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnemyInputForm from "@/components/EnemyInputForm";
import StatBlockDisplay from "@/components/StatBlockDisplay";
import type { Enemy } from "@/lib/types";
import { Loader2 } from 'lucide-react';
import { useAppTranslations } from '@/lib/i18n';

export default function HomePage() {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [encounterName, setEncounterName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useAppTranslations();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // `nameFromAI` is the `encounterBaseName` returned by the action, 
  // which is already formatted (e.g., "Гоблины x5" or "Гоблин")
  const handleGeneratedEnemies = (generatedEnemies: Enemy[], nameFromAI: string, isRandom: boolean = false) => {
    setEnemies(generatedEnemies);
    if (isRandom && generatedEnemies.length === 1 && nameFromAI) {
      // For random encounters, nameFromAI is just the localized base name. We construct the title.
      setEncounterName(t('randomEncounter.title', { enemyName: nameFromAI }));
    } else {
      // For forged encounters, nameFromAI is already the full display name (e.g. "Goblins x5" or "Goblin")
      setEncounterName(nameFromAI);
    }
  };
  
  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  if (!isMounted) {
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-accent" />
        <p className="mt-4 text-xl font-serif">{t('homePage.loader.text')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <EnemyInputForm onEnemiesGenerated={handleGeneratedEnemies} onLoadingStateChange={handleLoading} />
        
        {isLoading && (
          <div className="flex flex-col justify-center items-center mt-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="ml-4 text-xl mt-4">{t('homePage.loading.title')}</p>
            <p className="text-sm text-muted-foreground">{t('homePage.loading.subtitle')}</p>
          </div>
        )}
        
        {!isLoading && <StatBlockDisplay enemies={enemies} encounterName={encounterName} />}
      </main>
      <Footer />
    </div>
  );
}

