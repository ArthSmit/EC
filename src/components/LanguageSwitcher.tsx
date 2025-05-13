
"use client";

import { useAppTranslations } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useAppTranslations();

  return (
    <div className="flex space-x-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('en')}
        className={cn(
          "px-2 py-1 h-auto text-sm",
          language === 'en' ? 'font-bold text-accent' : 'text-primary-foreground/70 hover:text-primary-foreground'
        )}
        aria-pressed={language === 'en'}
      >
        {t('languageSwitcher.en')}
      </Button>
      <div className="border-l border-primary-foreground/30 h-5 self-center"></div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('ru')}
        className={cn(
          "px-2 py-1 h-auto text-sm",
          language === 'ru' ? 'font-bold text-accent' : 'text-primary-foreground/70 hover:text-primary-foreground'
        )}
        aria-pressed={language === 'ru'}
      >
        {t('languageSwitcher.ru')}
      </Button>
    </div>
  );
}
