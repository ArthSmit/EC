
import { Swords } from 'lucide-react'; // Using Swords as a D&D thematic icon

export default function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border bg-card shadow-md">
      <div className="container mx-auto flex items-center gap-3">
        <Swords className="h-10 w-10 text-accent" />
        <h1 className="text-4xl font-bold font-serif text-primary-foreground">Encounter Forge</h1>
      </div>
    </header>
  );
}
