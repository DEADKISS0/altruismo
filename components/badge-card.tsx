"use client";

import { Achievement } from "@/types";
import { Award, Star, Upload, Heart, Trophy, Zap } from "lucide-react";

interface BadgeCardProps {
  achievement: Achievement;
}

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; description: string }> = {
  first_upload: {
    icon: <Upload className="h-5 w-5" />,
    label: "Primer Upload",
    color: "text-ember",
    description: "Publicó su primera herramienta",
  },
  ten_uploads: {
    icon: <Star className="h-5 w-5" />,
    label: "Desarrollador Activo",
    color: "text-yellow-500",
    description: "Publicó 10 herramientas",
  },
  hundred_likes: {
    icon: <Heart className="h-5 w-5" />,
    label: "Favorito de la Comunidad",
    color: "text-pink-500",
    description: "Recibió 100 likes en total",
  },
  challenge_complete: {
    icon: <Trophy className="h-5 w-5" />,
    label: "Completador de Retos",
    color: "text-emerald-500",
    description: "Completó su primer reto",
  },
  streak_7: {
    icon: <Zap className="h-5 w-5" />,
    label: "Racha de 7 Días",
    color: "text-orange-500",
    description: "7 días consecutivos de actividad",
  },
  beta_tester: {
    icon: <Award className="h-5 w-5" />,
    label: "Beta Tester",
    color: "text-cyan-500",
    description: "Probó herramientas en fase beta",
  },
};

export function BadgeCard({ achievement }: BadgeCardProps) {
  const config = BADGE_CONFIG[achievement.badge_type] || {
    icon: <Award className="h-5 w-5" />,
    label: achievement.badge_type,
    color: "text-ash",
    description: "Logro desbloqueado",
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
      <div className={`p-2 bg-void rounded-lg ${config.color}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-parchment text-sm">{config.label}</p>
        <p className="text-xs text-ash truncate">{config.description}</p>
      </div>
      <span className="text-xs text-ash whitespace-nowrap">
        {new Date(achievement.earned_at).toLocaleDateString()}
      </span>
    </div>
  );
}
