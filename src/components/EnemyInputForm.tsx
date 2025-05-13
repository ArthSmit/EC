
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
import { Wand2, Loader2, HelpCircle, ChevronsUpDown, Check } from "lucide-react";
import type { Enemy } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PREDEFINED_ENEMY_TYPES_FOR_FORM_EN = [
  "Goblin", "Orc", "Skeleton", "Zombie", "Kobold", 
  "Bandit", "Cultist", "Guard", "Acolyte",
  "Wolf", "Giant Spider", "Ogre", 
  "Dragon (Young Red)", "Knight", "Veteran"
].sort();

const PREDEFINED_ENEMY_TYPES_FOR_FORM_RU = [
  "Гоблин", "Орк", "Скелет", "Зомби", "Кобольд",
  "Бандит", "Культист", "Стражник", "Аколит",
  "Волк", "Гигантский Паук", "Огр",
  "Дракон (Молодой Красный)", "Рыцарь", "Ветеран"
].sort();


const getFormSchema = (t: (key: string, params?: any) => string) => z.object({
  enemyType: z.string()
    .min(1, { message: t('enemyInputForm.enemyType.errorMin', { min: 1 }) }) 
    .max(50, { message: t('enemyInputForm.enemyType.errorMax', { max: 50 }) }),
  numberOfCreatures: z.coerce.number()
    .min(1, { message: t('enemyInputForm.numberOfCreatures.errorMin', { min: 1 }) })
    .max(20, { message: t('enemyInputForm.numberOfCreatures.errorMax', { max: 20 }) }),
  difficulty: z.enum(["easy", "medium", "hard", "random"], { 
    required_error: t('enemyInputForm.difficulty.errorRequired') 
  }),
});

type EnemyInputFormProps = {
  onEnemiesGenerated: (enemies: Enemy[], encounterName: string, isRandom?: boolean) => void;
  onLoadingStateChange: (isLoading: boolean) => void;
};

export default function EnemyInputForm({ onEnemiesGenerated, onLoadingStateChange }: EnemyInputFormProps) {
  const { t, language } = useAppTranslations();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRandomSubmitting, setIsRandomSubmitting] = React.useState(false);
  const [enemyTypePopoverOpen, setEnemyTypePopoverOpen] = React.useState(false);
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
  
  const predefinedEnemyTypes = React.useMemo(() => {
    return language === 'ru' ? PREDEFINED_ENEMY_TYPES_FOR_FORM_RU : PREDEFINED_ENEMY_TYPES_FOR_FORM_EN;
  }, [language]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    onLoadingStateChange(true);
    try {
      const { handleGenerateEncounter } = await import("@/app/actions");
      const result = await handleGenerateEncounter({ ...values, language });
      // result.encounterBaseName is already the formatted display name (e.g., "Гоблины x5" or "Гоблин")
      onEnemiesGenerated(result.enemies, result.encounterBaseName, false);
      toast({ 
        title: t('enemyInputForm.toast.forgeSuccess.title'), 
        // Use result.encounterBaseName which is the localized and potentially numbered name
        description: t('enemyInputForm.toast.forgeSuccess.description', { encounterDisplayName: result.encounterBaseName }) 
      });
    } catch (error) {
      console.error("Failed to generate encounter:", error);
      toast({ 
        variant: "destructive", 
        title: t('enemyInputForm.toast.forgeError.title'), 
        description: t('enemyInputForm.toast.forgeError.description')
      });
      onEnemiesGenerated([], "", false); 
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
      const result = await handleRandomEnemy({ language });
      // result.localizedBaseName is the single enemy's localized name
      onEnemiesGenerated(result.enemies, result.localizedBaseName, true);
      toast({ 
        title: t('enemyInputForm.toast.randomSuccess.title'), 
        // Use localizedBaseName for the single random enemy name
        description: t('enemyInputForm.toast.randomSuccess.description', { enemyName: result.localizedBaseName })
      });
    } catch (error) {
        console.error("Failed to generate random enemy:", error);
        toast({ 
          variant: "destructive", 
          title: t('enemyInputForm.toast.randomError.title'), 
          description: t('enemyInputForm.toast.randomError.description')
        });
        onEnemiesGenerated([], "", true); 
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
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base">{t('enemyInputForm.enemyType.label')}</FormLabel>
                  <Popover open={enemyTypePopoverOpen} onOpenChange={setEnemyTypePopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={enemyTypePopoverOpen}
                          className={cn(
                            "w-full justify-between text-left text-base py-2 px-3 h-auto font-normal", 
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? predefinedEnemyTypes.find(
                                (enemy) => enemy.toLowerCase() === field.value.toLowerCase()
                              ) || field.value
                            : t('enemyInputForm.enemyType.comboboxPlaceholder')}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput 
                          placeholder={t('enemyInputForm.enemyType.comboboxSearchPlaceholder')}
                          value={field.value || ""} 
                          onValueChange={(search) => { 
                             form.setValue("enemyType", search, { shouldValidate: true });
                          }}
                        />
                        <CommandEmpty>{t('enemyInputForm.enemyType.comboboxEmpty')}</CommandEmpty>
                        <CommandList>
                          {predefinedEnemyTypes.map((enemy) => (
                            <CommandItem
                              value={enemy}
                              key={enemy}
                              onSelect={(currentValue) => {
                                const valueToSet = currentValue.toLowerCase() === (field.value || "").toLowerCase() ? "" : currentValue;
                                form.setValue("enemyType", valueToSet, { shouldValidate: true });
                                setEnemyTypePopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  enemy.toLowerCase() === (field.value || "").toLowerCase() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {enemy}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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

