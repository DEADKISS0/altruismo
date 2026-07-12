"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";

export default function LoginPage() {
  const { messages, locale } = useLocale();

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 space-y-6">
        <h1 className="font-heading text-3xl text-parchment text-center">
          {messages.nav.login}
        </h1>
        <p className="text-center text-ash">{messages.login.joinCommunity}</p>
        <Link href={`/${locale}/feed`} className="block">
          <div className="w-full py-3 rounded-lg bg-ember text-parchment text-center font-medium">
            Google
          </div>
        </Link>
        <div className="w-full py-3 rounded-lg border border-parchment/20 text-parchment text-center font-medium cursor-pointer">
          GitHub
        </div>
        <div className="text-center text-sm text-ash">
          {messages.login.acceptTerms}
        </div>
      </div>
    </div>
  );
}
