"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Flame, Globe } from "lucide-react";
import { locales, labels, Locale } from "@/lib/i18n/config";
import { useState } from "react";

function LanguageSwitcher() {
  const { messages, locale } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const switchPath = (newLocale: Locale) => {
    return pathname.replace(`/${locale}`, `/${newLocale}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="text-parchment hover:text-ember" aria-label={locale === "es" ? "Cambiar idioma" : "Change language"}>
            <Globe className="h-5 w-5" />
          </Button>
        }
      />
      <SheetContent side="right" className="bg-pitch border-border">
        <div className="flex flex-col gap-4 mt-8">
          <h3 className="font-heading text-2xl text-parchment">{messages.nav.language}</h3>
          {locales.map((l) => (
            <Link
              key={l}
              href={switchPath(l)}
              onClick={() => setOpen(false)}
              className={`text-lg py-2 px-4 rounded border border-border ${
                l === locale ? "bg-ember text-parchment" : "text-parchment hover:bg-void"
              }`}
            >
              {labels[l]}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Navbar() {
  const { messages, locale } = useLocale();
  const t = messages.nav;
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: `/${locale}/feed`, label: t.feed },
    { href: `/${locale}/challenges`, label: t.challenges },
    { href: `/${locale}/leaderboard`, label: t.leaderboard },
    { href: `/${locale}/sponsors`, label: t.sponsors },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-pitch/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-ember" />
          <span className="font-heading text-2xl tracking-tight text-parchment">ALTRUISMO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-ember ${
                pathname === link.href ? "text-ember" : "text-parchment"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href={`/${locale}/upload`}>
            <Button className="hidden md:inline-flex bg-ember text-parchment hover:bg-ember/90">
              {t.upload}
            </Button>
          </Link>
          <Link href={`/${locale}/login`}>
            <Button variant="outline" className="border-parchment/20 text-parchment hover:bg-void">
              {t.login}
            </Button>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="text-parchment md:hidden" aria-label={locale === "es" ? "Abrir menú" : "Open menu"}>
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
            <SheetContent side="right" className="bg-pitch border-border">
              <div className="flex flex-col gap-4 mt-8">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg text-parchment hover:text-ember"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href={`/${locale}/upload`} onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-ember text-parchment">{t.upload}</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
