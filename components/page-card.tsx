"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Page, PageCategory } from "@/types";
import { useLocale } from "@/components/locale-provider";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Eye, MessageSquare, Code2, FileCode, Heart } from "lucide-react";
import { getPageLikes, isPageLiked, togglePageLike } from "@/lib/services";
import { toast } from "sonner";

interface PageCardProps {
  page: Page;
}

export function PageCard({ page }: PageCardProps) {
  const { messages, locale } = useLocale();
  const { user } = useAuth();
  const t = messages.feed;
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    getPageLikes(page.id).then(setLikes);
    isPageLiked(page.id).then(setLiked);
  }, [page.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error(messages.nav.login);
      return;
    }
    try {
      const next = await togglePageLike(page.id);
      setLiked(next);
      setLikes((prev) => (next ? prev + 1 : Math.max(prev - 1, 0)));
    } catch {
      toast.error(messages.common.error);
    }
  };

  const categoryLabel =
    t.categories[page.category as keyof typeof t.categories] || page.category || t.allCategories;

  const categoryGradients: Record<PageCategory | string, string> = {
    productivity: "from-ember/20 to-void/50",
    health: "from-emerald-500/20 to-void/50",
    entertainment: "from-violet-500/20 to-void/50",
    data: "from-cyan-500/20 to-void/50",
    professional: "from-amber-500/20 to-void/50",
  };

  const gradient = categoryGradients[page.category || "productivity"] || categoryGradients.productivity;

  return (
    <Link href={`/${locale}/page/${page.id}`}>
      <Card className="group h-full bg-card border-border hover:border-ember/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] overflow-hidden card-hover">
        <CardContent className="p-0">
          <div className={`aspect-video bg-linear-to-br ${gradient} relative flex items-center justify-center border-b border-border`}>
            <div className="text-center fade-in stagger-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pitch/60 border border-parchment/10 mb-2">
                <FileCode className="h-8 w-8 text-ember" />
              </div>
              <p className="text-xs text-ash">{messages.page.preview}</p>
            </div>
            {page.is_open_source && (
              <div className="absolute top-2 right-2 fade-in stagger-2">
                <Badge variant="secondary" className="bg-pitch/80 text-parchment border border-border">
                  <Code2 className="h-3 w-3 mr-1" />
                  {t.openSource}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3 p-5">
          <div className="flex items-center justify-between w-full">
            <Badge variant="outline" className="border-ember/30 text-ember">
              {categoryLabel}
            </Badge>
            <div className="flex items-center gap-1 text-ash text-sm">
              <Star className="h-4 w-4 fill-ember text-ember" />
              <span>{page.average_rating.toFixed(1)}</span>
            </div>
          </div>
          <h3 className="font-heading text-xl text-parchment group-hover:text-ember transition-colors duration-200">
            {page.title}
          </h3>
          <p className="text-sm text-ash line-clamp-2">{page.description}</p>
          <div className="flex items-center justify-between w-full text-sm text-ash mt-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={page.author?.avatar_url || ""} alt={page.author?.name || "Author avatar"} />
                <AvatarFallback className="bg-void text-parchment text-xs">
                  {page.author?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[120px]">{page.author?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 transition-colors duration-200 hover:scale-110 ${liked ? "text-ember" : "text-ash hover:text-ember"}`}
                aria-label={liked ? "Quitar me gusta" : "Me gusta"}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-ember" : ""}`} />
                <span>{likes}</span>
              </button>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {page.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {page.comments_count}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
