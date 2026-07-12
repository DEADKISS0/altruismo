import { type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LocaleProvider } from "@/components/locale-provider";
import { AuthProvider } from "@/components/auth-provider";
import { locales, isValidLocale, defaultLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? locale : defaultLocale;
  const messages = getMessages(validLocale);

  return (
    <AuthProvider>
      <LocaleProvider locale={validLocale} messages={messages}>
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
        <Toaster richColors position="bottom-right" />
      </LocaleProvider>
    </AuthProvider>
  );
}
