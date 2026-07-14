"use client";

import { useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createChallenge } from "@/lib/services";
import { toast } from "sonner";

export default function SponsorsPage() {
  const { messages } = useLocale();
  const { user } = useAuth();
  const t = messages.sponsors;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("30");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(messages.nav.login);
      return;
    }
    try {
      await createChallenge({
        title,
        description,
        reward_text: reward,
        sponsor_message: message,
        duration_days: parseInt(duration) || 30,
      });
      toast.success(t.create);
      setTitle("");
      setDescription("");
      setReward("");
      setMessage("");
    } catch {
      toast.error(messages.common.error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-5xl md:text-6xl text-parchment mb-8">
        {t.title.toUpperCase()}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-6">
            <h2 className="font-heading text-3xl text-parchment">{t.create}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-parchment">{t.brandName}</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-pitch border-border text-parchment"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-parchment">{messages.upload.description}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-pitch border-border text-parchment"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-parchment">{t.reward}</Label>
                <Input
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="bg-pitch border-border text-parchment"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-parchment">{t.organicIntegration}</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-pitch border-border text-parchment"
                  placeholder={t.organicIntegration}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-parchment">{messages.challenges.duration} (días)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-pitch border-border text-parchment"
                />
              </div>
              <Button type="submit" className="bg-ember text-parchment">
                {t.create}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h2 className="font-heading text-3xl text-parchment mb-4">{t.whySponsor}</h2>
              <ul className="space-y-3 text-ash">
                <li>{t.organicIntegration}</li>
                <li>{t.realEngagement}</li>
                <li>{t.metrics}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
