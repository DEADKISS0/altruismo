import { ChallengeCard } from "@/components/challenge-card";
import { getChallenges } from "@/lib/services";
import { LocaleParams } from "@/types";

export default async function ChallengesPage({ params }: LocaleParams) {
  const { locale } = await params;
  const challenges = await getChallenges();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-8">
        <h1 className="font-heading text-5xl md:text-6xl text-parchment">
          {locale === "es" ? "RETOS ACTIVOS" : "ACTIVE CHALLENGES"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}
