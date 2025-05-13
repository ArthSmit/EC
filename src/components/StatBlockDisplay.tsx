
import StatBlock from "./StatBlock";
import type { Enemy } from "@/lib/types";
import Image from "next/image";

interface StatBlockDisplayProps {
  enemies: Enemy[];
  encounterName?: string;
}

export default function StatBlockDisplay({ enemies, encounterName }: StatBlockDisplayProps) {
  if (!enemies || enemies.length === 0) {
    return (
        <div className="text-center text-muted-foreground mt-12 p-8 space-y-4">
            <Image 
              src="https://picsum.photos/seed/scrollview/300/200" 
              alt="Empty scroll illustration" 
              width={300} 
              height={200}
              className="mx-auto rounded-lg shadow-md"
              data-ai-hint="empty scroll"
            />
            <p className="text-xl">No enemies generated yet.</p>
            <p>Fill the form above and forge your encounter!</p>
        </div>
    );
  }

  return (
    <section className="mt-12 w-full">
      {encounterName && <h2 className="text-3xl font-bold text-center mb-8 text-accent">{encounterName}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {enemies.map((enemy) => (
          <StatBlock key={enemy.id} enemy={enemy} />
        ))}
      </div>
    </section>
  );
}
