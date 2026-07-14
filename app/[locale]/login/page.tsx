"use client";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signInWithGoogle, signInWithGitHub } from "./actions";

export default function LoginPage() {
  const { messages, locale } = useLocale();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(`/${locale}/feed`);
    }
  }, [user, isLoading, router, locale]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 text-center text-ash">
          {messages.common.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 space-y-6">
        <h1 className="font-heading text-3xl text-parchment text-center">
          {messages.nav.login}
        </h1>
        <p className="text-center text-ash">{messages.login.joinCommunity}</p>

        <form action={() => signInWithGoogle(locale)}>
          <Button
            type="submit"
            className="w-full bg-ember text-parchment hover:bg-ember/90"
          >
            Google
          </Button>
        </form>

        <form action={() => signInWithGitHub(locale)}>
          <Button
            type="submit"
            variant="outline"
            className="w-full border-parchment/20 text-parchment hover:bg-void"
          >
            GitHub
          </Button>
        </form>

        <div className="text-center text-sm text-ash">
          {messages.login.acceptTerms}
        </div>
      </div>
    </div>
  );
}
