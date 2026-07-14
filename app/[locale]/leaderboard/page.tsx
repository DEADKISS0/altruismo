import { LeaderboardTable } from "@/components/leaderboard-table";
import { getLeaderboard } from "@/lib/services/server";
import { LocaleParams } from "@/types";

export default async function LeaderboardPage({ params }: LocaleParams) {
  const { locale } = await params;
  const users = await getLeaderboard();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-5xl md:text-6xl text-parchment mb-8">
        {locale === "es" ? "RANKING" : "LEADERBOARD"}
      </h1>
      <LeaderboardTable users={users} />
    </div>
  );
}
