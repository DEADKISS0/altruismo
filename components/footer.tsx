"use client";

import { useLocale } from "@/components/locale-provider";
import { Flame } from "lucide-react";

export function Footer() {
  const { messages } = useLocale();

  return (
    <footer className="border-t border-border bg-pitch py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-ember" />
            <span className="font-heading text-xl text-parchment">ALTRUISMO</span>
          </div>
          <p className="text-sm text-ash">{messages.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
