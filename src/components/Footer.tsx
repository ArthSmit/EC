
"use client";

import { useAppTranslations } from "@/lib/i18n";

export default function Footer() {
  const { t } = useAppTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 px-4 md:px-8 border-t border-border mt-auto bg-card">
      <div className="container mx-auto text-center text-muted-foreground text-sm">
        <p>{t('footer.copyright', { year: currentYear })}</p>
      </div>
    </footer>
  );
}
