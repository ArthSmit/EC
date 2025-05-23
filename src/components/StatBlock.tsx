
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy, Shield, Heart, Wind, Zap, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Enemy } from "@/lib/types";
import { useAppTranslations } from "@/lib/i18n";

interface StatBlockProps {
  enemy: Enemy;
}

export default function StatBlock({ enemy }: StatBlockProps) {
  const { t } = useAppTranslations();
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    const statBlockText = `
${t('statBlock.clipboard.name', { name: enemy.name })}
${t('statBlock.clipboard.armorClass', { armorClass: enemy.armorClass })}
${t('statBlock.clipboard.hitPoints', { hitPoints: enemy.hitPoints })}
${t('statBlock.clipboard.speed', { speed: enemy.speed })}

${t('statBlock.clipboard.abilitiesHeader')}
${enemy.abilities.map(ability => `- ${ability}`).join('\n')}

${t('statBlock.clipboard.specialActionsHeader')}
${enemy.specialActions.map(action => `- ${action}`).join('\n')}
    `;
    navigator.clipboard.writeText(statBlockText.trim())
      .then(() => {
        toast({ 
          title: t('statBlock.toast.copied.title'), 
          description: t('statBlock.toast.copied.description', { enemyName: enemy.name })
        });
      })
      .catch(err => {
        toast({ 
          variant: "destructive", 
          title: t('statBlock.toast.copyError.title'), 
          description: t('statBlock.toast.copyError.description')
        });
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="p-4 bg-secondary/30">
        <CardTitle className="text-2xl font-bold text-accent">{enemy.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center pb-3">
          <div className="flex flex-col items-center p-2 rounded-md bg-background/50">
            <Shield className="h-5 w-5 mb-1 text-primary" />
            <p className="font-semibold text-lg text-card-foreground">{enemy.armorClass}</p>
            <p className="text-xs text-muted-foreground">{t('statBlock.armorClass')}</p>
          </div>
          <div className="flex flex-col items-center p-2 rounded-md bg-background/50">
            <Heart className="h-5 w-5 mb-1 text-primary" />
            <p className="font-semibold text-lg text-card-foreground">{enemy.hitPoints}</p>
            <p className="text-xs text-muted-foreground">{t('statBlock.hitPoints')}</p>
          </div>
          <div className="flex flex-col items-center p-2 rounded-md bg-background/50">
            <Wind className="h-5 w-5 mb-1 text-primary" />
            <p className="font-semibold text-lg text-card-foreground">{enemy.speed} ft.</p>
            <p className="text-xs text-muted-foreground">{t('statBlock.speed')}</p>
          </div>
        </div>

        {enemy.abilities.length > 0 && (
          <>
            <Separator className="my-2 bg-border/50" />
            <div>
              <h4 className="font-semibold text-accent flex items-center gap-2 mb-1 text-lg">
                <Star className="h-5 w-5" />
                {t('statBlock.abilities')}
              </h4>
              <ul className="list-disc list-inside pl-2 space-y-0.5 text-sm text-card-foreground/90">
                {enemy.abilities.map((ability, index) => (
                  <li key={`ability-${index}`}>{ability}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {enemy.specialActions.length > 0 && (
          <>
            <Separator className="my-2 bg-border/50" />
            <div>
              <h4 className="font-semibold text-accent flex items-center gap-2 mb-1 text-lg">
                <Zap className="h-5 w-5" />
                {t('statBlock.specialActions')}
              </h4>
              <ul className="list-disc list-inside pl-2 space-y-0.5 text-sm text-card-foreground/90">
                {enemy.specialActions.map((action, index) => (
                  <li key={`action-${index}`}>{action}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        
        <Separator className="my-3 bg-border/50" />
        <Button 
          onClick={handleCopyToClipboard} 
          variant="outline" 
          className="w-full text-accent border-accent hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
        >
          <Copy className="mr-2 h-4 w-4" /> {t('statBlock.buttons.copyStats')}
        </Button>
      </CardContent>
    </Card>
  );
}

