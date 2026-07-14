import { notFound } from "next/navigation";
import { ChallengeDetailClient } from "@/components/challenge-detail-client";
import { getChallenge } from "@/lib/services/server";
import { ChallengeParams } from "@/types";

export default async function ChallengeDetailPage({ params }: ChallengeParams) {
  const { id } = await params;
  const challenge = await getChallenge(id);

  if (!challenge) {
    notFound();
  }

  return (<ChallengeDetailClient challenge={challenge} />);
}
