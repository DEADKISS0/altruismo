"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/locale-provider";
import { useAuth } from "@/components/auth-provider";
import { Challenge } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, Trophy, Upload } from "lucide-react";
import {
  joinChallenge,
  updateChallengeProgress,
  getChallengeProgress,
} from "@/lib/services";
import { toast } from "sonner";

interface ChallengeDetailClientProps {
  challenge: Challenge;
}

export function ChallengeDetailClient({ challenge }: ChallengeDetailClientProps) {
  const { messages } = useLocale();
  const { user } = useAuth();
  const t = messages.challenges;
  const [progress, setProgress] = useState(0);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    getChallengeProgress(challenge.id).then((participant) => {
      if (participant) {
        setJoined(true);
        setProgress(participant.progress);
      }
    });
  }, [challenge.id]);

  const handleJoin = async () => {
    if (!user) {
      toast.error(messages.nav.login);
      return;
    }
    try {
      await joinChallenge(challenge.id);
      setJoined(true);
      toast.success(messages.challenges.joined);
    } catch {
      toast.error(messages.common.error);
    }
  };

  const handleProgress = async () => {
    if (!user) {
      toast.error(messages.nav.login);
      return;
    }
    try {
      const newProgress = Math.min(progress + 10, 100);
      setProgress(newProgress);
      await updateChallengeProgress(challenge.id, newProgress);
      if (newProgress >= 100) {
        toast.success(messages.page.challenge);
      }
    } catch {
      toast.error(messages.common.error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl">
        <h1 className="font-heading text-5xl md:text-6xl text-parchment mb-6">
          {challenge.title}
        </h1>

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 text-ash">
            <Calendar className="h-5 w-5" />
            {challenge.duration_days} {t.duration}
          </div>
          <div className="flex items-center gap-2 text-ash">
            <Users className="h-5 w-5" />
            {challenge.participants_count} {t.participants}
          </div>
          {challenge.sponsor && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={challenge.sponsor.avatar_url || ""} alt={challenge.sponsor.name || "Sponsor avatar"} />
                <AvatarFallback className="bg-void text-parchment text-xs">
                  {challenge.sponsor.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-ash">
                {t.sponsor} {challenge.sponsor.name}
              </span>
            </div>
          )}
        </div>

        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6 space-y-6">
            <p className="text-ash text-lg">{challenge.description}</p>
            {challenge.sponsor_message && (
              <div className="bg-void/50 border border-ember/20 rounded-lg p-4">
                <p className="text-parchment italic">&quot;{challenge.sponsor_message}&quot;</p>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-ash">
                <span>{messages.challenges.yourProgress}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-void" />
            </div>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleJoin}
                disabled={joined}
                className="bg-ember text-parchment hover:bg-ember/90"
              >
                {joined ? messages.challenges.joined : messages.page.joinChallenge}
              </Button>
              <Button
                onClick={handleProgress}
                variant="outline"
                className="border-parchment/20 text-parchment hover:bg-void"
              >
                <Upload className="mr-2 h-4 w-4" />
                {messages.challenges.logProgress}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-ember">
              <Trophy className="h-6 w-6" />
              <span className="font-heading text-2xl text-parchment">{challenge.reward_text}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
