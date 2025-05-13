
export default function Footer() {
  return (
    <footer className="py-6 px-4 md:px-8 border-t border-border mt-auto bg-card">
      <div className="container mx-auto text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Encounter Forge. Forged in the fires of imagination.</p>
      </div>
    </footer>
  );
}
