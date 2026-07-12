"use client";

import Link from "next/link";
import { Challenge } from "@/types";
import { useLocale } from "@/components/locale-provider";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, Trophy } from "lucide-react";

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { messages, locale } = useLocale();
  const t = messages.challenges;

  const progress = challenge.completed_count && challenge.participants_count
    ? Math.min(
        Math.round((challenge.completed_count / Math.max(challenge.participants_count, 1)) * 100),
        100
      )
    : 0;

  return (
    <Link href={`/${locale}/challenges/${challenge.id}`}>
      <Card className="group bg-card border-border hover:border-ember/50 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        <CardContent className="p-5 flex-1">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="border-ember/30 text-ember">
              {messages.challenges.active}
            </Badge>
            {challenge.sponsor && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={challenge.sponsor.avatar_url || ""} alt={challenge.sponsor.name || "Sponsor avatar"} />
                  <AvatarFallback className="bg-void text-parchment text-xs">
                    {challenge.sponsor.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-ash">{challenge.sponsor.name}</span>
              </div>
            )}
          </div>
          <h3 className="font-heading text-2xl text-parchment group-hover:text-ember transition-colors">
            {challenge.title}
          </h3>
          <p className="text-sm text-ash mt-2 line-clamp-2">{challenge.description}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-ash">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {challenge.duration_days} {t.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {challenge.participants_count} {t.participants}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-ash mb-1">
              <span>{messages.challenges.progress}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-void" />
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0">
          <div className="flex items-center gap-2 text-sm text-ember">
            <Trophy className="h-4 w-4" />
            <span>{challenge.reward_text}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
