
import type { Metadata } from 'next';
import { Merriweather } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: 'Encounter Forge',
  description: 'Forge your D&D 5e encounters with AI!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(merriweather.variable, "scroll-smooth")}>
      <body className={cn("font-serif antialiased min-h-screen flex flex-col")}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
