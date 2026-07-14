"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getActivity } from "@/lib/services";
import { Upload, Heart, MessageSquare, UserPlus, Trophy } from "lucide-react";

interface ActivityItem {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  action: string;
  target_type: string;
  target_id: string;
  target_title: string;
  created_at: string;
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; text: string }> = {
  upload: { icon: <Upload className="h-4 w-4" />, text: "publicó" },
  like: { icon: <Heart className="h-4 w-4" />, text: "le gustó" },
  comment: { icon: <MessageSquare className="h-4 w-4" />, text: "comentó en" },
  follow: { icon: <UserPlus className="h-4 w-4" />, text: "siguió a" },
  challenge_complete: { icon: <Trophy className="h-4 w-4" />, text: "completó el reto" },
};

interface ActivityFeedProps {
  userId?: string;
  limit?: number;
}

export function ActivityFeed({ userId, limit = 10 }: ActivityFeedProps) {
  const { locale } = useLocale();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getActivity(userId, limit)
      .then(setActivities)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [userId, limit]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-card border border-border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-ash text-center py-8">
        {locale === "es" ? "No hay actividad reciente" : "No recent activity"}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const config = ACTION_CONFIG[activity.action] || { icon: <Upload className="h-4 w-4" />, text: activity.action };
        const targetHref = activity.target_type === "page"
          ? `/${locale}/page/${activity.target_id}`
          : activity.target_type === "challenge"
          ? `/${locale}/challenges/${activity.target_id}`
          : `/${locale}/profile/${activity.target_id}`;

        return (
          <div key={activity.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
            <Avatar className="h-9 w-9">
              <AvatarImage src={activity.user_avatar || ""} />
              <AvatarFallback className="bg-void text-parchment text-xs">
                {activity.user_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-parchment">
                <Link href={`/${locale}/profile/${activity.user_id}`} className="font-medium hover:text-ember">
                  {activity.user_name}
                </Link>
                {" "}
                <span className="text-ash">{config.text}</span>
                {" "}
                <Link href={targetHref} className="font-medium hover:text-ember truncate">
                  {activity.target_title || "una herramienta"}
                </Link>
              </p>
              <p className="text-xs text-ash">
                {new Date(activity.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="text-ash">{config.icon}</span>
          </div>
        );
      })}
    </div>
  );
}
