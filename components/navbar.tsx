"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Menu, Flame, Globe, LogOut, User, BarChart3, Sun, Moon, Star } from "lucide-react";
import { locales, labels, Locale } from "@/lib/i18n/config";
import { NotificationBell } from "@/components/notification-bell";
import { useState, useEffect } from "react";

function LanguageSwitcher() {
  const { messages, locale } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const switchPath = (newLocale: Locale) => {
    return pathname.replace(`/${locale}`, `/${newLocale}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-parchment hover:text-ember" aria-label={locale === "es" ? "Cambiar idioma" : "Change language"}>
                  <Globe className="h-5 w-5" />
                </Button>
              }
            />
          }
        />
        <TooltipContent>
          <p>{locale === "es" ? "Cambiar idioma" : "Change language"}</p>
        </TooltipContent>
      </Tooltip>
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

function ThemeToggle() {
  const { locale } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!mounted) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon" className="text-parchment" aria-label="Theme">
              <Sun className="h-5 w-5" />
            </Button>
          }
        />
        <TooltipContent>
          <p>{locale === "es" ? "Cambiar tema" : "Toggle theme"}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-parchment hover:text-ember"
            aria-label={locale === "es" ? "Cambiar tema" : "Toggle theme"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        }
      />
      <TooltipContent>
        <p>{theme === "dark" ? (locale === "es" ? "Modo claro" : "Light mode") : (locale === "es" ? "Modo oscuro" : "Dark mode")}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const { messages, locale } = useLocale();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <Link href={`/${locale}/login`}>
        <Button variant="outline" className="border-parchment/20 text-parchment hover:bg-void">
          {messages.nav.login}
        </Button>
      </Link>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 p-0" aria-label={user.name || "User menu"}>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar_url || ""} alt={user.name || "User avatar"} />
                    <AvatarFallback className="bg-ember text-parchment text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              }
            />
          }
        />
        <TooltipContent>
          <p>{user.name}</p>
        </TooltipContent>
      </Tooltip>
      <SheetContent side="right" className="bg-pitch border-border">
        <div className="flex flex-col gap-4 mt-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || ""} alt={user.name || "User avatar"} />
              <AvatarFallback className="bg-ember text-parchment">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-parchment">{user.name}</p>
              <p className="text-sm text-ash">
                <span className="text-ember font-medium">{user.points.toLocaleString()}</span> {messages.leaderboard.points}
                {" · "}
                <span className="text-amber-400">Nivel {user.level}</span>
              </p>
              <div className="mt-1 h-1.5 bg-void rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-ember to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${(user.points % 100)}%` }}
                />
              </div>
              <p className="text-xs text-ash mt-0.5">
                {100 - (user.points % 100)} {locale === "es" ? "puntos para el siguiente nivel" : "points to next level"}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/profile/${user.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-lg text-parchment hover:text-ember"
          >
            <User className="h-5 w-5" />
            {messages.nav.profile}
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-lg text-parchment hover:text-ember"
          >
            <BarChart3 className="h-5 w-5" />
            {messages.nav.dashboard}
          </Link>
          <Button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            variant="outline"
            className="w-full border-parchment/20 text-parchment hover:bg-void"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {messages.nav.logout}
          </Button>
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
          <ThemeToggle />
          <NotificationBell />
          <Link href={`/${locale}/upload`}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button className="hidden md:inline-flex bg-ember text-parchment hover:bg-ember/90">
                    {t.upload}
                  </Button>
                }
              />
              <TooltipContent>
                <p>{locale === "es" ? "Subir una herramienta" : "Upload a tool"}</p>
              </TooltipContent>
            </Tooltip>
          </Link>
          <UserMenu />
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
                <div className="flex items-center justify-between py-2 border-t border-border">
                  <span className="text-parchment">{locale === "es" ? "Modo oscuro" : "Dark mode"}</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between py-2 border-t border-border">
                  <span className="text-parchment">{locale === "es" ? "Notificaciones" : "Notifications"}</span>
                  <NotificationBell />
                </div>
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
