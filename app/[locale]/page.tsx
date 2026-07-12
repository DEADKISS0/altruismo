import { Hero } from "@/components/hero";
import { PageCard } from "@/components/page-card";
import { ChallengeCard } from "@/components/challenge-card";
import { getPages, getChallenges } from "@/lib/services";
import { LocaleParams } from "@/types";

export default async function HomePage({ params }: LocaleParams) {
  const { locale } = await params;
  const pages = await getPages();
  const challenges = await getChallenges();

  return (
    <div className="min-h-screen">
      <Hero />

      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-heading text-4xl md:text-5xl text-parchment">
              {locale === "es" ? "DESTACADOS" : "FEATURED"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.slice(0, 3).map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-heading text-4xl md:text-5xl text-parchment">
              {locale === "es" ? "RETOS ACTIVOS" : "ACTIVE CHALLENGES"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.slice(0, 2).map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
