
"use client";

import StatBlock from "./StatBlock";
import type { Enemy } from "@/lib/types";
import Image from "next/image";
import { useAppTranslations } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Swords } from "lucide-react";
import { useRouter } from "next/navigation";

interface StatBlockDisplayProps {
  enemies: Enemy[];
  encounterName?: string;
}

export default function StatBlockDisplay({ enemies, encounterName }: StatBlockDisplayProps) {
  const { t } = useAppTranslations();
  const router = useRouter();

  if (!enemies || enemies.length === 0) {
    return (
        <div className="text-center text-muted-foreground mt-12 p-8 space-y-4">
            <Image 
              src="https://picsum.photos/seed/scrollview/300/200" 
              alt={t('statBlockDisplay.empty.message')} 
              width={300} 
              height={200}
              className="mx-auto rounded-lg shadow-md"
              data-ai-hint="empty scroll"
            />
            <p className="text-xl">{t('statBlockDisplay.empty.message')}</p>
            <p>{t('statBlockDisplay.empty.prompt')}</p>
        </div>
    );
  }

  const handleStartBattle = () => {
    if (enemies && enemies.length > 0) {
      localStorage.setItem('battleEnemies', JSON.stringify(enemies));
      if (encounterName) {
        localStorage.setItem('battleEncounterName', encounterName);
      } else {
        localStorage.setItem('battleEncounterName', t('battlePage.defaultTitle'));
      }
      router.push('/battle');
    }
  };

  return (
    <section className="mt-12 w-full">
      {encounterName && <h2 className="text-3xl font-bold text-center mb-8 text-accent">{encounterName}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {enemies.map((enemy) => (
          <StatBlock key={enemy.id} enemy={enemy} />
        ))}
      </div>
      {enemies && enemies.length > 0 && (
        <div className="mt-12 text-center">
          <Button 
            onClick={handleStartBattle} 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl py-4 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-150"
          >
            <Swords className="mr-2 h-6 w-6" />
            {t('statBlockDisplay.buttons.startBattle')}
          </Button>
        </div>
      )}
    </section>
  );
}
