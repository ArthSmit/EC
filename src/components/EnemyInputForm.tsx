
"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Loader2, HelpCircle } from "lucide-react";
import type { Enemy } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppTranslations } from "@/lib/i18n";

const getFormSchema = (t: (key: string, params?: any) => string) => z.object({
  enemyType: z.string()
    .min(2, { message: t('enemyInputForm.enemyType.errorMin', { min: 2 }) })
    .max(50, { message: t('enemyInputForm.enemyType.errorMax', { max: 50 }) }),
  numberOfCreatures: z.coerce.number()
    .min(1, { message: t('enemyInputForm.numberOfCreatures.errorMin', { min: 1 }) })
    .max(20, { message: t('enemyInputForm.numberOfCreatures.errorMax', { max: 20 }) }),
  difficulty: z.enum(["easy", "medium", "hard", "random"], { 
    required_error: t('enemyInputForm.difficulty.errorRequired') 
  }),
});

type EnemyInputFormProps = {
  onEnemiesGenerated: (enemies: Enemy[], encounterName: string) => void;
  onLoadingStateChange: (isLoading: boolean) => void;
};

export default function EnemyInputForm({ onEnemiesGenerated, onLoadingStateChange }: EnemyInputFormProps) {
  const { t } = useAppTranslations();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRandomSubmitting, setIsRandomSubmitting] = React.useState(false);
  const { toast } = useToast();

  const formSchema = React.useMemo(() => getFormSchema(t), [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enemyType: "",
      numberOfCreatures: 1,
      difficulty: "medium",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    onLoadingStateChange(true);
    try {
      const { handleGenerateEncounter } = await import("@/app/actions");
      const result = await handleGenerateEncounter(values);
      const encounterDisplayName = values.numberOfCreatures > 1 ? `${values.enemyType} x${values.numberOfCreatures}` : values.enemyType;
      onEnemiesGenerated(result, encounterDisplayName);
      toast({ 
        title: t('enemyInputForm.toast.forgeSuccess.title'), 
        description: t('enemyInputForm.toast.forgeSuccess.description', { enemyType: values.enemyType }) 
      });
    } catch (error) {
      console.error("Failed to generate encounter:", error);
      toast({ 
        variant: "destructive", 
        title: t('enemyInputForm.toast.forgeError.title'), 
        description: t('enemyInputForm.toast.forgeError.description')
      });
      onEnemiesGenerated([], ""); 
    } finally {
      setIsSubmitting(false);
      onLoadingStateChange(false);
    }
  }
  
  async function onRandomSubmit() {
    setIsRandomSubmitting(true);
    onLoadingStateChange(true);
    try {
      const { handleRandomEnemy } = await import("@/app/actions");
      const result = await handleRandomEnemy();
      onEnemiesGenerated(result.enemies, result.encounterName);
      toast({ 
        title: t('enemyInputForm.toast.randomSuccess.title'), 
        description: t('enemyInputForm.toast.randomSuccess.description', { encounterName: result.encounterName })
      });
    } catch (error) {
        console.error("Failed to generate random enemy:", error);
        toast({ 
          variant: "destructive", 
          title: t('enemyInputForm.toast.randomError.title'), 
          description: t('enemyInputForm.toast.randomError.description')
        });
        onEnemiesGenerated([], ""); 
    } finally {
        setIsRandomSubmitting(false);
        onLoadingStateChange(false);
    }
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-xl mx-auto p-6 md:p-8 bg-card text-card-foreground rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-accent">{t('enemyInputForm.title')}</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="enemyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">{t('enemyInputForm.enemyType.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('enemyInputForm.enemyType.placeholder')} {...field} className="text-base py-2 px-3"/>
                  </FormControl>
                  <FormDescription>
                    {t('enemyInputForm.enemyType.description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfCreatures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">{t('enemyInputForm.numberOfCreatures.label')}</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="20" {...field} className="text-base py-2 px-3"/>
                  </FormControl>
                   <FormDescription>
                    {t('enemyInputForm.numberOfCreatures.description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-base">{t('enemyInputForm.difficulty.label')}</FormLabel>
                    <Tooltip>
                      <TooltipTrigger type="button" onClick={(e) => e.preventDefault()}>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs bg-popover text-popover-foreground p-2 rounded-md shadow-lg">
                        <p className="text-sm">
                          {t('enemyInputForm.difficulty.tooltip')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-base py-2 px-3 h-auto">
                        <SelectValue placeholder={t('enemyInputForm.difficulty.placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">{t('enemyInputForm.difficultyOptions.easy')}</SelectItem>
                      <SelectItem value="medium">{t('enemyInputForm.difficultyOptions.medium')}</SelectItem>
                      <SelectItem value="hard">{t('enemyInputForm.difficultyOptions.hard')}</SelectItem>
                      <SelectItem value="random">{t('enemyInputForm.difficultyOptions.random')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/80 text-primary-foreground text-lg py-3 transition-colors duration-150" 
              disabled={isSubmitting || isRandomSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
              {t('enemyInputForm.buttons.forgeEncounter')}
            </Button>
          </form>
        </Form>
        <div className="mt-6 pt-6 border-t border-border/50">
          <Button 
            variant="outline" 
            className="w-full text-accent border-accent hover:bg-accent hover:text-accent-foreground text-lg py-3 transition-colors duration-150" 
            onClick={onRandomSubmit} 
            disabled={isSubmitting || isRandomSubmitting}
          >
              {isRandomSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
              {t('enemyInputForm.buttons.summonRandom')}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
