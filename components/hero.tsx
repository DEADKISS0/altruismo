"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  const { messages, locale } = useLocale();
  const t = messages.hero;

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-noise opacity-20" />
      <div className="container mx-auto px-4 py-24 md:py-32 relative">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-4 py-1.5 text-sm text-ember mb-6">
            <Sparkles className="h-4 w-4" />
            {t.tagline}
          </div>
          <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl text-parchment leading-[0.9]">
            {t.title}
            <br />
            <span className="text-ember">{t.titleHighlight}</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-ash max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href={`/${locale}/feed`}>
              <Button size="lg" className="bg-ember text-parchment hover:bg-ember/90 text-base px-8">
                {t.ctaPrimary}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={`/${locale}/upload`}>
              <Button size="lg" variant="outline" className="border-parchment/20 text-parchment hover:bg-void text-base px-8">
                {t.ctaSecondary}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
