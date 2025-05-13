
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

const formSchema = z.object({
  enemyType: z.string().min(2, { message: "Enemy type must be at least 2 characters." }).max(50, { message: "Enemy type must be 50 characters or less." }),
  numberOfCreatures: z.coerce.number().min(1, { message: "Must be at least 1 creature." }).max(20, { message: "Cannot exceed 20 creatures." }),
  difficulty: z.enum(["easy", "medium", "hard", "random"], { required_error: "Please select a difficulty." }),
});

type EnemyInputFormProps = {
  onEnemiesGenerated: (enemies: Enemy[], encounterName: string) => void;
  onLoadingStateChange: (isLoading: boolean) => void;
};

export default function EnemyInputForm({ onEnemiesGenerated, onLoadingStateChange }: EnemyInputFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRandomSubmitting, setIsRandomSubmitting] = React.useState(false);
  const { toast } = useToast();

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
      onEnemiesGenerated(result, `${values.numberOfCreatures} ${values.enemyType}(s)`);
      toast({ title: "Encounter Forged!", description: `${values.enemyType}(s) are ready for battle.` });
    } catch (error) {
      console.error("Failed to generate encounter:", error);
      toast({ variant: "destructive", title: "Forge Failed!", description: "Could not generate encounter. Please try again." });
      onEnemiesGenerated([], ""); // Clear previous results on error
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
      toast({ title: "Random Foe Summoned!", description: `${result.encounterName} awaits.` });
    } catch (error) {
        console.error("Failed to generate random enemy:", error);
        toast({ variant: "destructive", title: "Summoning Failed!", description: "Could not generate random enemy. Please try again." });
        onEnemiesGenerated([], ""); // Clear previous results on error
    } finally {
        setIsRandomSubmitting(false);
        onLoadingStateChange(false);
    }
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-xl mx-auto p-6 md:p-8 bg-card text-card-foreground rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-accent">Forge Your Encounter</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="enemyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Enemy Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Goblin, Dragon, Ogre" {...field} className="text-base py-2 px-3"/>
                  </FormControl>
                  <FormDescription>
                    What kind of foe are you summoning?
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
                  <FormLabel className="text-base">Number of Creatures</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="20" {...field} className="text-base py-2 px-3"/>
                  </FormControl>
                   <FormDescription>
                    How many combatants? (1-20)
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
                    <FormLabel className="text-base">Difficulty</FormLabel>
                    <Tooltip>
                      <TooltipTrigger type="button" onClick={(e) => e.preventDefault()}>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs bg-popover text-popover-foreground p-2 rounded-md shadow-lg">
                        <p className="text-sm">
                          Determines overall toughness. 'Random' lets fate (and AI) decide!
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-base py-2 px-3 h-auto">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
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
              Forge Encounter!
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
              Summon Random Foe
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
