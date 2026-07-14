import { DashboardClient } from "@/components/dashboard-client";
import { getCurrentUser, getPages } from "@/lib/services/server";
import { DashboardParams } from "@/types";
import { notFound } from "next/navigation";

export default async function DashboardPage({ params }: DashboardParams) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  const pages = await getPages({ authorId: user.id });

  return <DashboardClient user={user} pages={pages} locale={locale} />;
}