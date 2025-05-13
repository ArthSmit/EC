
"use client";

import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnemyInputForm from "@/components/EnemyInputForm";
import StatBlockDisplay from "@/components/StatBlockDisplay";
import type { Enemy } from "@/lib/types";
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [encounterName, setEncounterName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Hydration safety: client-only rendering for initial state if needed
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGeneratedEnemies = (generatedEnemies: Enemy[], name: string) => {
    setEnemies(generatedEnemies);
    setEncounterName(name);
  };
  
  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  if (!isMounted) {
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-accent" />
        <p className="mt-4 text-xl font-serif">Loading the Forge...</p>
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
            <p className="ml-4 text-xl mt-4">Forging your encounter...</p>
            <p className="text-sm text-muted-foreground">The mists of creation swirl!</p>
          </div>
        )}
        
        {!isLoading && <StatBlockDisplay enemies={enemies} encounterName={encounterName} />}
      </main>
      <Footer />
    </div>
  );
}
