
"use client";

import { Swords } from 'lucide-react';
import { useAppTranslations } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { t } = useAppTranslations();

  return (
    <header className="py-6 px-4 md:px-8 border-b border-border bg-card shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Swords className="h-10 w-10 text-accent" />
          <h1 className="text-4xl font-bold font-serif text-card-foreground">{t('header.title')}</h1>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

